/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { 
  AlertTriangle, 
  Layers, 
  Cpu, 
  Activity, 
  Terminal, 
  Compass, 
  CheckCircle,
  FileCode,
  ArrowRight
} from "lucide-react";
import { motion } from "motion/react";
import { ActiveTab } from "../types";

interface DashboardTabProps {
  onNavigate: (tab: ActiveTab) => void;
  serviceCount: number;
}

export default function DashboardTab({ onNavigate, serviceCount }: DashboardTabProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Codebase Missing Alert Banner */}
      <div id="missing-alert-banner" className="relative overflow-hidden bg-amber-50/70 border border-amber-200 rounded-2xl p-6 md:p-8">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-amber-100/30 rounded-full blur-2xl" />
        
        <div className="relative flex flex-col md:flex-row gap-6 items-start justify-between">
          <div className="flex gap-4 items-start">
            <div id="alert-icon-ring" className="p-3 bg-amber-100 text-amber-800 rounded-xl mt-1">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div className="space-y-2">
              <h2 className="text-lg font-semibold text-amber-900 tracking-tight">
                Codebase ZIP Not Found
              </h2>
              <p className="text-sm text-neutral-600 max-w-2xl leading-relaxed">
                The <span className="font-medium text-amber-950">beersheba.zip</span> codebase package was not found in the root workspace. We have initialized this modern Beersheba Platform Dashboard structure as an elegant foundation for your project.
              </p>
              <div className="text-xs text-neutral-500 font-mono flex items-center gap-2 mt-4">
                <Terminal className="h-3.5 w-3.5" />
                <span>workspace_root &gt; scan_complete &gt; files: 0 zip detected</span>
              </div>
            </div>
          </div>
          
          <button 
            id="btn-goto-uploader"
            onClick={() => onNavigate(ActiveTab.Uploader)}
            className="w-full md:w-auto shrink-0 transition-all flex items-center justify-center gap-2 px-5 py-3 bg-neutral-900 text-white rounded-xl text-sm font-medium hover:bg-neutral-800 active:scale-95 shadow-sm"
          >
            <span>Load Codebase ZIP</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Grid of system metrics */}
      <div id="metrics-grid" className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div id="metric-card-1" className="bg-white border border-neutral-100 p-6 rounded-2xl shadow-xs hover:shadow-md transition-shadow duration-300">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-xs text-neutral-400 font-mono tracking-wider uppercase">Active Microservices</span>
              <p className="text-3xl font-semibold text-neutral-900 font-sans tracking-tight">{serviceCount}</p>
            </div>
            <div className="p-2.5 bg-neutral-50 text-neutral-700 rounded-xl">
              <Layers className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-xs">
            <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-700 rounded font-medium">94.1% Live</span>
            <span className="text-neutral-500">Service mesh health optimal</span>
          </div>
        </div>

        <div id="metric-card-2" className="bg-white border border-neutral-100 p-6 rounded-2xl shadow-xs hover:shadow-md transition-shadow duration-300">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-xs text-neutral-400 font-mono tracking-wider uppercase">Mesh Request Load</span>
              <p className="text-3xl font-semibold text-neutral-900 font-sans tracking-tight">39.5%</p>
            </div>
            <div className="p-2.5 bg-neutral-50 text-neutral-700 rounded-xl">
              <Cpu className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-xs">
            <span className="px-1.5 py-0.5 bg-neutral-50 text-neutral-600 rounded font-medium">Balanced Load</span>
            <span className="text-neutral-500">Average memory: 1.2 GB / pod</span>
          </div>
        </div>

        <div id="metric-card-3" className="bg-white border border-neutral-100 p-6 rounded-2xl shadow-xs hover:shadow-md transition-shadow duration-300">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-xs text-neutral-400 font-mono tracking-wider uppercase">Network Telemetry</span>
              <p className="text-3xl font-semibold text-neutral-900 font-sans tracking-tight">14ms</p>
            </div>
            <div className="p-2.5 bg-neutral-50 text-neutral-700 rounded-xl">
              <Activity className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-xs">
            <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-700 rounded font-medium">Pristine</span>
            <span className="text-neutral-500">Zero packet drops reported</span>
          </div>
        </div>
      </div>

      {/* Technical Detail Pane */}
      <div id="detail-card" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div id="quick-overview-box" className="lg:col-span-2 bg-white border border-neutral-100 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-md font-semibold text-neutral-900 tracking-tight flex items-center gap-2">
              <Compass className="h-4.5 w-4.5 text-neutral-600" />
              <span>Platform Setup Instructions</span>
            </h3>
            <span className="text-[10px] text-neutral-400 font-mono tracking-widest uppercase">Overview</span>
          </div>
          
          <div className="space-y-4 leading-relaxed text-sm text-neutral-600">
            <p>
              The <strong>Beersheba Platform</strong> is a distributed, service-oriented ecosystem. To mount the custom production client on this live environment, you have several quick mechanisms:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="p-4 bg-neutral-50 rounded-xl space-y-2">
                <div className="w-6 h-6 rounded-full bg-neutral-900 text-white flex items-center justify-center text-xs font-bold">1</div>
                <h4 className="font-semibold text-neutral-800 text-xs">Upload ZIP File</h4>
                <p className="text-xs text-neutral-500 leading-normal">
                  Toggle to the <strong>Codebase Uploader</strong> to learn how to inject your workspace archive directly.
                </p>
              </div>

              <div className="p-4 bg-neutral-50 rounded-xl space-y-2">
                <div className="w-6 h-6 rounded-full bg-neutral-900 text-white flex items-center justify-center text-xs font-bold">2</div>
                <h4 className="font-semibold text-neutral-800 text-xs">Establish API Routes</h4>
                <p className="text-xs text-neutral-500 leading-normal">
                  Inject Node or Express server bindings at <code>server.ts</code> to facilitate local services.
                </p>
              </div>

              <div className="p-4 bg-neutral-50 rounded-xl space-y-2">
                <div className="w-6 h-6 rounded-full bg-neutral-900 text-white flex items-center justify-center text-xs font-bold">3</div>
                <h4 className="font-semibold text-neutral-800 text-xs">Integrate UI Views</h4>
                <p className="text-xs text-neutral-500 leading-normal">
                  Create component files underneath <code>/src/components</code> to display your modules directly.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Workspace info & system specs */}
        <div id="system-specs-box" className="bg-white border border-neutral-100 rounded-2xl p-6 space-y-4">
          <h3 className="text-md font-semibold text-neutral-900 tracking-tight flex items-center gap-2">
            <FileCode className="h-4.5 w-4.5 text-neutral-600" />
            <span>Active Workspace Specs</span>
          </h3>

          <div className="space-y-3.5 pt-1 text-xs">
            <div className="flex justify-between items-center pb-2 border-b border-neutral-50">
              <span className="text-neutral-400">Environment Host</span>
              <span className="font-mono font-medium text-neutral-700">Cloud Run</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-neutral-50">
              <span className="text-neutral-400">Target Framework</span>
              <span className="font-mono font-medium text-neutral-700">React + Vite + TS</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-neutral-50">
              <span className="text-neutral-400">Tailwind Engine</span>
              <span className="font-mono font-medium text-neutral-700">v4.1.14 (@import)</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-neutral-50">
              <span className="text-neutral-400">Main Gateway Node</span>
              <span className="font-mono font-medium text-neutral-700">Express v4.21.2</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-neutral-400">Listening Port</span>
              <span className="font-mono font-medium text-neutral-750 bg-neutral-100 px-1.5 py-0.5 rounded">3000 (Proxy Router)</span>
            </div>
          </div>

          <div className="p-3 bg-neutral-50 rounded-xl flex items-center gap-2 mt-4 text-xs">
            <CheckCircle className="h-4.5 w-4.5 text-emerald-600 shrink-0" />
            <span className="text-neutral-600">Dev server running cleanly in background.</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
