import React, { useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSignature,     // Sign
  faDownload,      // Download
  faCircleCheck,   // Approve
  faLocationDot,   // Anchor (panel icon)
  faRulerHorizontal, // Size (panel icon)
  faArrowsUpDownLeftRight, // Position (panel icon)
  faRotateLeft,    // Reset
  faTrash,         // Clear
  faChevronUp,
  faChevronDown,
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import SignaturePad from "signature_pad";
import { PDFDocument } from "pdf-lib";
import "./FinalResults.css";

type ResultApprovalViewerProps = {
  pdfUrl: string; // must be same-origin or CORS-enabled direct PDF
  onApprove: (signedPdfBlobUrl?: string) => void;
  onSign?: (signatureDataUrl: string) => void;
  onDownload?: (signedPdfBlobUrl?: string) => void;
  approveLabel?: string;
  autoDownloadAfterSign?: boolean; // default true
};

/* ----------------- Helpers ----------------- */

function dataUrlToUint8(dataUrl: string) {
  const m = dataUrl.match(/^data:(.*?);base64,(.*)$/);
  if (!m) return new Uint8Array();
  const base64 = m[2];
  const bin = atob(base64);
  const buf = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) buf[i] = bin.charCodeAt(i);
  return buf;
}

type Placement = {
  anchor?: "bottomRight" | "bottomLeft" | "topRight" | "topLeft";
  offsetX?: number; // + right
  offsetY?: number; // + up
  widthPts?: number; // (optional) target width in points
  scaleFactor?: number; // scales default width
};

async function stampSignatureIntoPdf(
  pdfUrlOrBlobUrl: string,
  sigDataUrl: string,
  placement: Placement = {}
): Promise<{ blobUrl: string; pageWidth: number; pageHeight: number }> {
  const pdfBytes = await fetch(pdfUrlOrBlobUrl).then((r) => {
    if (!r.ok) throw new Error(`Failed to fetch PDF: ${r.status}`);
    return r.arrayBuffer();
  });
  const pdfDoc = await PDFDocument.load(pdfBytes);

  const isPng = sigDataUrl.startsWith("data:image/png");
  const sigBytes = dataUrlToUint8(sigDataUrl);
  const sigImage = isPng ? await pdfDoc.embedPng(sigBytes) : await pdfDoc.embedJpg(sigBytes);

  const page = pdfDoc.getPage(0);
  const pageWidth = page.getWidth();
  const pageHeight = page.getHeight();

  // Defaults
  const margin = 36; // 0.5 inch
  const defaultWidth = Math.min(220, pageWidth * 0.35);
  const targetWidth =
    placement.widthPts ??
    defaultWidth * (placement.scaleFactor ? Math.max(0.25, placement.scaleFactor) : 1);
  const scale = targetWidth / sigImage.width;
  const targetHeight = sigImage.height * scale;

  // Start at anchor
  let x = pageWidth - targetWidth - margin;
  let y = margin;
  const anchor = placement.anchor ?? "bottomRight";
  if (anchor === "bottomLeft") { x = margin; y = margin; }
  if (anchor === "topRight")   { x = pageWidth - targetWidth - margin; y = pageHeight - targetHeight - margin; }
  if (anchor === "topLeft")    { x = margin; y = pageHeight - targetHeight - margin; }

  x += placement.offsetX ?? 0;
  y += placement.offsetY ?? 0;

  // Clamp in page
  x = Math.max(0, Math.min(x, pageWidth - targetWidth));
  y = Math.max(0, Math.min(y, pageHeight - targetHeight));

  page.drawImage(sigImage, { x, y, width: targetWidth, height: targetHeight, opacity: 0.98 });

  const newPdfBytes = await pdfDoc.save();
  const blob = new Blob([new Uint8Array(newPdfBytes)], { type: "application/pdf" });
  return { blobUrl: URL.createObjectURL(blob), pageWidth, pageHeight };
}

/* ----------------- Signature Dialog ----------------- */

