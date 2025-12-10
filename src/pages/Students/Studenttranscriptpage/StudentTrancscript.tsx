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


const StudentTranscript = () => {
  const navigate = useNavigate();
  const userId = useAppSelector(selectUserId);

  const [status, setStatus] = useState<TranscriptStatus>("processing");
  const [qrSrc, setQrSrc] = useState<string | undefined>(undefined);
  const [caption, setCaption] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!userId) return;

    const fetchQr = async () => {
      setLoading(true);
      setStatus("processing");
      setCaption(undefined);
      try {
        const res = await api.get(`/transcripts/${userId}/qr`, {
          responseType: "arraybuffer",
          headers: { Accept: "image/png" },
        });
        const blob = new Blob([res.data], { type: "image/png" });
        const url = URL.createObjectURL(blob);
        setQrSrc(url);
        setStatus("available");
        setCaption("Scan this QR code to verify your transcript via blockchain.");
      } catch (e: any) {
        const msg =
          e?.response?.data?.message ||
          e?.response?.data?.error ||
          "Your transcript is not prepared or not yet released.";
        setStatus("processing");
        setCaption(msg);
      } finally {
        setLoading(false);
      }
    };

    fetchQr();

    // optional cleanup of object URL
    return () => {
      if (qrSrc) {
        URL.revokeObjectURL(qrSrc);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const handleApply = () => navigate("/student/transcript/request");

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
            caption={loading ? "Loading transcript QR..." : caption}
          />
        </div>
      </div>
    </div>
  </div>
  );
};

export default StudentTranscript;
