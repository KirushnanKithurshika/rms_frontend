import React from 'react';
import './breadcrumbnav.css';
import { FaChevronRight } from 'react-icons/fa';

const BreadcrumbNav: React.FC = () => {
  const breadcrumbItems = [
    { label: 'EC 7212', link: '#' },
    { label: 'Take Home Assignments', link: '#' },
    { label: 'Take Home Assignment 1', link: null }
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