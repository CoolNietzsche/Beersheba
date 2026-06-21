/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  UploadCloud, 
  HelpCircle, 
  FolderLock, 
  Terminal, 
  FileCheck, 
  FolderPlus, 
  Loader2,
  ListRestart
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { codebaseGuides } from "../data";

interface UploaderTabProps {
  onAutoGenerate: () => void;
  isGenerating: boolean;
  hasStructure: boolean;
}

export default function UploaderTab({ onAutoGenerate, isGenerating, hasStructure }: UploaderTabProps) {
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.name.endsWith(".zip")) {
        setUploadedFile(file.name);
        setSuccessMessage(`Detected package "${file.name}"! Since this is a live web sandbox, you can drag & drop zip files or follow the manual setup. Click the action button below to unpack your structure.`);
      } else {
        alert("Please drop a valid .zip file containing your Beersheba codebase.");
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.name.endsWith(".zip")) {
        setUploadedFile(file.name);
        setSuccessMessage(`Detected package "${file.name}"! Since this is a live web sandbox, click 'Generate Codebase Shell' to scaffold folders or follow instructions.`);
      } else {
        alert("Please select a .zip file containing your Beersheba codebase.");
      }
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        
        {/* Left Side: Drag & Drop Upload Zone & Codebase Setup Form */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white border border-neutral-100 rounded-2xl p-6 space-y-4">
            <h3 className="text-md font-semibold text-neutral-900 tracking-tight flex items-center gap-2">
              <UploadCloud className="h-4.5 w-4.5 text-neutral-600" />
              <span>Bootstrap beersheba.zip Package</span>
            </h3>
            <p className="text-xs text-neutral-500 leading-normal">
              Drag your Beersheba ZIP file here to simulate unpacking operations, or instantly bootstrap the structural directory framework.
            </p>

            <div 
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl p-8 text-center flex flex-col items-center justify-center transition-all ${
                dragActive 
                ? "border-neutral-900 bg-neutral-900/[0.02]" 
                : "border-neutral-200 hover:border-neutral-300 bg-neutral-50/50"
              }`}
            >
              <UploadCloud className={`h-10 w-10 mb-4 transition-transform duration-300 ${dragActive ? "scale-110 text-neutral-800" : "text-neutral-400"}`} />
              
              <div className="space-y-2">
                <p className="text-xs font-medium text-neutral-800">
                  {uploadedFile ? `Selected: ${uploadedFile}` : "Drag and drop your beersheba.zip here"}
                </p>
                <p className="text-[10px] text-neutral-400">
                  Max file size: 50MB (Only .zip files supported)
                </p>
              </div>

              <div className="relative mt-4">
                <input 
                  type="file" 
                  accept=".zip" 
                  onChange={handleFileChange}
                  className="hidden" 
                  id="zip-uploader" 
                />
                <label 
                  htmlFor="zip-uploader"
                  className="cursor-pointer px-4 py-2 bg-white border border-neutral-200 rounded-xl text-xs font-semibold text-neutral-700 hover:bg-neutral-50 shadow-xs inline-block"
                >
                  Browse local ZIP
                </label>
              </div>
            </div>

            {/* Notification message */}
            <AnimatePresence>
              {successMessage && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-900 text-xs rounded-xl flex gap-3 leading-relaxed"
                >
                  <FileCheck className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold block mb-0.5">ZIP Detected Successfully</span>
                    {successMessage}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={onAutoGenerate}
                disabled={isGenerating}
                className="flex-1 transition-all flex items-center justify-center gap-2 px-4 py-3 bg-neutral-900 text-white rounded-xl text-xs font-semibold hover:bg-neutral-800 active:scale-98 disabled:opacity-70 disabled:cursor-not-allowed shadow-sm"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4.5 w-4.5 animate-spin" />
                    <span>Scaffolding Folder Structure...</span>
                  </>
                ) : hasStructure ? (
                  <>
                    <ListRestart className="h-4.5 w-4.5" />
                    <span>Reset & Rebuild Structure</span>
                  </>
                ) : (
                  <>
                    <FolderPlus className="h-4.5 w-4.5" />
                    <span>Generate Codebase Shell</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Quick Terminal Simulation */}
          <div className="bg-neutral-950 text-neutral-100 rounded-2xl p-5 font-mono text-[11px] space-y-3 shadow-md border border-neutral-800">
            <div className="flex justify-between items-center text-[10px] text-neutral-500 pb-2 border-b border-neutral-900">
              <div className="flex gap-1.5 items-center">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
              </div>
              <span>mesh-cli --daemon</span>
            </div>
            
            <div className="space-y-1 leading-relaxed text-neutral-300">
              <p className="text-neutral-500"># System diagnostic scan initiated...</p>
              <p className="text-neutral-500"># Timestamp: {new Date().toISOString()}</p>
              <p>&gt; checking workspace root: <span className="text-amber-400">/workspace</span></p>
              <p>&gt; found: <span className="text-blue-400">package.json</span>, <span className="text-blue-400">vite.config.ts</span>, <span className="text-blue-400">metadata.json</span></p>
              <p>&gt; scanning archives...</p>
              <p className="text-red-400">&gt; WARNING: "beersheba.zip" package not present in root directory.</p>
              <p className="text-green-400">&gt; status: {hasStructure ? "Scaffold framework mounted" : "Awaiting codebase bootstrap files"}</p>
              {hasStructure && (
                <>
                  <p className="text-white">&gt; directories created successfully: /src/components, /src/utils</p>
                  <p className="text-emerald-400">&gt; hot reloading active.</p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Setup Instructions */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-neutral-100 rounded-2xl p-6 space-y-5">
            <h3 className="text-md font-semibold text-neutral-900 tracking-tight flex items-center gap-2">
              <HelpCircle className="h-4.5 w-4.5 text-neutral-600" />
              <span>Bootstrap Methods</span>
            </h3>

            <div className="space-y-5">
              {codebaseGuides.map((guide, idx) => (
                <div key={idx} className="space-y-3 pb-4 border-b border-neutral-50 last:border-0 last:pb-0">
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-md bg-neutral-100 text-neutral-700 flex items-center justify-center font-mono text-[10px] font-bold mt-0.5 shrink-0">
                      {idx + 1}
                    </span>
                    <div className="space-y-0.5">
                      <h4 className="text-xs font-semibold text-neutral-800">{guide.title}</h4>
                      <p className="text-[11px] text-neutral-500 leading-normal">{guide.description}</p>
                    </div>
                  </div>

                  <ul className="pl-8 space-y-1.5">
                    {guide.steps.map((step, sIdx) => (
                      <li key={sIdx} className="text-[10px] text-neutral-400 flex items-start gap-1.5 leading-normal">
                        <span className="text-neutral-300 select-none">•</span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="p-4 bg-orange-50/50 border border-orange-100 rounded-xl space-y-2">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-orange-950">
                <FolderLock className="h-3.5 w-3.5 text-orange-850 shrink-0" />
                <span>Filesystem Permissions Notice</span>
              </div>
              <p className="text-[10px] text-orange-900/80 leading-normal">
                To guarantee correct package execution, all unpacked codebase files should reside under the <code>/src</code> directory to let Vite successfully bundle them.
              </p>
            </div>
          </div>
        </div>

      </div>
    </motion.div>
  );
}
