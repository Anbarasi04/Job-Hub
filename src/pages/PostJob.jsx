import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../Api';
import { Save, ArrowLeft, Plus, X } from 'lucide-react';
import toast from 'react-hot-toast';

const JOB_TYPES = ['Full-time', 'Part-time', 'Contract', 'Internship', 'Remote'];
const CATEGORIES = ['Technology', 'Design', 'Marketing', 'Finance', 'Healthcare', 'Education', 'Sales', 'Engineering', 'Other'];
const EXPERIENCE_LEVELS = ['Entry', 'Mid', 'Senior', 'Lead', 'Executive'];

const defaultForm = {
  title: '', company: '', location: '', type: 'Full-time', category: 'Technology',
  description: '', requirements: [''], responsibilities: [''], skills: [],
  salaryMin: '', salaryMax: '', salaryCurrency: 'USD', experienceLevel: 'Mid',
  deadline: '', isActive: true,
};

const PostJob = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const [form, setForm] = useState(defaultForm);
  const [skillInput, setSkillInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(isEdit);

  useEffect(() => {
    if (isEdit) {
      api.get(`/jobs/${id}`)
        .then((res) => {
          const j = res.data.job;
          setForm({
            title: j.title, company: j.company, location: j.location,
            type: j.type, category: j.category, description: j.description,
            requirements: j.requirements?.length ? j.requirements : [''],
            responsibilities: j.responsibilities?.length ? j.responsibilities : [''],
            skills: j.skills || [],
            salaryMin: j.salaryMin || '', salaryMax: j.salaryMax || '',
            salaryCurrency: j.salaryCurrency || 'USD',
            experienceLevel: j.experienceLevel || 'Mid',
            deadline: j.deadline ? j.deadline.split('T')[0] : '',
            isActive: j.isActive,
          });
        })
        .catch(() => navigate('/recruiter/jobs'))
        .finally(() => setLoading(false));
    }
  }, [id, isEdit, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      ...form,
      requirements: form.requirements.filter(Boolean),
      responsibilities: form.responsibilities.filter(Boolean),
      salaryMin: form.salaryMin ? Number(form.salaryMin) : undefined,
      salaryMax: form.salaryMax ? Number(form.salaryMax) : undefined,
    };
    try {
      if (isEdit) {
        await api.put(`/jobs/${id}`, payload);
        toast.success('Job updated!');
      } else {
        await api.post('/jobs', payload);
        toast.success('Job posted successfully!');
      }
      navigate('/recruiter/jobs');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save job');
    } finally {
      setSaving(false);
    }
  };

  const updateList = (field, index, value) => {
    const arr = [...form[field]];
    arr[index] = value;
    setForm({ ...form, [field]: arr });
  };
  const addListItem = (field) => setForm({ ...form, [field]: [...form[field], ''] });
  const removeListItem = (field, index) => setForm({ ...form, [field]: form[field].filter((_, i) => i !== index) });

  const addSkill = () => {
    const s = skillInput.trim();
    if (s && !form.skills.includes(s)) setForm({ ...form, skills: [...form.skills, s] });
    setSkillInput('');
  };
  
  const removeSkill = (s) => setForm({ ...form, skills: form.skills.filter((sk) => sk !== s) });

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;

  return (
    <div style={{ minHeight:'100vh', paddingBottom:60 }}>
      <div className="container" style={{ maxWidth:800, paddingTop:32 }}>
        <button className="btn btn-ghost btn-sm" onClick={() => navigate(-1)} style={{ marginBottom:24 }}>
          <ArrowLeft size={15} /> Back
        </button>

        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:28 }}>
          <h1 style={{ fontFamily:'var(--font-head)', fontSize:26 }}>{isEdit ? 'Edit Job' : 'Post a New Job'}</h1>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="card" style={{ marginBottom:20 }}>
            <h2 style={{ fontFamily:'var(--font-head)', fontSize:17, marginBottom:20, color:'var(--text-muted)' }}>Basic Information</h2>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Job Title *</label>
                <input className="form-input" required value={form.title} placeholder="e.g. Senior React Developer"
                  onChange={(e) => setForm({ ...form, title: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Company Name *</label>
                <input className="form-input" required value={form.company} placeholder="e.g. Acme Corp"
                  onChange={(e) => setForm({ ...form, company: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Location *</label>
                <input className="form-input" required value={form.location} placeholder="e.g. New York, NY"
                  onChange={(e) => setForm({ ...form, location: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Job Type *</label>
                <select className="form-input" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                  {JOB_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Category *</label>
                <select className="form-input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Experience Level</label>
                <select className="form-input" value={form.experienceLevel} onChange={(e) => setForm({ ...form, experienceLevel: e.target.value })}>
                  {EXPERIENCE_LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="card" style={{ marginBottom:20 }}>
            <h2 style={{ fontFamily:'var(--font-head)', fontSize:17, marginBottom:20, color:'var(--text-muted)' }}>Compensation & Timeline</h2>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Min Salary (annual)</label>
                <input type="number" className="form-input" value={form.salaryMin} placeholder="50000"
                  onChange={(e) => setForm({ ...form, salaryMin: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Max Salary (annual)</label>
                <input type="number" className="form-input" value={form.salaryMax} placeholder="80000"
                  onChange={(e) => setForm({ ...form, salaryMax: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Currency</label>
                <select className="form-input" value={form.salaryCurrency} onChange={(e) => setForm({ ...form, salaryCurrency: e.target.value })}>
                  {['USD','EUR','GBP','INR','CAD','AUD'].map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Application Deadline</label>
                <input type="date" className="form-input" value={form.deadline}
                  onChange={(e) => setForm({ ...form, deadline: e.target.value })} />
              </div>
            </div>
          </div>

          <div className="card" style={{ marginBottom:20 }}>
            <h2 style={{ fontFamily:'var(--font-head)', fontSize:17, marginBottom:20, color:'var(--text-muted)' }}>Job Details</h2>
            <div className="form-group">
              <label className="form-label">Job Description *</label>
              <textarea className="form-input" required rows={6} value={form.description}
                placeholder="Describe the role, responsibilities, and what makes your company great..."
                onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>

            {/* Requirements */}
            <div className="form-group">
              <label className="form-label">Requirements</label>
              {form.requirements.map((req, i) => (
                <div key={i} style={{ display:'flex', gap:8, marginBottom:8 }}>
                  <input className="form-input" value={req} placeholder={`Requirement ${i + 1}`}
                    onChange={(e) => updateList('requirements', i, e.target.value)} />
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => removeListItem('requirements', i)}><X size={14} /></button>
                </div>
              ))}
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => addListItem('requirements')}>
                <Plus size={13} /> Add requirement
              </button>
            </div>

            {/* Skills */}
            <div className="form-group">
              <label className="form-label">Required Skills</label>
              <div style={{ display:'flex', gap:8, marginBottom:10 }}>
                <input className="form-input" value={skillInput} placeholder="Add a skill and press Enter"
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())} />
                <button type="button" className="btn btn-secondary btn-sm" onClick={addSkill}>Add</button>
              </div>
              <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
                {form.skills.map((s) => (
                  <span key={s} style={{
                    display:'flex', alignItems:'center', gap:6, padding:'5px 10px',
                    background:'var(--accent-soft)', border:'1px solid var(--accent-border)',
                    borderRadius:100, fontSize:13, color:'var(--accent)',
                  }}>
                    {s}
                    <button type="button" onClick={() => removeSkill(s)} style={{ background:'none', border:'none', color:'var(--accent)', cursor:'pointer', lineHeight:1, padding:0 }}>×</button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {isEdit && (
            <div className="card" style={{ marginBottom:20 }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                <div>
                  <div style={{ fontWeight:600 }}>Job Status</div>
                  <div style={{ fontSize:13, color:'var(--text-muted)' }}>Toggle to activate or close this listing</div>
                </div>
                <label style={{ display:'flex', alignItems:'center', gap:10, cursor:'pointer' }}>
                  <div style={{
                    width:44, height:24, background: form.isActive ? 'var(--accent)' : 'var(--border)',
                    borderRadius:12, position:'relative', transition:'background 0.2s',
                  }} onClick={() => setForm({ ...form, isActive: !form.isActive })}>
                    <div style={{
                      position:'absolute', top:3, left: form.isActive ? 23 : 3,
                      width:18, height:18, background:'#fff', borderRadius:'50%', transition:'left 0.2s',
                    }} />
                  </div>
                  <span style={{ fontSize:14 }}>{form.isActive ? 'Active' : 'Closed'}</span>
                </label>
              </div>
            </div>
          )}

          <div style={{ display:'flex', gap:12, justifyContent:'flex-end' }}>
            <button type="button" className="btn btn-secondary" onClick={() => navigate(-1)}>Cancel</button>
            <button type="submit" className="btn btn-primary btn-lg" disabled={saving}>
              <Save size={16} /> {saving ? 'Saving...' : isEdit ? 'Update Job' : 'Post Job'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PostJob;