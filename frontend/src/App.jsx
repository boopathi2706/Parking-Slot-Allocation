import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './views/Login';
import RegisterCompany from './views/RegisterCompany';
import VehicleConfig from './views/VehicleConfig';
import Dashboard from './views/Dashboard';
import SlotAllocation from './views/SlotAllocation';
import DeallocateSlot from './views/DeallocateSlot';
import SlotDetails from './views/SlotDetails';
import CustomerDetails from './views/CustomerDetails';
import "./App.css"
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<RegisterCompany />} />
        <Route path="/" element={<Login />} />
        <Route path="/customer-details" element={<CustomerDetails />} />
        <Route path="/vehicle-config" element={<VehicleConfig />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/slot-allocation" element={<SlotAllocation />} />
        <Route path="/deallocate-slot" element={<DeallocateSlot />} />
        <Route path="/slot-details/all" element={<SlotDetails />} />
        {/* Redirect root to login if no token (basic logic) */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;