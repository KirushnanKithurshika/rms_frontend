import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../../services/api";
import "./TranscriptVerifyPage.css";

type VerifyResult = {
  valid: boolean;
  message?: string;
  regNo?: string;
  cid?: string;
  ipfsUrl?: string;
  txHash?: string;
  anchoredAt?: string;
};

const TranscriptVerifyPage: React.FC = () => {
  const [params] = useSearchParams();
  const regNo = params.get("regNo") || "";
  const cid = params.get("cid") || "";

  const [result, setResult] = useState<VerifyResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!regNo || !cid) {
      setError("Missing registration number or CID in verification link.");
      return;
    }

    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get("/transcripts/verify", {
          params: { regNo, cid },
        });
        const data = res.data?.data ?? res.data;
        setResult(data as VerifyResult);
      } catch (e: any) {
        const msg =
          e?.response?.data?.message ||
          e?.message ||
          "Transcript verification failed.";
        setError(msg);
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [regNo, cid]);

  const showResult = !loading && !error && result;

  return (
    <div className="tv-container">
      <div className="tv-card">
        <h2 className="tv-title">Transcript Verification</h2>

        {loading && <p>Verifying transcript on blockchain...</p>}

        {error && <p className="tv-error">{error}</p>}

        {showResult && (
          <div
            className={`tv-status ${result!.valid ? "ok" : "bad"}`}
            aria-live="polite"
          >
            <h3>{result!.valid ? "Transcript Verified" : "Transcript Not Valid"}</h3>
            <p>{result!.message}</p>

            <div className="tv-meta">
              {result!.regNo && (
                <div>
                  <span className="tv-label">Registration No:</span>
                  <span>{result!.regNo}</span>
                </div>
              )}
              {result!.cid && (
                <div>
                  <span className="tv-label">CID:</span>
                  <span>{result!.cid}</span>
                </div>
              )}
              {result!.anchoredAt && (
                <div>
                  <span className="tv-label">Anchored At:</span>
                  <span>{result!.anchoredAt}</span>
                </div>
              )}
              {result!.txHash && (
                <div>
                  <span className="tv-label">Tx Hash:</span>
                  <span>{result!.txHash}</span>
                </div>
              )}
            </div>

            {result!.valid && result!.ipfsUrl && (
              <div className="tv-actions">
                <a
                  href={result!.ipfsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="tv-btn"
                >
                  Open Transcript PDF
                </a>
              </div>
            )}
          </div>
        )}

        {!loading && !error && !result && (
          <p className="tv-error">
            Unable to load verification result. Please check the link.
          </p>
        )}
      </div>
    </div>
  );
};

export default TranscriptVerifyPage;

