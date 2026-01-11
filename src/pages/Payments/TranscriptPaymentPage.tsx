import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppSelector } from "../../app/hooks";
import { selectUserId } from "../../features/auth/selectors";
import { showError } from "../../utils/toast";
import { initiatePayment } from "../../services/payments";
import type { PayHereCheckoutResponse } from "../../services/payments";
import "./TranscriptPaymentPage.css";

type TranscriptType = "official" | "unofficial" | "";

const PAYHERE_URL =
  (import.meta.env.VITE_PAYHERE_URL as string | undefined) ??
  "https://sandbox.payhere.lk/pay/checkout";

function submitToPayHere(data: PayHereCheckoutResponse, targetName: string) {
  const form = document.createElement("form");
  form.method = "POST";
  form.action = PAYHERE_URL;
  form.target = targetName;
  form.style.display = "none";

  const fields: Record<string, string> = {
    merchant_id: data.merchantId,
    return_url: data.returnUrl,
    cancel_url: data.cancelUrl,
    notify_url: data.notifyUrl,
    order_id: data.orderId,
    items: data.items,
    amount: Number(data.amount).toFixed(2),
    currency: data.currency,
    first_name: data.firstName,
    last_name: data.lastName,
    email: data.email,
    phone: data.phone,
    address: data.address,
    city: data.city,
    country: data.country,
    hash: data.hash,
  };

  Object.entries(fields).forEach(([name, value]) => {
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = name;
    input.value = value ?? "";
    form.appendChild(input);
  });

  document.body.appendChild(form);
  form.submit();
}

const TranscriptPaymentPage: React.FC = () => {
  const navigate = useNavigate();
  const userId = useAppSelector(selectUserId);

  const [transcriptType, setTranscriptType] = useState<TranscriptType>("");
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const amount = useMemo(() => {
    if (transcriptType === "official") return 500;
    if (transcriptType === "unofficial") return 300;
    return 0;
  }, [transcriptType]);

  const validate = () => {
    const nextErrors: Record<string, string> = {};
    if (!transcriptType) {
      nextErrors.transcriptType = "Please select a transcript type.";
    }
    if (!userId) {
      nextErrors.userId = "User ID not available. Please login again.";
    }
    setFieldErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!validate()) return;

    try {
      setLoading(true);
      const targetName = "payhere_checkout_window";
      const popup = window.open("", targetName);
      if (!popup) {
        showError("Popup blocked. Please allow popups and try again.");
        setLoading(false);
        return;
      }
      const checkout = await initiatePayment({
        userId: Number(userId),
        paymentType: "TRANSCRIPT",
        amount,
      });
      submitToPayHere(checkout, targetName);
    } catch (err: any) {
      const apiMsg =
        err?.response?.data?.message ||
        err?.response?.data ||
        err?.message ||
        "";
      if (typeof apiMsg === "string" && apiMsg.includes("Student not found")) {
        setFormError(apiMsg);
      } else if (err?.request && !err?.response) {
        showError("Unable to connect. Please check your connection.");
      } else {
        showError(apiMsg || "Payment initiation failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const isValid =
    Boolean(transcriptType) &&
    Boolean(userId) &&
    Object.keys(fieldErrors).length === 0;

  return (
    <div className="tp-page">
      <div className="tp-header">
        <button className="tp-back" onClick={() => navigate(-1)}>
          Back
        </button>
        <h2>Transcript Payment</h2>
        <p>Choose your transcript type and proceed to PayHere checkout.</p>
      </div>

      <div className="tp-content">
        <form className="tp-form" onSubmit={handleSubmit}>
          {formError && <div className="tp-alert">{formError}</div>}

          <div className="tp-section">
            <label className="tp-label">Payment Type</label>
            <div className="tp-static">Transcript</div>
          </div>

          <div className="tp-section">
            <label className="tp-label">Transcript Type</label>
            <div className="tp-radio-group">
              <label className="tp-radio">
                <input
                  type="radio"
                  name="transcriptType"
                  value="official"
                  checked={transcriptType === "official"}
                  onChange={() => {
                    setTranscriptType("official");
                    setFieldErrors((s) => {
                      const next = { ...s };
                      delete next.transcriptType;
                      return next;
                    });
                  }}
                  disabled={loading}
                />
                <span>Orginal Transcript (LKR 500.00)</span>
              </label>
              <label className="tp-radio">
                <input
                  type="radio"
                  name="transcriptType"
                  value="unofficial"
                  checked={transcriptType === "unofficial"}
                  onChange={() => {
                    setTranscriptType("unofficial");
                    setFieldErrors((s) => {
                      const next = { ...s };
                      delete next.transcriptType;
                      return next;
                    });
                  }}
                  disabled={loading}
                />
                <span>Softcopy Transcript (LKR 300.00)</span>
              </label>
            </div>
            {fieldErrors.transcriptType && (
              <div className="tp-error">{fieldErrors.transcriptType}</div>
            )}
          </div>

          {fieldErrors.userId && (
            <div className="tp-error">{fieldErrors.userId}</div>
          )}

          <div className="tp-actions">
            <button
              type="submit"
              className="tp-submit"
              disabled={!isValid || loading}
            >
              {loading ? "Processing payment..." : "Proceed to Payment"}
            </button>
          </div>
        </form>

        <div className="tp-summary">
          <h3>Payment Summary</h3>
          <div className="tp-summary-row">
            <span>Payment Type</span>
            <span>Transcript</span>
          </div>
          <div className="tp-summary-row">
            <span>Type</span>
            <span>
              {transcriptType
                ? transcriptType === "official"
                  ? "Official"
                  : "Unofficial"
                : "-"}
            </span>
          </div>
          <div className="tp-summary-row">
            <span>Amount</span>
            <span>{amount ? `LKR ${amount.toFixed(2)}` : "-"}</span>
          </div>
        </div>
      </div>

      {loading && (
        <div className="tp-overlay" role="status" aria-live="polite">
          <div className="tp-spinner" />
          <p>Processing payment...</p>
        </div>
      )}
    </div>
  );
};

export default TranscriptPaymentPage;
