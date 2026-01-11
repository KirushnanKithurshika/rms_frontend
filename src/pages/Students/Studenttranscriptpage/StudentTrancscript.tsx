import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbarin from "../../../components/Navbar/navbarin.tsx";
import StudentSubNav from "../../../components/Students/StudentsubNav/Studentsubnav.tsx";
import "./StudentTranscript.css";
import StudentSidebar from "../../../components/Students/Studentsidebar/Studentsidebar.tsx";
import TranscriptAvailability from "../../../components/Students/Studentsidebar/TranscriptAvailability/TranscriptAvailability.tsx";
import BreadcrumbNav from "../../../components/breadcrumbnav/breadcrumbnav.tsx";
import { useAppSelector } from "../../../app/hooks.ts";
import { selectUserId } from "../../../features/auth/selectors.ts";
import api from "../../../services/api";
import type { TranscriptStatus } from "../../../components/Students/Studentsidebar/TranscriptAvailability/TranscriptAvailability.tsx";

type JsQrFn = (
  data: Uint8ClampedArray,
  width: number,
  height: number
) => { data: string } | null;

declare global {
  interface Window {
    jsQR?: JsQrFn;
  }
}

type VerifyParams = {
  regNo: string;
  cid: string;
};

type VerifyResult = {
  valid: boolean;
  message?: string;
  regNo?: string;
  cid?: string;
  ipfsUrl?: string;
  txHash?: string;
  anchoredAt?: string;
};

const getVerifyParamsFromUrl = (raw?: string): VerifyParams | null => {
  if (!raw) return null;
  const clean = raw.trim();
  if (!clean) return null;

  const parseQuery = (query: string) => {
    const params = new URLSearchParams(query);
    const regNo = params.get("regNo")?.trim();
    const cid = params.get("cid")?.trim();
    return regNo && cid ? { regNo, cid } : null;
  };

  try {
    const parsed = new URL(clean, window.location.origin);
    const params = parsed.search.startsWith("?")
      ? parsed.search.substring(1)
      : parsed.search;
    const found = parseQuery(params);
    if (found) return found;
  } catch {
    // Not a full URL, try treating it as a query string or raw params.
  }

  const qsIndex = clean.indexOf("?");
  const query = qsIndex >= 0 ? clean.substring(qsIndex + 1) : clean;
  return parseQuery(query);
};

const JSQR_CDN =
  "https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.js";

const ensureJsQr = (() => {
  let loadingPromise: Promise<JsQrFn | null> | null = null;
  return () => {
    if (typeof window === "undefined") return Promise.resolve(null);
    if (window.jsQR) return Promise.resolve(window.jsQR);
    if (loadingPromise) return loadingPromise;
    loadingPromise = new Promise<JsQrFn | null>((resolve) => {
      const script = document.createElement("script");
      script.src = JSQR_CDN;
      script.async = true;
      script.crossOrigin = "anonymous";
      script.onload = () => resolve(window.jsQR || null);
      script.onerror = () => resolve(null);
      document.head?.appendChild(script);
    });
    return loadingPromise;
  };
})();

const decodeWithBarcodeDetector = async (blob: Blob): Promise<string | undefined> => {
  if (typeof window === "undefined") return undefined;
  const ctor = (window as Record<string, any>).BarcodeDetector as
    | (new (config?: { formats?: string[] }) => {
        detect(source: ImageBitmapSource): Promise<Array<{ rawValue?: string }>>;
      })
    | undefined;
  if (!ctor || typeof window.createImageBitmap !== "function") {
    return undefined;
  }

  try {
    const detector = new ctor({ formats: ["qr_code"] });
    const bitmap = await window.createImageBitmap(blob);
    const codes = await detector.detect(bitmap);
    if (typeof (bitmap as ImageBitmap & { close?: () => void }).close === "function") {
      (bitmap as ImageBitmap & { close?: () => void }).close!();
    }
    const value = codes?.[0]?.rawValue;
    return value || undefined;
  } catch (err) {
    console.warn("BarcodeDetector failed to decode QR", err);
    return undefined;
  }
};

