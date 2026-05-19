import React, { useState, useMemo } from "react";
import { Search, Hash, Info, ListFilter } from "lucide-react";
import { ProcessedData, AvailableMaterialData } from "../lib/dataProcessor";
import { motion } from "motion/react";

interface QuickSearchProps {
  workshopData: ProcessedData[];
  availableData: AvailableMaterialData[];
  query: string;
  setQuery: (val: string) => void;
}

export const QuickSearch: React.FC<QuickSearchProps> = ({ workshopData, availableData, query, setQuery }) => {

  const results = useMemo(() => {
    if (!query.trim() || query.length < 2) return { workshop: [], available: [] };

    const lowerQuery = query.toLowerCase().trim();
    
    // Filter workshop
    const workshopMatches = workshopData.filter(item => {
      const code = (item.Code || "").toLowerCase();
      const designation = (item.Désignation || "").toLowerCase();
      const sousFamille = (item["SOUS FAMILLE"] || "").toLowerCase();
      const marqueType = (item["MARQUE/TYPE"] || "").toLowerCase();
      return code.includes(lowerQuery) ||
             designation.includes(lowerQuery) || 
             sousFamille.includes(lowerQuery) || 
             marqueType.includes(lowerQuery);
    });

    const availableMatches = availableData.filter(item => {
      const code = (item.Code || "").toLowerCase();
      const designation = (item.Désignation || "").toLowerCase();
      const sousFamille = (item["SOUS FAMILLE"] || "").toLowerCase();
      const marqueType = (item["MARQUE/TYPE"] || "").toLowerCase();
      return code.includes(lowerQuery) ||
             designation.includes(lowerQuery) || 
             sousFamille.includes(lowerQuery) || 
             marqueType.includes(lowerQuery);
    });

    const isAinHallouf = (affect: string) => (affect || "").toUpperCase().includes("AIN HALLOUF");

    return {
      workshop: Array.from(new Set(workshopMatches.map(m => m.Code))).sort(),
      availableAtelier: Array.from(new Set(availableMatches.filter(m => isAinHallouf(m["Affectation Actuel"])).map(m => m.Code))).sort(),
      availableChantier: Array.from(new Set(availableMatches.filter(m => !isAinHallouf(m["Affectation Actuel"])).map(m => m.Code))).sort()
    };
  }, [workshopData, availableData, query]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4"
    >
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
          <Search className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-900">Recherche Rapide (Code Affaire, Désignation...)</h3>
          <p className="text-xs text-slate-500">Filtrer par Code, Désignation, Sous-Famille ou Type</p>
        </div>
      </div>

      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ex: Pompe, Moteur, KOMATSU, PC210..."
          className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
        />
        <ListFilter className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
      </div>

      {query.length >= 2 && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="space-y-4"
        >
          {/* Workshop Results */}
          <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-xs font-bold text-blue-700 uppercase tracking-tight">
                <Hash className="w-3.5 h-3.5" />
                <span>À l'Atelier (En cours)</span>
              </div>
              <div className="px-2 py-0.5 bg-blue-600 text-white rounded-full text-[10px] font-black">
                {results.workshop.length} {results.workshop.length > 1 ? 'CODES' : 'CODE'}
              </div>
            </div>
            {results.workshop.length > 0 ? (
              <div className="text-sm font-mono font-medium text-blue-900 break-words bg-white p-3 rounded-lg border border-blue-50 shadow-sm leading-relaxed">
                {results.workshop.join(" ; ")}
              </div>
            ) : (
              <div className="text-xs text-slate-400 italic py-1">Aucun code en cours d'intervention.</div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Available Atelier Results */}
            <div className="p-4 bg-orange-50/50 rounded-xl border border-orange-100 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-xs font-bold text-orange-700 uppercase tracking-tight">
                  <Hash className="w-3.5 h-3.5" />
                  <span>Disponible à l'Atelier (AIN HALLOUF)</span>
                </div>
                <div className="px-2 py-0.5 bg-orange-500 text-white rounded-full text-[10px] font-black">
                  {results.availableAtelier.length}
                </div>
              </div>
              {results.availableAtelier.length > 0 ? (
                <div className="text-sm font-mono font-medium text-orange-900 break-words bg-white p-3 rounded-lg border border-orange-50 shadow-sm leading-relaxed">
                  {results.availableAtelier.join(" ; ")}
                </div>
              ) : (
                <div className="text-xs text-slate-400 italic py-1">Aucun code dispo à l'Atelier.</div>
              )}
            </div>

            {/* Available Chantier Results */}
            <div className="p-4 bg-green-50/50 rounded-xl border border-green-100 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-xs font-bold text-green-700 uppercase tracking-tight">
                  <Hash className="w-3.5 h-3.5" />
                  <span>Disponible Chantier (Autres)</span>
                </div>
                <div className="px-2 py-0.5 bg-green-600 text-white rounded-full text-[10px] font-black">
                  {results.availableChantier.length}
                </div>
              </div>
              {results.availableChantier.length > 0 ? (
                <div className="text-sm font-mono font-medium text-green-900 break-words bg-white p-3 rounded-lg border border-green-50 shadow-sm leading-relaxed">
                  {results.availableChantier.join(" ; ")}
                </div>
              ) : (
                <div className="text-xs text-slate-400 italic py-1">Aucun code dispo en chantier.</div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};
