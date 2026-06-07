import React, { useState } from 'react';
import { UploadCloud, FileText, CheckCircle2 } from 'lucide-react';
import { GlassCard, GlassBadge, GlassButton } from '../components/GlassComponents';

export default function DocumentUploadCenter() {
  const [uploadedFiles, setUploadedFiles] = useState([
    { name: "soc2_compliance_checklist.txt", size: "12 KB", status: "Processed" },
    { name: "websocket_architecture_v2.txt", size: "45 KB", status: "Indexed" }
  ]);
  const [uploadStatus, setUploadStatus] = useState("");

  const handleUploadSimulate = () => {
    setUploadStatus("Uploading files...");
    setTimeout(() => {
      setUploadedFiles(prev => [...prev, { name: "prd_telemetry_requirements.txt", size: "8 KB", status: "Processed" }]);
      setUploadStatus("Successfully uploaded and indexed in Product Brain!");
    }, 1500);
  };

  return (
    <div className="space-y-6 font-mono text-xs">
      <div>
        <h1 className="text-xl font-bold text-white tracking-wider font-mono">SHARED DOCUMENT UPLOADS</h1>
        <p className="text-[10px] text-gray-500 font-mono">Upload knowledge base files and sync automatically with Vector store memory</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <GlassCard className="p-4 bg-slate-900/60 border-white/5 space-y-4">
            <div className="border border-dashed border-white/10 rounded-2xl p-8 text-center bg-black/20 flex flex-col items-center justify-center space-y-3">
              <UploadCloud className="h-10 w-10 text-cyan-400 animate-bounce" />
              <div>
                <p className="text-xs text-white">Drag and drop knowledge text files here</p>
                <p className="text-[9px] text-gray-500 mt-1">Accepts raw text or markdown (.txt, .md)</p>
              </div>
              <GlassButton variant="primary" onClick={handleUploadSimulate}>Select Files to Upload</GlassButton>
            </div>
            
            {uploadStatus && <div className="text-[10px] text-cyan-400 bg-white/5 border border-white/5 rounded p-2">{uploadStatus}</div>}
          </GlassCard>

          <GlassCard className="p-4 bg-slate-900/60 border-white/5 space-y-4">
            <h2 className="font-bold text-white border-b border-white/5 pb-2">Uploaded Knowledge Base Vault</h2>
            <div className="space-y-2">
              {uploadedFiles.map((f, i) => (
                <div key={i} className="p-2.5 bg-black/20 border border-white/5 rounded flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-cyan-400" />
                    <span>{f.name} ({f.size})</span>
                  </div>
                  <GlassBadge color="green">{f.status}</GlassBadge>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
