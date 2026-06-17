import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../Api';
import { useAuth } from '../context/AuthContext';
import { Briefcase, Clock, CheckCircle, XCircle, Star, User, Search, ArrowRight, TrendingUp } from 'lucide-react';

const statusBadge = (status) => {
  const map = {
    Pending: 'badge-amber', Reviewed: 'badge-accent', Shortlisted: 'badge-green',
    Rejected: 'badge-red', Hired: 'badge-green',
  };
  return map[status] || 'badge-gray';
};

const CandidateDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/candidate/dashboard'),
      api.get('/candidate/applications'),
    ]).then(([dashRes, appRes]) => {
      setStats(dashRes.data.stats);
      setApplications(appRes.data.applications.slice(0, 5));
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;

  const statItems = [
    { label:'Total Applied', value: stats?.total, icon: <Briefcase size={20} />, color:'#6c63ff', bg:'rgba(108,99,255,0.12)' },
    { label:'Pending', value: stats?.pending, icon: <Clock size={20} />, color:'#ffb830', bg:'rgba(255,184,48,0.12)' },
    { label:'Shortlisted', value: stats?.shortlisted, icon: <Star size={20} />, color:'#00d68f', bg:'rgba(0,214,143,0.12)' },
    { label:'Hired', value: stats?.hired, icon: <CheckCircle size={20} />, color:'#00d68f', bg:'rgba(0,214,143,0.15)' },
  ];

  return (
    <div style={{ minHeight:'100vh', paddingBottom:60 }}>
      <div className="container" style={{ paddingTop:32 }}>
        {/* Header */}
        <div style={{ marginBottom:32 }}>
          <div style={{ display:'flex', alignItems:'center', gap:16 }}>
            <div style={{
              width:52, height:52, borderRadius:'50%', background:'var(--accent-soft)',
              border:'2px solid var(--accent-border)', display:'flex', alignItems:'center',
              justifyContent:'center', fontFamily:'var(--font-head)', fontWeight:800,
              fontSize:20, color:'var(--accent)',
            }}>
              {user?.name[0].toUpperCase()}
            </div>
            <div>
              <h1 style={{ fontFamily:'var(--font-head)', fontSize:26 }}>
                Hey, {user?.name.split(' ')[0]} 👋
              </h1>
              <p className="text-muted text-sm">Track your job applications and career progress</p>
            </div>
          </div>
        </div>

        {/* Profile incomplete banner */}
        {!stats?.profileComplete && (
          <Link to="/candidate/profile" style={{ textDecoration:'none' }}>
            <div style={{
              marginBottom:24, padding:'16px 20px',
              background:'linear-gradient(135deg, rgba(108,99,255,0.15), rgba(108,99,255,0.05))',
              border:'1px solid var(--accent-border)', borderRadius:12,
              display:'flex', alignItems:'center', justifyContent:'space-between',
            }}>
              <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                <div style={{ width:36, height:36, background:'var(--accent)', borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <User size={18} color="#fff" />
                </div>
                <div>
                  <div style={{ fontWeight:600, fontSize:14 }}>Complete your profile</div>
                  <div style={{ fontSize:13, color:'var(--text-muted)' }}>Add your skills and experience to stand out to recruiters</div>
                </div>
              </div>
              <ArrowRight size={16} style={{ color:'var(--accent)' }} />
            </div>
          </Link>
        )}

        {/* Stats grid */}
        <div className="grid-4" style={{ marginBottom:32 }}>
          {statItems.map((s) => (
            <div key={s.label} className="stat-card">
              <div className="stat-icon" style={{ background: s.bg, color: s.color }}>
                {s.icon}
              </div>
              <div className="stat-info">
                <h3>{s.value ?? 0}</h3>
                <p>{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Quick actions */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:32 }}>
          <Link to="/jobs" style={{ textDecoration:'none' }}>
            <div className="card" style={{ cursor:'pointer', display:'flex', alignItems:'center', gap:16, transition:'all 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.borderColor='var(--accent)'}
              onMouseLeave={e => e.currentTarget.style.borderColor='var(--border)'}>
              <div style={{ width:44, height:44, borderRadius:10, background:'var(--accent-soft)', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--accent)' }}>
                <Search size={20} />
              </div>
              <div>
                <div style={{ fontWeight:600, fontFamily:'var(--font-head)' }}>Browse Jobs</div>
                <div style={{ fontSize:13, color:'var(--text-muted)' }}>Explore new opportunities</div>
              </div>
              <ArrowRight size={16} style={{ color:'var(--text-muted)', marginLeft:'auto' }} />
            </div>
          </Link>
          <Link to="/candidate/profile" style={{ textDecoration:'none' }}>
            <div className="card" style={{ cursor:'pointer', display:'flex', alignItems:'center', gap:16, transition:'all 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.borderColor='var(--accent)'}
              onMouseLeave={e => e.currentTarget.style.borderColor='var(--border)'}>
              <div style={{ width:44, height:44, borderRadius:10, background:'var(--green-soft)', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--green)' }}>
                <User size={20} />
              </div>
              <div>
                <div style={{ fontWeight:600, fontFamily:'var(--font-head)' }}>My Profile</div>
                <div style={{ fontSize:13, color:'var(--text-muted)' }}>Update your information</div>
              </div>
              <ArrowRight size={16} style={{ color:'var(--text-muted)', marginLeft:'auto' }} />
            </div>
          </Link>
        </div>

        {/* Recent applications */}
        <div>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
            <h2 style={{ fontFamily:'var(--font-head)', fontSize:20 }}>Recent Applications</h2>
            <Link to="/candidate/applications" className="btn btn-ghost btn-sm">View all <ArrowRight size={13} /></Link>
          </div>

          {applications.length === 0 ? (
            <div className="empty-state" style={{ padding:'40px 24px' }}>
              <Briefcase size={40} />
              <h3>No applications yet</h3>
              <p>Start applying to jobs to track them here</p>
              <Link to="/jobs" className="btn btn-primary mt-16">Browse Jobs</Link>
            </div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {applications.map((app) => (
                <div key={app._id} className="card" style={{ padding:'16px 20px', display:'flex', alignItems:'center', justifyContent:'space-between', gap:12 }}>
                  <div>
                    <div style={{ fontWeight:600, fontFamily:'var(--font-head)', fontSize:15 }}>{app.job?.title}</div>
                    <div style={{ fontSize:13, color:'var(--text-muted)', marginTop:2 }}>{app.job?.company} · {app.job?.location}</div>
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:12, flexShrink:0 }}>
                    <span className={`badge ${statusBadge(app.status)}`}>{app.status}</span>
                    <span style={{ fontSize:12, color:'var(--text-dim)' }}>
                      {new Date(app.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CandidateDashboard;