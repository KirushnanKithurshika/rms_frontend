
import { NavLink } from "react-router-dom";
import "./AcademicSetupTab.css";

export default function OrgTabs() {
  return (
    <nav className="org-tabs">
  <NavLink to="/admin/academicsetup/universities" end className="org-tab">
    University
  </NavLink>
  <span className="sep">|</span>

  <NavLink to="/admin/academicsetup/faculties" className="org-tab">
    Faculty
  </NavLink>
  <span className="sep">|</span>

  <NavLink to="/admin/academicsetup/departments" className="org-tab">
    Department
  </NavLink>
  <span className="sep">|</span>

  <NavLink to="/admin/academicsetup/semesters" className="org-tab">
    Semester
  </NavLink>
   <span className="sep">|</span>
  <NavLink to="/admin/academicsetup/batches" className="org-tab">
    Batches
  </NavLink>
</nav>

  );
}
