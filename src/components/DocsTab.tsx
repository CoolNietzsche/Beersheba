/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { 
  BookOpen, 
  Terminal, 
  ShieldCheck, 
  Database, 
  Layers, 
  FileCode,
  ArrowRight
} from "lucide-react";
import { motion } from "motion/react";

export default function DocsTab() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="bg-white border border-neutral-100 rounded-2xl p-6 md:p-8 space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-neutral-900 text-white rounded-xl">
            <BookOpen className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-neutral-900 tracking-tight">
              Architectural Documentation
            </h2>
            <p className="text-xs text-neutral-500">
              Guideline structure for the Beersheba Platform distributed architecture.
            </p>
          </div>
        </div>

        <p className="text-xs text-neutral-600 leading-relaxed max-w-4xl">
          The Beersheba Platform is built around microservice modularity, a full-stack node gateway, and reactive client dashboards. This guide helps you understand how standard parts map together.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Core Gateway section */}
        <div className="bg-white border border-neutral-100 rounded-2xl p-6 space-y-4">
          <h3 className="text-xs font-mono font-bold text-neutral-450 tracking-wider uppercase flex items-center gap-2">
            <Layers className="h-4 w-4 text-neutral-600" />
            <span>1. Full-Stack Server Architecture</span>
          </h3>
          <p className="text-xs text-neutral-600 leading-relaxed">
            All client requests are proxied via a secure, server-side Express runtime. This guarantees that backend secrets, tokens, or credentials are never leaked directly to client bundles running in the browser.
          </p>

          <div className="bg-neutral-50 border border-neutral-100 rounded-xl p-4 space-y-2">
            <span className="text-[10px] font-mono text-neutral-500 font-semibold block">Sample server.ts Route Handler</span>
            <pre className="text-[10px] text-neutral-700 font-mono overflow-x-auto leading-normal whitespace-pre">
{`import express from "express";
const app = express();

// Secure API endpoint shields secrets
app.get("/api/beersheba/services", async (req, res) => {
  try {
    const data = await fetchServicesMesh();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Mesh connect fail" });
  }
});`}
            </pre>
          </div>
        </div>

        {/* Durable Storage options */}
        <div className="bg-white border border-neutral-100 rounded-2xl p-6 space-y-4">
          <h3 className="text-xs font-mono font-bold text-neutral-450 tracking-wider uppercase flex items-center gap-2">
            <Database className="h-4 w-4 text-neutral-600" />
            <span>2. Persistent Cloud Database</span>
          </h3>
          <p className="text-xs text-neutral-600 leading-relaxed">
            For state preservation across user sessions (such as node configuration updates, metadata alterations, or dashboard analytics), the platform integrates natively with cloud resources like <strong>Firebase Firestore</strong>.
          </p>

          <div className="space-y-3.5 pt-2 text-xs text-neutral-600">
            <div className="flex gap-2.5 items-start">
              <ShieldCheck className="h-4.5 w-4.5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-neutral-800 font-medium">Firestore Collections Schema</strong>
                <p className="text-[11px] text-neutral-500">Includes collections for <code>services/</code>, <code>telemetry/</code>, and <code>profiles/</code> structured securely.</p>
              </div>
            </div>

            <div className="flex gap-2.5 items-start">
              <ShieldCheck className="h-4.5 w-4.5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-neutral-800 font-medium">Deterministic Rulesets</strong>
                <p className="text-[11px] text-neutral-500">Security rules shield database records such that only registered clients can apply modifications.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Directory Layout & Mounting */}
        <div className="bg-white border border-neutral-100 rounded-2xl p-6 space-y-4 md:col-span-2">
          <h3 className="text-xs font-mono font-bold text-neutral-450 tracking-wider uppercase flex items-center gap-2">
            <FileCode className="h-4.5 w-4.5 text-neutral-600" />
            <span>3. Recommended Directory Blueprint</span>
          </h3>
          
          <p className="text-xs text-neutral-600 leading-relaxed">
            Ensure files mapped from your local platform zip align with standard paths shown below to facilitate successful compilation under Vite's bundle step:
          </p>

          <div className="bg-neutral-950 text-neutral-100 rounded-xl p-4 font-mono text-[11px]">
            <pre className="overflow-x-auto select-none">
{`📂 root/
 ├── 📄 package.json          (Dependencies manager; dev bindings)
 ├── 📄 server.ts              (Full-stack entry point; Express server-side APIs)
 ├── 📄 vite.config.ts         (Asset bundle & client-side paths aliases)
 ├── 📂 src/
 │    ├── 📄 App.tsx           (Global Layout manager, state, routes routing)
 │    ├── 📄 index.css         (Tailwind CSS utility loaders)
 │    ├── 📂 components/       (Sub-elements: Node registry lists, alerts)
 │    └── 📂 utils/            (Modular service functions, network connectors)`}
            </pre>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
