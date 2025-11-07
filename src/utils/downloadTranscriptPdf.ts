import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";



export async function downloadTranscriptPDF(
  root: HTMLElement,
  filename = "Transcript.pdf"
) {
  const sheets = Array.from(root.querySelectorAll<HTMLElement>(".sheet.a4"));
  if (sheets.length === 0) {
     sheets.push(root);
  }

  
  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth = 210;
  const pageHeight = 297;

  const originalBg = document.body.style.backgroundColor;
  document.body.style.backgroundColor = "#ffffff";

  try {
    for (let i = 0; i < sheets.length; i++) {
      const node = sheets[i];

      const canvas = await html2canvas(node, {
        scale: 2,              // sharper
        useCORS: true,
        backgroundColor: "#ffffff",
        scrollX: 0,
        scrollY: -window.scrollY,
        windowWidth: document.documentElement.scrollWidth,
        windowHeight: document.documentElement.scrollHeight,
      });

      const dataUrl = canvas.toDataURL("image/jpeg", 0.98);

      // keep aspect ratio – fit width to A4 width
      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      if (i > 0) pdf.addPage("a4", "portrait");
      pdf.addImage(dataUrl, "JPEG", 0, 0, imgWidth, Math.min(imgHeight, pageHeight));
    }

    pdf.save(filename);
  } finally {
    document.body.style.backgroundColor = originalBg;
  }
}
