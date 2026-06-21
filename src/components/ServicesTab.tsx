/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  Plus, 
  Search, 
  Sliders, 
  Activity, 
  Play, 
  Wifi, 
  Settings, 
  RefreshCw, 
  CheckCircle, 
  Info,
  AlertOctagon,
  Wrench
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { ServiceItem } from "../types";

interface ServicesTabProps {
  services: ServiceItem[];
  onToggleStatus: (id: string) => void;
  onUpdateLoad: (id: string, load: number) => void;
  onAddService: (newService: Omit<ServiceItem, "id">) => void;
}

export default function ServicesTab({ services, onToggleStatus, onUpdateLoad, onAddService }: ServicesTabProps) {
  const [filter, setFilter] = useState<string>("all");
  const [search, setSearch] = useState<string>("");
  const [activeSimulation, setActiveSimulation] = useState<string | null>(null);
  const [simulationLogs, setSimulationLogs] = useState<string[]>(["[mesh] Mesh router gateway initiated."]);
  const [showAddForm, setShowAddForm] = useState(false);

  // New Service state
  const [newName, setNewName] = useState("");
  const [newCategory, setNewCategory] = useState("Infrastructure");
  const [newLoad, setNewLoad] = useState(10);

  const categories = ["all", "Infrastructure", "Business & Innovation", "Education & Tech", "Utility", "Social & Tourism", "Cyberspace / IT"];

  const filteredServices = services.filter((service) => {
    const matchesCategory = filter === "all" || service.category === filter;
    const matchesSearch = service.name.toLowerCase().includes(search.toLowerCase()) || 
                          service.category.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const runSimulation = (id: string, name: string) => {
    setActiveSimulation(id);
    const logMsg = `[simulation] Router dispatch to [${name}] ... resolved in ${Math.floor(Math.random() * 20) + 4}ms (Status: 200 OK)`;
    setSimulationLogs(prev => [logMsg, ...prev].slice(0, 8));
    
    setTimeout(() => {
      setActiveSimulation(null);
    }, 600);
  };

  const handleCreateService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    onAddService({
      name: newName,
      category: newCategory,
      status: "operational",
      load: newLoad
    });
    setNewName("");
    setNewLoad(10);
    setShowAddForm(false);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <div>
          <h2 className="text-lg font-semibold text-neutral-900 tracking-tight">
            Node Registry Mesh Gateway
          </h2>
          <p className="text-xs text-neutral-500 leading-normal">
            Track, query, and adjust node statuses for the Beersheba local microservice routers.
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 px-4 py-2 bg-neutral-900 text-white rounded-xl text-xs font-semibold hover:bg-neutral-800 active:scale-95 shadow-sm ml-auto md:ml-0"
        >
          <Plus className="h-4 w-4" />
          <span>Register New Node</span>
        </button>
      </div>

      {/* Add New Service Form Modal-Like Card */}
      <AnimatePresence>
        {showAddForm && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleCreateService}
            className="bg-neutral-50 border border-neutral-100 rounded-2xl p-5 space-y-4 overflow-hidden"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] text-neutral-500 font-mono tracking-wider uppercase block">Service Node Name</label>
                <input 
                  type="text" 
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Beersheba Energy Grid Microservice"
                  className="w-full bg-white border border-neutral-200 px-3 py-2 rounded-xl text-xs font-sans text-neutral-800 focus:outline-none focus:border-neutral-900" 
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-neutral-500 font-mono tracking-wider uppercase block">Category</label>
                <select 
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full bg-white border border-neutral-200 px-3 py-2 rounded-xl text-xs font-sans text-neutral-800 focus:outline-none focus:border-neutral-900"
                >
                  {categories.filter(c => c !== "all").map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-neutral-500 font-mono tracking-wider uppercase block">Initial Target Load (%)</label>
                <input 
                  type="range" 
                  min="0" 
                  max="100"
                  value={newLoad}
                  onChange={(e) => setNewLoad(parseInt(e.target.value))}
                  className="w-full"
                />
                <span className="text-[10px] text-neutral-400 font-mono block text-right">{newLoad}%</span>
              </div>
            </div>

            <div className="flex gap-2.5 justify-end">
              <button 
                type="button" 
                onClick={() => setShowAddForm(false)}
                className="px-3 py-2 bg-white border border-neutral-200 text-neutral-700 rounded-xl text-xs font-medium hover:bg-neutral-50"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="px-4 py-2 bg-neutral-900 text-white rounded-xl text-xs font-medium hover:bg-neutral-800"
              >
                Register Node
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Query Bar */}
      <div id="query-bar" className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
          <input 
            type="text" 
            placeholder="Search registered services, tags, or components..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-neutral-100 pl-10 pr-4 py-2.5 rounded-xl text-xs text-neutral-800 focus:outline-none focus:border-neutral-200 shadow-xs"
          />
        </div>

        {/* Filter categories */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-colors ${
                filter === cat 
                ? "bg-neutral-900 text-white" 
                : "bg-white border border-neutral-100 text-neutral-500 hover:text-neutral-900"
              }`}
            >
              {cat === "all" ? "All Categories" : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Main interactive list and live simulation simulator console */}
      <div id="live-services-grid" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Services List Box */}
        <div className="lg:col-span-2 space-y-4">
          <AnimatePresence mode="popLayout">
            {filteredServices.map((service) => (
              <motion.div
                key={service.id}
                layout
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white border border-neutral-100 p-5 rounded-2xl shadow-xs flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center hover:border-neutral-200 transition-colors"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${
                      service.status === "operational" ? "bg-emerald-500 animate-pulse" : 
                      service.status === "maintenance" ? "bg-amber-500" : "bg-red-500"
                    }`} />
                    <h3 className="font-semibold text-neutral-900 text-xs tracking-tight">{service.name}</h3>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 items-center text-[10px] text-neutral-400 font-mono">
                    <span className="bg-neutral-50 border border-neutral-100 text-neutral-600 px-1.5 py-0.5 rounded">
                      {service.category}
                    </span>
                    <span>•</span>
                    <span>Node ID: {service.id}</span>
                    <span>•</span>
                    <span>Target Load: <strong className="text-neutral-700">{service.load}%</strong></span>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto justify-end pt-3 sm:pt-0 border-t sm:border-t-0 border-neutral-50">
                  {/* Slider simulation */}
                  <div className="flex items-center gap-2 w-24 shrink-0">
                    <Sliders className="h-3 w-3 text-neutral-400" />
                    <input 
                      type="range" 
                      min="0" 
                      max="100" 
                      value={service.load}
                      onChange={(e) => onUpdateLoad(service.id, parseInt(e.target.value))}
                      className="w-full accent-neutral-900 cursor-pointer"
                    />
                  </div>

                  {/* Actions */}
                  <button
                    onClick={() => onToggleStatus(service.id)}
                    className={`p-2 rounded-lg border transition-all text-xs flex items-center justify-center ${
                      service.status === "operational" 
                        ? "border-amber-100 bg-amber-50/50 text-amber-700 hover:bg-amber-100" 
                        : "border-emerald-100 bg-emerald-50/50 text-emerald-700 hover:bg-emerald-100"
                    }`}
                    title={service.status === "operational" ? "Simulate Maintenance" : "Recover Node"}
                  >
                    {service.status === "operational" ? <Wrench className="h-3.5 w-3.5" /> : <CheckCircle className="h-3.5 w-3.5" />}
                  </button>

                  <button
                    disabled={activeSimulation !== null}
                    onClick={() => runSimulation(service.id, service.name)}
                    className="flex items-center justify-center p-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 disabled:opacity-50 text-white"
                    title="Dispatch simulator call"
                  >
                    {activeSimulation === service.id ? (
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Play className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
              </motion.div>
            ))}

            {filteredServices.length === 0 && (
              <div className="bg-white border border-neutral-50 text-center py-12 rounded-2xl text-neutral-400 text-xs space-y-2">
                <AlertOctagon className="h-8 w-8 mx-auto text-neutral-300" />
                <p>No registered platform services found matching the specifications.</p>
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* Live Simulator Logs Box */}
        <div id="live-logs-terminal" className="bg-neutral-950 text-neutral-300 rounded-2xl p-5 flex flex-col h-[340px] border border-neutral-800">
          <div className="flex justify-between items-center text-[10px] text-neutral-500 pb-3 border-b border-neutral-900 shrink-0">
            <span className="flex items-center gap-1.5 font-mono">
              <Activity className="h-3 w-3 text-emerald-400 animate-pulse" />
              <span>LIVE CORE SIMULATOR CONSOLE</span>
            </span>
            <span className="font-mono text-[9px] bg-neutral-900 px-1.5 py-0.5 rounded text-neutral-400">WS GATEWAY</span>
          </div>

          <div className="flex-1 overflow-y-auto font-mono text-[10px] space-y-1.5 pt-4 scrollbar-thin scrollbar-thumb-neutral-900">
            {simulationLogs.map((log, idx) => (
              <p 
                key={idx} 
                className={`leading-normal ${
                  log.includes("resolved") ? "text-emerald-400" :
                  log.includes("dispatch") ? "text-blue-400" : "text-neutral-500"
                }`}
              >
                {log}
              </p>
            ))}
          </div>

          <div className="pt-2 border-t border-neutral-900 shrink-0 flex justify-between items-center text-[9px] text-neutral-500">
            <span>Buffer limit: 8 metrics</span>
            <button 
              onClick={() => setSimulationLogs(["[mesh] Console logs cleared manually."])}
              className="hover:text-white transition-colors"
            >
              Clear Buffer
            </button>
          </div>
        </div>

      </div>
    </motion.div>
  );
}
