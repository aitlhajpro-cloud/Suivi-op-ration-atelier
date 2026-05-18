import { Document, Packer, Paragraph, Table, TableCell, TableRow, WidthType, BorderStyle, AlignmentType, TextRun } from "docx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { AvailableMaterialData, ProcessedData } from "./dataProcessor";

export async function exportToWord(data: (ProcessedData | AvailableMaterialData)[], visibleColumns: Record<string, boolean>, title: string = "Récapitulatif Situation Atelier") {
  const allColumns = [
    { key: "Code", label: "Code" },
    { key: "Désignation", label: "Désignation" },
    { key: "SOUS FAMILLE", label: "SOUS FAMILLE" },
    { key: "MARQUE/TYPE", label: "MARQUE/TYPE" },
    { key: "Intervention", label: "Intervention" },
    { key: "Date Commande Pièces", label: "Date Commande Pièces" },
    { key: "N° DAI", label: "N° DAI" },
    { key: "Date Départ", label: "Date Départ" },
    { key: "Jours en Atelier", label: "Jours Atelier" },
    { key: "Date Prévu MO", label: "Date Prévu MO" },
    { key: "Date planifiée", label: "Date planifiée" },
    { key: "MARGE EN (JRS)", label: "MARGE EN (JRS)" },
    { key: "Jours en Réparation", label: "Jours Réparation" },
    { key: "Date de disponibilité", label: "Disponibilité" },
    { key: "Affectation Actuel", label: "Affectation" },
    { key: "Date D'affectation", label: "Date Affectation" },
  ];

  const activeColumns = allColumns.filter(col => visibleColumns[col.key]);

  const tableRows = data.map((item) => {
    return new TableRow({
      children: activeColumns.map(col => new TableCell({ 
        children: [new Paragraph(String((item as any)[col.key] || ""))] 
      })),
    });
  });

  const headerRow = new TableRow({
    tableHeader: true,
    children: activeColumns.map(col => new TableCell({
      shading: { fill: "f5f5f5" },
      children: [new Paragraph({ children: [new TextRun({ text: col.label, bold: true })] })]
    }))
  });

  const doc = new Document({
    sections: [{
      properties: {
        page: {
          size: {
            orientation: "landscape" as any
          }
        }
      },
      children: [
        new Paragraph({
          text: title,
          heading: "Heading1" as any,
          alignment: AlignmentType.CENTER,
          spacing: { after: 400 }
        }),
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [headerRow, ...tableRows]
        }),
      ],
    }],
  });

  const blob = await Packer.toBlob(doc);
  const fileName = title.replace(/\s+/g, "_") + ".docx";
  saveAs(blob, fileName);
}

export function exportToPDF(data: (ProcessedData | AvailableMaterialData)[], visibleColumns: Record<string, boolean>, title: string = "Récapitulatif Situation Atelier") {
  const doc = new jsPDF("landscape");
  
  doc.setFontSize(18);
  doc.text(title, 140, 15, { align: "center" });

  const allColumns = [
    { key: "Code", label: "Code" },
    { key: "Désignation", label: "Désignation" },
    { key: "SOUS FAMILLE", label: "SOUS FAMILLE" },
    { key: "MARQUE/TYPE", label: "MARQUE/TYPE" },
    { key: "Intervention", label: "Intervention" },
    { key: "Date Commande Pièces", label: "Date Com. Pièces" },
    { key: "N° DAI", label: "N° DAI" },
    { key: "Date Départ", label: "Date Départ" },
    { key: "Jours en Atelier", label: "Jours" },
    { key: "Date Prévu MO", label: "Prévu MO" },
    { key: "Date planifiée", label: "Planifiée" },
    { key: "MARGE EN (JRS)", label: "Marge" },
    { key: "Jours en Réparation", label: "Réparation (j)" },
    { key: "Date de disponibilité", label: "Dispo" },
    { key: "Affectation Actuel", label: "Affectation" },
    { key: "Date D'affectation", label: "Date Aff." },
  ];

  const activeColumns = allColumns.filter(col => visibleColumns[col.key]);

  const body = data.map(item => activeColumns.map(col => String((item as any)[col.key] || "")));

  autoTable(doc, {
    head: [activeColumns.map(col => col.label)],
    body: body,
    startY: 25,
    theme: 'grid',
    styles: { fontSize: 7, cellPadding: 1.5 },
    headStyles: { fillColor: [41, 128, 185], textColor: 255 },
  });

  const fileName = title.replace(/\s+/g, "_") + ".pdf";
  doc.save(fileName);
}

