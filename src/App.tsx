/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo } from "react";
import { FileUploader } from "./components/FileUploader";
import { RecapTable } from "./components/RecapTable";
import { AvailableMaterialTable } from "./components/AvailableMaterialTable";
import { QuickSearch } from "./components/QuickSearch";
import { processWorkshopData, processAvailableMaterial, ProcessedData, AvailableMaterialData, RawData } from "./lib/dataProcessor";
import { motion, AnimatePresence } from "motion/react";
import { LayoutDashboard, Settings, Info, Cloud, ArrowRight, Table } from "lucide-react";
import { DriveLinkImport } from "./components/DriveLinkImport";

export interface WorkbookData {
  workshop: RawData[];
  available: RawData[];
}

export default function App() {
  const [hasData, setHasData] = useState(false);
  const [processedWorkshop, setProcessedWorkshop] = useState<ProcessedData[]>([]);
  const [processedAvailable, setProcessedAvailable] = useState<AvailableMaterialData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"workshop" | "available">("workshop");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredWorkshop = useMemo(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) return processedWorkshop;
    const lowerQuery = searchQuery.toLowerCase().trim();
    return processedWorkshop.filter(item => {
      const code = (item.Code || "").toLowerCase();
      const designation = (item.Désignation || "").toLowerCase();
      const sousFamille = (item["SOUS FAMILLE"] || "").toLowerCase();
      const marqueType = (item["MARQUE/TYPE"] || "").toLowerCase();
      return code.includes(lowerQuery) ||
             designation.includes(lowerQuery) || 
             sousFamille.includes(lowerQuery) || 
             marqueType.includes(lowerQuery);
    });
  }, [processedWorkshop, searchQuery]);

  const filteredAvailable = useMemo(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) return processedAvailable;
    const lowerQuery = searchQuery.toLowerCase().trim();
    return processedAvailable.filter(item => {
      const code = (item.Code || "").toLowerCase();
      const designation = (item.Désignation || "").toLowerCase();
      const sousFamille = (item["SOUS FAMILLE"] || "").toLowerCase();
      const marqueType = (item["MARQUE/TYPE"] || "").toLowerCase();
      return code.includes(lowerQuery) ||
             designation.includes(lowerQuery) || 
             sousFamille.includes(lowerQuery) || 
             marqueType.includes(lowerQuery);
    });
  }, [processedAvailable, searchQuery]);

  const handleDataLoaded = (data: WorkbookData) => {
    setHasData(true);
    setProcessedWorkshop(processWorkshopData(data.workshop));
    setProcessedAvailable(processAvailableMaterial(data.available));
  };

  const handleReset = () => {
    setHasData(false);
    setProcessedWorkshop([]);
    setProcessedAvailable([]);
    setSearchQuery("");
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans selection:bg-blue-100">
      {/* Header */}
      <header className="bg-white border-bottom border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm print:hidden">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
            <LayoutDashboard className="text-white w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight">WorkshopManager</h1>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Suivi des Opérations</p>
          </div>
        </div>
        
        {hasData && (
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button 
              onClick={() => setActiveTab("workshop")}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === "workshop" ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Atelier
            </button>
            <button 
              onClick={() => setActiveTab("available")}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === "available" ? 'bg-white text-green-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Matériel Dispo
            </button>
          </div>
        )}

        <div className="flex items-center space-x-4">
          <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="max-w-[1500px] mx-auto p-6 md:p-8">
        <AnimatePresence mode="wait">
          {!hasData ? (
            <motion.div
              key="uploader"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8"
            >
              <div className="max-w-2xl mx-auto text-center space-y-4 py-8">
                <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 leading-tight">
                  Gestion centralisée de votre <span className="text-blue-600">Atelier</span> et de votre <span className="text-green-600">Parc</span>.
                </h2>
                <p className="text-lg text-slate-600">
                  Importez votre fichier Excel contenant les feuilles "SUIVI OP ATELIER" et "MATERIEL DISPONIBLE (archivé)".
                </p>
              </div>

              <DriveLinkImport 
                onDataLoaded={handleDataLoaded} 
                isLoading={isLoading} 
                setIsLoading={setIsLoading} 
              />

              <div className="max-w-2xl mx-auto flex items-center space-x-4 my-4 opacity-50">
                <div className="h-px flex-1 bg-slate-300"></div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">OU</span>
                <div className="h-px flex-1 bg-slate-300"></div>
              </div>

              <FileUploader 
                onDataLoaded={handleDataLoaded} 
                isLoading={isLoading} 
                setIsLoading={setIsLoading} 
              />

              <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4 mt-12">
                <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                    <LayoutDashboard className="w-5 h-5 text-blue-600" />
                  </div>
                  <h3 className="font-bold text-base text-slate-900">Suivi Atelier</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Regroupement des interventions par code affaire, exclusion des dossiers clôturés et calcul automatique des délais.
                  </p>
                </div>
                <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-3">
                  <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                    <Table className="w-5 h-5 text-green-600" />
                  </div>
                  <h3 className="font-bold text-base text-slate-900">Matériel Disponible</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Vue d'ensemble du matériel archivé, calcul du temps total de réparation et suivi des affectations actuelles.
                  </p>
                </div>
                <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                    <Cloud className="w-5 h-5 text-orange-600" />
                  </div>
                  <h3 className="font-bold text-base text-slate-900">Export Multi-format</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Générez instantanément des rapports PDF ou Word de vos tableaux avec application automatique de vos filtres.
                  </p>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="table-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-8"
            >
              <QuickSearch 
                workshopData={processedWorkshop} 
                availableData={processedAvailable}
                query={searchQuery}
                setQuery={setSearchQuery}
              />
              
              {activeTab === "workshop" ? (
                <RecapTable data={filteredWorkshop} onReset={handleReset} />
              ) : (
                <AvailableMaterialTable data={filteredAvailable} onReset={handleReset} />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer Details */}
      <footer className="max-w-[1400px] mx-auto px-8 py-12 border-t border-slate-200 mt-12 print:hidden">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-sm text-slate-500">
            © 2026 WorkshopManager - Système de génération de rapports.
          </p>
          <div className="flex items-center space-x-6 text-sm font-medium text-slate-600">
            <a href="#" className="hover:text-blue-600 transition-colors">Aide</a>
            <a href="#" className="hover:text-blue-600 transition-colors">Confidentialité</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

