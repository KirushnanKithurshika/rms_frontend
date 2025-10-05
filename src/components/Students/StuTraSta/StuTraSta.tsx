import React, { useEffect, useState } from "react";
import {
  FaCheckCircle,
  FaTimesCircle,
  FaRegClock,
  FaRegCircle,
} from "react-icons/fa";
import "./StuTraSta.css";

/* ───────────────────────── Types ───────────────────────── */
type StepStatus = "done" | "current" | "pending" | "rejected";
type TimelineStep = {
  id: string;
  title: string;
  date?: string;
  status: StepStatus;
  reason?: string;
};

type TranscriptStatusApi = {
  id: string;
  applicationReceivedAt?: string | null;
  paymentReceivedAt?: string | null;
  section: {
    state: "waiting" | "approved" | "rejected";
    updatedAt?: string | null;
    reason?: string | null;
  };
  admin: { state: "pending" | "approved"; updatedAt?: string | null };
  dean: { state: "pending" | "approved"; updatedAt?: string | null };
};

/* ─────────────── Demo data (renders immediately) ─────────────── */
const DEMO: TranscriptStatusApi = {
  id: "DEMO-1",
  applicationReceivedAt: "2024-05-12T10:12:00Z",
  paymentReceivedAt: "2024-05-12T12:30:00Z",
  section: { state: "rejected", reason: "Rejected by Library Section" },
  admin: { state: "pending" },
  dean: { state: "pending" },
};

/* ───────────────────── helpers / mapping ───────────────────── */
function formatDate(iso?: string | null) {
  if (!iso) return undefined;
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function buildSteps(data: TranscriptStatusApi): TimelineStep[] {
  const steps: TimelineStep[] = [];
  const appDone = !!data.applicationReceivedAt;
  const payDone = !!data.paymentReceivedAt;

  steps.push({
    id: "app",
    title: "Application Received",
    date: formatDate(data.applicationReceivedAt),
    status: appDone ? "done" : "pending",
  });

  steps.push({
    id: "pay",
    title: "Payment Received",
    date: formatDate(data.paymentReceivedAt),
    status: payDone ? "done" : appDone ? "current" : "pending",
  });

  if (data.section.state === "rejected") {
    steps.push({
      id: "section",
      title: "Rejected by Section",
      status: "rejected",
      reason: data.section.reason || "Your request was rejected by the section.",
    });
  } else if (data.section.state === "approved") {
    steps.push({
      id: "section",
      title: "Section Approved",
      date: formatDate(data.section.updatedAt),
      status: "done",
    });
  } else {
    steps.push({
      id: "section",
      title: "Waiting for Section Approval",
      status: payDone ? "current" : "pending",
    });
  }

  const adminDone = data.admin.state === "approved";
  steps.push({
    id: "admin",
    title: "Administrative Approval",
    date: formatDate(data.admin.updatedAt),
    status:
      data.section.state === "rejected"
        ? "pending"
        : adminDone
        ? "done"
        : data.section.state === "approved"
        ? "current"
        : "pending",
  });

  const deanDone = data.dean.state === "approved";
  steps.push({
    id: "dean",
    title: "Dean Approval",
    date: formatDate(data.dean.updatedAt),
    status:
      data.section.state === "rejected"
        ? "pending"
        : deanDone
        ? "done"
        : adminDone
        ? "current"
        : "pending",
  });

  return steps;
}

/* ───────────────────── Row (3-column) ───────────────────── */
function Row({
  step,
  isLast,
  side, // "left" | "right"
}: {
  step: TimelineStep;
  isLast: boolean;
  side: "left" | "right";
}) {
  let iconClass = "tl-icon--pending";
  let Icon: React.ReactNode = <FaRegCircle />;

  if (step.status === "done") {
    iconClass = "tl-icon--done";
    Icon = <FaCheckCircle />;
  } else if (step.status === "current") {
    iconClass = "tl-icon--current";
    Icon = <FaRegClock />;
  } else if (step.status === "rejected") {
    iconClass = "tl-icon--rejected";
    Icon = <FaTimesCircle />;
  }

  const Content = (
    <div className="tl-content">
      {/* show date for all non-pending states to match your mock */}
      {step.date && <div className="tl-date">{step.date}</div>}
      <div className={`tl-title ${step.status === "pending" ? "is-muted" : ""}`}>
        {step.title}
      </div>
      {step.status === "rejected" && (
        <div className="tl-reason">{step.reason || "No reason provided."}</div>
      )}
    </div>
  );

  return (
    <div className="tl-row-3">
      {/* LEFT column */}
      <div className={`tl-side tl-left ${side === "left" ? "show" : ""}`}>
        {side === "left" && Content}
      </div>

      {/* CENTER track */}
      <div className="tl-track">
        <div className={`tl-icon ${iconClass}`} aria-hidden>
          {Icon}
        </div>
        {!isLast && <div className="tl-connector" />}
      </div>

      {/* RIGHT column */}
      <div className={`tl-side tl-right ${side === "right" ? "show" : ""}`}>
        {side === "right" && Content}
      </div>
    </div>
  );
}

/* ───────────────────── Public component ───────────────────── */
type Props = {
  transcriptId?: string; // optional: use built-in demo if not provided
  mockData?: TranscriptStatusApi;
  pollMs?: number;
  endpoint?: (id: string) => string;
};

const TranscriptStatusTimeline: React.FC<Props> = ({
  transcriptId,
  mockData,
  pollMs = 0,
  endpoint = (id: string) => `/api/transcripts/${id}/status`,
}) => {
  const [data, setData] = useState<TranscriptStatusApi | null>(
    mockData ?? DEMO
  );
  const [error, setError] = useState<string | null>(null);

  // adopt new mockData at runtime
  useEffect(() => {
    if (mockData) setData(mockData);
  }, [mockData]);

  // fetch only if transcriptId exists AND no mockData
  useEffect(() => {
    if (!transcriptId || mockData) return;
    let timer: number | undefined;
    let aborted = false;

    const run = async () => {
      try {
        setError(null);
        const res = await fetch(endpoint(transcriptId), { credentials: "include" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json: TranscriptStatusApi = await res.json();
        if (!aborted) setData(json);
      } catch (e: any) {
        if (!aborted) setError(e?.message || "Failed to load status");
      } finally {
        if (!aborted && pollMs > 0) timer = window.setTimeout(run, pollMs);
      }
    };

    run();
    return () => {
      aborted = true;
      if (timer) clearTimeout(timer);
    };
  }, [transcriptId, pollMs, endpoint, mockData]);

  const source = mockData ?? data ?? DEMO;
  if (error && !source) return <div className="tl-loading">Couldn’t load status.</div>;

  const steps = buildSteps(source);

  return (
    <div className="tl">
      {steps.map((step, i) => (
        <Row
          key={step.id}
          step={step}
          isLast={i === steps.length - 1}
          side={i % 2 === 0 ? "right" : "left"} // 1st right, 2nd left, etc.
        />
      ))}
    </div>
  );
};

export default TranscriptStatusTimeline;
