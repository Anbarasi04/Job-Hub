import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from './Api';
import { ArrowLeft, User, Mail, Calendar, FileText } from 'lucide-react';
import toast from 'react-hot-toast';

const STATUSES = ['Pending', 'Reviewed', 'Shortlisted', 'Rejected', 'Hired'];
const statusBadge = (s) => ({
  Pending:'badge-amber', Reviewed:'badge-accent', Shortlisted:'badge-green', Rejected:'badge-red', Hired:'badge-green'
})[s] || 'badge-gray';

const Applicants = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [updating, setUpdating] = useState(null);

  useEffect(() => {
    Promise.all([
      api.get(`/jobs/${id}`),
      api.get(`/jobs/${id}/applicants`),
    ]).then(([jobRes, appRes]) => {
      setJob(jobRes.data.job);
      setApplications(appRes.data.applications);
    }).catch(() => navigate('/recruiter/jobs'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const updateStatus = async (appId, status, notes) => {
    setUpdating(appId);
    try {
      const res = await api.put(`/jobs/application/${appId}/status`, { status, recruiterNotes: notes });
      setApplications(applications.map((a) => a._id === appId ? { ...a, status: res.data.application.status, recruiterNotes: res.data.application.recruiterNotes } : a));
      toast.success('Status updated');
    } catch {
      toast.error('Failed to update status');
    } finally {
      setUpdating(null);
    }
  };

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;

  return (
    <div style={{ minHeight:'100vh', paddingBottom:60 }}>
      <div className="container" style={{ paddingTop:32 }}>
        <button className="btn btn-ghost btn-sm" onClick={() => navigate(-1)} style={{ marginBottom:24 }}>
          <ArrowLeft size={15} /> Back
        </button>

        <div className="page-header">
          <h1>Applicants for "{job?.title}"</h1>
          <p>{applications.length} application{applications.length !== 1 ? 's' : ''} received · {job?.company}</p>
        </div>

        {/* Status filter tabs */}
        <div style={{ display:'flex', gap:4, marginBottom:20, overflowX:'auto', flexWrap:'wrap' }}>
          {['All', ...STATUSES].map((s) => {
            const count = s === 'All' ? applications.length : applications.filter((a) => a.status === s).length;
            return (
              <button key={s} className="btn btn-ghost btn-sm" style={{ fontSize:13 }}>
                {s} <span style={{ background:'var(--bg-elevated)', borderRadius:100, padding:'1px 7px', marginLeft:4, fontSize:11 }}>{count}</span>
              </button>
            );
          })}
        </div>

        {applications.length === 0 ? (
          <div className="empty-state">
            <User size={48} />
            <h3>No applicants yet</h3>
            <p>Applications will appear here as candidates apply</p>
          </div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            {applications.map((app) => (
              <div key={app._id} className="card" style={{ padding:0, overflow:'hidden' }}>
                {/* Applicant row */}
                <div style={{ padding:'18px 22px', display:'flex', alignItems:'center', justifyContent:'space-between', gap:16, flexWrap:'wrap', cursor:'pointer' }}
                  onClick={() => setExpanded(expanded === app._id ? null : app._id)}>
                  <div style={{ display:'flex', alignItems:'center', gap:14 }}>
                    <div style={{
                      width:42, height:42, borderRadius:'50%', background:'var(--accent-soft)',
                      border:'1px solid var(--accent-border)', display:'flex', alignItems:'center',
                      justifyContent:'center', fontFamily:'var(--font-head)', fontWeight:700,
                      fontSize:16, color:'var(--accent)', flexShrink:0,
                    }}>
                      {app.candidate?.name?.[0]?.toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontWeight:600, fontFamily:'var(--font-head)', fontSize:15 }}>{app.candidate?.name}</div>
                      <div style={{ fontSize:13, color:'var(--text-muted)', display:'flex', alignItems:'center', gap:6 }}>
                        <Mail size={12} /> {app.candidate?.email}
                      </div>
                    </div>
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:12, flexShrink:0 }}>
                    <span className={`badge ${statusBadge(app.status)}`}>{app.status}</span>
                    <span style={{ fontSize:12, color:'var(--text-dim)', display:'flex', alignItems:'center', gap:4 }}>
                      <Calendar size={12} /> {new Date(app.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Expanded view */}
                {expanded === app._id && (
                  <div style={{ borderTop:'1px solid var(--border)', padding:'20px 22px', background:'var(--bg-elevated)' }}>
                    {app.coverLetter && (
                      <div style={{ marginBottom:20 }}>
                        <div style={{ fontSize:12, fontWeight:600, color:'var(--text-muted)', letterSpacing:'0.05em', marginBottom:8, textTransform:'uppercase' }}>Cover Letter</div>
                        <p style={{ fontSize:14, color:'var(--text)', lineHeight:1.7, whiteSpace:'pre-line', padding:'14px 16px', background:'var(--bg-card)', borderRadius:8, border:'1px solid var(--border)' }}>
                          {app.coverLetter}
                        </p>
                      </div>
                    )}

                    <div style={{ display:'flex', gap:16, flexWrap:'wrap', alignItems:'flex-end' }}>
                      <div className="form-group" style={{ marginBottom:0, flex:'0 0 auto' }}>
                        <label className="form-label">Update Status</label>
                        <select className="form-input" style={{ minWidth:160 }}
                          value={app.status}
                          onChange={(e) => updateStatus(app._id, e.target.value, app.recruiterNotes)}
                          disabled={updating === app._id}>
                          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                      <div className="form-group" style={{ marginBottom:0, flex:1, minWidth:200 }}>
                        <label className="form-label">Notes (private)</label>
                        <div style={{ display:'flex', gap:8 }}>
                          <input className="form-input" placeholder="Add internal notes..."
                            defaultValue={app.recruiterNotes || ''}
                            id={`notes-${app._id}`} />
                          <button className="btn btn-secondary btn-sm"
                            disabled={updating === app._id}
                            onClick={() => {
                              const notes = document.getElementById(`notes-${app._id}`).value;
                              updateStatus(app._id, app.status, notes);
                            }}>
                            Save
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Applicants;