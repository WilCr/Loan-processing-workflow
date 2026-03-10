import React, { useState, useRef } from 'react';
import { FileText, CheckCircle, Circle, Send, Loader2, AlertCircle, Calculator, Home, FileCheck, DollarSign, BookOpen, Rocket, Layers, BarChart3, ExternalLink } from 'lucide-react';

export default function HardMoneyLoanProcessor() {
  const resourcesRef = useRef(null);
  const [currentStage, setCurrentStage] = useState(0);
  const [loanData, setLoanData] = useState({
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
  const [stageNotes, setStageNotes] = useState({});

  const scrollToResources = () => {
    resourcesRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
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

  const handleSendMessage = async () => {
    if (!userInput.trim() || isLoading) return;

    const newMessage = { role: 'user', content: userInput };
    setChatMessages(prev => [...prev, newMessage]);
    setUserInput('');
    setIsLoading(true);

    try {
      const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY || process.env.REACT_APP_ANTHROPIC_API_KEY;
      
      if (!apiKey) {
        throw new Error('API key not configured. Please set VITE_ANTHROPIC_API_KEY or REACT_APP_ANTHROPIC_API_KEY environment variable.');
      }

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          system: stagePrompts[currentStage],
          messages: [...chatMessages, newMessage].map(msg => ({
            role: msg.role,
            content: typeof msg.content === 'string' ? msg.content : msg.content
          }))
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `API error: ${response.status}`);
      }

      const data = await response.json();
      const aiResponse = data.content.find(item => item.type === 'text')?.text || 'Sorry, I encountered an error.';
      
      setChatMessages(prev => [...prev, { role: 'assistant', content: aiResponse }]);
    } catch (error) {
      setChatMessages(prev => [...prev, { 
        role: 'assistant', 
        content: `Error: ${error.message}. Please check your API key configuration.` 
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto p-6 max-w-7xl">
        {/* CurvedSpace Investment Link */}
        <div className="mb-4 text-center">
          <a 
            href="https://curvedspace.us" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-semibold text-lg transition-colors"
          >
            <ExternalLink className="w-5 h-5" />
            <span>CurvedSpace Investment</span>
          </a>
        </div>
        
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-800 mb-2">Private Money Loan Processor AI</h1>
              <p className="text-slate-600">AI-powered workflow assistant for private money lending</p>
            </div>
            <button
              onClick={scrollToResources}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <BookOpen className="w-5 h-5" />
              <span>Resources</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel - Loan Info & Stages */}
          <div className="lg:col-span-1 space-y-6">
            {/* Loan Details */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold text-slate-800 mb-4">Loan Details</h2>
              <div className="space-y-3">
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
                    type="number"
                    value={loanData.loanAmount}
                    onChange={(e) => setLoanData({...loanData, loanAmount: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="250000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Property Value ($)</label>
                  <input
                    type="number"
                    value={loanData.propertyValue}
                    onChange={(e) => setLoanData({...loanData, propertyValue: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="350000"
                  />
                </div>
                {calculateLTV() && (
                  <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                    <p className="text-sm font-medium text-blue-800">LTV Ratio: {calculateLTV()}%</p>
                  </div>
                )}
                <div>
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

            {/* Workflow Stages */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold text-slate-800 mb-4">Workflow Stages</h2>
              <div className="space-y-2">
                {stages.map((stage) => {
                  const Icon = stage.icon;
                  const isActive = stage.id === currentStage;
                  const colors = colorClasses[stage.color];
                  return (
                    <button
                      key={stage.id}
                      onClick={() => changeStage(stage.id)}
                      className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all border-2 ${
                        isActive 
                          ? `${colors.bg} ${colors.border}` 
                          : 'bg-slate-50 hover:bg-slate-100 border-transparent'
                      }`}
                    >
                      <Icon className={`w-5 h-5 ${isActive ? colors.text : 'text-slate-500'}`} />
                      <span className={`font-medium ${isActive ? colors.textDark : 'text-slate-700'}`}>
                        {stage.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Panel - AI Chat */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg h-[calc(100vh-200px)] flex flex-col">
              {/* Chat Header */}
              <div className="border-b border-slate-200 p-4">
                <div className="flex items-center gap-3">
                  {React.createElement(stages[currentStage].icon, { 
                    className: `w-6 h-6 ${colorClasses[stages[currentStage].color].text}` 
                  })}
                  <div>
                    <h2 className="text-xl font-bold text-slate-800">{stages[currentStage].name}</h2>
                    <p className="text-sm text-slate-600">Ask questions or request assistance</p>
                  </div>
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
                  <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-3xl rounded-lg p-4 ${
                      msg.role === 'user' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-slate-100 text-slate-800'
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
          </div>
        </div>

        {/* Resources Section */}
        <div ref={resourcesRef} className="mt-12 pt-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-slate-800 mb-2">Resources</h2>
            <p className="text-slate-600">Tools and resources to help optimize your treasury operations and investor relations.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Free Web App Card */}
            <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
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
            <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
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
            <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
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
