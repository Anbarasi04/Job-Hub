import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from './Api';
import { Search, MapPin, Briefcase, Clock, DollarSign, Filter, X, ChevronLeft, ChevronRight } from 'lucide-react';

const JOB_TYPES = ['Full-time', 'Part-time', 'Contract', 'Internship', 'Remote'];
const CATEGORIES = ['Technology', 'Design', 'Marketing', 'Finance', 'Healthcare', 'Education', 'Sales', 'Engineering', 'Other'];
const EXPERIENCE_LEVELS = ['Entry', 'Mid', 'Senior', 'Lead', 'Executive'];

const JobCard = ({ job }) => {
  const salaryText = job.salaryMin
    ? `${job.salaryCurrency} ${(job.salaryMin / 1000).toFixed(0)}k${job.salaryMax ? `–${(job.salaryMax / 1000).toFixed(0)}k` : '+'}`
    : 'Not disclosed';

  const typeColor = { 'Full-time':'badge-green', 'Remote':'badge-accent', 'Contract':'badge-amber', 'Part-time':'badge-gray', 'Internship':'badge-gray' };

  return (
    <Link to={`/jobs/${job._id}`} style={{ textDecoration:'none' }}>
      <div className="card" style={{
        transition:'all 0.2s', cursor:'pointer',
        borderColor: 'var(--border)',
      }}
        onMouseEnter={e => { e.currentTarget.style.borderColor='var(--accent)'; e.currentTarget.style.transform='translateY(-2px)'; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.transform='translateY(0)'; }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:12 }}>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6, flexWrap:'wrap' }}>
              <span className={`badge ${typeColor[job.type] || 'badge-gray'}`}>{job.type}</span>
              <span className="badge badge-gray">{job.category}</span>
            </div>
            <h3 style={{ fontSize:16, fontFamily:'var(--font-head)', color:'var(--text)', marginBottom:4, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
              {job.title}
            </h3>
            <p style={{ fontSize:14, color:'var(--text-muted)', fontWeight:500 }}>{job.company}</p>
          </div>
          <div style={{
            width:44, height:44, borderRadius:10,
            background:'var(--accent-soft)', border:'1px solid var(--accent-border)',
            display:'flex', alignItems:'center', justifyContent:'center',
            fontFamily:'var(--font-head)', fontWeight:800, fontSize:16, color:'var(--accent)',
            flexShrink:0,
          }}>
            {job.company[0]}
          </div>
        </div>

        <div style={{ display:'flex', flexWrap:'wrap', gap:16, marginTop:16, fontSize:13, color:'var(--text-muted)' }}>
          <span style={{ display:'flex', alignItems:'center', gap:4 }}><MapPin size={13} />{job.location}</span>
          <span style={{ display:'flex', alignItems:'center', gap:4 }}><DollarSign size={13} />{salaryText}</span>
          <span style={{ display:'flex', alignItems:'center', gap:4 }}><Briefcase size={13} />{job.applicantsCount} applicants</span>
        </div>

        {job.skills?.length > 0 && (
          <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginTop:12 }}>
            {job.skills.slice(0, 4).map((s) => (
              <span key={s} style={{ padding:'3px 8px', background:'var(--bg-elevated)', border:'1px solid var(--border)', borderRadius:4, fontSize:12, color:'var(--text-muted)' }}>{s}</span>
            ))}
            {job.skills.length > 4 && <span style={{ fontSize:12, color:'var(--text-dim)' }}>+{job.skills.length - 4} more</span>}
          </div>
        )}
      </div>
    </Link>
  );
};

const Jobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState({
    search: '', location: '', type: '', category: '', experienceLevel: '',
  });
  const [appliedFilters, setAppliedFilters] = useState({ ...filters });

  const fetchJobs = useCallback(async (page = 1, f = appliedFilters) => {
    setLoading(true);
    try {
      const params = { page, limit: 9, ...f };
      Object.keys(params).forEach((k) => { if (!params[k]) delete params[k]; });
      const res = await api.get('/jobs', { params });
      const data = res.data || {};
      setJobs(Array.isArray(data.jobs) ? data.jobs : []);
      setTotalPages(typeof data.pages === 'number' ? data.pages : 1);
      setTotal(typeof data.total === 'number' ? data.total : 0);
      setCurrentPage(page);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [appliedFilters]);

  useEffect(() => { fetchJobs(1, appliedFilters); }, [appliedFilters]);

  const applyFilters = () => { setAppliedFilters({ ...filters }); setShowFilters(false); };
  const clearFilters = () => {
    const empty = { search:'', location:'', type:'', category:'', experienceLevel:'' };
    setFilters(empty); setAppliedFilters(empty);
  };
  const activeFilterCount = Object.values(appliedFilters).filter(Boolean).length;

  return (
    <div style={{ minHeight:'100vh', paddingBottom:60 }}>
      {/* Hero search bar */}
      <div style={{
        background:'linear-gradient(180deg, rgba(108,99,255,0.06) 0%, transparent 100%)',
        borderBottom:'1px solid var(--border)', padding:'40px 0',
      }}>
        <div className="container">
          <h1 style={{ fontFamily:'var(--font-head)', fontSize:36, marginBottom:8, textAlign:'center' }}>
            Find Your Dream <span style={{ color:'var(--accent)' }}>Job</span>
          </h1>
          <p className="text-muted text-center" style={{ marginBottom:28 }}>
            {total} opportunities waiting for you
          </p>
          <div style={{ display:'flex', gap:12, maxWidth:680, margin:'0 auto', flexWrap:'wrap' }}>
            <div style={{ flex:1, position:'relative', minWidth:200 }}>
              <Search size={16} style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'var(--text-dim)' }} />
              <input
                className="form-input"
                style={{ paddingLeft:38 }}
                placeholder="Job title, skills, or company..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
              />
            </div>
            <div style={{ position:'relative', minWidth:180 }}>
              <MapPin size={16} style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'var(--text-dim)' }} />
              <input
                className="form-input"
                style={{ paddingLeft:38 }}
                placeholder="Location..."
                value={filters.location}
                onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
              />
            </div>
            <button className="btn btn-primary" onClick={applyFilters}>
              <Search size={15} /> Search
            </button>
          </div>
        </div>
      </div>

      <div className="container" style={{ marginTop:32 }}>
        {/* Filter bar */}
        <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:24, flexWrap:'wrap' }}>
          <button className="btn btn-secondary btn-sm" onClick={() => setShowFilters(!showFilters)}>
            <Filter size={14} /> Filters {activeFilterCount > 0 && <span style={{ background:'var(--accent)', color:'#fff', borderRadius:'50%', width:18, height:18, display:'flex', alignItems:'center', justifyContent:'center', fontSize:11 }}>{activeFilterCount}</span>}
          </button>

          {/* Quick type filters */}
          {JOB_TYPES.map((t) => (
            <button key={t} className={`btn btn-sm ${appliedFilters.type === t ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setAppliedFilters({ ...appliedFilters, type: appliedFilters.type === t ? '' : t })}>
              {t}
            </button>
          ))}

          {activeFilterCount > 0 && (
            <button className="btn btn-ghost btn-sm" onClick={clearFilters} style={{ color:'var(--red)', marginLeft:'auto' }}>
              <X size={13} /> Clear all
            </button>
          )}
        </div>

        {/* Advanced filters panel */}
        {showFilters && (
          <div className="card" style={{ marginBottom:24 }}>
            <div className="grid-3" style={{ gap:16 }}>
              <div className="form-group" style={{ marginBottom:0 }}>
                <label className="form-label">Category</label>
                <select className="form-input" value={filters.category} onChange={(e) => setFilters({ ...filters, category: e.target.value })}>
                  <option value="">All Categories</option>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group" style={{ marginBottom:0 }}>
                <label className="form-label">Experience Level</label>
                <select className="form-input" value={filters.experienceLevel} onChange={(e) => setFilters({ ...filters, experienceLevel: e.target.value })}>
                  <option value="">All Levels</option>
                  {EXPERIENCE_LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
              <div className="form-group" style={{ marginBottom:0 }}>
                <label className="form-label">Job Type</label>
                <select className="form-input" value={filters.type} onChange={(e) => setFilters({ ...filters, type: e.target.value })}>
                  <option value="">All Types</option>
                  {JOB_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>
            <div style={{ display:'flex', gap:10, marginTop:16, justifyContent:'flex-end' }}>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowFilters(false)}>Cancel</button>
              <button className="btn btn-primary btn-sm" onClick={applyFilters}>Apply Filters</button>
            </div>
          </div>
        )}

        {/* Job grid */}
        {loading ? (
          <div className="loading-screen"><div className="spinner" /></div>
        ) : jobs.length === 0 ? (
          <div className="empty-state">
            <Briefcase size={48} />
            <h3>No jobs found</h3>
            <p>Try adjusting your search or filters</p>
            <button className="btn btn-secondary mt-16" onClick={clearFilters}>Clear Filters</button>
          </div>
        ) : (
          <>
            <div style={{ fontSize:14, color:'var(--text-muted)', marginBottom:16 }}>
              Showing <strong style={{ color:'var(--text)' }}>{jobs.length}</strong> of <strong style={{ color:'var(--text)' }}>{total}</strong> jobs
            </div>
            <div className="grid-3" style={{ marginBottom:32 }}>
              {jobs.map((job) => <JobCard key={job._id} job={job} />)}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
                <button className="btn btn-ghost btn-sm" onClick={() => fetchJobs(currentPage - 1)} disabled={currentPage === 1}>
                  <ChevronLeft size={16} />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button key={p} className={`btn btn-sm ${p === currentPage ? 'btn-primary' : 'btn-ghost'}`}
                    onClick={() => fetchJobs(p)}>
                    {p}
                  </button>
                ))}
                <button className="btn btn-ghost btn-sm" onClick={() => fetchJobs(currentPage + 1)} disabled={currentPage === totalPages}>
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Jobs;