import React from "react";
import {
    HiOutlinePencilSquare,
    HiOutlineArrowDownTray,
    HiOutlineCheckCircle,
} from "react-icons/hi2";
import "./ResultApprovalViewer.css";

type ResultApprovalViewerProps = {
    pdfUrl: string;
    onApprove: () => void;
    onSign?: () => void;
    onDownload?: () => void;
    approveLabel?: string;
};

const ResultApprovalViewer: React.FC<ResultApprovalViewerProps> = ({
    pdfUrl,
    onApprove,
    onSign,
    onDownload,
    approveLabel = "Approve",
}) => {
    const handleDownload = () => {
        if (onDownload) return onDownload();

        const a = document.createElement("a");
        a.href = pdfUrl;
        a.download = "";
        a.rel = "noopener";
        a.click();
    };

    return (
        <section className="ra-shell">

            <aside className="ra-rail" aria-label="Document actions">
                <button
                    className="ra-rail-btn"
                    onClick={onSign}
                    aria-label="Sign document"
                    disabled={!onSign}
                    title={onSign ? "Sign" : "Sign (disabled)"}
                >
                    <HiOutlinePencilSquare className="ra-ico" aria-hidden="true" />
                    <span className="ra-rail-text">Sign</span>
                </button>

                <button
                    className="ra-rail-btn"
                    onClick={handleDownload}
                    aria-label="Download document"
                    title="Download"
                >
                    <HiOutlineArrowDownTray className="ra-ico" aria-hidden="true" />
                    <span className="ra-rail-text">Download</span>
                </button>

                <button
                    className="ra-rail-btn ra-approve"
                    onClick={onApprove}
                    aria-label="Approve document"
                    title={approveLabel}
                >
                    <HiOutlineCheckCircle className="ra-ico" aria-hidden="true" />
                    <span className="ra-rail-text">{approveLabel}</span>
                </button>
            </aside>

            <div className="ra-stage">
                <div className="ra-canvas">
                    {pdfUrl ? (
                        <iframe
                            className="ra-pdf"
                            src={pdfUrl}
                            title="Result sheet preview"
                            aria-label="Result sheet preview"
                        />
                    ) : (
                        <div className="ra-empty">
                            <p>No document to display.</p>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};

export default ResultApprovalViewer;
