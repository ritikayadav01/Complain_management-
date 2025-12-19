import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import { FiMail, FiLock, FiUser, FiPhone } from 'react-icons/fi';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    address: '',
    role: 'user'
  });
  
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Always register as citizen user
    const payload = {
      ...formData,
      role: 'user'
    };

    setLoading(true);

    const result = await register(payload);
    setLoading(false);

    if (result.success) {
      toast.success('Registration successful');
      const user = result.user || JSON.parse(localStorage.getItem('user') || '{}');

      // Navigate based on role (admin role not possible through registration)
      if (user.role === 'department_staff') {
        navigate('/staff/dashboard');
      } else {
        navigate('/dashboard');
      }

    } else {
      toast.error(result.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-6">
      <div className="max-w-5xl w-full bg-white rounded-2xl shadow-2xl p-10 border border-blue-100">
        
        {/* HEADER */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">Smart CMS</h1>
          <p className="text-gray-700 text-lg font-medium">Complaint Management System</p>
          <p className="text-lg text-gray-600 mt-1">Create your new account</p>
        </div>

        {/* TWO COLUMN GRID */}
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">

          {/* LEFT SIDE */}
          <div className="space-y-5">

            {/* Role Info (Citizen only) */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-1">Account type</label>
              <p className="text-sm text-gray-700 font-medium">Citizen (File & track complaints)</p>
              <p className="text-xs text-gray-500 mt-1">
                Staff accounts are created by administrators only. Public signup is for citizens.
              </p>
            </div>

            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-1">Full Name</label>
              <div className="relative">
                <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-500" />
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter your name"
                  className="input pl-10 border-blue-200 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-1">Email</label>
              <div className="relative">
                <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-500" />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Enter your email"
                  className="input pl-10 border-blue-200 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

          </div>

          {/* RIGHT SIDE */}
          <div className="space-y-5">

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-1">Phone</label>
              <div className="relative">
                <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-500" />
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="Enter your phone"
                  className="input pl-10 border-blue-200 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-1">Address</label>
              <textarea
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                rows="3"
                placeholder="Enter your address"
                className="input border-blue-200 focus:ring-blue-500 focus:border-blue-500"
              ></textarea>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-1">Password</label>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-500" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Enter your password"
                  className="input pl-10 border-blue-200 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

          </div>

          {/* SUBMIT BUTTON – spans full width */}
          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-800 text-white font-semibold py-3 px-4 rounded-lg hover:from-blue-700 hover:to-blue-900 shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
            >
              {loading ? 'Creating your account…' : 'Create Account'}
            </button>
          </div>

        </form>

        {/* LOGIN LINK */}
        <p className="mt-6 text-center text-sm text-gray-700">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-600 hover:text-blue-800 font-semibold hover:underline">
            Sign in
          </Link>
        </p>

      </div>
    </div>
  );
};

export default Register;


