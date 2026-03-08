# Private Money Loan Processor AI

An AI-powered workflow assistant for private money lending, built with React and Vite.

## Features

- **7-Stage Workflow**: Application & Docs, Property Valuation, Title Review, Borrower Verification, Loan Structuring, Underwriting Prep, and Closing Coordination
- **AI Chat Assistant**: Context-aware AI assistant powered by Anthropic's Claude API
- **Loan Calculations**: Real-time LTV ratio calculations
- **Modern UI**: Beautiful, responsive interface built with Tailwind CSS

## Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure API Key**
   - Copy `.env.example` to `.env`
   - Add your Anthropic API key:
     ```
     VITE_ANTHROPIC_API_KEY=your_api_key_here
     ```
   - Get your API key from [Anthropic Console](https://console.anthropic.com/)

3. **Run Development Server**
   ```bash
   npm run dev
   ```

4. **Build for Production**
   ```bash
   npm run build
   ```

## Project Structure

```
├── src/
│   ├── components/
│   │   └── HardMoneyLoanProcessor.jsx  # Main component
│   ├── App.jsx                         # App wrapper
│   ├── main.jsx                        # Entry point
│   └── index.css                       # Tailwind imports
├── index.html                          # HTML template
├── package.json                        # Dependencies
├── vite.config.js                      # Vite configuration
├── tailwind.config.js                  # Tailwind configuration
└── .env                                # Environment variables (create from .env.example)
```

## Usage

1. Fill in the loan details in the left panel
2. Select a workflow stage from the stages list
3. Ask questions or request assistance in the chat interface
4. The AI assistant will provide stage-specific guidance based on the current workflow stage

## Technologies

- React 18
- Vite
- Tailwind CSS
- Lucide React (icons)
- Anthropic Claude API
