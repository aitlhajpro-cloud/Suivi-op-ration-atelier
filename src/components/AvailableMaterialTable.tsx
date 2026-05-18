import React, { useState, useMemo } from "react";
import { Download, FileText, Printer, Eye, EyeOff, Filter, ArrowUpDown, ChevronUp, ChevronDown } from "lucide-react";
import { AvailableMaterialData } from "../lib/dataProcessor";
import { exportToPDF, exportToWord } from "../lib/exportUtils";
import { motion, AnimatePresence } from "motion/react";

interface AvailableMaterialTableProps {
  data: AvailableMaterialData[];
  onReset: () => void;
}

type ColumnKey = keyof AvailableMaterialData;

export const AvailableMaterialTable: React.FC<AvailableMaterialTableProps> = ({ data, onReset }) => {
  const [visibleColumns, setVisibleColumns] = useState<Record<ColumnKey, boolean>>({
    Code: true,
    Désignation: true,
    "SOUS FAMILLE": true,
    "MARQUE/TYPE": true,
    "Jours en Réparation": true,
    "Date de disponibilité": true,
    "Affectation Actuel": true,
    "Date D'affectation": true,
  });

  const [showFilter, setShowFilter] = useState(false);
  const [sortConfig, setSortConfig] = useState<{ key: ColumnKey; direction: 'asc' | 'desc' } | null>(null);

  const toggleColumn = (key: ColumnKey) => {
    setVisibleColumns(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSort = (key: ColumnKey) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedData = useMemo(() => {
    if (!sortConfig) return data;
    
    return [...data].sort((a, b) => {
      const valA = String(a[sortConfig.key] || "");
      const valB = String(b[sortConfig.key] || "");
      
      const isNumberCol = sortConfig.key === "Jours en Réparation";
      
      if (isNumberCol) {
        const numA = parseFloat(valA) || 0;
        const numB = parseFloat(valB) || 0;
        return sortConfig.direction === 'asc' ? numA - numB : numB - numA;
      }
      
      return sortConfig.direction === 'asc' 
        ? valA.localeCompare(valB, undefined, { sensitivity: 'base' })
        : valB.localeCompare(valA, undefined, { sensitivity: 'base' });
    });
  }, [data, sortConfig]);

  const allColumns: { key: ColumnKey; label: string }[] = [
    { key: "Code", label: "Code" },
    { key: "Désignation", label: "Désignation" },
    { key: "SOUS FAMILLE", label: "Sous Famille" },
    { key: "MARQUE/TYPE", label: "Marque/Type" },
    { key: "Jours en Réparation", label: "Jours Réparation" },
    { key: "Date de disponibilité", label: "Date Dispo" },
    { key: "Affectation Actuel", label: "Affectation" },
    { key: "Date D'affectation", label: "Date Affectation" },
  ];

  if (data.length === 0) {
    return (
      <div className="text-center p-12 bg-white rounded-xl border border-gray-200">
        <p className="text-gray-500 italic">Aucune donnée trouvée dans la feuille "MATERIEL DISPONIBLE (archivé)".</p>
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center p-4 bg-white rounded-xl border border-gray-200 shadow-sm gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 text-green-600">Matériel Disponible (Archivé)</h2>
          <p className="text-sm text-gray-500">{data.length} matériels répertoriés</p>
        </div>
        <div className="flex flex-wrap gap-2 print:hidden">
          <button 
            onClick={() => setShowFilter(!showFilter)}
            className={`flex items-center px-4 py-2 rounded-lg transition-colors text-sm font-medium border ${showFilter ? 'bg-green-50 border-green-200 text-green-700' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}`}
          >
            <Filter className="w-4 h-4 mr-2" /> Colonnes
          </button>
          <button 
            onClick={() => exportToPDF(sortedData, visibleColumns, "Materiel Disponible")}
            className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium shadow-sm"
          >
            <Download className="w-4 h-4 mr-2" /> PDF
          </button>
          <button 
            onClick={() => exportToWord(sortedData, visibleColumns, "Materiel Disponible")}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium shadow-sm"
          >
            <FileText className="w-4 h-4 mr-2" /> Word
          </button>
          <button 
            onClick={handlePrint}
            className="flex items-center px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition-colors text-sm font-medium shadow-sm"
          >
            <Printer className="w-4 h-4 mr-2" /> Imprimer
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showFilter && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden bg-white border border-slate-200 rounded-xl p-4 shadow-sm print:hidden"
          >
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Affichage des colonnes</div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {allColumns.map(col => (
                <button
                  key={col.key}
                  onClick={() => toggleColumn(col.key)}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium border transition-all ${
                    visibleColumns[col.key] 
                      ? 'bg-green-50 border-green-200 text-green-700 shadow-sm' 
                      : 'bg-slate-50 border-slate-200 text-slate-400 opacity-60'
                  }`}
                >
                  <span className="truncate">{col.label}</span>
                  {visibleColumns[col.key] ? <Eye className="w-3 h-3 ml-2" /> : <EyeOff className="w-3 h-3 ml-2" />}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="overflow-x-auto bg-white rounded-xl border border-gray-200 shadow-sm print:shadow-none print:border-none">
        <table className="min-w-full divide-y divide-gray-200 text-xs md:text-sm">
          <thead className="bg-gray-50 sticky top-0 z-10">
            <tr className="divide-x divide-gray-200">
              {allColumns.map(col => visibleColumns[col.key] && (
                <th 
                  key={col.key}
                  onClick={() => handleSort(col.key)}
                  className="px-4 py-3 text-left font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap cursor-pointer hover:bg-gray-100 transition-colors group"
                >
                  <div className="flex items-center space-x-1">
                    <span>{col.label}</span>
                    <span className="text-gray-400 group-hover:text-green-500">
                      {sortConfig?.key === col.key ? (
                        sortConfig.direction === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                      ) : (
                        <ArrowUpDown className="w-3 h-3 opacity-30 group-hover:opacity-100" />
                      )}
                    </span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedData.map((row, idx) => (
              <tr key={row.Code + idx} className="hover:bg-gray-50 divide-x divide-gray-200 transition-colors">
                {visibleColumns.Code && <td className="px-4 py-3 font-mono font-medium">{row.Code}</td>}
                {visibleColumns.Désignation && <td className="px-4 py-3 min-w-[200px] text-gray-800">{row.Désignation || <span className="text-slate-300 italic">Non spécifié</span>}</td>}
                {visibleColumns["SOUS FAMILLE"] && <td className="px-4 py-3 whitespace-nowrap">{row["SOUS FAMILLE"]}</td>}
                {visibleColumns["MARQUE/TYPE"] && <td className="px-4 py-3 whitespace-nowrap">{row["MARQUE/TYPE"]}</td>}
                {visibleColumns["Jours en Réparation"] && (
                  <td className="px-4 py-3 whitespace-nowrap text-center font-bold text-slate-600 bg-slate-50/50">
                    {row["Jours en Réparation"]} j
                  </td>
                )}
                {visibleColumns["Date de disponibilité"] && <td className="px-4 py-3 whitespace-nowrap font-medium text-green-600 bg-green-50/20">{row["Date de disponibilité"]}</td>}
                {visibleColumns["Affectation Actuel"] && <td className="px-4 py-3 font-medium text-blue-700">{row["Affectation Actuel"]}</td>}
                {visibleColumns["Date D'affectation"] && <td className="px-4 py-3 whitespace-nowrap text-gray-500">{row["Date D'affectation"]}</td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};
