import React, { useState } from "react";
import { Link2, ExternalLink, Loader2, Copy, Check } from "lucide-react";
import * as XLSX from "xlsx";
import { RawData } from "../lib/dataProcessor";

const DEFAULT_SHEET_URL = "https://docs.google.com/spreadsheets/d/1K88TlSdwxe-axJHWvH_ERKaJbDSVK5mseYxXkzVo1lQ/edit?gid=1358643693#gid=1358643693";

interface DriveLinkImportProps {
  onDataLoaded: (data: RawData[]) => void;
  isLoading: boolean;
  setIsLoading: (val: boolean) => void;
}

export const DriveLinkImport: React.FC<DriveLinkImportProps> = ({ onDataLoaded, isLoading, setIsLoading }) => {
  const [url, setUrl] = useState("");
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(DEFAULT_SHEET_URL);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy!", err);
    }
  };

  const useDefault = () => {
    setUrl(DEFAULT_SHEET_URL);
  };

  const handleImport = async () => {
    if (!url) return;

    setIsLoading(true);
    try {
      // Extract Google Sheet ID
      const sheetIdMatch = url.match(/\/d\/([\w-_]+)/);
      if (!sheetIdMatch) {
        throw new Error("Lien Google Sheets invalide. Assurez-vous qu'il s'agit d'un lien d'édition ou de partage.");
      }

      const sheetId = sheetIdMatch[1];
      // Force XLSX export URL
      const exportUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=xlsx`;

      const response = await fetch(exportUrl);
      if (!response.ok) {
        throw new Error("Impossible d'accéder au fichier. Vérifiez que l'accès est 'Tous les utilisateurs disposant du lien' en lecture.");
      }

      const arrayBuffer = await response.arrayBuffer();
      const wb = XLSX.read(arrayBuffer, { type: "array" });

      // Try to find "SUIVI OP ATELIER" sheet
      let wsName = wb.SheetNames.find(n => n.toUpperCase() === "SUIVI OP ATELIER");
      if (!wsName) {
        wsName = wb.SheetNames[0];
        console.warn("Sheet 'SUIVI OP ATELIER' not found, using first sheet:", wsName);
      }

      const ws = wb.Sheets[wsName];
      const data = XLSX.utils.sheet_to_json(ws) as RawData[];
      onDataLoaded(data);
    } catch (error: any) {
      console.error("Link import error:", error);
      alert(error.message || "Une erreur est survenue lors de l'importation via le lien.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6 bg-white rounded-2xl border border-slate-200 shadow-sm mt-4">
      <div className="flex items-center space-x-3 mb-4">
        <div className="p-2 bg-green-50 rounded-lg">
          <Link2 className="w-5 h-5 text-green-600" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-900">Importer via Lien Google Drive</h3>
          <p className="text-xs text-slate-500">Le tableau doit être partagé en mode "Tous les utilisateurs disposant du lien"</p>
        </div>
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Collez le lien de votre Google Sheets ici..."
            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all pl-10"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
          <ExternalLink className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>
        <button
          onClick={handleImport}
          disabled={isLoading || !url}
          className="px-6 py-2 bg-slate-900 text-white rounded-lg text-sm font-bold hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Chargement...
            </>
          ) : (
            "Importer"
          )}
        </button>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          onClick={handleCopy}
          className="flex items-center px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-semibold transition-colors border border-slate-200"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3 mr-1.5 text-green-600" /> Lien copié !
            </>
          ) : (
            <>
              <Copy className="w-3 h-3 mr-1.5" /> Copier le lien par défaut
            </>
          )}
        </button>
        <button
          onClick={useDefault}
          className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline transition-all"
        >
          Remplir automatiquement
        </button>
      </div>
    </div>
  );
};
