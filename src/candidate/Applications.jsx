import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../Api';
import { Briefcase, MapPin, ArrowRight } from 'lucide-react';

const statusBadge = (status) => {
  const map = { Pending:'badge-amber', Reviewed:'badge-accent', Shortlisted:'badge-green', Rejected:'badge-red', Hired:'badge-green' };
  return map[status] || 'badge-gray';
};

const Applications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/candidate/applications')
      .then((res) => setApplications(res.data.applications))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;

  return (
    <div style={{ minHeight:'100vh', paddingBottom:60 }}>
      <div className="container" style={{ paddingTop:32 }}>
        <div className="page-header">
          <h1>My Applications</h1>
          <p>Track the status of all your job applications</p>
        </div>

        {applications.length === 0 ? (
          <div className="empty-state">
            <Briefcase size={48} />
            <h3>No applications yet</h3>
            <p>You haven't applied to any jobs yet.</p>
            <Link to="/jobs" className="btn btn-primary mt-16">Browse Jobs</Link>
          </div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            {applications.map((app) => (
              <div key={app._id} className="card" style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:16, padding:'18px 22px' }}>
                <div style={{ flex:1, minWidth:0 }}>
                  <h3 style={{ fontFamily:'var(--font-head)', fontSize:16, marginBottom:4, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                    {app.job?.title}
                  </h3>
                  <div style={{ display:'flex', flexWrap:'wrap', gap:12, fontSize:13, color:'var(--text-muted)' }}>
                    <span>{app.job?.company}</span>
                    <span style={{ display:'flex', alignItems:'center', gap:4 }}><MapPin size={12} />{app.job?.location}</span>
                    <span style={{ display:'flex', alignItems:'center', gap:4 }}><Briefcase size={12} />{app.job?.type}</span>
                  </div>
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:16, flexShrink:0 }}>
                  <div style={{ textAlign:'right' }}>
                    <span className={`badge ${statusBadge(app.status)}`}>{app.status}</span>
                    <div style={{ fontSize:12, color:'var(--text-dim)', marginTop:4 }}>
                      Applied {new Date(app.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  {app.job?._id && (
                    <Link to={`/jobs/${app.job._id}`} className="btn btn-ghost btn-sm">
                      <ArrowRight size={14} />
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Applications;