import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { User, Mail, Lock, Building, Briefcase, AlertCircle, CheckCircle2, Eye, EyeOff, ArrowRight } from 'lucide-react';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        department: '',
        designation: '',
        password: '',
        confirmPassword: '',
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    const { register } = useAuth();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            return setError('Passwords do not match');
        }
        if (formData.password.length < 6) {
            return setError('Password must be at least 6 characters');
        }

        setLoading(true);
        try {
            await register(formData);
            setSuccess(true);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to submit registration');
        } finally {
            setLoading(false);
        }
    };

    // ── Success screen ──
    if (success) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-10 text-center">
                    <div className="h-16 w-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-5 border-2 border-emerald-100">
                        <CheckCircle2 className="h-8 w-8" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800">Application Submitted!</h2>
                    <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                        Your access request for <span className="font-semibold text-slate-800">{formData.email}</span> has been sent to the administrator.
                    </p>
                    <div className="my-6 p-4 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-xs text-left">
                        <p className="font-semibold mb-1">⏳ What happens next?</p>
                        <p>An administrator will review your application, assign your role (Developer or Sales), and configure your section permissions. You can log in once approved.</p>
                    </div>
                    <Link
                        to="/login"
                        className="flex items-center justify-center gap-2 w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm shadow-sm transition-all"
                    >
                        <ArrowRight className="h-4 w-4" />
                        Back to Sign In
                    </Link>
                </div>
            </div>
        );
    }

    const inputClass = "w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all";

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center p-4">
            {/* Background blobs */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-700/20 rounded-full blur-3xl" />
                <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl" />
            </div>

            <div className="relative w-full max-w-xl">
                {/* Header */}
                <div className="text-center mb-8">
                    <img src="/accessflow-logo-dark.svg" alt="AccessFlow" className="h-14 mx-auto mb-4" />
                    <h2 className="text-3xl font-bold text-white">Request Employee Access</h2>
                    <p className="text-slate-400 text-sm mt-2">Fill in your details to request access to your organization's portal</p>
                </div>

                {/* Card */}
                <div className="bg-white rounded-2xl shadow-2xl p-8">
                    {error && (
                        <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-xl flex items-center gap-2">
                            <AlertCircle className="h-4 w-4 shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Name + Email */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Full Name *</label>
                                <div className="relative">
                                    <User className="h-4 w-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                    <input type="text" name="name" required value={formData.name} onChange={handleChange} placeholder="Alex Johnson" className={inputClass} />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Work Email *</label>
                                <div className="relative">
                                    <Mail className="h-4 w-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                    <input type="email" name="email" required value={formData.email} onChange={handleChange} placeholder="alex@company.com" className={inputClass} />
                                </div>
                            </div>
                        </div>

                        {/* Department + Designation */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Department *</label>
                                <div className="relative">
                                    <Building className="h-4 w-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                    <input type="text" name="department" required value={formData.department} onChange={handleChange} placeholder="Engineering / Sales / HR" className={inputClass} />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Designation <span className="text-slate-400 font-normal">(Optional)</span></label>
                                <div className="relative">
                                    <Briefcase className="h-4 w-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                    <input type="text" name="designation" value={formData.designation} onChange={handleChange} placeholder="Frontend Engineer" className={inputClass} />
                                </div>
                            </div>
                        </div>

                        {/* Divider */}
                        <div className="border-t border-slate-100 pt-1" />

                        {/* Password + Confirm Password */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Password *</label>
                                <div className="relative">
                                    <Lock className="h-4 w-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        name="password"
                                        required
                                        value={formData.password}
                                        onChange={handleChange}
                                        placeholder="Min 6 characters"
                                        className="w-full pl-10 pr-11 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                                    >
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Confirm Password *</label>
                                <div className="relative">
                                    <Lock className="h-4 w-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                    <input
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        name="confirmPassword"
                                        required
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        placeholder="Re-enter password"
                                        className={`w-full pl-10 pr-11 py-3 bg-slate-50 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:border-transparent focus:bg-white transition-all ${
                                            formData.confirmPassword && formData.password !== formData.confirmPassword
                                                ? 'border-rose-300 focus:ring-rose-400'
                                                : formData.confirmPassword && formData.password === formData.confirmPassword
                                                ? 'border-emerald-300 focus:ring-emerald-400'
                                                : 'border-slate-200 focus:ring-blue-500'
                                        }`}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                                        aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                                    >
                                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                                {/* Live match indicator */}
                                {formData.confirmPassword && (
                                    <p className={`text-xs mt-1.5 ${formData.password === formData.confirmPassword ? 'text-emerald-600' : 'text-rose-500'}`}>
                                        {formData.password === formData.confirmPassword ? '✓ Passwords match' : '✗ Passwords do not match'}
                                    </p>
                                )}
                            </div>
                        </div>

                        <p className="text-xs text-slate-400 bg-slate-50 rounded-xl p-3 border border-slate-100">
                            🔒 Roles and permissions are assigned securely by the administrator upon review. You will be notified once your account is approved.
                        </p>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-xl text-sm shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
                        >
                            {loading ? (
                                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <>
                                    <span>Submit Registration Request</span>
                                    <ArrowRight className="h-4 w-4" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-6 pt-5 border-t border-slate-100 text-center">
                        <p className="text-sm text-slate-500">
                            Already registered?{' '}
                            <Link to="/login" className="font-semibold text-blue-600 hover:text-blue-700 hover:underline">
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
