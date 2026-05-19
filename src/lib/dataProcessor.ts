import * as XLSX from "xlsx";

export interface RawData {
  [key: string]: any;
}

export interface ProcessedData {
  Code: string;
  Désignation: string;
  "SOUS FAMILLE": string;
  "MARQUE/TYPE": string;
  Intervention: string;
  "Date Commande Pièces": string;
  "N° DAI": string;
  "Date Prévu MO": string;
  "Date planifiée": string;
  "MARGE EN (JRS)": string;
  "Date Départ": string;
  "Jours en Atelier": string;
}

export interface AvailableMaterialData {
  Code: string;
  Désignation: string;
  "SOUS FAMILLE": string;
  "MARQUE/TYPE": string;
  "Jours en Réparation": string;
  "Date de disponibilité": string;
  "Affectation Actuel": string;
  "Date D'affectation": string;
}

/**
 * Calculates number of days between two dates (DD/MM/YYYY)
 */
function calculateDaysDiff(startStr: string, endStr: string): number {
  if (!startStr || !endStr) return 0;
  try {
    const p1 = startStr.split("/");
    const p2 = endStr.split("/");
    if (p1.length !== 3 || p2.length !== 3) return 0;
    
    const start = new Date(parseInt(p1[2], 10), parseInt(p1[1], 10) - 1, parseInt(p1[0], 10));
    const end = new Date(parseInt(p2[2], 10), parseInt(p2[1], 10) - 1, parseInt(p2[0], 10));
    
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);
    
    const diff = end.getTime() - start.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  } catch (e) {
    return 0;
  }
}

/**
 * Calculates number of days between a date (DD/MM/YYYY) and today
 */
function calculateDaysInWorkshop(formattedDate: string): string {
  if (!formattedDate) return "";
  const parts = formattedDate.split("/");
  if (parts.length !== 3) return "";
  
  const d = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10) - 1;
  const y = parseInt(parts[2], 10);
  
  const startDate = new Date(y, m, d);
  const today = new Date();
  
  // Set to midnight for clean day calculation
  startDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  
  const diffTime = today.getTime() - startDate.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays >= 0 ? String(diffDays) : "0";
}

/**
 * Formats various date inputs (Excel serial, Date object, string) to DD/MM/YYYY
 */
function formatExcelDate(value: any): string {
  if (value === null || value === undefined || value === "") return "";
  
  let date: Date;
  
  if (value instanceof Date) {
    date = value;
  } else if (typeof value === "number") {
    // Handle Excel serial date
    date = XLSX.SSF.parse_date_code(value) as any;
    // SSF returns an object {y, m, d, ...}. Convert to Date.
    const dObj = date as any;
    date = new Date(dObj.y, dObj.m - 1, dObj.d);
  } else {
    // Try to parse string
    const stringVal = String(value).trim();
    if (!stringVal) return "";
    
    // Check if it's already in a recognizable format or needs splitting
    // Some common formats: YYYY-MM-DD, DD/MM/YYYY, MM/DD/YYYY
    const parts = stringVal.split(/[-/]/);
    if (parts.length === 3) {
      // Very basic heuristic for DD/MM/YYYY or MM/DD/YYYY
      // If first part > 12, it's likely DD
      // Since the request is for DD/MM/YYYY, if it's already a string, we might just return it if it looks valid
      // But let's try to normalize it.
      if (parts[0].length === 4) {
        // YYYY-MM-DD
        date = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
      } else {
        // Assume DD/MM/YYYY or MM/DD/YYYY
        // For workshop data in French context, usually DD/MM/YYYY
        const d = Number(parts[0]);
        const m = Number(parts[1]);
        const y = Number(parts[2]);
        if (y > 100) {
           date = new Date(y, m - 1, d);
        } else {
           return stringVal; // Return as is if we can't reliably parse
        }
      }
    } else {
      date = new Date(stringVal);
    }
  }

  if (isNaN(date.getTime())) return String(value);

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  
  return `${day}/${month}/${year}`;
}

