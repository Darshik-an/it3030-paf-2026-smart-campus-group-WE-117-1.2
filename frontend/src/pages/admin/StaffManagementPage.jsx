import React, { useState } from 'react';
import Navbar from '../../components/layout/Navbar';
import Sidebar from '../../components/layout/Sidebar';
import ManageStaff from '../../features/auth/components/admin/ManageStaff';

export default function StaffManagementPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDesktopMenuOpen, setIsDesktopMenuOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-[#f8f9fa] font-sans">
      <Sidebar 
        isMobileMenuOpen={isMobileMenuOpen} 
        setIsMobileMenuOpen={setIsMobileMenuOpen}
        isDesktopMenuOpen={isDesktopMenuOpen}
        setIsDesktopMenuOpen={setIsDesktopMenuOpen}
        activeTab="staff"
      />
      <main className="flex-1 flex flex-col overflow-hidden relative">
        <Navbar setIsMobileMenuOpen={setIsMobileMenuOpen} setIsDesktopMenuOpen={setIsDesktopMenuOpen} />
        <div className="flex-1 overflow-y-auto p-4 md:p-10">
          <ManageStaff />
        </div>
      </main>
    </div>
  );
}
