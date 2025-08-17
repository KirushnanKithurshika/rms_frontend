import { useState } from 'react';
import Navbarin from '../../../components/Navbar/navbarin.tsx';
import BreadcrumbNav from '../../../components/breadcrumbnav/breadcrumbnav.tsx';
import StudentSubNav from '../../../components/Students/StudentsubNav/Studentsubnav.tsx';
import './studenthomepage.css';
import StudentMetrics from '../../../components/Students/studenthomepagegraphs/studenthomepagegraph.tsx';
import ResultSheet from '../../../components/Students/Studentsresultsheet/StudentResultsSheet.tsx';
import StudentResultsSheet from '../../../components/Students/Studentsresultsheet/StudentResultsSheet.tsx';
import ResultsTabsButtomSection from '../../../components/Students/StudentHomePageButtonSection/studenthomebuttonsection.tsx';


const StudentDashboard = () => {


  return (
    <div className="lec-dashboard-container">
      {/* Navbar */}
      <div className="nav">
        <Navbarin />
      </div>


     {/* <div className="breadcrumb">
        <BreadcrumbNav />
      </div>*/}

   
      <div className="dashboard-content">
        <StudentSubNav/>

        <div className="subnav-divider"></div>
        <div className="dashboard-cards-students">
          
          <div className="card-students">
             <StudentMetrics/>
          </div>
<div className='SHP'><ResultsTabsButtomSection/></div>
          <div>
        
          </div>
        
          </div>
        </div>
      </div>
   
  );
};

export default StudentDashboard;
