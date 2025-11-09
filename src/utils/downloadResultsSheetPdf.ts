// utils/downloadExactHtmlPdf.ts
import html2pdf from "html2pdf.js";

export async function downloadExactHtmlPdf(
  selectorOrEl: string | HTMLElement,
  fileName = "ResultsSheet.pdf"
) {
  const el =
    typeof selectorOrEl === "string"
      ? (document.querySelector(selectorOrEl) as HTMLElement | null)
      : selectorOrEl;

  if (!el) throw new Error("PDF root element not found");

  // Important: ensure all webfonts/images are settled
  await document.fonts?.ready?.catch(() => {});

  const opt: html2pdf.Options = {
    margin: [0, 0, 0, 0],                // mm (top, right, bottom, left)
    filename: fileName,
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: {
      scale: 3,                           // higher = sharper
      useCORS: true,
      backgroundColor: "#ffffff",
      scrollY: -window.scrollY,
    },
    jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    pagebreak: {
      mode: ["css", "legacy"],            // obey our CSS break rules
      avoid: [".avoid-break"],            // classes to keep on one page
    },
  };

  await html2pdf().set(opt).from(el).save();
}
