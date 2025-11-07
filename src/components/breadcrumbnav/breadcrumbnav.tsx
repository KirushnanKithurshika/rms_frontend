// src/components/breadcrumbnav/BreadcrumbNav.tsx
import React, { useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import { FaChevronRight } from "react-icons/fa";
import "./breadcrumbnav.css";

type CrumbMap = Record<string, string>;

const breadcrumbMap: CrumbMap = {
  "/": "Home",
  "/drop": "User Menu",
  "/login": "Login",
  "/reset-password": "Reset Password",
  "/reset-password-mail": "Reset Password Email",
  "/student": "Student",
  "/student/student-dashboard": "Student Dashboard",
  "/account-setting": "Account Settings",
  "/verification": "Two-Step Verification",
  "/lecturerhome": "Lecturer Home",
  "/createcourseui": "Create Course (UI)",
  "/createcourse": "Create Course",
  "/courses": "Courses",
  "/results-preview": "Results Preview",
  "/results-analysis": "Results Analysis",

  "/admin": "Admin",
  "/admin/dashboard": "Dashboard",
  "/admin/user-management": "User Management",
  "/admin/role-management": "Role Management",
  "/admin/student-management": "Student Management",
  "/admin/transcripts": "Transcript Approvals",
  "/admin/academicsetup": "Academic Setup",
  "/StudentResultsSheet": "Student Results Sheet",
  "/student-courses": "Student Courses",
  "/student/transcript": "Student Transcript",
  "/student/transcript/request": "Transcript Request",
  "/student/transcript/status": "Transcript Status",
  "/approval-requests": "Approval Requests",
  "/approval-history": "Approval History",
  "/course-history": "Course History",
  "/modify-results": "Modify Results",
  "/signatureboard": "Signature Board",
  "/results-approval-requests": "Results Approval Requests",
  "/lec-announcement-page": "Lecturer Announcements",
};

const BreadcrumbNav: React.FC = () => {
  const { pathname = "/" } = useLocation();
  const crumbs = useMemo(() => {
    const segs = pathname.split("/").filter(Boolean);
    const paths = segs.map((_, i) => "/" + segs.slice(0, i + 1).join("/"));
    if (paths.length === 0) paths.push("/");

    return paths
      .map((p) => (breadcrumbMap[p] ? { to: p, label: breadcrumbMap[p] } : null))
      .filter(Boolean) as { to: string; label: string }[];
  }, [pathname]);

  if (!crumbs.length) return null;

  return (
    <nav className="breadcrumb-container" aria-label="Breadcrumb">
      {crumbs.map((c, i) => {
        const isLast = i === crumbs.length - 1;
        return (
          <span key={c.to} className="breadcrumb-item">
            {isLast ? (
              <span className="breadcrumb-current">{c.label}</span>
            ) : (
              <Link to={c.to} className="breadcrumb-link">{c.label}</Link>
            )}
            {!isLast && <FaChevronRight className="breadcrumb-separator" />}
          </span>
        );
      })}
    </nav>
  );
};

export default BreadcrumbNav;