const loadBlobAsImage = (blob: Blob): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(blob);
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = (err) => {
      URL.revokeObjectURL(url);
      reject(err);
    };
    img.src = url;
  });

const decodeWithJsQr = async (blob: Blob): Promise<string | undefined> => {
  if (typeof window === "undefined") return undefined;
  const jsQR = await ensureJsQr();
  if (!jsQR) return undefined;

  try {
    const img = await loadBlobAsImage(blob);
    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth || img.width;
    canvas.height = img.naturalHeight || img.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return undefined;
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const result = jsQR(imageData.data, imageData.width, imageData.height);
    return result?.data || undefined;
  } catch (err) {
    console.warn("jsQR fallback failed to decode QR", err);
    return undefined;
  }
};

const tryDecodeQrPayload = async (blob: Blob): Promise<string | undefined> => {
  const barcodePayload = await decodeWithBarcodeDetector(blob);
  if (barcodePayload) return barcodePayload;
  return decodeWithJsQr(blob);
};

const StudentTranscript = () => {
  const navigate = useNavigate();

  const transcriptId = "ABC123";
  const lastUpdated = "2025-09-25 14:05";

  const handleApply = () => navigate("/student/transcript/apply");
  const handleOpen = () => navigate(`/student/transcript/view?id=${transcriptId}`);
  const handleDownload = () => {
    // e.g., window.open(`/api/transcripts/${transcriptId}/pdf`, "_blank");
  };
  const handleRequestTranscript = () => navigate("/student/transcript/payment");

  return (
    <div className="lec-dashboard-container">
      <div className="nav">
        <Navbarin />
      </div>
      <div className="breadcrumb">
        <BreadcrumbNav />
      </div>
      <div className="dashboard-content-students-transcript">
        <StudentSubNav />
        <div className="subnav-divider" />

        <div className="main-area-students-transcript">
          <div className="sidebar-student">
            <StudentSidebar />
          </div>

          <div className="card-students-trsnscript">
            <TranscriptAvailability
              status={status}
              imageSrc={qrSrc}
              onApply={handleApply}
              onOpen={status === "available" ? handleOpen : undefined}
              caption={loading ? "Loading transcript QR..." : caption}
            />

            {status === "available" && (verifying || verifyError || verifyResult) && (
              <div className="transcript-verify-panel">
                {verificationUrl && (
                  <p className="verify-info-small">
                    Verification link embedded in QR: <span>{verificationUrl}</span>
                  </p>
                )}
                {verifying && (
                  <p className="verify-info" aria-live="polite">
                    Verifying transcript against blockchain registry...
                  </p>
                )}
                {verifyError && !verifying && (
                  <p className="verify-error" role="alert">
                    {verifyError}
                  </p>
                )}
                {verifyResult && !verifying && (
                  <div className={`verify-result ${verifyResult.valid ? "ok" : "bad"}`}>
                    <strong>
                      {verifyResult.valid
                        ? "Transcript verified via blockchain."
                        : "Transcript could not be verified."}
                    </strong>
                    {verifyResult.message && <p>{verifyResult.message}</p>}
                    <div className="verify-meta">
                      {verifyResult.regNo && (
                        <span>
                          <span className="label">Reg No:</span> {verifyResult.regNo}
                        </span>
                      )}
                      {verifyResult.cid && (
                        <span>
                          <span className="label">CID:</span> {verifyResult.cid}
                        </span>
                      )}
                      {verifyResult.txHash && (
                        <span>
                          <span className="label">Tx Hash:</span> {verifyResult.txHash}
                        </span>
                      )}
                      {verifyResult.anchoredAt && (
                        <span>
                          <span className="label">Anchored At:</span>{" "}
                          {verifyResult.anchoredAt}
                        </span>
                      )}
                    </div>
                    {verifyResult.valid && verifyResult.ipfsUrl && (
                      <a
                        href={verifyResult.ipfsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="verify-link"
                      >
                        View transcript document
                      </a>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentTranscript;
