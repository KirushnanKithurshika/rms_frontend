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
  "/admin/academicsetup/universities": "Universities",
  "/admin/academicsetup/faculties": "Faculties",
  "/admin/academicsetup/departments": "Departments",
  "/admin/academicsetup/semesters": "Semesters",
  "/admin/academicsetup/batches": "Batches",
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
  "/lecturer/student-management":"Student Management",
};

const BreadcrumbNav: React.FC = () => {
  const breadcrumbItems = [
    { label: 'EC 7212', link: '#' },
    { label: 'Results', link: '#' },
    { label: 'CA Marks', link: null }
  ];

  return (
    <nav className="breadcrumb-container">
      {breadcrumbItems.map((item, index) => (
        <span key={index} className="breadcrumb-item">
          {item.link ? (
            <a href={item.link} className="breadcrumb-link">{item.label}</a>
          ) : (
            <span className="breadcrumb-current">{item.label}</span>
          )}
          {index !== breadcrumbItems.length - 1 && (
            <FaChevronRight className="breadcrumb-separator" />
          )}
        </span>
      ))}
    </nav>
  );
};

export default BreadcrumbNav;