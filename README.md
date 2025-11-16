# Zaply - Visual Workflow Automation Platform

A powerful, visual workflow automation platform built with Next.js that allows you to create, connect, and execute AI-powered workflows without writing code. Think of it as a simplified n8n alternative with built-in AI capabilities.

<img width="860" height="500" alt="Screenshot 2025-11-16 131957" src="https://github.com/user-attachments/assets/e5e09693-f06e-4953-960f-11aa8aad16d1" />

## 🚀 Features

### Visual Workflow Builder
- **Drag-and-drop interface** for creating workflows
- **Real-time visual feedback** with node execution status
- **Interactive canvas** powered by ReactFlow
- **Node connection system** with validation
- **Minimap and controls** for easy navigation

### Node Categories

#### 🎯 Trigger Nodes
- **Webhook Trigger** - Start workflows via HTTP requests
- **Schedule Trigger** - Run workflows on a schedule (minutes, hours, days)

#### 🤖 AI Nodes (OpenAI Integration)
- **AI Text Generator** - Generate text content with customizable prompts
- **AI Content Analyzer** - Perform sentiment analysis, keyword extraction, and summarization
- **AI Chatbot** - Create conversational AI with customizable personalities
- **AI Data Extractor** - Extract structured data from unstructured text

#### ⚡ Action Nodes
- **HTTP Request** - Make API calls (GET, POST, PUT, DELETE)
- **Data Transform** - Transform data using JavaScript code
- **Send Email** - Send emails (simulated for demo)

#### 🔀 Logic Nodes
- **If/Else** - Conditional branching with JavaScript expressions
- **Delay** - Add delays between workflow steps

## 🛠️ Tech Stack

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript
- **UI Components**: shadcn/ui (Radix UI primitives)
- **Styling**: Tailwind CSS with custom theme
- **Workflow Engine**: ReactFlow for visual workflow builder
- **State Management**: Zustand
- **AI Integration**: OpenAI API (gpt-4o-mini)
- **Icons**: Lucide React

## 📦 Installation

1. **Clone the repository:**
```bash
git clone https://github.com/trishit78/Zaply.git
cd zaply
```

2. **Install dependencies:**
```bash
npm install
```

3. **Create a `.env.local` file in the root directory:**
```env
OPENAI_API_KEY=your_openai_api_key_here
```

4. **Run the development server:**
```bash
npm run dev
```

5. **Open your browser:**
Navigate to [http://localhost:3000](http://localhost:3000)

## 🎮 Usage

### Creating a Workflow

1. **Add Nodes**: Drag nodes from the sidebar onto the canvas
2. **Connect Nodes**: Click and drag from one node's output to another's input
3. **Configure Nodes**: Double-click any node to open its configuration panel
4. **Execute Workflow**: Click the "Execute" button to run your workflow

### Template Variables

Use template variables to pass data between nodes:
- `{{input}}` - Access the entire input object
- `{{input.fieldName}}` - Access specific fields
- `{{input.nested.field}}` - Access nested fields

**Example:**
```javascript
// In HTTP Request URL field:
https://api.example.com/users/{{input.userId}}

// In AI Text Generator prompt:
Write a summary about: {{input.content}}
```

### Example Workflows

#### 1. AI Content Analyzer
```
Schedule Trigger → AI Text Generator → AI Content Analyzer → Send Email
```

#### 2. Conditional API Call
```
Webhook → If/Else → HTTP Request (Branch A) / Send Email (Branch B)
```

#### 3. Data Processing Pipeline
```
Webhook → Data Transform → AI Data Extractor → HTTP Request
```

## 📁 Project Structure
```
zaply/
├── app/
│   ├── api/
│   │   └── ai/execute/    # AI node execution endpoints
│   ├── page.tsx           # Main workflow builder page
│   ├── layout.tsx         # Root layout
│   └── globals.css        # Global styles
├── component/
│   ├── CustomNode.tsx     # Workflow node component
│   ├── Sidebar.tsx        # Node palette sidebar
│   └── NodeConfigPanel.tsx # Node configuration panel
├── components/ui/         # shadcn/ui components
├── lib/
│   ├── store.ts           # Zustand state management
│   ├── types.ts           # TypeScript type definitions
│   ├── executor.ts        # Workflow execution engine
│   ├── node-definitions.ts # Node type definitions
│   └── utils.ts           # Utility functions
└── hooks/
    └── use-mobile.ts      # Mobile detection hook
```

## 🔧 Configuration

### Adding a New Node Type

1. **Define the node in `lib/node-definitions.ts`:**
```typescript
myNewNode: {
  type: "myNewNode",
  label: "My New Node",
  description: "Does something cool",
  category: "action",
  icon: MyIcon,
  color: "bg-blue-500",
  defaultConfig: {
    // Default configuration values
  },
  configFields: [
    {
      name: "fieldName",
      label: "Field Label",
      type: "text",
      placeholder: "Enter value...",
      required: true
    }
  ]
}
```

2. **Implement execution logic in `lib/executor.ts`:**
```typescript
private async executeMyNewNode(config: Record<string, any>, input: any) {
  // Your execution logic here
  return {
    success: true,
    output: { /* result */ }
  };
}
```
## 📝 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `OPENAI_API_KEY` | Your OpenAI API key for AI nodes | Yes |
## 🤝 Contributing

## 🔧 Extending the Application

### Adding a New Node Type

1. **Define the node** in `lib/node-definitions.ts`:

```typescript
myCustomNode: {
  type: 'myCustomNode',
  label: 'My Custom Node',
  description: 'Does something amazing',
  category: 'action',
  icon: Star,
  color: 'bg-yellow-500',
  defaultConfig: { /* ... */ },
  configFields: [ /* ... */ ]
}
```

2. **Implement execution** in `lib/executor.ts`:

```typescript
case 'myCustomNode':
  return this.executeMyCustomNode(config, input);
```

3. **Add the handler**:

```typescript
private executeMyCustomNode(config: any, input: any) {
  // Your logic here
  return {
    success: true,
    output: { /* ... */ }
  };
}
```

### Adding More AI Capabilities

- **Image Generation**: Use DALL-E API
- **Speech-to-Text**: Integrate Whisper API
- **Vision**: Analyze images with GPT-4 Vision
- **Embeddings**: For semantic search


## 💡 Ideas for Enhancement

- [ ] Save/load workflows to database
- [ ] User authentication
- [ ] Workflow scheduling with cron
- [ ] Real webhook endpoints
- [ ] Node marketplace
- [ ] Collaboration features
- [ ] Version control for workflows
- [ ] Execution history and logs
- [ ] Cost tracking for AI usage
- [ ] Mobile responsive design
- [ ] Dark mode improvements
- [ ] Keyboard shortcuts
- [ ] Undo/redo functionality
- [ ] Workflow templates library
- [ ] Export/import workflows as JSON
- [ ] Performance monitoring

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines

- Follow the existing code style
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed
