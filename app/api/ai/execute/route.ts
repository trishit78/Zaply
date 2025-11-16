/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

 export function replaceTemplateVariables(text: string, input: any): string {
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

      case "aiAnalyzer":
        result = await executeAnalyzer(config, input, openai);
        break;

      case "aiChatbot":
        result = await executeChatbot(config, input, openai);
        break;

      case "aiDataExtractor":
        result = await executeDataExtractor(config, input, openai);
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

async function executeAnalyzer(config: any, input: any, openai: OpenAI) {
  let { text, analysisType } = config;
  text = replaceTemplateVariables(text, input);

  let systemPrompt = "";
  switch (analysisType) {
    case "sentiment":
      systemPrompt =
        "Analyze the sentiment of the following text. Respond with: Positive, Negative, or Neutral, with confidence score and explanation.";
      break;
    case "keywords":
      systemPrompt =
        "Extract the most important keywords from the text. Return JSON array.";
      break;
    case "summary":
      systemPrompt = "Summarize the following text in 2–3 sentences.";
      break;
  }

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: text },
    ],
    temperature: 0.3,
  });

  return {
    analysisType,
    result: completion.choices[0].message.content,
    usage: completion.usage,
  };
}

async function executeChatbot(config: any, input: any, openai: OpenAI) {
  let { systemPrompt, userMessage, personality } = config;

  systemPrompt = replaceTemplateVariables(systemPrompt, input);
  userMessage = replaceTemplateVariables(userMessage, input);

  const personalities = {
    professional: "Respond professionally.",
    friendly: "Respond in a warm and friendly manner.",
    concise: "Respond briefly and to the point.",
  };

  const fullSystemPrompt = `${systemPrompt}\n\n${
    personalities[personality] || ""
  }`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: fullSystemPrompt },
      { role: "user", content: userMessage },
    ],
    temperature: 0.7,
  });

  return {
    response: completion.choices[0].message.content,
    personality,
    usage: completion.usage,
  };
}

async function executeDataExtractor(config: any, input: any, openai: OpenAI) {
  let { text, schema } = config;

  text = replaceTemplateVariables(text, input);
  schema = replaceTemplateVariables(schema, input);

  const systemPrompt = `Extract data according to this schema: ${schema}. Return ONLY JSON.`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: text },
    ],
    temperature: 0.1,
  });

  const extracted = completion.choices[0].message.content;

  try {
    return {
      extractedData: JSON.parse(extracted || "{}"),
      usage: completion.usage,
    };
  } catch {
    return {
      extractedData: extracted,
      note: "Returned raw text because JSON parsing failed",
      usage: completion.usage,
    };
  }
}
