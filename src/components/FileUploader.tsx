import React, { useRef } from "react";
import { Upload, FileType, FileSpreadsheet } from "lucide-react";
import * as XLSX from "xlsx";
import { RawData } from "../lib/dataProcessor";

interface FileUploaderProps {
  onDataLoaded: (data: RawData[]) => void;
  isLoading: boolean;
  setIsLoading: (val: boolean) => void;
}

export const FileUploader: React.FC<FileUploaderProps> = ({ onDataLoaded, isLoading, setIsLoading }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processFile(file);
  };

  const processFile = (file: File) => {
    setIsLoading(true);
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        
        // Try to find "SUIVI OP ATELIER" sheet
        let wsName = wb.SheetNames.find(n => n.toUpperCase() === "SUIVI OP ATELIER");
        if (!wsName) {
           wsName = wb.SheetNames[0]; // Fallback to first sheet
           console.warn("Sheet 'SUIVI OP ATELIER' not found, using first sheet:", wsName);
        }
        
        const ws = wb.Sheets[wsName];
        const data = XLSX.utils.sheet_to_json(ws) as RawData[];
        onDataLoaded(data);
      } catch (error) {
        console.error("Error parsing file:", error);
        alert("Erreur lors de la lecture du fichier. Assurez-vous qu'il s'agit d'un fichier Excel valide.");
      } finally {
        setIsLoading(false);
      }
    };
    reader.readAsBinaryString(file);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  };

  return (
    <div 
      className="w-full max-w-2xl mx-auto p-8 border-2 border-dashed border-gray-300 rounded-2xl bg-white hover:border-blue-500 transition-all cursor-pointer group"
      onDragOver={onDragOver}
      onDrop={onDrop}
      onClick={() => fileInputRef.current?.click()}
    >
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        className="hidden" 
        accept=".xlsx, .xls, .csv" 
      />
      <div className="flex flex-col items-center justify-center space-y-4">
        <div className="p-4 bg-blue-50 rounded-full group-hover:bg-blue-100 transition-colors">
          <Upload className="w-8 h-8 text-blue-600" />
        </div>
        <div className="text-center">
          <p className="text-lg font-medium text-gray-900">
            {isLoading ? "Traitement en cours..." : "Cliquez ou glissez votre fichier Excel ici"}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Recherche la feuille "SUIVI OP ATELIER" par défaut
          </p>
        </div>
        <div className="flex space-x-2">
           <FileSpreadsheet className="w-5 h-5 text-green-600" />
           <span className="text-xs font-mono text-gray-400">.xlsx, .xls, .csv</span>
        </div>
      </div>
    </div>
  );
};
