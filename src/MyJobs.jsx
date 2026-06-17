import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from './Api';
import { Briefcase, Edit2, Trash2, Eye, PlusCircle, Users } from 'lucide-react';
import toast from 'react-hot-toast';

const MyJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    api.get('/jobs/recruiter/myjobs')
      .then((res) => setJobs(res.data.jobs))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this job? This will also remove all applications.')) return;
    setDeleting(id);
    try {
      await api.delete(`/jobs/${id}`);
      setJobs(jobs.filter((j) => j._id !== id));
      toast.success('Job deleted');
    } catch (err) {
      toast.error('Failed to delete');
    } finally {
      setDeleting(null);
    }
  };

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;

  return (
    <div style={{ minHeight:'100vh', paddingBottom:60 }}>
      <div className="container" style={{ paddingTop:32 }}>
        <div className="page-header" style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:12 }}>
          <div>
            <h1>My Job Postings</h1>
            <p>{jobs.length} job{jobs.length !== 1 ? 's' : ''} posted</p>
          </div>
          <Link to="/recruiter/jobs/new" className="btn btn-primary">
            <PlusCircle size={15} /> Post New Job
          </Link>
        </div>

        {jobs.length === 0 ? (
          <div className="empty-state">
            <Briefcase size={48} />
            <h3>No jobs posted yet</h3>
            <p>Create your first job listing to start receiving applications</p>
            <Link to="/recruiter/jobs/new" className="btn btn-primary mt-16">Post a Job</Link>
          </div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            {jobs.map((job) => (
              <div key={job._id} className="card" style={{ display:'flex', alignItems:'center', gap:16, padding:'18px 22px', flexWrap:'wrap' }}>
                <div style={{ flex:1, minWidth:200 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4, flexWrap:'wrap' }}>
                    <h3 style={{ fontFamily:'var(--font-head)', fontSize:16 }}>{job.title}</h3>
                    <span className={`badge ${job.isActive ? 'badge-green' : 'badge-gray'}`}>
                      {job.isActive ? 'Active' : 'Closed'}
                    </span>
                  </div>
                  <div style={{ fontSize:13, color:'var(--text-muted)', display:'flex', flexWrap:'wrap', gap:12 }}>
                    <span>{job.company}</span>
                    <span>{job.location}</span>
                    <span>{job.type}</span>
                    <span style={{ display:'flex', alignItems:'center', gap:4 }}>
                      <Users size={12} /> {job.applicantsCount} applicants
                    </span>
                    <span>Posted {new Date(job.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <div style={{ display:'flex', gap:8, flexShrink:0 }}>
                  <Link to={`/recruiter/jobs/${job._id}/applicants`} className="btn btn-secondary btn-sm">
                    <Eye size={13} /> Applicants
                  </Link>
                  <Link to={`/recruiter/jobs/${job._id}/edit`} className="btn btn-secondary btn-sm">
                    <Edit2 size={13} />
                  </Link>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleDelete(job._id)}
                    disabled={deleting === job._id}>
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyJobs;