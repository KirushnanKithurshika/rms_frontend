import html2pdf from "html2pdf.js";


export async function downloadResultsSheetPdf(
  selectorOrEl: string | HTMLElement,
  fileName = "ResultsSheet.pdf"
): Promise<void> {
  const el: HTMLElement | null =
    typeof selectorOrEl === "string"
      ? (document.querySelector(selectorOrEl) as HTMLElement | null)
      : selectorOrEl;

  if (!el) {
    throw new Error("PDF root element not found");
  }

  try {
    await (document as any).fonts?.ready;
  } catch {}

  const opt: any = {
    margin: [5, 5, 5, 5],
    filename: fileName,
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: {
      scale: 3,
      useCORS: true,
      backgroundColor: "#ffffff",
      scrollY: -window.scrollY,
      windowWidth: document.documentElement.clientWidth,
    },
    jsPDF: {
      unit: "mm",
      format: "a4",
      orientation: "portrait",
    },
    pagebreak: {
      mode: ["css", "legacy"],
      avoid: [".avoid-break"],
    },
  };

  await (html2pdf() as any).set(opt).from(el).save();
}
