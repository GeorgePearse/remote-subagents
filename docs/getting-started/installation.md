# Installation

## Prerequisites

- Node.js 18+
- npm or yarn
- An [E2B](https://e2b.dev) account and API key
- An OpenAI API key (for the remote sub-agent)

## Step 1: Clone the Repository

```bash
git clone https://github.com/GeorgePearse/remote-subagents.git
cd remote-subagents
```

## Step 2: Install Dependencies

```bash
npm install
```

## Step 3: Configure Environment

Create a `.env` file from the example:

```bash
cp .env.example .env
```

Edit `.env` with your API keys:

```env
E2B_API_KEY=your_e2b_api_key_here
OPENAI_API_KEY=your_openai_api_key_here
```

!!! warning "Keep your keys secure"
    Never commit your `.env` file to version control. It's already in `.gitignore`.

## Step 4: Build

```bash
npm run build
```

## Step 5: Run

```bash
npm start
```

The MCP server will start and be ready to accept connections.

## Verifying Installation

You can verify the server is working by checking the logs when it starts. You should see the server initialize and register its tools.

## Next Steps

- [Configuration](configuration.md) - Configure your MCP client
- [Basic Usage](../usage/basic.md) - Start using remote subagents