const SignatureDialog: React.FC<{
  open: boolean;
  onClose: () => void;
  onDone: (dataUrl: string) => void;
}> = ({ open, onClose, onDone }) => {
  const [tab, setTab] = useState<"draw" | "upload">("draw");
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const padRef = useRef<SignaturePad | null>(null);
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    if (tab === "draw") {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ratio = Math.max(window.devicePixelRatio || 1, 1);
      canvas.width = 600 * ratio;
      canvas.height = 220 * ratio;
      canvas.style.width = "600px";
      canvas.style.height = "220px";
      const ctx = canvas.getContext("2d");
      if (ctx) ctx.scale(ratio, ratio);
      padRef.current = new SignaturePad(canvas, {
        minWidth: 0.8,
        maxWidth: 2.2,
        throttle: 0,
        penColor: "#111",
        backgroundColor: "rgba(255,255,255,0)",
      });
    }
    return () => { padRef.current?.off(); padRef.current = null; };
  }, [open, tab]);

  const handleClear = () => padRef.current?.clear();

  const handleUseDrawn = () => {
    if (!padRef.current || padRef.current.isEmpty()) {
      alert("Please draw a signature first.");
      return;
    }
    onDone(padRef.current.toDataURL("image/png"));
    onClose();
  };

  const onFileChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!/image\/(png|jpe?g)/i.test(file.type)) {
      alert("Please upload a PNG or JPG image.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setUploadPreview(String(reader.result));
    reader.readAsDataURL(file);
  };

  const handleUseUploaded = () => {
    if (!uploadPreview) {
      alert("Please select an image first.");
      return;
    }
    onDone(uploadPreview);
    onClose();
  };

  if (!open) return null;

  return (
    <div className="ra-modal-backdrop" role="dialog" aria-modal="true">
      <div className="ra-modal">
        <header className="ra-modal-header">
          <h3>Sign Document</h3>
          <button className="ra-close" onClick={onClose} aria-label="Close">×</button>
        </header>

        <nav className="ra-tabs">
          <button className={`ra-tab ${tab === "draw" ? "active" : ""}`} onClick={() => setTab("draw")}>Draw</button>
          <button className={`ra-tab ${tab === "upload" ? "active" : ""}`} onClick={() => setTab("upload")}>Upload</button>
        </nav>

        {tab === "draw" ? (
          <div className="ra-tab-panel">
            <canvas ref={canvasRef} className="ra-sign-canvas" />
            <div className="ra-row">
              <button className="ra-btn" onClick={handleClear}>Clear</button>
              <button className="ra-btn ra-primary" onClick={handleUseDrawn}>Use Signature</button>
            </div>
          </div>
        ) : (
          <div className="ra-tab-panel">
            <input type="file" accept="image/png,image/jpeg" onChange={onFileChange} />
            {uploadPreview && (
              <div className="ra-upload-preview">
                <img src={uploadPreview} alt="Signature preview" />
              </div>
            )}
            <div className="ra-row">
              <button className="ra-btn ra-primary" onClick={handleUseUploaded} disabled={!uploadPreview}>
                Use Signature
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/* ----------------- Main Viewer ----------------- */

const ResultApprovalViewer: React.FC<ResultApprovalViewerProps> = ({
  pdfUrl,
  onApprove,
  onSign,
  onDownload,
  approveLabel = "Approve",
  autoDownloadAfterSign = true,
}) => {
  const [isSignOpen, setIsSignOpen] = useState(false);
  const [signatureDataUrl, setSignatureDataUrl] = useState<string | null>(null);
  const [signedPdfUrl, setSignedPdfUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Placement controls (PDF points)
  const [scaleFactor, setScaleFactor] = useState(1);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const [anchor, setAnchor] = useState<Placement["anchor"]>("bottomRight");
  const [pageDims, setPageDims] = useState<{ w: number; h: number } | null>(null);

  const effectivePdfUrl = signedPdfUrl ?? pdfUrl;

  const handleDownload = () => {
    if (onDownload) return onDownload(effectivePdfUrl ?? undefined);
    const a = document.createElement("a");
    a.href = effectivePdfUrl;
    a.download = "";
    a.rel = "noopener";
    a.click();
  };

  const handleSignClick = () => setIsSignOpen(true);

  const applyStamp = async (baseUrl: string, dataUrl: string) => {
    const { blobUrl, pageWidth, pageHeight } = await stampSignatureIntoPdf(baseUrl, dataUrl, {
      anchor, offsetX, offsetY, scaleFactor,
    });
    setPageDims({ w: pageWidth, h: pageHeight });
    setSignedPdfUrl((old) => {
      if (old) URL.revokeObjectURL(old);
      return blobUrl;
    });
  };

  const handleSignatureChosen = async (dataUrl: string) => {
    try {
      setIsProcessing(true);
      setSignatureDataUrl(dataUrl);
      await applyStamp(signedPdfUrl ?? pdfUrl, dataUrl);
      onSign?.(dataUrl);
    } catch (e) {
      console.error(e);
      alert("Could not apply signature to the PDF.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleApprove = async () => {
    try {
      setIsProcessing(true);
      if (!signatureDataUrl) {
        alert("Please add a signature first (Draw or Upload) before approving.");
        setIsProcessing(false);
        return;
      }
      await applyStamp(effectivePdfUrl, signatureDataUrl);

      // Download the newly signed if requested
      if (autoDownloadAfterSign && signedPdfUrl) {
        const a = document.createElement("a");
        a.href = signedPdfUrl;
        a.download = "signed.pdf";
        a.rel = "noopener";
        a.click();
      }

      onApprove(signedPdfUrl ?? undefined);
    } catch (err) {
      console.error(err);
      alert("Failed to sign/approve the PDF. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const restampIfPossible = async () => {
    if (!signatureDataUrl) return;
    setIsProcessing(true);
    try { await applyStamp(pdfUrl, signatureDataUrl); }
    finally { setIsProcessing(false); }
  };

  const nudge = async (dx: number, dy: number) => {
    setOffsetX((v) => v + dx);
    setOffsetY((v) => v + dy);
    await restampIfPossible();
  };
  const handleScaleChange: React.ChangeEventHandler<HTMLInputElement> = async (e) => {
    setScaleFactor(parseFloat(e.target.value));
    await restampIfPossible();
  };
  const handleAnchorChange: React.ChangeEventHandler<HTMLSelectElement> = async (e) => {
    setAnchor(e.target.value as Placement["anchor"]);
    await restampIfPossible();
  };
  const handleResetPlacement = async () => {
    setScaleFactor(1); setOffsetX(0); setOffsetY(0); setAnchor("bottomRight");
    await restampIfPossible();
  };
  const handleClearSignatures = () => {
    if (signedPdfUrl) URL.revokeObjectURL(signedPdfUrl);
    setSignedPdfUrl(null);
    setSignatureDataUrl(null);
    setPageDims(null);
    setScaleFactor(1); setOffsetX(0); setOffsetY(0); setAnchor("bottomRight");
  };

  return (
    <section className="ra-shell">
      {/* Rail */}
      <aside className="ra-rail" aria-label="Document actions">
        <button
          className="ra-rail-btn ra-rail-btn--primary"
          onClick={handleSignClick}
          aria-label="Sign document"
          title="Sign"
        >
          <FontAwesomeIcon icon={faSignature} className="ra-ico" aria-hidden="true" />
          <span className="ra-rail-text">{signatureDataUrl ? "Re-sign" : "Sign"}</span>
        </button>

        <button
          className="ra-rail-btn"
          onClick={handleDownload}
          aria-label="Download document"
          title="Download"
          disabled={!effectivePdfUrl}
        >
          <FontAwesomeIcon icon={faDownload} className="ra-ico" aria-hidden="true" />
          <span className="ra-rail-text">Download</span>
        </button>

        <button
          className="ra-rail-btn ra-approve"
          onClick={handleApprove}
          aria-label="Approve document"
          title={approveLabel}
          disabled={isProcessing || !effectivePdfUrl}
        >
          <FontAwesomeIcon icon={faCircleCheck} className="ra-ico" aria-hidden="true" />
          <span className="ra-rail-text">
            {isProcessing ? "Processing..." : approveLabel}
          </span>
        </button>
      </aside>

      {/* Stage */}
      <div className="ra-stage">
        <div className="ra-canvas">
          {effectivePdfUrl ? (
            <iframe
              key={effectivePdfUrl}
              className="ra-pdf"
              src={effectivePdfUrl}
              title="Result sheet preview"
              aria-label="Result sheet preview"
            />
          ) : (
            <div className="ra-empty"><p>No document to display.</p></div>
          )}
        </div>

        {/* Settings */}
        <div className="ra-settings" aria-label="Signature settings">
          <header className="ra-settings__header">
            <h4>Signature Settings</h4>
            <p>Fine-tune where and how your signature appears on the first page.</p>
          </header>

          <div className="ra-settings-row">
            <label className="ra-field-label">
              <FontAwesomeIcon icon={faLocationDot} />
              <span>Anchor</span>
            </label>
            <div className="ra-field">
              <select value={anchor} onChange={handleAnchorChange} disabled={!signatureDataUrl}>
                <option value="bottomRight">Bottom Right</option>
                <option value="bottomLeft">Bottom Left</option>
                <option value="topRight">Top Right</option>
                <option value="topLeft">Top Left</option>
              </select>
            </div>
          </div>

          <div className="ra-settings-row">
            <label className="ra-field-label">
              <FontAwesomeIcon icon={faRulerHorizontal} />
              <span>Size</span>
            </label>
            <div className="ra-field ra-field--range">
              <input
                type="range"
                min={0.5}
                max={2}
                step={0.05}
                value={scaleFactor}
                onChange={handleScaleChange}
                disabled={!signatureDataUrl}
              />
              <span className="ra-settings-value">{(scaleFactor * 100).toFixed(0)}%</span>
            </div>
          </div>

          <div className="ra-settings-row">
            <label className="ra-field-label">
              <FontAwesomeIcon icon={faArrowsUpDownLeftRight} />
              <span>Position</span>
            </label>
            <div className="ra-field">
              <div className="ra-nudge-grid" role="group" aria-label="Nudge position">
                <button onClick={() => nudge(0, 12)} disabled={!signatureDataUrl} title="Up">
                  <FontAwesomeIcon icon={faChevronUp} />
                </button>
                <div className="ra-nudge-mid">
                  <button onClick={() => nudge(-12, 0)} disabled={!signatureDataUrl} title="Left">
                    <FontAwesomeIcon icon={faChevronLeft} />
                  </button>
                  <button onClick={() => nudge(12, 0)} disabled={!signatureDataUrl} title="Right">
                    <FontAwesomeIcon icon={faChevronRight} />
                  </button>
                </div>
                <button onClick={() => nudge(0, -12)} disabled={!signatureDataUrl} title="Down">
                  <FontAwesomeIcon icon={faChevronDown} />
                </button>
              </div>
            </div>
          </div>

          <div className="ra-settings-actions">
            <button className="ra-btn ra-btn--ghost" onClick={handleResetPlacement} disabled={!signatureDataUrl}>
              <FontAwesomeIcon icon={faRotateLeft} />
              <span>Reset</span>
            </button>
            <button className="ra-btn ra-btn--danger" onClick={handleClearSignatures} disabled={!signedPdfUrl}>
              <FontAwesomeIcon icon={faTrash} />
              <span>Clear signatures</span>
            </button>
          </div>

          {pageDims && (
            <footer className="ra-settings__meta">
              <small>Page size: {Math.round(pageDims.w)} × {Math.round(pageDims.h)} pts</small>
            </footer>
          )}
        </div>
      </div>

      {/* Signature modal */}
      <SignatureDialog
        open={isSignOpen}
        onClose={() => setIsSignOpen(false)}
        onDone={handleSignatureChosen}
      />
    </section>
  );
};

export default ResultApprovalViewer;
