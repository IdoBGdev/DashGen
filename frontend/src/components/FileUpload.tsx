import React, { useRef, useState } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react';

interface FileUploadProps {
    onUpload: (file: File) => void;
    isProcessing: boolean;
    fileName?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onUpload, isProcessing, fileName }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isOver, setIsOver] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            onUpload(e.target.files[0]);
        }
    };

    return (
        <div
            onDragOver={(e) => { e.preventDefault(); setIsOver(true); }}
            onDragLeave={() => setIsOver(false)}
            onDrop={(e) => { e.preventDefault(); setIsOver(false); if (e.dataTransfer.files[0]) onUpload(e.dataTransfer.files[0]); }}
            onClick={() => !isProcessing && fileInputRef.current?.click()}
            className={`relative group cursor-pointer border-2 border-dashed rounded-[2rem] p-16 transition-all duration-500 flex flex-col items-center justify-center text-center
        ${isOver ? 'border-blue-500 bg-blue-50/50 scale-[1.02] shadow-2xl shadow-blue-500/10' : ''}
        ${fileName
                    ? 'border-emerald-200 bg-emerald-50/30'
                    : 'border-slate-200 bg-white hover:border-blue-400 hover:shadow-2xl hover:shadow-blue-500/5'
                } ${isProcessing ? 'opacity-50 cursor-not-allowed scale-95' : ''}`}
        >
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept=".csv,.xlsx,.xls"
            />

            <div className={`w-24 h-24 rounded-full mb-8 flex items-center justify-center transition-all duration-500 transform group-hover:rotate-12
        ${fileName ? 'bg-emerald-100 shadow-emerald-200 shadow-inner' : 'bg-blue-50 shadow-blue-100 shadow-inner'}`}>
                {fileName ? (
                    <CheckCircle className="w-10 h-10 text-emerald-600" />
                ) : (
                    <Upload className="w-10 h-10 text-blue-600" />
                )}
            </div>

            <div className="max-w-xs transition-all duration-300">
                <h3 className="text-2xl font-black text-slate-800 tracking-tight">
                    {fileName ? 'Ready to analyze' : 'Drop your dataset'}
                </h3>
                <p className="text-slate-500 font-medium mt-2 leading-relaxed">
                    {fileName ? `Loaded: ${fileName}` : 'Seamlessly process CSV and Excel files in seconds.'}
                </p>
            </div>

            {!fileName && !isProcessing && (
                <div className="mt-8 flex items-center space-x-4">
                    <span className="h-[1px] w-8 bg-slate-200"></span>
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Secure & Local</span>
                    <span className="h-[1px] w-8 bg-slate-200"></span>
                </div>
            )}

            {isProcessing && (
                <div className="mt-8 flex items-center text-blue-600 font-bold space-x-2">
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                    <span className="ml-2">Deep Scanning...</span>
                </div>
            )}
        </div>
    );
};
