import { NavLink } from "react-router-dom";

export default function TranscriptRequestTabs() {
  return (
    <nav className="org-tabs">
      <NavLink to="pending" end className="org-tab">
        Pending Requests
      </NavLink>

      <span className="sep">|</span>

      <NavLink to="rejected" className="org-tab">
        Rejected Transcript Requests
      </NavLink>
    </nav>
  );
}