export function processWorkshopData(rawData: RawData[]): ProcessedData[] {
  // Normalize row keys to handle potential trailing spaces like "Désignation "
  // and internal newlines sometimes found in Excel headers
  const normalizedRawData = rawData.map(row => {
    const newRow: any = {};
    for (const key in row) {
      const cleanKey = key.replace(/[\r\n]+/g, ' ').replace(/\s+/g, ' ').trim();
      newRow[cleanKey] = row[key];
    }
    return newRow;
  });

  // Filter out closed operations/interventions
  const filteredData = normalizedRawData.filter((row) => {
    const statusOp = String(row["Statut Opération"] || "").toLowerCase().trim();
    const statusInt = String(row["Statut"] || "").toLowerCase().trim();
    
    const isClosed = (s: string) => {
      if (!s) return false;
      const normalized = s.toLowerCase().trim();
      // Catch variations: Clôturé, Cloturé, Clôturée, Cloturée, Clôture, Cloture
      return normalized.startsWith("clot") || normalized.startsWith("clôt");
    };
    
    // Explicitly ignore if EITHER status is closed
    return !isClosed(statusOp) && !isClosed(statusInt);
  });

  const groupedByCode: { [code: string]: ProcessedData } = {};

  filteredData.forEach((row) => {
    const code = String(row["Code"] || "N/A").trim();
    if (!code || code === "N/A") return;

    const designation = String(row["Désignation"] || row["Designation"] || "").trim();
    const type = String(row["Type"] || "").trim();
    const marque = String(row["Marque"] || "").trim();
    const marqueType = [marque, type].filter(Boolean).join(" / ");
    
    const startDateRaw = row["Date Départ Intervention"] || row["Date Départ"] || row["Date Commencement"];
    const startDate = formatExcelDate(startDateRaw);

    if (!groupedByCode[code]) {
      groupedByCode[code] = {
        Code: code,
        Désignation: designation,
        "SOUS FAMILLE": String(row["SOUS FAMILLE"] || ""),
        "MARQUE/TYPE": marqueType,
        Intervention: String(row["Intervention"] || ""),
        "Date Commande Pièces": formatExcelDate(row["Date Commande Pièces"]),
        "N° DAI": String(row["N° DAI"] || ""),
        "Date Prévu MO": formatExcelDate(row["Date Prévu MO"]),
        "Date planifiée": formatExcelDate(row["Date planifiée"]),
        "MARGE EN (JRS)": String(row["MARGE EN (JRS)"] || ""),
        "Date Départ": startDate,
        "Jours en Atelier": "",
      };
    } else {
      const existing = groupedByCode[code];
      
      const newValIntervention = String(row["Intervention"] || "").trim();
      if (newValIntervention && !existing.Intervention.includes(newValIntervention)) {
        existing.Intervention += (existing.Intervention ? " ; " : "") + newValIntervention;
      }

      const newValDAI = String(row["N° DAI"] || "").trim();
      if (newValDAI && !existing["N° DAI"].includes(newValDAI)) {
        existing["N° DAI"] += (existing["N° DAI"] ? " ; " : "") + newValDAI;
      }

      const newValDatePiecesStr = formatExcelDate(row["Date Commande Pièces"]);
      if (newValDatePiecesStr && !existing["Date Commande Pièces"].includes(newValDatePiecesStr)) {
        existing["Date Commande Pièces"] += (existing["Date Commande Pièces"] ? " ; " : "") + newValDatePiecesStr;
      }

      // Keep the "first" start date encountered
      if (!existing["Date Départ"] && startDate) {
        existing["Date Départ"] = startDate;
      }
      
      if (!existing.Désignation) existing.Désignation = designation;
      if (!existing["MARQUE/TYPE"]) existing["MARQUE/TYPE"] = marqueType;
      if (!existing["SOUS FAMILLE"]) existing["SOUS FAMILLE"] = String(row["SOUS FAMILLE"] || "");
      if (!existing["Date Prévu MO"]) existing["Date Prévu MO"] = formatExcelDate(row["Date Prévu MO"]);
      if (!existing["Date planifiée"]) existing["Date planifiée"] = formatExcelDate(row["Date planifiée"]);
      if (!existing["MARGE EN (JRS)"]) existing["MARGE EN (JRS)"] = String(row["MARGE EN (JRS)"] || "");
    }
  });

  const result = Object.values(groupedByCode);
  
  // Calculate days in workshop after all rows are processed
  result.forEach(item => {
    item["Jours en Atelier"] = calculateDaysInWorkshop(item["Date Départ"]);
  });

  return result;
}

