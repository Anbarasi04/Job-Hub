import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import toast from 'react-hot-toast';
import { Briefcase, User, UserCheck, Building2, Mail, Lock } from 'lucide-react';


function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'candidate' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async(e) => {
       e.preventDefault();
       if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
       setLoading(true);
       try {
            const user = await register(form.name, form.email, form.password, form.role);
            if(user) {
                toast.success('Account created! Welcome to HireHub 🎉');
                navigate(user.role === 'recruiter' ? '/recruiter/dashboard' : '/candidate/dashboard');
            }
        } catch (err) {
            console.log(err);
            toast.error(err.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
  }

  return(
      <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'radial-gradient(ellipse at 50% 0%, rgba(108,99,255,0.08) 0%, transparent 60%)',
      padding: '24px',
    }}>
      <div className="fade-in" style={{ width: '100%', maxWidth: 480 }}>
        <div className="text-center mb-24">
          <div style={{
            width:52, height:52, background:'var(--accent)', borderRadius:14,
            display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px',
          }}>
            <Briefcase size={24} color="#fff" />
          </div>
          <h1 style={{ fontSize:28, fontFamily:'var(--font-head)' }}>Create your account</h1>
          <p className="text-muted mt-8">Join thousands of professionals on HireHub</p>
        </div>
 
        <div className="card" style={{ padding:32 }}>
          {/* Role selection */}
          <div style={{ marginBottom:24 }}>
            <label className="form-label" style={{ marginBottom:10, display:'block' }}>I am a...</label>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
              {[
                { value:'candidate', label:'Job Seeker', icon:<UserCheck size={20} />, desc:'Looking for opportunities' },
                { value:'recruiter', label:'Recruiter', icon:<Building2 size={20} />, desc:'Hiring talent' },
              ].map((r) => (
                <button key={r.value} type="button"
                  onClick={() => setForm({ ...form, role: r.value })}
                  style={{
                    padding:'16px', borderRadius:10, border:'2px solid',
                    borderColor: form.role === r.value ? 'var(--accent)' : 'var(--border)',
                    background: form.role === r.value ? 'var(--accent-soft)' : 'var(--bg-elevated)',
                    cursor:'pointer', textAlign:'left', transition:'all 0.2s',
                  }}>
                  <div style={{ color: form.role === r.value ? 'var(--accent)' : 'var(--text-muted)', marginBottom:6 }}>{r.icon}</div>
                  <div style={{ fontWeight:600, fontSize:14, color:'var(--text)', fontFamily:'var(--font-head)' }}>{r.label}</div>
                  <div style={{ fontSize:12, color:'var(--text-muted)', marginTop:2 }}>{r.desc}</div>
                </button>
              ))}
            </div>
          </div>
 
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Full name</label>
              <div style={{ position:'relative' }}>
                <User size={16} style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'var(--text-dim)' }} />
                <input type="text" className="form-input" style={{ paddingLeft:38 }}
                  placeholder="John Doe" value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>
            </div>
 
            <div className="form-group">
              <label className="form-label">Email address</label>
              <div style={{ position:'relative' }}>
                <Mail size={16} style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'var(--text-dim)' }} />
                <input type="email" className="form-input" style={{ paddingLeft:38 }}
                  placeholder="you@example.com" value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })} required />
              </div>
            </div>
 
            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position:'relative' }}>
                <Lock size={16} style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'var(--text-dim)' }} />
                <input type="password" className="form-input" style={{ paddingLeft:38 }}
                  placeholder="Min. 6 characters" value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })} required />
              </div>
            </div>
 
            <button type="submit" className="btn btn-primary" style={{ width:'100%', justifyContent:'center', marginTop:8 }} disabled={loading}>
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>
 
          <div style={{ marginTop:24, textAlign:'center', fontSize:14, color:'var(--text-muted)' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color:'var(--accent)', fontWeight:500 }}>Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );

}

export default Register;