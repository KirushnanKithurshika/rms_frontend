import { useState } from 'react';
import Navbarin from '../../../components/Navbar/navbarin.tsx';
import BreadcrumbNav from '../../../components/breadcrumbnav/breadcrumbnav.tsx';
import AdminSidebar from '../../../components/Admin/adminsidebar/adminsidebar.tsx';
import RolesPanel from '../../../components/Admin/rolescomponent/rolecomponent.tsx';
import RolePrivilegesTable from '../../../components/Admin/rolepreviliagetable/rolepreviliagetable.tsx';
import './rolemanagement.css';



const RoleManagement: React.FC = () => {
    const [isSidebarOpen, setSidebarOpen] = useState(false);



    const handleBackdropClick = () => setSidebarOpen(false);





    return (
        <div className="admin-dashboard-container">
            <div className="nav">
                <Navbarin />
            </div>

            <div className="breadcrumb">
                <BreadcrumbNav />
            </div>

            <div
                className={`sidebar-backdrop ${isSidebarOpen ? 'active' : ''}`}
                onClick={handleBackdropClick}
            ></div>

            <div className="main-area">
                <div className={`sidebar ${isSidebarOpen ? 'active' : ''}`}>
                    <AdminSidebar />
                </div>

                <div className="dashboard-content">
                    <div className="dashboard-cards">

                        <div className="cardcourse">
                            <div className="roles-page-container">
                                <RolesPanel />
                                <RolePrivilegesTable />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RoleManagement;
