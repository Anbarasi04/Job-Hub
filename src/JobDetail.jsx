import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from './Api';
import { useAuth } from './context/AuthContext';
import { MapPin, Briefcase, Clock, DollarSign, Users, Calendar, ArrowLeft, CheckCircle, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import AIJobPanel from './candidate/AIJobPanel';

const JobDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');

  useEffect(() => {
    api.get(`/jobs/${id}`)
      .then((res) => setJob(res.data.job))
      .catch(() => navigate('/jobs'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  // Check if already applied
  useEffect(() => {
    if (user?.role === 'candidate') {
      api.get('/candidate/applications')
        .then((res) => {
          const hasApplied = res.data.applications.some((a) => a.job?._id === id);
          setApplied(hasApplied);
        })
        .catch(() => {});
    }
  }, [id, user]);

  const handleApply = async () => {
    setApplying(true);
    try {
      await api.post(`/candidate/apply/${id}`, { coverLetter });
      setApplied(true);
      setShowApplyModal(false);
      toast.success('Application submitted! 🎉');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to apply');
    } finally {
      setApplying(false);
    }
  };

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;
  if (!job) return null;

  const salaryText = job.salaryMin
    ? `${job.salaryCurrency} ${job.salaryMin.toLocaleString()}${job.salaryMax ? ` – ${job.salaryMax.toLocaleString()}` : '+'} /year`
    : 'Salary not disclosed';

  return (
    <div style={{ minHeight:'100vh', paddingBottom:60 }}>
      <div className="container" style={{ maxWidth:900, paddingTop:32 }}>
        <button className="btn btn-ghost btn-sm" onClick={() => navigate(-1)} style={{ marginBottom:24 }}>
          <ArrowLeft size={15} /> Back to Jobs
        </button>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 320px', gap:24, alignItems:'start' }}>
          {/* Main content */}
          <div>
            <div className="card" style={{ marginBottom:24 }}>
              <div style={{ display:'flex', gap:16, alignItems:'flex-start' }}>
                <div style={{
                  width:60, height:60, borderRadius:14, background:'var(--accent-soft)',
                  border:'1px solid var(--accent-border)', display:'flex', alignItems:'center',
                  justifyContent:'center', fontFamily:'var(--font-head)', fontWeight:800,
                  fontSize:22, color:'var(--accent)', flexShrink:0,
                }}>
                  {job.company[0]}
                </div>
                <div style={{ flex:1 }}>
                  <h1 style={{ fontSize:24, fontFamily:'var(--font-head)', marginBottom:4 }}>{job.title}</h1>
                  <p style={{ color:'var(--accent)', fontWeight:500, fontSize:15 }}>{job.company}</p>
                  <div style={{ display:'flex', flexWrap:'wrap', gap:12, marginTop:12, fontSize:13, color:'var(--text-muted)' }}>
                    <span style={{ display:'flex', alignItems:'center', gap:4 }}><MapPin size={13} />{job.location}</span>
                    <span style={{ display:'flex', alignItems:'center', gap:4 }}><Briefcase size={13} />{job.type}</span>
                    <span style={{ display:'flex', alignItems:'center', gap:4 }}><Users size={13} />{job.applicantsCount} applicants</span>
                    <span style={{ display:'flex', alignItems:'center', gap:4 }}><DollarSign size={13} />{salaryText}</span>
                    {job.experienceLevel && <span style={{ display:'flex', alignItems:'center', gap:4 }}><Clock size={13} />{job.experienceLevel} level</span>}
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="card" style={{ marginBottom:24 }}>
              <h2 style={{ fontSize:18, fontFamily:'var(--font-head)', marginBottom:16 }}>Job Description</h2>
              <p style={{ color:'var(--text-muted)', lineHeight:1.8, whiteSpace:'pre-line' }}>{job.description}</p>
            </div>

            {/* Requirements */}
            {job.requirements?.length > 0 && (
              <div className="card" style={{ marginBottom:24 }}>
                <h2 style={{ fontSize:18, fontFamily:'var(--font-head)', marginBottom:16 }}>Requirements</h2>
                <ul style={{ listStyle:'none', display:'flex', flexDirection:'column', gap:10 }}>
                  {job.requirements.map((r, i) => (
                    <li key={i} style={{ display:'flex', gap:10, alignItems:'flex-start', color:'var(--text-muted)', fontSize:14 }}>
                      <CheckCircle size={16} style={{ color:'var(--green)', flexShrink:0, marginTop:2 }} />
                      {r}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Skills */}
            {job.skills?.length > 0 && (
              <div className="card">
                <h2 style={{ fontSize:18, fontFamily:'var(--font-head)', marginBottom:16 }}>Skills Required</h2>
                <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
                  {job.skills.map((s) => (
                    <span key={s} className="badge badge-accent">{s}</span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div style={{ position:'sticky', top:80 }}>
            <div className="card" style={{ marginBottom:16 }}>
              {!user ? (
                <button className="btn btn-primary" style={{ width:'100%', justifyContent:'center' }}
                  onClick={() => navigate('/login', { state: { from: { pathname: `/jobs/${id}` } } })}>
                  Login to Apply
                </button>
              ) : user.role === 'candidate' ? (
                applied ? (
                  <div style={{ textAlign:'center', padding:'8px 0' }}>
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, color:'var(--green)', fontWeight:600 }}>
                      <CheckCircle size={18} /> Applied Successfully
                    </div>
                    <p style={{ fontSize:13, color:'var(--text-muted)', marginTop:6 }}>Your application is under review</p>
                  </div>
                ) : (
                  <button className="btn btn-primary" style={{ width:'100%', justifyContent:'center' }}
                    onClick={() => setShowApplyModal(true)}>
                    <Send size={15} /> Apply Now
                  </button>
                )
              ) : (
                <p style={{ fontSize:13, color:'var(--text-muted)', textAlign:'center' }}>Switch to a candidate account to apply</p>
              )}

              <div style={{ marginTop:20, display:'flex', flexDirection:'column', gap:12 }}>
                {[
                  { label:'Job Type', value:job.type },
                  { label:'Category', value:job.category },
                  { label:'Experience', value:job.experienceLevel || 'Not specified' },
                  { label:'Salary', value:salaryText },
                  { label:'Posted', value:new Date(job.createdAt).toLocaleDateString() },
                  job.deadline && { label:'Deadline', value:new Date(job.deadline).toLocaleDateString() },
                ].filter(Boolean).map((item) => (
                  <div key={item.label} style={{ display:'flex', justifyContent:'space-between', fontSize:13 }}>
                    <span style={{ color:'var(--text-muted)' }}>{item.label}</span>
                    <span style={{ fontWeight:500 }}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── AI Panel (only for logged-in candidates) ── */}
            {user?.role === 'candidate' && (
              <AIJobPanel job={job} />
      )}

      {/* Apply Modal */}
      {showApplyModal && (
        <div style={{
          position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', backdropFilter:'blur(4px)',
          display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000, padding:24,
        }}>
          <div className="card fade-in" style={{ width:'100%', maxWidth:560, padding:32 }}>
            <h2 style={{ fontFamily:'var(--font-head)', fontSize:20, marginBottom:6 }}>Apply for {job.title}</h2>
            <p style={{ color:'var(--text-muted)', fontSize:14, marginBottom:24 }}>{job.company} · {job.location}</p>

            <div className="form-group">
              <label className="form-label">Cover Letter <span style={{ color:'var(--text-dim)' }}>(optional)</span></label>
              <textarea
                className="form-input"
                rows={6}
                placeholder="Tell the recruiter why you're a great fit for this role..."
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
              />
            </div>

            <div style={{ display:'flex', gap:12, justifyContent:'flex-end' }}>
              <button className="btn btn-ghost" onClick={() => setShowApplyModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleApply} disabled={applying}>
                {applying ? 'Submitting...' : 'Submit Application'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobDetail;