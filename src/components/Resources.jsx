import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ExternalLink } from 'lucide-react';

export default function Resources() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto p-6 max-w-4xl">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center gap-4 mb-4">
            <Link 
              to="/" 
              className="flex items-center gap-2 text-slate-600 hover:text-slate-800 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Loan Processor</span>
            </Link>
          </div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Resources</h1>
          <p className="text-slate-600">Helpful tools and resources for loan processing</p>
        </div>

        {/* Resources Content */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold text-slate-800 mb-4">Tools & Resources</h2>
          <div className="space-y-4">
            <div className="border border-slate-200 rounded-lg p-4 hover:border-blue-500 transition-colors">
              <a 
                href="https://tools.curvedspace.us" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-blue-600 hover:text-blue-800 font-medium"
              >
                <ExternalLink className="w-5 h-5" />
                <span>Access Loan Processor AI Tool</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
