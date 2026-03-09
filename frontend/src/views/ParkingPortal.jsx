import React, { useState } from 'react';
import { 
  LayoutDashboard, Grid3X3, PlusCircle, MinusCircle, 
  ParkingCircle, Settings, LogOut, Menu, X 
} from 'lucide-react';

// Import your existing page components
import Dashboard from './Dashboard';
import SlotDetails from './SlotDetails';
import SlotAllocation from './SlotAllocation';
import DeallocateSlot from './DeallocateSlot';

const ParkingPortal = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard />;
      case 'slots': return <SlotDetails />;
      case 'allocation': return <SlotAllocation />;
      case 'deallocate': return <DeallocateSlot />;
      default: return <Dashboard />;
    }
  };

  // Close sidebar and change tab
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setIsSidebarOpen(false); // Auto-close menu on mobile after selection
  };

  return (
    <div className="flex h-screen bg-[#f6f7f8] font-sans antialiased text-[#111418] overflow-hidden">
      
      {/* MOBILE OVERLAY */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden" 
          onClick={toggleSidebar}
        />
      )}

      {/* SIDEBAR */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 flex flex-col h-full transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:static lg:inset-auto
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-[#137fec] w-10 h-10 rounded-lg flex items-center justify-center text-white shadow-lg shadow-[#137fec]/20">
              <ParkingCircle size={24} />
            </div>
            <div>
              <h1 className="text-base font-bold leading-none">ParkManager</h1>
              <p className="text-[#617589] text-[10px] font-medium mt-1">ADMIN PORTAL</p>
            </div>
          </div>
          {/* Close button for mobile */}
          <button onClick={toggleSidebar} className="lg:hidden text-gray-500">
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-1 mt-4">
          <SidebarLink 
            icon={<LayoutDashboard size={20} />} 
            label="Dashboard" 
            active={activeTab === 'dashboard'} 
            onClick={() => handleTabChange('dashboard')} 
          />
          <SidebarLink 
            icon={<Grid3X3 size={20} />} 
            label="Slot Details" 
            active={activeTab === 'slots'} 
            onClick={() => handleTabChange('slots')} 
          />
          <SidebarLink 
            icon={<PlusCircle size={20} />} 
            label="Allocate Slot" 
            active={activeTab === 'allocation'} 
            onClick={() => handleTabChange('allocation')} 
          />
          <SidebarLink 
            icon={<MinusCircle size={20} />} 
            label="Deallocate Slot" 
            active={activeTab === 'deallocate'} 
            onClick={() => handleTabChange('deallocate')} 
          />
          
          <div className="pt-6 pb-2 px-3">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">System</p>
          </div>
          <SidebarLink icon={<Settings size={20} />} label="Settings" />
        </nav>

        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-3 px-2 py-3">
            <div className="w-8 h-8 rounded-full bg-gray-100 border flex items-center justify-center font-bold text-[#137fec] text-xs text-shrink-0">
              AJ
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">Alex Johnson</p>
              <p className="text-[10px] text-[#617589]">Manager</p>
            </div>
            <button className="text-gray-400 hover:text-red-500 transition-colors">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* MOBILE TOP BAR (Three Bar Icon) */}
        <header className="lg:hidden bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <button onClick={toggleSidebar} className="p-2 -ml-2 text-gray-600">
            <Menu size={24} />
          </button>
          <div className="flex items-center gap-2">
            <ParkingCircle size={20} className="text-[#137fec]" />
            <span className="font-bold text-sm">ParkManager</span>
          </div>
          <div className="w-10" /> {/* Spacer for centering title */}
        </header>

        <main className="flex-1 overflow-y-auto">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

const SidebarLink = ({ icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
      active 
        ? 'bg-[#137fec]/10 text-[#137fec] font-semibold' 
        : 'text-[#617589] hover:bg-gray-50 hover:text-[#111418]'
    }`}
  >
    {icon}
    <span className="text-sm">{label}</span>
    {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#137fec]"></div>}
  </button>
);

export default ParkingPortal;