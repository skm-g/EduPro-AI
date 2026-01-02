
import React from 'react';
import { Certificate } from '../types';
import Button from './Button';

interface CertificateModalProps {
  certificate: Certificate;
  onClose: () => void;
}

const CertificateModal: React.FC<CertificateModalProps> = ({ certificate, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-8">
      <div 
        className="absolute inset-0 bg-slate-900/80 backdrop-blur-md transition-opacity" 
        onClick={onClose}
      ></div>
      
      <div className="relative bg-white dark:bg-slate-900 rounded-[32px] w-full max-w-4xl max-h-[95vh] overflow-hidden shadow-2xl flex flex-col border border-white/20">
        {/* Controls */}
        <div className="p-4 flex justify-between items-center bg-slate-50 dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800 print:hidden">
          <div className="flex gap-3">
             <Button variant="outline" size="sm" onClick={handlePrint}>
               <i className="fa-solid fa-download mr-2"></i> Save / Print
             </Button>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <i className="fa-solid fa-xmark text-xl"></i>
          </button>
        </div>

        {/* Certificate Body */}
        <div className="flex-1 overflow-y-auto p-12 bg-white print:p-0 print:m-0 flex items-center justify-center">
          <div 
            id="certificate-print-area"
            className="relative w-full max-w-[800px] aspect-[1.414/1] bg-white border-[16px] border-indigo-600/10 p-12 flex flex-col items-center justify-between text-center overflow-hidden shadow-inner print:shadow-none print:border-indigo-600/20"
          >
            {/* Decorative Background Elements */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-50 border-b-8 border-l-8 border-indigo-600 -mr-20 -mt-20 rotate-45 opacity-50"></div>
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-indigo-50 border-t-8 border-r-8 border-indigo-600 -ml-20 -mb-20 rotate-45 opacity-50"></div>
            
            <header className="space-y-4">
              <div className="w-20 h-20 bg-indigo-600 rounded-2xl flex items-center justify-center text-white mx-auto shadow-xl mb-6">
                <i className="fa-solid fa-graduation-cap text-4xl"></i>
              </div>
              <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic">Certificate of Completion</h1>
              <div className="h-1 w-32 bg-indigo-600 mx-auto rounded-full"></div>
            </header>

            <main className="space-y-6">
              <p className="text-slate-500 font-bold uppercase tracking-[0.3em] text-xs">This is to certify that</p>
              <h2 className="text-5xl font-black text-indigo-700 tracking-tight">{certificate.studentName}</h2>
              <p className="text-slate-500 max-w-lg mx-auto font-medium text-lg leading-relaxed">
                has successfully completed the online course
              </p>
              <h3 className="text-3xl font-black text-slate-900 tracking-tight">"{certificate.courseTitle}"</h3>
              <p className="text-slate-500 font-medium">
                issued on <span className="text-slate-900 font-bold">{certificate.completionDate}</span>
              </p>
            </main>

            <footer className="w-full flex justify-between items-end gap-10 border-t border-slate-100 pt-10 mt-10">
              <div className="text-left space-y-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Instructor</p>
                <p className="text-lg font-black text-slate-900 border-b-2 border-indigo-600 inline-block pb-1">{certificate.instructorName}</p>
                <p className="text-[10px] text-slate-400 italic">EduPro Senior Faculty</p>
              </div>

              <div className="space-y-3">
                <div className="w-20 h-20 border-4 border-indigo-600/20 rounded-full flex items-center justify-center mx-auto bg-indigo-50/50">
                   <div className="w-14 h-14 bg-indigo-600 rounded-full flex items-center justify-center text-white text-xl">
                      <i className="fa-solid fa-award"></i>
                   </div>
                </div>
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Verified by EduPro AI</div>
              </div>

              <div className="text-right space-y-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Roll Number</p>
                <p className="text-sm font-black text-slate-900 font-mono tracking-tighter">{certificate.rollNumber}</p>
                <div className="flex justify-end gap-1 mt-2">
                   {/* Mock small QR-like block */}
                   <div className="grid grid-cols-3 gap-0.5">
                      {Array.from({length: 9}).map((_,i) => (
                        <div key={i} className={`w-1.5 h-1.5 ${Math.random() > 0.5 ? 'bg-indigo-600' : 'bg-slate-200'}`}></div>
                      ))}
                   </div>
                </div>
              </div>
            </footer>
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #certificate-print-area, #certificate-print-area * {
            visibility: visible;
          }
          #certificate-print-area {
            position: absolute;
            left: 0;
            top: 0;
            margin: 0;
            width: 100%;
            height: auto;
            border: none;
          }
        }
      `}</style>
    </div>
  );
};

export default CertificateModal;
