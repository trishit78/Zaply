import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

function replaceTemplateVariables(text: string, input: any): string {
  if (!text || typeof text !== "string") return text;

  let result = text.replace(
    /\{\{input\}\}/g,
    typeof input === "object" ? JSON.stringify(input) : String(input)
  );

  result = result.replace(
    /\{\{input\.([^}]+)\}\}/g,
    (match: string, path: string) => {
      const fields = path.split(".");
      let value = input;

      for (const field of fields) {
        if (value && typeof value === "object" && field in value) {
          value = value[field];
        } else {
          return match;
        }
      }

      return typeof value === "object" ? JSON.stringify(value) : String(value);
    }
  );

  return result;
}

export async function POST(request: NextRequest) {
  try {
    const { type, config, input } = await request.json();

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "Missing OPENAI_API_KEY in environment variables" },
        { status: 500 }
      );
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    let result;

    switch (type) {
      case "aiTextGenerator":
        result = await executeTextGenerator(config, input, openai);
        break;

      default:
        return NextResponse.json(
          { error: `Unknown AI node type: ${type}` },
          { status: 400 }
        );
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("AI execution error:", error);
    return NextResponse.json(
      {
        error: error.message || "AI execution failed",
      },
      { status: 500 }
    );
  }
}

async function executeTextGenerator(config: any, input: any, openai: OpenAI) {
  let { prompt, temperature, maxTokens } = config;

  prompt = replaceTemplateVariables(prompt, input);

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini", // or gpt-4o / gpt-4.1 / etc.
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
    temperature: parseFloat(temperature || "0.7"),
    max_tokens: parseInt(maxTokens || "500"),
  });

  return {
    generatedText: completion.choices[0].message.content,
    model: completion.model,
    usage: completion.usage,
  };
}
