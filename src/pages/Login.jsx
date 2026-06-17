import { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Briefcase, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate, useLocation } from "react-router-dom";

function Login() {

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || null;

  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      toast.success(`Welcome back, ${user.name.split(' ')[0]}!`);
      if (from) return navigate(from, { replace: true });
      navigate(user.role === 'recruiter' ? '/recruiter/dashboard' : '/candidate/dashboard');
    } catch (err) {
      console.error('Login error:', err); 
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return(
        <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'radial-gradient(ellipse at 50% 0%, rgba(108,99,255,0.08) 0%, transparent 60%)',
      padding: '24px',
    }}>
      <div className="fade-in" style={{ width: '100%', maxWidth: 440 }}>
        {/* Logo */}
        <div className="text-center mb-24">
          <div style={{
            width:52, height:52, background:'var(--accent)', borderRadius:14,
            display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px',
          }}>
            <Briefcase size={24} color="#fff" />
          </div>
          <h1 style={{ fontSize:28, fontFamily:'var(--font-head)' }}>Welcome back</h1>
          <p className="text-muted mt-8">Sign in to your HireHub account</p>
        </div>
 
        <div className="card" style={{ padding:32 }}>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email address</label>
              <div style={{ position:'relative' }}>
                <Mail size={16} style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'var(--text-dim)' }} />
                <input
                  type="email"
                  className="form-input"
                  style={{ paddingLeft:38 }}
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>
            </div>
 
            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position:'relative' }}>
                <Lock size={16} style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'var(--text-dim)' }} />
                <input
                  type={showPass ? 'text' : 'password'}
                  className="form-input"
                  style={{ paddingLeft:38, paddingRight:38 }}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)',
                    background:'none', border:'none', color:'var(--text-dim)', cursor:'pointer' }}>
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
 
            <button type="submit" className="btn btn-primary" style={{ width:'100%', justifyContent:'center', marginTop:8 }} disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
 
          <div style={{ marginTop:24, textAlign:'center', fontSize:14, color:'var(--text-muted)' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{fontWeight:500 }}>Create one</Link>
          </div>
        </div>
 
        <div style={{
          marginTop:16, padding:'12px 16px', background:'var(--accent-soft)',
          border:'1px solid var(--accent-border)', borderRadius:8, fontSize:13, color:'var(--text-muted)'
        }}>
          <strong style={{ color:'var(--accent)' }}>Demo:</strong> Register as a candidate or recruiter to explore all features.
        </div>
      </div>
    </div>
  );

}

export default Login;