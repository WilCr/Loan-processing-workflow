import React, { useState, useRef, useEffect } from 'react';
import { FileText, CheckCircle, Circle, Send, Loader2, AlertCircle, Calculator, Home, FileCheck, DollarSign, BookOpen, Rocket, Layers, BarChart3, ExternalLink, Upload, X, Save, FolderOpen, CheckCircle2, HelpCircle, Trash2 } from 'lucide-react';

export default function HardMoneyLoanProcessor() {
  const resourcesRef = useRef(null);
  const fileInputRef = useRef(null);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-300 to-slate-400">
      <div className="w-full max-w-none mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-800 mb-2">Private Money Loan Processor AI</h1>
              <p className="text-slate-600">AI-powered workflow assistant for private money lending</p>
              {loanData.loanId && (
                <p className="text-sm text-slate-500 mt-1">Loan ID: {loanData.loanId}</p>
              )}
            </div>
            <div className="flex items-center gap-3">
              <a
                href="https://curvedspace.us"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <ExternalLink className="w-5 h-5" />
                <span>CurvedSpace Investment</span>
              </a>
              <button
                onClick={scrollToResources}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <BookOpen className="w-5 h-5" />
                <span>Resources</span>
              </button>
            </div>
          </div>
          {/* Save/Load Buttons */}
          <div className="flex items-center gap-3 pt-4 border-t border-slate-200">
            <button
              onClick={saveLoanData}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Save className="w-5 h-5" />
              <span>Save Loan</span>
            </button>
            <label className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors cursor-pointer">
              <FolderOpen className="w-5 h-5" />
              <span>Load Loan</span>
              <input
                type="file"
                accept=".json"
                onChange={loadLoanData}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Save Success Notification */}
        {showSaveSuccess && (
          <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 z-50 animate-fade-in">
            <CheckCircle2 className="w-5 h-5" />
            <span>Loan data saved successfully!</span>
          </div>
        )}

        {/* Loan Details — full width (wireframe: below nav) */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6 w-full min-w-0">
          <h2 className="text-xl font-bold text-slate-800 mb-4">Loan Details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-x-8 gap-y-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Borrower Name</label>
              <input
                type="text"
                value={loanData.borrowerName}
                onChange={(e) => setLoanData({...loanData, borrowerName: e.target.value})}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="John Doe"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Property Address</label>
              <input
                type="text"
                value={loanData.propertyAddress}
                onChange={(e) => setLoanData({...loanData, propertyAddress: e.target.value})}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="123 Main St, City, ST"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Loan Type</label>
              <select
                value={loanData.loanType}
                onChange={(e) => setLoanData({...loanData, loanType: e.target.value})}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="purchase">Purchase</option>
                <option value="refinance">Refinance</option>
                <option value="fix-and-flip">Fix & Flip</option>
                <option value="bridge">Bridge Loan</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Loan Amount ($)</label>
              <input
                type="text"
                value={formatCurrency(loanData.loanAmount)}
                onChange={(e) => {
                  const parsed = parseCurrency(e.target.value);
                  setLoanData({...loanData, loanAmount: parsed});
                }}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="250,000.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Property Value ($)</label>
              <input
                type="text"
                value={formatCurrency(loanData.propertyValue)}
                onChange={(e) => {
                  const parsed = parseCurrency(e.target.value);
                  setLoanData({...loanData, propertyValue: parsed});
                }}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="350,000.00"
              />
            </div>
            {calculateLTV() && (
              <div className="flex items-end">
                <div className="w-full bg-blue-50 border border-blue-200 rounded-md p-3">
                  <p className="text-sm font-medium text-blue-800">LTV Ratio: {calculateLTV()}%</p>
                </div>
              </div>
            )}
            <div className="sm:col-span-2 xl:col-span-3">
              <label className="block text-sm font-medium text-slate-700 mb-1">Exit Strategy</label>
              <input
                type="text"
                value={loanData.exitStrategy}
                onChange={(e) => setLoanData({...loanData, exitStrategy: e.target.value})}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Sale after rehab"
              />
            </div>
          </div>
        </div>

        {/* Wireframe: left column ≈31% (Documents, Workflow); right ≈69% (stage chat, How to Use) */}
        <div className="grid grid-cols-1 lg:grid-cols-[31fr_69fr] gap-6 lg:items-stretch">
          {/* Documents */}
          <div className="bg-white rounded-lg shadow-lg p-6 flex flex-col min-w-0 w-full">
                <div className="flex items-center justify-between gap-2 mb-4">
                  <h2 className="text-xl font-bold text-slate-800">Documents</h2>
                  <button
                    type="button"
                    onClick={clearCurrentStageDocuments}
                    disabled={!stageFiles[currentStage]?.length}
                    className="text-sm px-3 py-1.5 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-1.5"
                    title="Remove all files for this stage"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Clear
                  </button>
                </div>
                
                <div className="flex-1 flex flex-col">
                  {/* Drag and Drop Zone */}
                  <div
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors flex-shrink-0 ${
                      dragActive 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-slate-300 hover:border-slate-400'
                    }`}
                  >
                    <Upload className={`w-8 h-8 mx-auto mb-2 ${dragActive ? 'text-blue-500' : 'text-slate-400'}`} />
                    <p className="text-sm text-slate-600 mb-2">
                      Drag and drop files here, or
                    </p>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                    >
                      browse files
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      onChange={handleFileInput}
                      className="hidden"
                    />
                  </div>

                  {/* File List */}
                  {stageFiles[currentStage] && stageFiles[currentStage].length > 0 && (
                    <div className="mt-4 flex-1 flex flex-col min-h-0">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-semibold text-slate-700">
                          Uploaded Files ({stageFiles[currentStage].length})
                        </h3>
                        <button
                          onClick={() => analyzeFiles('Identify which documents indicate this is a business purpose loan. List each file name and explain your determination.')}
                          disabled={isLoading}
                          className="px-3 py-1 bg-purple-600 text-white text-xs rounded-lg hover:bg-purple-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
                        >
                          <AlertCircle className="w-3 h-3" />
                          Analyze Files
                        </button>
                      </div>
                      <div className="flex-1 overflow-y-auto space-y-2">
                        {stageFiles[currentStage].map((file) => (
                          <div
                            key={file.id}
                            className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                          >
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <FileText className="w-4 h-4 text-slate-500 flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-slate-800 truncate">
                                  {file.name}
                                </p>
                                <p className="text-xs text-slate-500">
                                  {formatFileSize(file.size)}
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={() => removeFile(file.id)}
                              className="ml-2 p-1 text-slate-400 hover:text-red-600 transition-colors flex-shrink-0"
                              title="Remove file"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
          </div>

          {/* Stage assistant — wireframe "Application & Docs" panel (title follows selected stage) */}
          <div className="bg-white rounded-lg shadow-lg min-h-[min(70vh,720px)] lg:min-h-[calc(100vh-260px)] flex flex-col min-w-0 w-full">
              {/* Chat Header */}
              <div className="border-b border-slate-200 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    {React.createElement(stages[currentStage].icon, { 
                      className: `w-6 h-6 flex-shrink-0 ${colorClasses[stages[currentStage].color].text}` 
                    })}
                    <div className="min-w-0">
                      <h2 className="text-xl font-bold text-slate-800">{stages[currentStage].name}</h2>
                      <p className="text-sm text-slate-600">Ask questions or request assistance</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={clearChat}
                    disabled={isLoading || chatMessages.length === 0}
                    className="text-sm px-3 py-1.5 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-1.5 flex-shrink-0"
                    title="Clear all messages in this chat"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Clear chat
                  </button>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {chatMessages.length === 0 && (
                  <div className="text-center py-12">
                    <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500">Start a conversation with your AI assistant</p>
                    <p className="text-sm text-slate-400 mt-2">Ask about checklists, calculations, or next steps</p>
                  </div>
                )}
                
                {chatMessages.map((msg, idx) => (
                  <div key={idx} className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`rounded-lg p-4 ${
                      msg.role === 'user'
                        ? 'bg-blue-600 text-white max-w-[min(92%,42rem)]'
                        : 'bg-slate-100 text-slate-800 w-full max-w-[min(100%,72rem)]'
                    }`}>
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  </div>
                ))}
                
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-slate-100 rounded-lg p-4">
                      <Loader2 className="w-5 h-5 animate-spin text-slate-600" />
                    </div>
                  </div>
                )}
              </div>

              {/* Chat Input */}
              <div className="border-t border-slate-200 p-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Ask about this stage..."
                    className="flex-1 px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={isLoading}
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={isLoading || !userInput.trim()}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                  >
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                  </button>
                </div>
              </div>
          </div>

          {/* Workflow Stages */}
          <div className="bg-white rounded-lg shadow-lg p-6 flex flex-col min-w-0 w-full">
            <h2 className="text-xl font-bold text-slate-800 mb-4">Workflow Stages</h2>
            <div className="space-y-2 flex-1">
              {stages.map((stage) => {
                const Icon = stage.icon;
                const isActive = stage.id === currentStage;
                const colors = colorClasses[stage.color];
                const fileCount = stageFiles[stage.id]?.length || 0;
                return (
                  <button
                    key={stage.id}
                    onClick={() => changeStage(stage.id)}
                    className={`w-full flex items-center justify-between gap-3 p-3 rounded-lg transition-all border-2 ${
                      isActive 
                        ? `${colors.bg} ${colors.border}` 
                        : 'bg-slate-50 hover:bg-slate-100 border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? colors.text : 'text-slate-500'}`} />
                      <span className={`font-medium text-left truncate ${isActive ? colors.textDark : 'text-slate-700'}`}>
                        {stage.name}
                      </span>
                    </div>
                    {fileCount > 0 && (
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold flex-shrink-0 ${
                        isActive ? 'bg-white text-blue-600' : 'bg-blue-100 text-blue-600'
                      }`}>
                        {fileCount}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* How to Use */}
          <div className="bg-white rounded-lg shadow-lg p-6 flex flex-col min-w-0 w-full">
            <div className="flex items-center gap-2 mb-4">
              <HelpCircle className="w-6 h-6 text-blue-600 flex-shrink-0" />
              <h2 className="text-xl font-bold text-slate-800">How to Use</h2>
            </div>
            <div className="space-y-3 text-sm text-slate-700 flex-1">
              <div>
                <p className="font-semibold text-slate-800 mb-1">1. Enter Loan Details</p>
                <p className="text-slate-600">Fill in borrower information, property address, loan amount, and property value. The LTV ratio will calculate automatically.</p>
              </div>
              <div>
                <p className="font-semibold text-slate-800 mb-1">2. Upload Documents</p>
                <p className="text-slate-600">Drag and drop files or click "browse files" to upload documents for the current workflow stage.</p>
              </div>
              <div>
                <p className="font-semibold text-slate-800 mb-1">3. Select Workflow Stage</p>
                <p className="text-slate-600">Click on any stage in the Workflow Stages list to switch between different stages of the loan process.</p>
              </div>
              <div>
                <p className="font-semibold text-slate-800 mb-1">4. Chat with AI Assistant</p>
                <p className="text-slate-600">Ask questions or request assistance in the chat interface. The AI provides stage-specific guidance based on your current workflow stage.</p>
              </div>
              <div>
                <p className="font-semibold text-slate-800 mb-1">5. Save Your Work</p>
                <p className="text-slate-600">Use the "Save Loan" button to export your loan data, documents, and chat history. Load it later using "Load Loan".</p>
              </div>
            </div>
          </div>
        </div>

        {/* Resources Section */}
        <div ref={resourcesRef} className="mt-12 pt-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-slate-800 mb-2">Resources</h2>
            <p className="text-slate-600">Tools and resources to help optimize your treasury operations and investor relations.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
            {/* Free Web App Card */}
            <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow w-full min-w-0">
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
            <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow w-full min-w-0">
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
            <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow w-full min-w-0">
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
                  className="flex items-center justify-center gap-2 text-blue-600 hover:text-blue-800 font-medium text-sm"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Access Loan Processor AI Tool</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
