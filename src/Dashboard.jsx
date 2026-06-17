import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from './Api';
import { useAuth } from './context/AuthContext';
import { Briefcase, Users, CheckCircle, Clock, PlusCircle, ArrowRight, TrendingUp, Eye } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/jobs/recruiter/dashboard')
      .then((res) => setData(res.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;

  const { stats, recentJobs } = data || {};

  const statItems = [
    { label:'Total Jobs', value: stats?.totalJobs, icon: <Briefcase size={20} />, color:'#6c63ff', bg:'rgba(108,99,255,0.12)' },
    { label:'Active Jobs', value: stats?.activeJobs, icon: <TrendingUp size={20} />, color:'#00d68f', bg:'rgba(0,214,143,0.12)' },
    { label:'Total Applications', value: stats?.totalApplications, icon: <Users size={20} />, color:'#ffb830', bg:'rgba(255,184,48,0.12)' },
    { label:'Hired', value: stats?.hired, icon: <CheckCircle size={20} />, color:'#00d68f', bg:'rgba(0,214,143,0.15)' },
  ];

  return (
    <div style={{ minHeight:'100vh', paddingBottom:60 }}>
      <div className="container" style={{ paddingTop:32 }}>
        {/* Header */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:32, flexWrap:'wrap', gap:16 }}>
          <div>
            <h1 style={{ fontFamily:'var(--font-head)', fontSize:26 }}>Recruiter Dashboard</h1>
            <p className="text-muted text-sm mt-8">Welcome back, {user?.name.split(' ')[0]}</p>
          </div>
          <Link to="/recruiter/jobs/new" className="btn btn-primary">
            <PlusCircle size={16} /> Post New Job
          </Link>
        </div>

        {/* Stats */}
        <div className="grid-4" style={{ marginBottom:32 }}>
          {statItems.map((s) => (
            <div key={s.label} className="stat-card">
              <div className="stat-icon" style={{ background: s.bg, color: s.color }}>{s.icon}</div>
              <div className="stat-info">
                <h3>{s.value ?? 0}</h3>
                <p>{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Application status breakdown */}
        <div className="grid-2" style={{ marginBottom:32 }}>
          <div className="card">
            <h2 style={{ fontFamily:'var(--font-head)', fontSize:18, marginBottom:20 }}>Application Pipeline</h2>
            {[
              { label:'Pending Review', value: stats?.pending, color:'var(--amber)' },
              { label:'Shortlisted', value: stats?.shortlisted, color:'var(--green)' },
              { label:'Hired', value: stats?.hired, color:'var(--accent)' },
            ].map((item) => (
              <div key={item.label} style={{ marginBottom:16 }}>
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:13, marginBottom:6 }}>
                  <span style={{ color:'var(--text-muted)' }}>{item.label}</span>
                  <span style={{ fontWeight:600 }}>{item.value ?? 0}</span>
                </div>
                <div style={{ height:6, background:'var(--border)', borderRadius:3, overflow:'hidden' }}>
                  <div style={{
                    height:'100%', background: item.color, borderRadius:3,
                    width: stats?.totalApplications ? `${((item.value || 0) / stats.totalApplications) * 100}%` : '0%',
                    transition:'width 0.5s ease',
                  }} />
                </div>
              </div>
            ))}
          </div>

          <div className="card">
            <h2 style={{ fontFamily:'var(--font-head)', fontSize:18, marginBottom:20 }}>Quick Actions</h2>
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {[
                { label:'Post a New Job', to:'/recruiter/jobs/new', icon:<PlusCircle size={16} />, color:'var(--accent)' },
                { label:'View All My Jobs', to:'/recruiter/jobs', icon:<Briefcase size={16} />, color:'var(--green)' },
              ].map((a) => (
                <Link key={a.label} to={a.to} style={{ textDecoration:'none' }}>
                  <div style={{
                    display:'flex', alignItems:'center', gap:12, padding:'12px 14px',
                    background:'var(--bg-elevated)', borderRadius:8, border:'1px solid var(--border)',
                    cursor:'pointer', transition:'all 0.2s',
                  }}
                    onMouseEnter={e => e.currentTarget.style.borderColor='var(--accent)'}
                    onMouseLeave={e => e.currentTarget.style.borderColor='var(--border)'}>
                    <span style={{ color: a.color }}>{a.icon}</span>
                    <span style={{ fontSize:14, fontWeight:500 }}>{a.label}</span>
                    <ArrowRight size={14} style={{ marginLeft:'auto', color:'var(--text-muted)' }} />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Recent jobs */}
        <div>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
            <h2 style={{ fontFamily:'var(--font-head)', fontSize:20 }}>Recent Job Postings</h2>
            <Link to="/recruiter/jobs" className="btn btn-ghost btn-sm">View all <ArrowRight size={13} /></Link>
          </div>

          {!recentJobs?.length ? (
            <div className="empty-state" style={{ padding:'40px 24px' }}>
              <Briefcase size={40} />
              <h3>No jobs posted yet</h3>
              <Link to="/recruiter/jobs/new" className="btn btn-primary mt-16">Post Your First Job</Link>
            </div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {recentJobs.map((job) => (
                <div key={job._id} className="card" style={{ padding:'16px 20px', display:'flex', alignItems:'center', justifyContent:'space-between', gap:12 }}>
                  <div>
                    <div style={{ fontWeight:600, fontFamily:'var(--font-head)', fontSize:15 }}>{job.title}</div>
                    <div style={{ fontSize:13, color:'var(--text-muted)', marginTop:2 }}>
                      {job.type} · {job.location} · <strong style={{ color:'var(--text)' }}>{job.applicantsCount}</strong> applicants
                    </div>
                  </div>
                  <div style={{ display:'flex', gap:8, flexShrink:0 }}>
                    <span className={`badge ${job.isActive ? 'badge-green' : 'badge-gray'}`}>
                      {job.isActive ? 'Active' : 'Closed'}
                    </span>
                    <Link to={`/recruiter/jobs/${job._id}/applicants`} className="btn btn-secondary btn-sm">
                      <Eye size={13} /> Applicants
                    </Link>
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

export default Dashboard;