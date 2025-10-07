import React, { useEffect, useRef, useState } from "react";
import "./StuTraAppform.css";
import { FaChevronDown, FaCheck } from "react-icons/fa";

type TranscriptType =
  | "Full Academic Transcript"
  | "Transcript by Semester"
  | "Transcript by Year";

type DeliveryType = "pdf" | "address" | "collect";

type StudentProfile = {
  fullName: string;
  studentId: string;
  email: string;
  degreeProgram: string;
  defaultAddress?: string;
};

type Option = { label: string; value: string };

const transcriptTypeOptions: Option[] = [
  { label: "Full Academic Transcript", value: "Full Academic Transcript" },
  { label: "Transcript by Semester", value: "Transcript by Semester" },
  { label: "Transcript by Year", value: "Transcript by Year" },
];

const semesterYearOptions: Option[] = [
  { label: "Select", value: "" },
  { label: "1-6 semester", value: "1-6 semester" },
  { label: "Final year", value: "Final year" },
];

/* --- Custom Select --- */
function CustomSelect({
  value,
  onChange,
  options,
  placeholder = "Select...",
  disabled = false,
}: {
  value: string;
  onChange: (v: string) => void;
  options: Option[];
  placeholder?: string;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [hoverIdx, setHoverIdx] = useState<number>(-1);
  const wrapRef = useRef<HTMLDivElement>(null);

  const current = options.find((o) => o.value === value);
  const showLabel = current?.label ?? (placeholder || "Select...");

  // Close when clicking outside
  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  // Keyboard nav
  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (disabled) return;
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      if (!open) setOpen(true);
      else if (hoverIdx >= 0) {
        onChange(options[hoverIdx].value);
        setOpen(false);
      }
      return;
    }
    if (e.key === "Escape") {
      setOpen(false);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setHoverIdx((i) => {
        const next = Math.min((i < 0 ? -1 : i) + 1, options.length - 1);
        return next;
      });
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setOpen(true);
      setHoverIdx((i) => Math.max((i < 0 ? options.length : i) - 1, 0));
      return;
    }
    if (e.key === "Home") {
      e.preventDefault();
      setHoverIdx(0);
      return;
    }
    if (e.key === "End") {
      e.preventDefault();
      setHoverIdx(options.length - 1);
      return;
    }
  };

  return (
    <div
      ref={wrapRef}
      className={`cs-root ${disabled ? "is-disabled" : ""} ${
        open ? "is-open" : ""
      }`}
      tabIndex={disabled ? -1 : 0}
      role="combobox"
      aria-expanded={open}
      aria-haspopup="listbox"
      onKeyDown={onKeyDown}
    >
      <button
        type="button"
        className="cs-control"
        onClick={() => !disabled && setOpen((o) => !o)}
        disabled={disabled}
      >
        <span className={`cs-value ${!current ? "cs-placeholder" : ""}`}>
          {showLabel}
        </span>
        <FaChevronDown className="cs-icon" aria-hidden />
      </button>

      {open && (
        <ul className="cs-menu" role="listbox">
          {options.map((opt, idx) => {
            const selected = opt.value === value;
            const hovered = idx === hoverIdx;
            return (
              <li
                key={opt.value + idx}
                role="option"
                aria-selected={selected}
                className={`cs-option ${selected ? "is-selected" : ""} ${
                  hovered ? "is-hovered" : ""
                }`}
                onMouseEnter={() => setHoverIdx(idx)}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
              >
                <span className="cs-option-label">{opt.label}</span>
                {selected && <FaCheck className="cs-check" aria-hidden />}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
/* --- /Custom Select --- */

const TranscriptForm: React.FC = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    studentId: "",
    email: "",
    degreeProgram: "",
    transcriptType: "Full Academic Transcript" as TranscriptType,
    semesterYear: "",
    deliveryType: "pdf" as DeliveryType,
    deliveryAddress: "",
    paymentMethod: "",
  });

  const [loading, setLoading] = useState(true);
  const [prefillError, setPrefillError] = useState<string | null>(null);

  useEffect(() => {
    const ctrl = new AbortController();
    (async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/students/me", {
          credentials: "include",
          signal: ctrl.signal,
        });
        if (!res.ok) throw new Error(`Profile fetch failed (${res.status})`);
        const profile: StudentProfile = await res.json();

        setFormData((s) => ({
          ...s,
          fullName: profile.fullName ?? "",
          studentId: profile.studentId ?? "",
          degreeProgram: profile.degreeProgram ?? "",
          email: profile.email ?? s.email,
          deliveryAddress: profile.defaultAddress ?? s.deliveryAddress,
        }));
        setPrefillError(null);
      } catch (err: any) {
        if (err.name !== "AbortError") setPrefillError(null); // no error UI as requested
      } finally {
        setLoading(false);
      }
    })();
    return () => ctrl.abort();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((s) => ({ ...s, [name]: value }));
  };

  const setTranscriptType = (t: TranscriptType) =>
    setFormData((s) => ({ ...s, transcriptType: t }));

  const isAddressRequired = formData.deliveryType === "address";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isAddressRequired && !formData.deliveryAddress.trim()) {
      alert("Please enter a delivery address.");
      return;
    }
    if (!formData.paymentMethod) {
      alert("Please select a payment method (Visa / MasterCard).");
      return;
    }
    const payload = {
      fullName: formData.fullName,
      studentId: formData.studentId,
      degreeProgram: formData.degreeProgram,
      email: formData.email,
      transcriptType: formData.transcriptType,
      semesterYear: formData.semesterYear || null,
      deliveryType: formData.deliveryType,
      deliveryAddress: isAddressRequired ? formData.deliveryAddress : null,
      paymentMethod: formData.paymentMethod,
    };
    console.log("Submitting:", payload);
    const res = await fetch("/api/transcripts/requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const msg = await res.text();
      alert(`Failed to submit: ${msg || res.status}`);
      return;
    }
    alert("Request submitted successfully!");
  };

  return (
    <form className="transcript-form" onSubmit={handleSubmit}>
      <h3>Please Fill the below form to requesting Transcript</h3>

      {loading && <div className="info">Loading your profile…</div>}

      {/* Row 1 */}
      <div className="form-row">
        <div className="form-group">
          <label>Full Name</label>
          <input
            type="text"
            name="fullName"
            placeholder="Kithurshika K"
            value={formData.fullName}
            onChange={handleChange}
            disabled
          />
        </div>

        <div className="form-group">
          <label>Student ID</label>
          <input
            type="text"
            name="studentId"
            placeholder="EG/2020/4023"
            value={formData.studentId}
            onChange={handleChange}
            disabled
          />
        </div>
      </div>

      {/* Row 2 */}
      <div className="form-row">
        <div className="form-group">
          <label>Email <small className="muted">(you can change)</small></label>
          <input
            type="email"
            name="email"
            placeholder="student@example.com"
            value={formData.email}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Degree Program</label>
          <input
            type="text"
            name="degreeProgram"
            placeholder="Computer Engineering"
            value={formData.degreeProgram}
            onChange={handleChange}
            disabled
          />
        </div>
      </div>

      {/* Row 3 */}
      <div className="form-row">
        <div className="form-group">
          <label>Transcript Type</label>
          <CustomSelect
            value={formData.transcriptType}
            onChange={(v) => setTranscriptType(v as TranscriptType)}
            options={transcriptTypeOptions}
          />
        </div>

        <div className="form-group">
          <label>Semester/Year</label>
          <CustomSelect
            value={formData.semesterYear}
            onChange={(v) => setFormData((s) => ({ ...s, semesterYear: v }))}
            options={semesterYearOptions}
            placeholder="Select"
          />
        </div>
      </div>

      {/* Row 4 */}
      <div className="form-row">
        <div className="form-group">
          <label>Delivery Type</label>
          <div className="radio-group">
            <label className="radio">
              <input
                type="radio"
                name="deliveryType"
                value="pdf"
                checked={formData.deliveryType === "pdf"}
                onChange={handleChange}
              />
              <span>Download as PDF</span>
            </label>

            <label className="radio">
              <input
                type="radio"
                name="deliveryType"
                value="address"
                checked={formData.deliveryType === "address"}
                onChange={handleChange}
              />
              <span>Send to the address</span>
            </label>

            <label className="radio">
              <input
                type="radio"
                name="deliveryType"
                value="collect"
                checked={formData.deliveryType === "collect"}
                onChange={handleChange}
              />
              <span>Collect from the university</span>
            </label>
          </div>
        </div>

        <div className="form-group">
          <label>
            Delivery Address {formData.deliveryType === "address" && <em>(required)</em>}
          </label>
          <input
            type="text"
            name="deliveryAddress"
            placeholder="Address"
            value={formData.deliveryAddress}
            onChange={handleChange}
            required={formData.deliveryType === "address"}
          />
        </div>
      </div>

      {/* Row 5 */}
      <div className="form-row">
        <div className="form-group">
          <label>Payment</label>
          <div className="payment-options">
            <label
              className={`pay-opt ${formData.paymentMethod === "visa" ? "selected" : ""}`}
            >
              <input
                type="radio"
                name="paymentMethod"
                value="visa"
                checked={formData.paymentMethod === "visa"}
                onChange={handleChange}
              />
              <span className="pay-circle">
                <span className="visa">VISA</span>
              </span>
            </label>

            <label
              className={`pay-opt ${formData.paymentMethod === "mastercard" ? "selected" : ""}`}
            >
              <input
                type="radio"
                name="paymentMethod"
                value="mastercard"
                checked={formData.paymentMethod === "mastercard"}
                onChange={handleChange}
              />
              <span className="pay-circle">
                <span className="mc"></span>
              </span>
            </label>
          </div>
        </div>
      </div>

      <div className="form-actions">
        <button type="submit" className="submit-btn">
          proceed to pay
        </button>
      </div>
    </form>
  );
};

export default TranscriptForm;