export function processAvailableMaterial(rawData: RawData[]): AvailableMaterialData[] {
  // Normalize row keys
  const normalizedRawData = rawData.map(row => {
    const newRow: any = {};
    for (const key in row) {
      const cleanKey = key.replace(/[\r\n]+/g, ' ').replace(/\s+/g, ' ').trim();
      newRow[cleanKey] = row[key];
    }
    return newRow;
  });

  const groupedByCode: { 
    [code: string]: {
      items: any[],
      minStart: string,
      maxEnd: string
    } 
  } = {};

  normalizedRawData.forEach(row => {
    const code = String(row["Code"] || "").trim();
    if (!code || code === "undefined") return;

    if (!groupedByCode[code]) {
      groupedByCode[code] = { items: [], minStart: "", maxEnd: "" };
    }
    
    groupedByCode[code].items.push(row);

    const start = formatExcelDate(row["Date Départ Intervention"] || row["Date Départ"]);
    const end = formatExcelDate(row["Date Fin opération"] || row["Date fin"] || row["Date Fin"]);

    if (start) {
      if (!groupedByCode[code].minStart) {
        groupedByCode[code].minStart = start;
      } else {
        const currentMinParts = groupedByCode[code].minStart.split("/");
        const currentMin = new Date(Number(currentMinParts[2]), Number(currentMinParts[1])-1, Number(currentMinParts[0]));
        const newStartParts = start.split("/");
        const newStart = new Date(Number(newStartParts[2]), Number(newStartParts[1])-1, Number(newStartParts[0]));
        if (newStart < currentMin) groupedByCode[code].minStart = start;
      }
    }

    if (end) {
      if (!groupedByCode[code].maxEnd) {
        groupedByCode[code].maxEnd = end;
      } else {
        const currentMaxParts = groupedByCode[code].maxEnd.split("/");
        const currentMax = new Date(Number(currentMaxParts[2]), Number(currentMaxParts[1])-1, Number(currentMaxParts[0]));
        const newEndParts = end.split("/");
        const newEnd = new Date(Number(newEndParts[2]), Number(newEndParts[1])-1, Number(newEndParts[0]));
        if (newEnd > currentMax) groupedByCode[code].maxEnd = end;
      }
    }
  });

  return Object.keys(groupedByCode).map(code => {
    const info = groupedByCode[code];
    // Sort items by some date to get the "latest" assignment info? 
    // For now take the first found as a baseline, but maybe the last one in the spreadsheet is more recent.
    const lastRow = info.items[info.items.length - 1]; 
    
    const type = String(lastRow["Type"] || "").trim();
    const marque = String(lastRow["Marque"] || "").trim();
    const marqueType = [marque, type].filter(Boolean).join(" / ");

    const days = calculateDaysDiff(info.minStart, info.maxEnd);

    return {
      Code: code,
      Désignation: String(lastRow["Désignation"] || lastRow["Designation"] || "").trim(),
      "SOUS FAMILLE": String(lastRow["SOUS FAMILLE"] || ""),
      "MARQUE/TYPE": marqueType,
      "Jours en Réparation": days > 0 ? String(days) : "0",
      "Date de disponibilité": formatExcelDate(lastRow["Date de disponibilité"] || lastRow["Date Disponibilité"]),
      "Affectation Actuel": String(lastRow["Affectation Actuel"] || lastRow["Affectation actuelle"] || ""),
      "Date D'affectation": formatExcelDate(lastRow["Date D'affectation"] || lastRow["Date d'affectation"]),
    };
  });
}

