
import React, { useRef, useEffect, useState } from 'react';
import { geminiService } from '../services/geminiService';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({ value, onChange, placeholder }) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isSourceMode, setIsSourceMode] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);

  useEffect(() => {
    if (editorRef.current && !isSourceMode && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
    }
  }, [value, isSourceMode]);

  const execCommand = (command: string, value: string | undefined = undefined) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const addLink = () => {
    const url = prompt('Enter the URL (e.g. https://google.com):');
    if (url) execCommand('createLink', url);
  };

  const addImage = () => {
    const url = prompt('Enter the image URL:');
    if (url) execCommand('insertImage', url);
  };

  const handleAiRefine = async () => {
    const selection = window.getSelection();
    const selectedText = selection?.toString();
    
    if (!selectedText) {
      alert("Please select a paragraph or sentence to refine with AI.");
      return;
    }

    setIsAiLoading(true);
    try {
      const response = await geminiService.getLearningAssistant(
        `As an expert educator, rewrite and improve the following educational content to be more engaging and clear. Keep the same meaning but make it professional: "${selectedText}"`
      );
      if (response) {
        document.execCommand('insertHTML', false, `<span>${response}</span>`);
        if (editorRef.current) onChange(editorRef.current.innerHTML);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsAiLoading(false);
    }
  };

  const toolbarButtons = [
    { icon: 'fa-bold', command: 'bold', label: 'Bold' },
    { icon: 'fa-italic', command: 'italic', label: 'Italic' },
    { icon: 'fa-underline', command: 'underline', label: 'Underline' },
    { icon: 'fa-list-ul', command: 'insertUnorderedList', label: 'Bullets' },
    { icon: 'fa-list-ol', command: 'insertOrderedList', label: 'Numbers' },
    { icon: 'fa-quote-right', command: 'formatBlock', value: 'blockquote', label: 'Quote' },
  ];

  return (
    <div className="border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden bg-white dark:bg-slate-950 flex flex-col focus-within:ring-2 focus-within:ring-indigo-500/50 transition-all shadow-sm">
      {/* Premium Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-1 p-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 backdrop-blur-sm">
        <div className="flex flex-wrap items-center gap-1">
          {toolbarButtons.map((btn, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => execCommand(btn.command, btn.value)}
              className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all active:scale-90"
              title={btn.label}
              disabled={isSourceMode}
            >
              <i className={`fa-solid ${btn.icon} text-sm`}></i>
            </button>
          ))}
          <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-2"></div>
          <button
            type="button"
            onClick={addLink}
            className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all"
            title="Add Link"
            disabled={isSourceMode}
          >
            <i className="fa-solid fa-link text-sm"></i>
          </button>
          <button
            type="button"
            onClick={addImage}
            className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all"
            title="Insert Image"
            disabled={isSourceMode}
          >
            <i className="fa-solid fa-image text-sm"></i>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleAiRefine}
            disabled={isAiLoading || isSourceMode}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
              isAiLoading 
                ? 'bg-slate-100 text-slate-400' 
                : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-200 dark:shadow-none'
            }`}
          >
            {isAiLoading ? <i className="fa-solid fa-spinner animate-spin"></i> : <i className="fa-solid fa-wand-magic-sparkles"></i>}
            AI Refine
          </button>
          <button
            type="button"
            onClick={() => setIsSourceMode(!isSourceMode)}
            className={`w-9 h-9 flex items-center justify-center rounded-xl transition-all ${
              isSourceMode 
                ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600' 
                : 'text-slate-400 hover:text-slate-600'
            }`}
            title="Toggle Source Code"
          >
            <i className="fa-solid fa-code text-sm"></i>
          </button>
        </div>
      </div>

      {/* Editable Area */}
      <div className="relative min-h-[250px] flex flex-col">
        {isSourceMode ? (
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="flex-1 p-6 font-mono text-sm bg-slate-900 text-emerald-400 focus:outline-none resize-none"
            spellCheck={false}
          />
        ) : (
          <div
            ref={editorRef}
            contentEditable
            onInput={handleInput}
            className="flex-1 p-8 focus:outline-none prose dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 min-h-[250px]"
            data-placeholder={placeholder}
          />
        )}
      </div>
      
      <style>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: #94a3b8;
          font-style: italic;
        }
        .dark [contenteditable]:empty:before {
          color: #475569;
        }
        [contenteditable] img {
          max-width: 100%;
          border-radius: 1.5rem;
          margin: 1.5rem 0;
          box-shadow: 0 10px 30px -10px rgba(0,0,0,0.1);
        }
        [contenteditable] blockquote {
          border-left: 4px solid #6366f1;
          padding-left: 1.5rem;
          color: #6366f1;
          font-style: italic;
          background: rgba(99, 102, 241, 0.03);
          padding-top: 0.5rem;
          padding-bottom: 0.5rem;
          margin: 1.5rem 0;
        }
        [contenteditable] ul, [contenteditable] ol {
          padding-left: 1.5rem;
          margin: 1rem 0;
        }
        [contenteditable] li {
          margin-bottom: 0.5rem;
        }
      `}</style>
    </div>
  );
};

export default RichTextEditor;
