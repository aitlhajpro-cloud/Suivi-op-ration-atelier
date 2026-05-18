/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { FileUploader } from "./components/FileUploader";
import { RecapTable } from "./components/RecapTable";
import { processWorkshopData, ProcessedData, RawData } from "./lib/dataProcessor";
import { motion, AnimatePresence } from "motion/react";
import { LayoutDashboard, Settings, Info, Cloud } from "lucide-react";
import { DriveLinkImport } from "./components/DriveLinkImport";

export default function App() {
  const [rawData, setRawData] = useState<RawData[] | null>(null);
  const [processedData, setProcessedData] = useState<ProcessedData[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleDataLoaded = (data: RawData[]) => {
    setRawData(data);
    const processed = processWorkshopData(data);
    setProcessedData(processed);
  };

  const handleReset = () => {
    setRawData(null);
    setProcessedData([]);
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
        
        <div className="flex items-center space-x-4">
          <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto p-6 md:p-8">
        <AnimatePresence mode="wait">
          {!rawData ? (
            <motion.div
              key="uploader"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8"
            >
              <div className="max-w-2xl mx-auto text-center space-y-4 py-8">
                <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900">
                  Générez vos rapports d'atelier en un clic.
                </h2>
                <p className="text-lg text-slate-600">
                  Uploadez votre fichier de suivi Google Sheets (export XLSX/CSV) pour regrouper les interventions par affaire et filtrer les dossiers clôturés.
                </p>
              </div>

              <FileUploader 
                onDataLoaded={handleDataLoaded} 
                isLoading={isLoading} 
                setIsLoading={setIsLoading} 
              />

              <div className="max-w-2xl mx-auto flex items-center space-x-4 my-4 opacity-50">
                <div className="h-px flex-1 bg-slate-300"></div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">OU</span>
                <div className="h-px flex-1 bg-slate-300"></div>
              </div>

              <DriveLinkImport 
                onDataLoaded={handleDataLoaded} 
                isLoading={isLoading} 
                setIsLoading={setIsLoading} 
              />

              <div className="max-w-xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4 mt-12">
                <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-2">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <Info className="w-4 h-4 text-green-600" />
                  </div>
                  <h3 className="font-bold text-sm">Regroupement intelligent</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Les interventions et numéros DAI sont automatiquement regroupés par code affaire avec un séparateur ";"
                  </p>
                </div>
                <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Settings className="w-4 h-4 text-blue-600" />
                  </div>
                  <h3 className="font-bold text-sm">Filtre automatique</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Les dossiers avec le statut "Clôturé" sont systématiquement exclus du récapitulatif généré.
                  </p>
                </div>
              </div>
            </motion.div>
          ) : (
            <div key="table">
              <RecapTable data={processedData} onReset={handleReset} />
            </div>
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

