import React, { useState, useMemo } from "react";
import { Search, Hash, Info, ListFilter } from "lucide-react";
import { ProcessedData, AvailableMaterialData } from "../lib/dataProcessor";
import { motion } from "motion/react";

interface QuickSearchProps {
  workshopData: ProcessedData[];
  availableData: AvailableMaterialData[];
}

export const QuickSearch: React.FC<QuickSearchProps> = ({ workshopData, availableData }) => {
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    if (!query.trim() || query.length < 2) return { workshop: [], available: [] };

    const lowerQuery = query.toLowerCase().trim();
    
    // Filter workshop
    const workshopMatches = workshopData.filter(item => {
      const designation = (item.Désignation || "").toLowerCase();
      const sousFamille = (item["SOUS FAMILLE"] || "").toLowerCase();
      const marqueType = (item["MARQUE/TYPE"] || "").toLowerCase();
      return designation.includes(lowerQuery) || 
             sousFamille.includes(lowerQuery) || 
             marqueType.includes(lowerQuery);
    });

    const availableMatches = availableData.filter(item => {
      const designation = (item.Désignation || "").toLowerCase();
      const sousFamille = (item["SOUS FAMILLE"] || "").toLowerCase();
      const marqueType = (item["MARQUE/TYPE"] || "").toLowerCase();
      return designation.includes(lowerQuery) || 
             sousFamille.includes(lowerQuery) || 
             marqueType.includes(lowerQuery);
    });

    return {
      workshop: Array.from(new Set(workshopMatches.map(m => m.Code))).sort(),
      available: Array.from(new Set(availableMatches.map(m => m.Code))).sort()
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
          <h3 className="text-sm font-bold text-slate-900">Recherche Rapide par Catégorie</h3>
          <p className="text-xs text-slate-500">Filtrer par Désignation, Sous-Famille ou Type</p>
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
                <span>À l'Atelier</span>
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

          {/* Available Results */}
          <div className="p-4 bg-green-50/50 rounded-xl border border-green-100 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-xs font-bold text-green-700 uppercase tracking-tight">
                <Hash className="w-3.5 h-3.5" />
                <span>Disponible (Archivé)</span>
              </div>
              <div className="px-2 py-0.5 bg-green-600 text-white rounded-full text-[10px] font-black">
                {results.available.length} {results.available.length > 1 ? 'CODES' : 'CODE'}
              </div>
            </div>
            {results.available.length > 0 ? (
              <div className="text-sm font-mono font-medium text-green-900 break-words bg-white p-3 rounded-lg border border-green-50 shadow-sm leading-relaxed">
                {results.available.join(" ; ")}
              </div>
            ) : (
              <div className="text-xs text-slate-400 italic py-1">Aucun code archivé disponible.</div>
            )}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};
