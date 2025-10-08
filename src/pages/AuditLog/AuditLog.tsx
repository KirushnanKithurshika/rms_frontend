import { useState } from 'react';
import Navbarin from '../../components/Navbar/navbarin.tsx';
import BreadcrumbNav from '../../components/breadcrumbnav/breadcrumbnav.tsx';
import AdminSidebar from '../../components/Admin/adminsidebar/adminsidebar.tsx';
import AuditLogTable from '../../components/Admin/AuditLog/AuditLogTable.tsx';


const AuditLog: React.FC = () => {
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
            />

            <div className="main-area">
                <div className={`sidebar ${isSidebarOpen ? 'active' : ''}`}>
                    <AdminSidebar />
                </div>
                <div className="dashboard-content">
                    <div className="dashboard-cards">
                        <div className="cardcourse">
                            <div className="roles-page-container">
                                <AuditLogTable />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuditLog;
