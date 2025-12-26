/* 文件位置: frontend/src/pages/ConvertPage.jsx */
import React from 'react';
import { FileText, BookOpen } from 'lucide-react';
import ConvertPanel from '../components/ConvertPanel';

const ConvertPage = () => {
  return (
    <div className="bg-[#f4f1ea] p-6">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8 text-center border-b-2 border-black pb-4">
          <h1 className="font-masthead text-4xl font-bold mb-2 flex items-center justify-center gap-3">
            <BookOpen className="text-black" />
            <span>Document Converter</span>
          </h1>
          <p className="font-serif text-lg italic">Transform your PDF or Word documents into plain text files</p>
        </header>
        
        <main>
          <ConvertPanel />
        </main>
      </div>
    </div>
  );
};

export default ConvertPage;