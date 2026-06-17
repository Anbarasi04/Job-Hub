import React, { useState, useEffect } from 'react';
import api from '../Api';
import { useAuth } from '../context/AuthContext';
import { Save, Plus, Trash2, User, Briefcase, GraduationCap, Globe } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');

  const [form, setForm] = useState({
    headline: '', bio: '', location: '', phone: '',
    skills: [], linkedin: '', github: '', portfolio: '',
    experience: [], education: [],
  });
  const [skillInput, setSkillInput] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/candidate/profile')
      .then((res) => {
        const p = res.data.profile;
        setForm({
          headline: p.headline || '', bio: p.bio || '', location: p.location || '',
          phone: p.phone || '', skills: p.skills || [], linkedin: p.linkedin || '',
          github: p.github || '', portfolio: p.portfolio || '',
          experience: p.experience || [], education: p.education || [],
        });
      })
      .catch(() => {}) // Profile may not exist yet
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put('/candidate/profile', form);
      toast.success('Profile saved!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const addSkill = () => {
    const s = skillInput.trim();
    if (s && !form.skills.includes(s)) {
      setForm({ ...form, skills: [...form.skills, s] });
    }
    setSkillInput('');
  };

  const removeSkill = (s) => setForm({ ...form, skills: form.skills.filter((sk) => sk !== s) });

  const addExperience = () => setForm({
    ...form, experience: [...form.experience, { title:'', company:'', location:'', from:'', to:'', current:false, description:'' }]
  });
  const updateExp = (i, field, val) => {
    const exp = [...form.experience];
    exp[i] = { ...exp[i], [field]: val };
    setForm({ ...form, experience: exp });
  };
  const removeExp = (i) => setForm({ ...form, experience: form.experience.filter((_, idx) => idx !== i) });

  const addEducation = () => setForm({
    ...form, education: [...form.education, { school:'', degree:'', fieldOfStudy:'', from:'', to:'', current:false, description:'' }]
  });
  const updateEdu = (i, field, val) => {
    const edu = [...form.education];
    edu[i] = { ...edu[i], [field]: val };
    setForm({ ...form, education: edu });
  };
  const removeEdu = (i) => setForm({ ...form, education: form.education.filter((_, idx) => idx !== i) });

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;

  const tabs = [
    { id:'basic', label:'Basic Info', icon:<User size={15} /> },
    { id:'skills', label:'Skills', icon:<Briefcase size={15} /> },
    { id:'experience', label:'Experience', icon:<Briefcase size={15} /> },
    { id:'education', label:'Education', icon:<GraduationCap size={15} /> },
    { id:'links', label:'Links', icon:<Globe size={15} /> },
  ];

  return (
    <div style={{ minHeight:'100vh', paddingBottom:60 }}>
      <div className="container" style={{ maxWidth:800, paddingTop:32 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:28 }}>
          <div>
            <h1 style={{ fontFamily:'var(--font-head)', fontSize:26 }}>My Profile</h1>
            <p className="text-muted text-sm mt-8">Keep your profile updated to attract recruiters</p>
          </div>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            <Save size={15} /> {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </div>

        {/* Tabs */}
        <div style={{ display:'flex', gap:4, borderBottom:'1px solid var(--border)', marginBottom:28, overflowX:'auto' }}>
          {tabs.map((t) => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className="btn btn-ghost btn-sm"
              style={{
                borderBottom: activeTab === t.id ? '2px solid var(--accent)' : '2px solid transparent',
                borderRadius:0, color: activeTab === t.id ? 'var(--accent)' : undefined,
                paddingBottom:12,
              }}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* Basic Info */}
        {activeTab === 'basic' && (
          <div className="fade-in">
            <div className="form-group">
              <label className="form-label">Professional Headline</label>
              <input className="form-input" placeholder="e.g. Full Stack Developer with 3+ years experience"
                value={form.headline} onChange={(e) => setForm({ ...form, headline: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Bio</label>
              <textarea className="form-input" rows={4} placeholder="Tell recruiters about yourself..."
                value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Location</label>
                <input className="form-input" placeholder="City, Country"
                  value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Phone</label>
                <input className="form-input" placeholder="+1 234 567 8900"
                  value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
            </div>
          </div>
        )}

        {/* Skills */}
        {activeTab === 'skills' && (
          <div className="fade-in">
            <div className="form-group">
              <label className="form-label">Add Skills</label>
              <div style={{ display:'flex', gap:8 }}>
                <input className="form-input" placeholder="e.g. React, Node.js, Python..."
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())} />
                <button className="btn btn-secondary" onClick={addSkill}>Add</button>
              </div>
            </div>
            {form.skills.length > 0 && (
              <div style={{ display:'flex', flexWrap:'wrap', gap:8, marginTop:8 }}>
                {form.skills.map((s) => (
                  <span key={s} style={{
                    display:'flex', alignItems:'center', gap:6,
                    padding:'6px 12px', background:'var(--accent-soft)',
                    border:'1px solid var(--accent-border)', borderRadius:100,
                    fontSize:13, color:'var(--accent)',
                  }}>
                    {s}
                    <button onClick={() => removeSkill(s)} style={{ background:'none', border:'none', color:'var(--accent)', cursor:'pointer', lineHeight:1, padding:0 }}>×</button>
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Experience */}
        {activeTab === 'experience' && (
          <div className="fade-in">
            {form.experience.map((exp, i) => (
              <div key={i} className="card" style={{ marginBottom:16 }}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:16 }}>
                  <h3 style={{ fontFamily:'var(--font-head)', fontSize:15 }}>Experience {i + 1}</h3>
                  <button className="btn btn-danger btn-sm" onClick={() => removeExp(i)}><Trash2 size={13} /></button>
                </div>
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Job Title</label>
                    <input className="form-input" value={exp.title} placeholder="Software Engineer"
                      onChange={(e) => updateExp(i, 'title', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Company</label>
                    <input className="form-input" value={exp.company} placeholder="Acme Corp"
                      onChange={(e) => updateExp(i, 'company', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">From</label>
                    <input type="date" className="form-input" value={exp.from ? exp.from.split('T')[0] : ''}
                      onChange={(e) => updateExp(i, 'from', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">To</label>
                    <input type="date" className="form-input" value={exp.to ? exp.to.split('T')[0] : ''}
                      disabled={exp.current}
                      onChange={(e) => updateExp(i, 'to', e.target.value)} />
                    <label style={{ display:'flex', alignItems:'center', gap:6, marginTop:6, fontSize:13, cursor:'pointer' }}>
                      <input type="checkbox" checked={exp.current} onChange={(e) => updateExp(i, 'current', e.target.checked)} />
                      Current role
                    </label>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea className="form-input" rows={3} value={exp.description}
                    placeholder="What did you do in this role?"
                    onChange={(e) => updateExp(i, 'description', e.target.value)} />
                </div>
              </div>
            ))}
            <button className="btn btn-secondary" onClick={addExperience}>
              <Plus size={15} /> Add Experience
            </button>
          </div>
        )}

        {/* Education */}
        {activeTab === 'education' && (
          <div className="fade-in">
            {form.education.map((edu, i) => (
              <div key={i} className="card" style={{ marginBottom:16 }}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:16 }}>
                  <h3 style={{ fontFamily:'var(--font-head)', fontSize:15 }}>Education {i + 1}</h3>
                  <button className="btn btn-danger btn-sm" onClick={() => removeEdu(i)}><Trash2 size={13} /></button>
                </div>
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">School / University</label>
                    <input className="form-input" value={edu.school} placeholder="MIT"
                      onChange={(e) => updateEdu(i, 'school', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Degree</label>
                    <input className="form-input" value={edu.degree} placeholder="Bachelor of Science"
                      onChange={(e) => updateEdu(i, 'degree', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Field of Study</label>
                    <input className="form-input" value={edu.fieldOfStudy} placeholder="Computer Science"
                      onChange={(e) => updateEdu(i, 'fieldOfStudy', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">From</label>
                    <input type="date" className="form-input" value={edu.from ? edu.from.split('T')[0] : ''}
                      onChange={(e) => updateEdu(i, 'from', e.target.value)} />
                  </div>
                </div>
              </div>
            ))}
            <button className="btn btn-secondary" onClick={addEducation}>
              <Plus size={15} /> Add Education
            </button>
          </div>
        )}

        {/* Links */}
        {activeTab === 'links' && (
          <div className="fade-in">
            {[
              { key:'linkedin', label:'LinkedIn URL', placeholder:'https://linkedin.com/in/yourname' },
              { key:'github', label:'GitHub URL', placeholder:'https://github.com/yourname' },
              { key:'portfolio', label:'Portfolio Website', placeholder:'https://yourportfolio.com' },
            ].map((l) => (
              <div key={l.key} className="form-group">
                <label className="form-label">{l.label}</label>
                <input className="form-input" placeholder={l.placeholder}
                  value={form[l.key]} onChange={(e) => setForm({ ...form, [l.key]: e.target.value })} />
              </div>
            ))}
          </div>
        )}
        <button style={{padding: "7px", margin: "7px", borderRadius:"10px", background: "lightpink"}} onClick={()=> {navigate(-1)}}>Back to Dashboard?</button>
      </div>
    </div>
  );
};

export default Profile;