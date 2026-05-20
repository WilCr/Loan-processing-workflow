import React, { useState, useRef, useEffect } from 'react';
import { FileText, CheckCircle, Send, Loader2, Calculator, Home, FileCheck, DollarSign, BookOpen, Rocket, Layers, BarChart3, ExternalLink, Upload, X, Save, FolderOpen, CheckCircle2, Trash2, ChevronUp, Sparkles } from 'lucide-react';

export default function HardMoneyLoanProcessor() {
  const resourcesRef = useRef(null);
  const fileInputRef = useRef(null);
  const loadInputRef = useRef(null);
  const [currentStage, setCurrentStage] = useState(0);
  const [loanData, setLoanData] = useState({
    loanId: '',
    propertyAddress: '',
    loanAmount: '',
    propertyValue: '',
    borrowerName: '',
    loanType: 'purchase',
    exitStrategy: ''
  });
  const [chatMessages, setChatMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [stageFiles, setStageFiles] = useState({
    0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: []
  });
  const [dragActive, setDragActive] = useState(false);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);

  // Generate Loan ID on component mount
  useEffect(() => {
    if (!loanData.loanId) {
      const timestamp = Date.now();
      const loanId = `LOAN-${timestamp}`;
      setLoanData(prev => ({ ...prev, loanId }));
    }
  }, []);

  const scrollToResources = () => {
    resourcesRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Format number with commas and decimal point
  const formatCurrency = (value) => {
    if (!value) return '';
    // Remove all non-numeric characters except decimal point
    const numericValue = value.toString().replace(/[^\d.]/g, '');
    if (!numericValue) return '';
    
    // Split by decimal point
    const parts = numericValue.split('.');
    const integerPart = parts[0];
    const decimalPart = parts[1] || '';
    
    // Add commas to integer part
    const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    
    // Limit decimal part to 2 digits
    const formattedDecimal = decimalPart.slice(0, 2);
    
    // Combine parts
    if (formattedDecimal) {
      return `${formattedInteger}.${formattedDecimal}`;
    }
    return formattedInteger;
  };

  // Parse formatted currency string to number
  const parseCurrency = (value) => {
    if (!value) return '';
    // Remove commas and keep only numbers and decimal point
    return value.toString().replace(/,/g, '');
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  // Handle drag events
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  // Handle file drop
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  // Handle file input change
  const handleFileInput = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Process files and add to state (store File object for analysis)
  const handleFiles = (files) => {
    const newFiles = Array.from(files).map(file => ({
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: file.name,
      size: file.size,
      type: file.type,
      uploadedAt: new Date().toISOString(),
      file: file  // Store the actual File object for AI analysis
    }));

    setStageFiles(prev => ({
      ...prev,
      [currentStage]: [...prev[currentStage], ...newFiles]
    }));
  };

  // Remove file from current stage
  const removeFile = (fileId) => {
    setStageFiles(prev => ({
      ...prev,
      [currentStage]: prev[currentStage].filter(file => file.id !== fileId)
    }));
  };

  const clearChat = () => {
    setChatMessages([]);
  };

  const clearCurrentStageDocuments = () => {
    if (!stageFiles[currentStage]?.length) return;
    if (!window.confirm('Remove all uploaded files for this workflow stage? You can upload new documents afterward.')) return;
    setStageFiles(prev => ({
      ...prev,
      [currentStage]: []
    }));
  };

  // Save loan data to JSON file (file content excluded - only metadata saved)
  const saveLoanData = () => {
    const stageFilesToSave = {};
    Object.keys(stageFiles).forEach(stage => {
      stageFilesToSave[stage] = stageFiles[stage].map(({ file, ...meta }) => meta);
    });
    const dataToSave = {
      loanData,
      stageFiles: stageFilesToSave,
      chatMessages,
      currentStage,
      savedAt: new Date().toISOString()
    };

    const jsonString = JSON.stringify(dataToSave, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const date = new Date().toISOString().split('T')[0];
    const filename = `${loanData.loanId}_${date}.json`;
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    // Show success notification
    setShowSaveSuccess(true);
    setTimeout(() => setShowSaveSuccess(false), 3000);
  };

  // Load loan data from JSON file
  const loadLoanData = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const loadedData = JSON.parse(event.target.result);
        
        if (loadedData.loanData) setLoanData(loadedData.loanData);
        if (loadedData.stageFiles) setStageFiles(loadedData.stageFiles);
        if (loadedData.chatMessages) setChatMessages(loadedData.chatMessages);
        if (typeof loadedData.currentStage === 'number') setCurrentStage(loadedData.currentStage);
      } catch (error) {
        alert('Error loading file: Invalid JSON format');
      }
    };
    reader.readAsText(file);
    
    // Reset input
    e.target.value = '';
  };

  const stages = [
    { id: 0, name: 'Application & Docs', icon: FileText, color: 'blue' },
    { id: 1, name: 'Property Valuation', icon: Home, color: 'green' },
    { id: 2, name: 'Title Review', icon: FileCheck, color: 'purple' },
    { id: 3, name: 'Borrower Verification', icon: CheckCircle, color: 'orange' },
    { id: 4, name: 'Loan Structuring', icon: Calculator, color: 'red' },
    { id: 5, name: 'Underwriting Prep', icon: FileText, color: 'indigo' },
    { id: 6, name: 'Closing Coordination', icon: DollarSign, color: 'teal' }
  ];

  // Color mapping for Tailwind classes
  const colorClasses = {
    blue: {
      bg: 'bg-blue-100',
      border: 'border-blue-500',
      text: 'text-blue-600',
      textDark: 'text-blue-900'
    },
    green: {
      bg: 'bg-green-100',
      border: 'border-green-500',
      text: 'text-green-600',
      textDark: 'text-green-900'
    },
    purple: {
      bg: 'bg-purple-100',
      border: 'border-purple-500',
      text: 'text-purple-600',
      textDark: 'text-purple-900'
    },
    orange: {
      bg: 'bg-orange-100',
      border: 'border-orange-500',
      text: 'text-orange-600',
      textDark: 'text-orange-900'
    },
    red: {
      bg: 'bg-red-100',
      border: 'border-red-500',
      text: 'text-red-600',
      textDark: 'text-red-900'
    },
    indigo: {
      bg: 'bg-indigo-100',
      border: 'border-indigo-500',
      text: 'text-indigo-600',
      textDark: 'text-indigo-900'
    },
    teal: {
      bg: 'bg-teal-100',
      border: 'border-teal-500',
      text: 'text-teal-600',
      textDark: 'text-teal-900'
    }
  };

  const stagePrompts = {
    0: `You are an AI assistant helping a private money loan processor with the Application & Documentation Collection stage. 

Current loan details:
- Property: ${loanData.propertyAddress || 'Not specified'}
- Loan Amount: ${loanData.loanAmount || 'Not specified'}
- Borrower: ${loanData.borrowerName || 'Not specified'}
- Type: ${loanData.loanType}

Help the processor by:
1. Providing a checklist of required documents
2. Answering questions about documentation requirements
3. Suggesting next steps
4. Identifying missing information

Be concise and practical.`,
    
    1: `You are an AI assistant helping with Property Valuation for a private money loan.

Current loan details:
- Property: ${loanData.propertyAddress || 'Not specified'}
- Property Value: ${loanData.propertyValue || 'Not specified'}
- Loan Amount: ${loanData.loanAmount || 'Not specified'}

Help the processor by:
1. Calculating LTV ratios
2. Explaining appraisal vs BPO requirements
3. Reviewing property condition considerations
4. Calculating ARV for rehab projects

Provide specific calculations and recommendations.`,

    2: `You are an AI assistant helping with Title & Legal Review for a private money loan.

Property: ${loanData.propertyAddress || 'Not specified'}

Help the processor by:
1. Creating a title review checklist
2. Explaining common title issues and solutions
3. Reviewing lien priorities
4. Advising on title insurance requirements

Be specific about private money lending title requirements.`,

    3: `You are an AI assistant helping with Borrower & Exit Strategy Verification.

Borrower: ${loanData.borrowerName || 'Not specified'}
Exit Strategy: ${loanData.exitStrategy || 'Not specified'}
Loan Type: ${loanData.loanType}

Help the processor by:
1. Reviewing exit strategy viability
2. Identifying required borrower documentation
3. Assessing experience requirements
4. Evaluating reserve requirements

Focus on asset-based lending criteria.`,

    4: `You are an AI assistant helping with Loan Structuring & Pricing.

Current loan details:
- Loan Amount: ${loanData.loanAmount || 'Not specified'}
- Property Value: ${loanData.propertyValue || 'Not specified'}

Help the processor by:
1. Calculating points and fees (typical private money: 2-4 points)
2. Suggesting appropriate interest rates (8-15%)
3. Recommending loan terms (6-24 months)
4. Calculating monthly payments

Provide specific calculations.`,

    5: `You are an AI assistant helping prepare the Underwriting Package.

Help the processor by:
1. Creating a comprehensive document checklist
2. Drafting an executive summary template
3. Organizing submission materials
4. Identifying any gaps in documentation

Be thorough and organized.`,

    6: `You are an AI assistant helping with Closing Coordination.

Help the processor by:
1. Creating a closing checklist
2. Calculating closing costs and prorations
3. Managing timeline (typical private money: 7-14 days)
4. Coordinating with title company

Focus on rapid closing requirements.`
  };

  /** Appends per-stage filename list so chat can classify documents by name (full PDF/image analysis uses Analyze Files). */
  const buildChatSystemPrompt = () => {
    const files = stageFiles[currentStage] || [];
    const count = files.length;
    const fileLines =
      count === 0
        ? '(No files uploaded for this workflow stage.)'
        : files.map((f, i) => `${i + 1}. ${f.name}`).join('\n');

    return `${stagePrompts[currentStage]}

---
Uploaded files for this stage (${count}):
${fileLines}

You can see every filename above. Use them to infer likely document types (e.g. title, commitment, appraisal, credit) when names are descriptive. If names are ambiguous or the user needs analysis of PDF/image contents, tell them to use the purple "Analyze Files" button in the Documents panel. Do not claim you cannot see filenames—they are listed in this message.`;
  };

  const handleSendMessage = async () => {
    if (!userInput.trim() || isLoading) return;

    const newMessage = { role: 'user', content: userInput };
    setChatMessages(prev => [...prev, newMessage]);
    setUserInput('');
    setIsLoading(true);

    try {
      const messages = [...chatMessages, newMessage].map(msg => ({
        role: msg.role,
        content: typeof msg.content === 'string' ? msg.content : msg.content
      }));

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system: buildChatSystemPrompt(),
          messages
        })
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || `API error: ${response.status}`);
      }

      const aiResponse = data.text || 'Sorry, I encountered an error.';
      
      setChatMessages(prev => [...prev, { role: 'assistant', content: aiResponse }]);
    } catch (error) {
      const message = error.message === 'Failed to fetch'
        ? 'Unable to reach the chat service. If deployed on Vercel, ensure the API route is configured and redeploy.'
        : error.message;
      setChatMessages(prev => [...prev, { 
        role: 'assistant', 
        content: `Error: ${message}` 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Analyze uploaded files with AI (business purpose detection, document classification, etc.)
  const analyzeFiles = async (query) => {
    if (!stageFiles[currentStage] || stageFiles[currentStage].length === 0) {
      setChatMessages(prev => [...prev, {
        role: 'assistant',
        content: 'No files have been uploaded to this stage yet. Please upload files first.'
      }]);
      return;
    }

    setIsLoading(true);
    const defaultQuery = 'Identify which documents indicate this is a business purpose loan. List each file name and explain your determination.';
    const analysisMessage = { role: 'user', content: query || defaultQuery };
    setChatMessages(prev => [...prev, analysisMessage]);

    /** Vercel serverless request bodies are capped (~4.5MB). JSON + base64 needs a conservative per-request budget. */
    const MAX_ANALYZE_MEDIA_BYTES = 2_400_000;

    const estimateBlockBytes = (block) => {
      if (block.type === 'text') return (block.text?.length || 0) * 2;
      if (block.source?.data) return Math.ceil(block.source.data.length * 1.05);
      return 0;
    };

    const chunkBlocksBySize = (namedBlocks, maxBytes) => {
      const chunks = [];
      let current = [];
      let sum = 0;
      for (const nb of namedBlocks) {
        const b = estimateBlockBytes(nb.block);
        if (b > maxBytes) {
          return { error: `File "${nb.name}" is too large to send in one request (~${Math.round(b / 1e6)}MB encoded). Try a smaller PDF, fewer pages, or split into multiple files.` };
        }
        if (current.length && sum + b > maxBytes) {
          chunks.push(current);
          current = [];
          sum = 0;
        }
        current.push(nb);
        sum += b;
      }
      if (current.length) chunks.push(current);
      return { chunks };
    };

    try {
      const namedBlocks = [];

      for (const fileData of stageFiles[currentStage]) {
        if (!fileData.file) continue; // Skip files loaded from JSON (no File object)

        const content = await new Promise((resolve, reject) => {
          const reader = new FileReader();

          if (fileData.type === 'application/pdf' || fileData.type.startsWith('image/')) {
            reader.onload = (e) => {
              const base64 = e.target.result.split(',')[1];
              if (!base64) return resolve(null);
              resolve({
                type: 'image', // Anthropic uses 'image' for both PDF and images
                source: {
                  type: 'base64',
                  media_type: fileData.type,
                  data: base64
                }
              });
            };
            reader.onerror = reject;
            reader.readAsDataURL(fileData.file);
          } else if (fileData.type.startsWith('text/') || fileData.name.endsWith('.txt')) {
            reader.onload = (e) => resolve({
              type: 'text',
              text: `File: ${fileData.name}\n\n${e.target.result}`
            });
            reader.onerror = reject;
            reader.readAsText(fileData.file);
          } else {
            resolve(null);
          }
        });

        if (content) namedBlocks.push({ name: fileData.name, block: content });
      }

      if (namedBlocks.length === 0) {
        const hasLoadedFiles = stageFiles[currentStage].some(f => !f.file);
        const message = hasLoadedFiles
          ? 'Files were loaded from a saved loan. Re-upload the files in this session to enable AI analysis. (File content is not saved for privacy.)'
          : 'None of the uploaded files are in a supported format (PDF, images, or text files). Please upload PDFs, images (JPG, PNG, GIF, WebP), or .txt files.';
        setChatMessages(prev => [...prev, { role: 'assistant', content: message }]);
        setIsLoading(false);
        return;
      }

      const fileNames = stageFiles[currentStage].map(f => f.name).join(', ');
      const q = query || defaultQuery;
      const { chunks, error: chunkError } = chunkBlocksBySize(namedBlocks, MAX_ANALYZE_MEDIA_BYTES);
      if (chunkError) {
        setChatMessages(prev => [...prev, { role: 'assistant', content: chunkError }]);
        setIsLoading(false);
        return;
      }

      const parts = [];
      for (let i = 0; i < chunks.length; i++) {
        const batch = chunks[i];
        const namesInBatch = batch.map((x) => x.name).join(', ');
        const intro =
          chunks.length === 1
            ? `I have ${stageFiles[currentStage].length} files uploaded. File names: ${fileNames}.\n\n${q}`
            : `Part ${i + 1} of ${chunks.length} (this request only includes: ${namesInBatch}). All files in this stage: ${fileNames}.\n\nAnswer for these files now; other parts are analyzed separately.\n\n${q}`;

        const messageContent = [{ type: 'text', text: intro }, ...batch.map((x) => x.block)];

        const response = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: [{ role: 'user', content: messageContent }]
          })
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          const detail =
            response.status === 413
              ? 'Payload too large (413). Try fewer or smaller files, or split large PDFs.'
              : data.error || `API error: ${response.status}`;
          throw new Error(detail);
        }

        const aiResponse = data.text || 'Error analyzing files.';
        if (chunks.length > 1) {
          parts.push(`**Part ${i + 1} of ${chunks.length}** (${namesInBatch})\n\n${aiResponse}`);
        } else {
          parts.push(aiResponse);
        }
      }

      const combined =
        parts.length === 1
          ? parts[0]
          : `${parts.join('\n\n---\n\n')}\n\n---\n\nIf needed, compare the parts above for documents that appear in different batches.`;
      setChatMessages(prev => [...prev, { role: 'assistant', content: combined }]);
    } catch (error) {
      console.error('File analysis error:', error);
      setChatMessages(prev => [...prev, {
        role: 'assistant',
        content: error.message === 'Failed to fetch'
          ? 'Unable to reach the analysis service. Please ensure the API is configured.'
          : `Error analyzing files: ${error.message}`
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateLTV = () => {
    const loan = parseFloat(loanData.loanAmount);
    const value = parseFloat(loanData.propertyValue);
    if (loan && value) {
      return ((loan / value) * 100).toFixed(2);
    }
    return null;
  };

  const changeStage = (newStage) => {
    setCurrentStage(newStage);
    setChatMessages([]);
  };

  const inputFocusRing =
    'rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/25';

  return (
    <div className="min-h-screen bg-[#E8EAED] text-slate-900 antialiased">
      {/* Save Success Notification */}
      {showSaveSuccess && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-white shadow-lg animate-fade-in">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          <span className="text-sm font-medium">Session saved successfully.</span>
        </div>
      )}

      <header className="sticky top-0 z-40 border-b border-slate-200/90 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-none flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-violet-600 shadow-sm ring-1 ring-violet-700/20">
              <ChevronUp className="h-5 w-5 text-white" strokeWidth={2.5} aria-hidden />
            </div>
            <span className="truncate text-lg font-bold tracking-tight text-slate-900 sm:text-xl">
              Loan Processor AI
            </span>
          </div>
          <nav className="flex flex-wrap items-center justify-end gap-2">
            <a
              href="https://curvedspace.us"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              <ExternalLink className="h-4 w-4 text-slate-500" />
              CurvedSpace
            </a>
            <button
              type="button"
              onClick={scrollToResources}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              <BookOpen className="h-4 w-4 text-slate-500" />
              Resources
            </button>
            <button
              type="button"
              onClick={saveLoanData}
              className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white shadow-sm ring-1 ring-violet-700/15 transition hover:bg-violet-700"
            >
              <Save className="h-4 w-4" />
              Save session
            </button>
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50">
              <FolderOpen className="h-4 w-4 text-slate-500" />
              Load loan
              <input type="file" accept=".json" onChange={loadLoanData} className="hidden" />
            </label>
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-none space-y-6 px-4 pb-16 pt-10 sm:px-6 lg:space-y-8 lg:px-8 lg:pt-12">
        {/* Hero */}
        <section className="mx-auto max-w-3xl px-2 text-center">
          <h1 className="text-balance text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl lg:text-[2.75rem] lg:leading-tight">
            Process private-money loans with AI
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-pretty text-base text-slate-600 sm:text-lg">
            Enter the deal, upload docs per stage, and get checklist and structuring help tailored to where you are in the file.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-medium text-violet-800 ring-1 ring-violet-200/80">
              Stage-aware guidance
            </span>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 ring-1 ring-slate-200">
              Save session
            </span>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 ring-1 ring-slate-200">
              PDF &amp; images for analysis
            </span>
          </div>
        </section>

        {/* Thin options strip */}
        <section className="w-full rounded-xl border border-slate-200 bg-white px-5 py-3.5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm font-medium text-slate-800">
              Loan session &amp; options
              {loanData.loanId ? (
                <span className="ml-2 font-normal text-slate-500">· {loanData.loanId}</span>
              ) : null}
            </p>
            <button
              type="button"
              onClick={() => loadInputRef.current?.click()}
              className="text-sm font-medium text-violet-600 hover:text-violet-700 hover:underline"
            >
              Load saved loan…
            </button>
          </div>
          <input ref={loadInputRef} type="file" accept=".json" onChange={loadLoanData} className="hidden" />
        </section>

        {/* Loan details — solid card */}
        <section className="w-full rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="mb-6 text-lg font-semibold text-slate-900">Loan details</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 xl:gap-x-8">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Borrower name</label>
              <input
                type="text"
                value={loanData.borrowerName}
                onChange={(e) => setLoanData({ ...loanData, borrowerName: e.target.value })}
                className={`w-full ${inputFocusRing}`}
                placeholder="John Doe"
              />
            </div>
            <div className="sm:col-span-2 xl:col-span-2">
              <label className="mb-1 block text-sm font-medium text-slate-700">Property address</label>
              <input
                type="text"
                value={loanData.propertyAddress}
                onChange={(e) => setLoanData({ ...loanData, propertyAddress: e.target.value })}
                className={`w-full ${inputFocusRing}`}
                placeholder="123 Main St, City, ST"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Loan type</label>
              <select
                value={loanData.loanType}
                onChange={(e) => setLoanData({ ...loanData, loanType: e.target.value })}
                className={`w-full ${inputFocusRing}`}
              >
                <option value="purchase">Purchase</option>
                <option value="refinance">Refinance</option>
                <option value="fix-and-flip">Fix &amp; Flip</option>
                <option value="bridge">Bridge Loan</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Loan amount ($)</label>
              <input
                type="text"
                value={formatCurrency(loanData.loanAmount)}
                onChange={(e) => {
                  const parsed = parseCurrency(e.target.value);
                  setLoanData({ ...loanData, loanAmount: parsed });
                }}
                className={`w-full ${inputFocusRing}`}
                placeholder="250,000.00"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Property value ($)</label>
              <input
                type="text"
                value={formatCurrency(loanData.propertyValue)}
                onChange={(e) => {
                  const parsed = parseCurrency(e.target.value);
                  setLoanData({ ...loanData, propertyValue: parsed });
                }}
                className={`w-full ${inputFocusRing}`}
                placeholder="350,000.00"
              />
            </div>
            {calculateLTV() ? (
              <div className="flex items-end">
                <div className="w-full rounded-lg border border-violet-100 bg-violet-50 px-3 py-2.5">
                  <p className="text-sm font-medium text-violet-900">LTV: {calculateLTV()}%</p>
                </div>
              </div>
            ) : null}
            <div className="sm:col-span-2 xl:col-span-3">
              <label className="mb-1 block text-sm font-medium text-slate-700">Exit strategy</label>
              <input
                type="text"
                value={loanData.exitStrategy}
                onChange={(e) => setLoanData({ ...loanData, exitStrategy: e.target.value })}
                className={`w-full ${inputFocusRing}`}
                placeholder="Sale after rehab"
              />
            </div>
          </div>
        </section>

        {/* Documents — dashed upload card */}
        <section className="w-full rounded-xl border-2 border-dashed border-slate-300 bg-white p-6 shadow-sm sm:p-10">
          <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-5">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Documents</h2>
              <p className="mt-1 text-sm text-slate-600">
                Files attach to the workflow stage selected below ({stages[currentStage].name}).
              </p>
            </div>
            <button
              type="button"
              onClick={clearCurrentStageDocuments}
              disabled={!stageFiles[currentStage]?.length}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Trash2 className="h-4 w-4" />
              Clear uploads
            </button>
          </div>

          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`mx-auto mt-8 flex max-w-2xl flex-col items-center rounded-xl px-4 py-12 text-center transition-colors ${
              dragActive ? 'bg-violet-50/80' : 'bg-transparent'
            }`}
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-violet-600 shadow-md ring-4 ring-violet-600/15">
              <Upload className="h-7 w-7 text-white" strokeWidth={2} />
            </div>
            <p className="mt-5 text-base font-semibold text-slate-900">Drag &amp; drop files here</p>
            <p className="mt-2 max-w-md text-sm text-slate-600">
              or{' '}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="font-semibold text-violet-600 underline decoration-violet-300 underline-offset-2 hover:text-violet-700"
              >
                click to browse
              </button>{' '}
              — PDF, DOCX, images, spreadsheets, or anything you need reviewed.
            </p>
            <input ref={fileInputRef} type="file" multiple onChange={handleFileInput} className="hidden" />
          </div>

          {stageFiles[currentStage]?.length > 0 ? (
            <div className="mx-auto mt-8 max-w-4xl border-t border-slate-100 pt-6">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-800">
                  Uploaded ({stageFiles[currentStage].length})
                </h3>
              </div>
              <ul className="max-h-56 space-y-2 overflow-y-auto pr-1">
                {stageFiles[currentStage].map((file) => (
                  <li
                    key={file.id}
                    className="flex items-center justify-between gap-3 rounded-lg border border-slate-100 bg-slate-50/90 px-3 py-2.5 transition hover:bg-slate-100"
                  >
                    <div className="flex min-w-0 flex-1 items-center gap-2">
                      <FileText className="h-4 w-4 shrink-0 text-slate-500" />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-slate-900">{file.name}</p>
                        <p className="text-xs text-slate-500">{formatFileSize(file.size)}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(file.id)}
                      className="shrink-0 rounded-lg p-2 text-slate-400 transition hover:bg-white hover:text-red-600"
                      title="Remove"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </section>

        {/* Toolbar — stage + actions */}
        <div className="flex w-full flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <div className="min-w-0 flex-1 sm:min-w-[min(100%,14rem)]">
            <label htmlFor="workflow-stage" className="sr-only">
              Workflow stage
            </label>
            <select
              id="workflow-stage"
              value={currentStage}
              onChange={(e) => changeStage(Number(e.target.value))}
              className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm font-medium text-slate-900 shadow-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/25"
            >
              {stages.map((stage) => {
                const n = stageFiles[stage.id]?.length || 0;
                return (
                  <option key={stage.id} value={stage.id}>
                    {stage.name}
                    {n ? ` (${n} file${n === 1 ? '' : 's'})` : ''}
                  </option>
                );
              })}
            </select>
          </div>
          <button
            type="button"
            onClick={() =>
              analyzeFiles(
                'Identify which documents indicate this is a business purpose loan. List each file name and explain your determination.'
              )
            }
            disabled={isLoading}
            className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-lg border border-violet-200 bg-violet-50 px-4 text-sm font-semibold text-violet-800 shadow-sm transition hover:bg-violet-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Sparkles className="h-4 w-4" />
            Analyze files
          </button>
          <button
            type="button"
            onClick={saveLoanData}
            className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50"
          >
            <Save className="h-4 w-4 text-slate-600" />
            Save session
          </button>
          <button
            type="button"
            onClick={clearChat}
            disabled={isLoading || chatMessages.length === 0}
            className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Trash2 className="h-4 w-4" />
            Clear chat
          </button>
        </div>

        <details className="w-full rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm text-slate-600 shadow-sm">
          <summary className="cursor-pointer select-none font-medium text-slate-800">How to use</summary>
          <ol className="mt-3 list-inside list-decimal space-y-2 text-slate-600">
            <li>Fill in loan details, then choose a workflow stage from the dropdown.</li>
            <li>Upload documents for that stage; use Analyze files when you need AI review of PDFs or images.</li>
            <li>Chat is scoped to the selected stage — switch stages to reset the conversation.</li>
            <li>Save session downloads a JSON file with your loan fields, filenames, chat, and stage (re-upload files after loading).</li>
          </ol>
        </details>

        {/* Assistant preview — dashed card */}
        <section className="flex min-h-[min(52vh,560px)] w-full flex-col rounded-xl border-2 border-dashed border-slate-300 bg-white shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 px-6 py-4 sm:px-8">
            <div className="flex min-w-0 items-center gap-3">
              {React.createElement(stages[currentStage].icon, {
                className: `h-7 w-7 shrink-0 ${colorClasses[stages[currentStage].color].text}`
              })}
              <div className="min-w-0">
                <h2 className="truncate text-lg font-semibold text-slate-900">{stages[currentStage].name}</h2>
                <p className="text-sm text-slate-600">Assistant preview · ask questions below</p>
              </div>
            </div>
          </div>

          <div className="flex flex-1 flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto px-6 py-6 sm:px-8">
              {chatMessages.length === 0 && !isLoading ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-100">
                    <FileText className="h-9 w-9 text-slate-400" strokeWidth={1.5} />
                  </div>
                  <p className="mt-6 text-base font-semibold text-slate-900">No messages yet</p>
                  <p className="mt-2 max-w-sm text-sm text-slate-600">
                    Add context above and send a message — guidance follows your selected workflow stage.
                  </p>
                </div>
              ) : null}

              <div className="space-y-4">
                {chatMessages.map((msg, idx) => (
                  <div key={idx} className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`rounded-xl px-4 py-3 text-sm shadow-sm ${
                        msg.role === 'user'
                          ? 'max-w-[min(92%,42rem)] bg-violet-600 text-white'
                          : 'w-full max-w-[min(100%,72rem)] border border-slate-100 bg-slate-50 text-slate-800'
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  </div>
                ))}
                {isLoading ? (
                  <div className="flex justify-start">
                    <div className="flex items-center gap-2 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                      <Loader2 className="h-5 w-5 animate-spin text-violet-600" />
                      <span className="text-sm text-slate-600">Thinking…</span>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>

            <div className="border-t border-slate-100 bg-slate-50/80 px-6 py-4 sm:px-8">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSendMessage();
                  }}
                  placeholder="Ask about this stage…"
                  className={`min-h-[48px] flex-1 ${inputFocusRing}`}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={handleSendMessage}
                  disabled={isLoading || !userInput.trim()}
                  className="inline-flex min-h-[48px] shrink-0 items-center justify-center rounded-lg bg-violet-600 px-5 text-white shadow-sm ring-1 ring-violet-700/15 transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:ring-0"
                >
                  {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                </button>
              </div>
              <p className="mt-3 text-center text-xs text-slate-500">
                Messages stay in this browser session until you save it. Enter sends your question.
              </p>
            </div>
          </div>
        </section>

        <p className="text-center text-xs text-slate-500">
          Files are not uploaded to our servers unless your deployment forwards them to the AI APIs for chat or analysis.
        </p>

        {/* Resources Section */}
        <div ref={resourcesRef} className="border-t border-slate-200 pt-14">
          <div className="mb-10 text-center">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Resources</h2>
            <p className="mx-auto mt-2 max-w-lg text-slate-600">
              Tools and references from CurvedSpace for treasury workflows and investor relations.
            </p>
          </div>

          <div className="grid w-full grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Free Web App Card */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md w-full min-w-0">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <Rocket className="w-8 h-8 text-white" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2 text-center">Free Web App</h3>
              <p className="text-slate-600 mb-4 text-center text-sm">
                Coming soon! A powerful web application to streamline your treasury management workflows.
              </p>
              <p className="text-slate-400 text-sm text-center">Available soon</p>
            </div>

            {/* Knowledge Base Card */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md w-full min-w-0">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 via-red-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <Layers className="w-8 h-8 text-white" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2 text-center">Knowledge Base</h3>
              <p className="text-slate-600 mb-4 text-center text-sm">
                Articles, guides, and best practices for treasury management and investor relations.
              </p>
              <p className="text-slate-400 text-sm text-center">Coming soon</p>
            </div>

            {/* Tools & Templates Card */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md w-full min-w-0">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 via-pink-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-8 h-8 text-white" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2 text-center">Tools & Templates</h3>
              <p className="text-slate-600 mb-4 text-center text-sm">
                Downloadable templates and tools to help you manage cash flow, track distributions, and optimize processes.
              </p>
              <div className="mt-4">
                <a 
                  href="https://tools.curvedspace.us" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 text-sm font-medium text-violet-600 hover:text-violet-800"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Access Loan Processor AI Tool</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
