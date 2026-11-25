import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Lock, Mail, AlertCircle, ArrowRight, Eye, EyeOff, ShieldCheck } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [statusNotice, setStatusNotice] = useState(null);
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setStatusNotice(null);
    setLoading(true);
    try {
      const user = await login({ email: email.trim(), password: password.trim() });
      if (user.role === 'Admin') navigate('/admin');
      else navigate('/dashboard');
    } catch (err) {
      const res = err.response?.data;
      if (res?.status) setStatusNotice({ status: res.status, message: res.message });
      else setError(res?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* ── Left Panel: Branding ── */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex-col items-center justify-center p-12 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-blue-500 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-700 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 text-center">
          <img src="/accessflow-logo-dark.svg" alt="AccessFlow" className="h-20 mx-auto mb-10" />
          <h1 className="text-4xl font-bold text-white leading-tight mb-4">
            Enterprise Access,<br />
            <span className="text-blue-400">Simplified.</span>
          </h1>
          <p className="text-slate-400 text-lg max-w-sm mx-auto leading-relaxed">
            Manage employee onboarding, permissions, and resource access — all in one secure portal.
          </p>
          {/* Feature pills */}
          <div className="mt-10 flex flex-col gap-3 items-start max-w-xs mx-auto">
            {[
              'Role-based access control',
              'Time-bound permissions',
              'Full enterprise audit logs',
              'Real-time notifications',
            ].map((f) => (
              <div key={f} className="flex items-center gap-2.5 text-slate-300 text-sm">
                <div className="h-5 w-5 rounded-full bg-blue-500/20 border border-blue-400/30 flex items-center justify-center shrink-0">
                  <ShieldCheck className="h-3 w-3 text-blue-400" />
                </div>
                {f}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right Panel: Form ── */}
      <div className="flex-1 flex items-center justify-center p-6 bg-slate-50">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <img src="/accessflow-logo-light.svg" alt="AccessFlow" className="h-12 mx-auto" />
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-slate-900">Welcome back</h2>
            <p className="text-slate-500 mt-1 text-sm">Sign in to your AccessFlow account</p>
          </div>

          {/* Status Alert */}
          {statusNotice && (
            <div className={`mb-5 p-4 rounded-xl text-sm border flex items-start gap-3 ${
              statusNotice.status === 'pending'
                ? 'bg-amber-50 border-amber-200 text-amber-800'
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}>
              <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold capitalize">{statusNotice.status} Account</p>
                <p className="mt-0.5 text-xs">{statusNotice.message}</p>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-xl flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Work Email</label>
              <div className="relative">
                <Mail className="h-4 w-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-xs"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="h-4 w-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-11 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-xs"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-xl text-sm shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Footer link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-slate-500">
              New employee?{' '}
              <Link to="/register" className="font-semibold text-blue-600 hover:text-blue-700 hover:underline">
                Request access
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
