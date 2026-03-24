# Private Money Loan Processor AI

An AI-powered workflow assistant for private money lending, built with React and Vite.

## Features

- **7-Stage Workflow**: Application & Docs, Property Valuation, Title Review, Borrower Verification, Loan Structuring, Underwriting Prep, and Closing Coordination
- **AI Chat Assistant**: Context-aware AI assistant powered by Anthropic's Claude API
- **File Analysis**: Upload documents (PDFs, images, text) and ask the AI to analyze them—e.g., identify business purpose loans, classify documents, find missing items
- **Loan Calculations**: Real-time LTV ratio calculations
- **Modern UI**: Beautiful, responsive interface built with Tailwind CSS

## Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure API Key**
   - **Local development**: Copy `.env.example` to `.env` and add your Anthropic API key
   - **Vercel deployment**: Add `VITE_ANTHROPIC_API_KEY` or `ANTHROPIC_API_KEY` in Project Settings → Environment Variables
   - Get your API key from [Anthropic Console](https://console.anthropic.com/)

3. **Run Development Server**
   ```bash
   npm run dev
   ```
   For local chat testing with the API proxy, use `vercel dev` instead.

4. **Build for Production**
   ```bash
   npm run build
   ```

## Project Structure

```
├── api/
│   ├── chat.js                         # Vercel serverless function (Anthropic proxy)
│   └── analyze.js                      # File analysis proxy (multimodal)
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
2. Upload documents (PDFs, images, or .txt files) for the current stage
3. Click **Analyze Files** to have the AI analyze uploaded documents (e.g., business purpose detection, document classification)
4. Select a workflow stage from the stages list
5. Ask questions or request assistance in the chat interface
6. The AI assistant will provide stage-specific guidance based on the current workflow stage

### File Analysis

- **Supported formats**: PDF, JPG, PNG, GIF, WebP, .txt
- **Unsupported**: Word (.docx), Excel (.xlsx)—convert to PDF first
- Saved loans store only file metadata; re-upload files to use Analyze after loading

## Technologies

- React 18
- Vite
- Tailwind CSS
- Lucide React (icons)
- Anthropic Claude API
