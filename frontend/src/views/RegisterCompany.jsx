import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { MdVisibility, MdVisibilityOff, MdBusiness, MdPerson, MdEmail, MdLock, MdPhone } from "react-icons/md";
import toast, { Toaster } from 'react-hot-toast';
import { motion } from 'framer-motion';
import GlassCard from '../components/GlassCard';

const InputField = ({ icon, ...props }) => (
  <div className="relative">
    <div className="absolute left-3 top-3.5 text-gray-400 text-xl">{icon}</div>
    <input
      {...props}
      className="w-full pl-10 pr-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
    />
  </div>
);

const RegisterCompany = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    companyName: "", username: "", email: "", password: "", whatsappNumber: "",
  });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("https://parking-slot-allocation.onrender.com/api/auth/register", formData);
      localStorage.setItem("token", response.data.token);
      toast.success("Account Created!");
      setTimeout(() => navigate("/vehicle-config"), 1000);
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="min-h-screen anim-gradient flex items-center justify-center p-4">
      <Toaster position="top-center" />
      <GlassCard className="w-full max-w-lg p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">Get Started</h2>
          <p className="text-gray-500 mt-2">Create your company account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <InputField
              icon={<MdBusiness />}
              name="companyName"
              value={formData.companyName}
              placeholder="Company Name"
              onChange={handleChange}
              required
            />
            <InputField
              icon={<MdPerson />}
              name="username"
              value={formData.username}
              placeholder="Username"
              onChange={handleChange}
              required
            />
          </div>
          <InputField
            icon={<MdEmail />}
            name="email"
            type="email"
            value={formData.email}
            placeholder="Email Address"
            onChange={handleChange}
            required
          />
          <InputField
            icon={<MdPhone />}
            name="whatsappNumber"
            value={formData.whatsappNumber}
            placeholder="WhatsApp Number"
            onChange={handleChange}
            required
          />

          <div className="relative">
            <div className="absolute left-3 top-3.5 text-gray-400 text-xl"><MdLock /></div>
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              value={formData.password}
              placeholder="Password"
              onChange={handleChange}
              className="w-full pl-10 pr-10 py-3 bg-white/50 border border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
              required
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3.5 text-gray-400 hover:text-blue-500">
              {showPassword ? <MdVisibilityOff size={20} /> : <MdVisibility size={20} />}
            </button>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            type="submit"
            className="w-full py-3.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 mt-4"
          >
            Create Account
          </motion.button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-500 text-sm">Already have an account? <span onClick={() => navigate('/login')} className="text-blue-600 font-bold cursor-pointer hover:underline">Log in</span></p>
        </div>
      </GlassCard>
    </div>
  );
};

export default RegisterCompany;