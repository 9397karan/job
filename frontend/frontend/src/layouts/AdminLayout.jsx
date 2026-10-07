import { Outlet } from "react-router-dom";

import Navbar from "../components/Navbar";
import AdminSidebar from "../components/AdminSidebar";

const AdminLayout = () => {
  return (
    <div className="min-h-screen bg-slate-50">

      {/* Navbar */}
      <Navbar />

      <div className="flex">

        {/* Admin Sidebar */}
        <AdminSidebar />

        {/* Main Content */}
        <main className="min-w-0 flex-1">

          <div className="dashboard-bg min-h-[calc(100vh-4rem)] p-4 md:p-6 lg:p-8">

            <div className="page-enter">
              <Outlet />
            </div>

          </div>

        </main>

      </div>

    </div>
  );
};

export default AdminLayout;