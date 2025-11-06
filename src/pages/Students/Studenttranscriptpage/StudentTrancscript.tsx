import { useNavigate } from "react-router-dom";
import Navbarin from "../../../components/Navbar/navbarin.tsx";
import StudentSubNav from "../../../components/Students/StudentsubNav/Studentsubnav.tsx";
import "./StudentTranscript.css";
import StudentSidebar from "../../../components/Students/Studentsidebar/Studentsidebar.tsx";
import TranscriptAvailability from "../../../components/Students/Studentsidebar/TranscriptAvailability/TranscriptAvailability.tsx";
import readyImg from "../../../assets/transcript-ready.png"; // adjust path to your image
import BreadcrumbNav from "../../../components/breadcrumbnav/breadcrumbnav.tsx";


const StudentTranscript = () => {
  const navigate = useNavigate();

  const transcriptId = "ABC123";
  const lastUpdated = "2025-09-25 14:05";

  const handleApply = () => navigate("/student/transcript/apply");
  const handleOpen = () => navigate(`/student/transcript/view?id=${transcriptId}`);
  const handleDownload = () => {
    // e.g., window.open(`/api/transcripts/${transcriptId}/pdf`, "_blank");
  };

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
            status="available"
            imageSrc={readyImg}
            onApply={handleApply}
            onOpen={handleOpen}
            onDownload={handleDownload}
            caption={`Last updated: ${lastUpdated}`}
          />
        </div>
      </div>
    </div>
  </div>
  );
};

export default StudentTranscript;
