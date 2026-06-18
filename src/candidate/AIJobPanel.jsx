import React, { useState } from 'react';
import api from '../Api';

import {
  Sparkles, Brain, Copy, Check, ChevronDown, ChevronUp,
  Zap, AlertCircle, TrendingUp, BookOpen, Target
} from 'lucide-react';
import toast from 'react-hot-toast';

// ─── Cover Letter Generator ─────────────────────────────────────────────────
const CoverLetterGenerator = ({ job }) => {
  const [coverLetter, setCoverLetter] = useState('');
  const [loading, setLoading]         = useState(false);
  const [copied, setCopied]           = useState(false);
  const [open, setOpen]               = useState(false);

  const generate = async () => {
    setLoading(true);
    setOpen(true);
    try {
      const res = await api.post('/ai/cover-letter', {
        jobTitle:       job.title,
        company:        job.company,
        jobDescription: job.description,
        skills:         job.skills,
      });
      console.log('AI Cover Letter Response:', res.data);
      console.log('AI Cover Letter:', res.data.coverLetter);
      setCoverLetter(res.data.coverLetter);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'AI generation failed');
    } finally {
      setLoading(false);
    }
  };

  const copy = () => {
    navigator.clipboard.writeText(coverLetter);
    setCopied(true);
    toast.success('Cover letter copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{
      border: '1px solid var(--accent-border)',
      borderRadius: 12,
      overflow: 'hidden',
      background: 'linear-gradient(135deg, rgba(108,99,255,0.05), rgba(108,99,255,0.02))',
    }}>
      {/* Header */}
      <div style={{
        padding: '16px 20px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: open ? '1px solid var(--border)' : 'none',
        cursor: 'pointer',
      }} onClick={() => !loading && setOpen(!open)}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 8,
            background: 'var(--accent)', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
          }}>
            <Sparkles size={16} color="#fff" />
          </div>
          <div>
            <div style={{ fontWeight: 600, fontFamily: 'var(--font-head)', fontSize: 14 }}>
              AI Cover Letter Generator
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              Tailored to your profile × this job
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            onClick={(e) => { e.stopPropagation(); generate(); }}
            className="btn btn-primary btn-sm"
            disabled={loading}
            style={{ fontSize: 13 }}
          >
            {loading
              ? <><SpinnerTiny /> Generating...</>
              : coverLetter
              ? <><Sparkles size={13} /> Regenerate</>
              : <><Sparkles size={13} /> Generate</>
            }
          </button>
          {open ? <ChevronUp size={16} color="var(--text-muted)" /> : <ChevronDown size={16} color="var(--text-muted)" />}
        </div>
      </div>

      {/* Body */}
      {open && (
        <div style={{ padding: '16px 20px' }}>
          {loading && (
            <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-muted)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 8 }}>
                <SpinnerTiny />
                <span style={{ fontSize: 14 }}>Gemini AI is writing your cover letter...</span>
              </div>
              <p style={{ fontSize: 12, color: 'var(--text-dim)' }}>Analyzing job requirements and your profile</p>
            </div>
          )}

          {!loading && !coverLetter && (
            <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--text-muted)', fontSize: 14 }}>
              Click <strong style={{ color: 'var(--accent)' }}>Generate</strong> to create a personalized cover letter using your profile.
            </div>
          )}

          {!loading && coverLetter && (
            <div>
              <div style={{
                background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                borderRadius: 8, padding: 16, marginBottom: 12,
                fontSize: 14, lineHeight: 1.8, color: 'var(--text)',
                whiteSpace: 'pre-line', maxHeight: 320, overflowY: 'auto',
              }}>
                {coverLetter}
              </div>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <button className="btn btn-ghost btn-sm" onClick={copy}>
                  {copied ? <><Check size={13} /> Copied!</> : <><Copy size={13} /> Copy</>}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ─── Skill Gap Analyzer ──────────────────────────────────────────────────────
const SkillGapAnalyzer = ({ job }) => {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading]   = useState(false);
  const [open, setOpen]         = useState(false);

  const analyze = async () => {
    setLoading(true);
    setOpen(true);
    try {
      const res = await api.post('/ai/skill-gap', {
        jobTitle:       job.title,
        jobDescription: job.description,
        requiredSkills: job.skills,
      });
      setAnalysis(res.data.analysis);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Skill analysis failed');
    } finally {
      setLoading(false);
    }
  };

  const priorityColor = {
    High:   { color: 'var(--red)',    bg: 'var(--red-soft)' },
    Medium: { color: 'var(--amber)',  bg: 'var(--amber-soft)' },
    Low:    { color: 'var(--green)',  bg: 'var(--green-soft)' },
  };

  const scoreColor = (score) =>
    score >= 70 ? 'var(--green)' : score >= 45 ? 'var(--amber)' : 'var(--red)';

  return (
    <div style={{
      border: '1px solid rgba(0,214,143,0.25)',
      borderRadius: 12, overflow: 'hidden',
      background: 'linear-gradient(135deg, rgba(0,214,143,0.04), transparent)',
    }}>
      {/* Header */}
      <div style={{
        padding: '16px 20px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: open ? '1px solid var(--border)' : 'none',
        cursor: 'pointer',
      }} onClick={() => !loading && setOpen(!open)}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 8,
            background: 'var(--green)', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
          }}>
            <Brain size={16} color="#fff" />
          </div>
          <div>
            <div style={{ fontWeight: 600, fontFamily: 'var(--font-head)', fontSize: 14 }}>
              AI Skill Gap Analyzer
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              See what skills you're missing for this role
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {analysis && (
            <div style={{
              padding: '4px 10px', borderRadius: 100,
              background: scoreColor(analysis.matchScore) + '20',
              border: `1px solid ${scoreColor(analysis.matchScore)}40`,
              color: scoreColor(analysis.matchScore),
              fontSize: 13, fontWeight: 700,
            }}>
              {analysis.matchScore}% match
            </div>
          )}
          <button
            onClick={(e) => { e.stopPropagation(); analyze(); }}
            className="btn btn-sm"
            disabled={loading}
            style={{
              background: 'var(--green-soft)', color: 'var(--green)',
              border: '1px solid rgba(0,214,143,0.3)', fontSize: 13,
            }}
          >
            {loading
              ? <><SpinnerTiny color="var(--green)" /> Analyzing...</>
              : analysis
              ? <><Brain size={13} /> Re-analyze</>
              : <><Brain size={13} /> Analyze</>
            }
          </button>
          {open ? <ChevronUp size={16} color="var(--text-muted)" /> : <ChevronDown size={16} color="var(--text-muted)" />}
        </div>
      </div>

      {/* Body */}
      {open && (
        <div style={{ padding: '16px 20px' }}>
          {loading && (
            <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-muted)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 8 }}>
                <SpinnerTiny color="var(--green)" />
                <span style={{ fontSize: 14 }}>Analyzing job requirements vs your profile...</span>
              </div>
            </div>
          )}

          {!loading && !analysis && (
            <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--text-muted)', fontSize: 14 }}>
              Click <strong style={{ color: 'var(--green)' }}>Analyze</strong> to find skill gaps between your profile and this job.
            </div>
          )}

          {!loading && analysis && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

              {/* Match score bar */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 8 }}>
                  <span style={{ color: 'var(--text-muted)' }}>Overall Profile Match</span>
                  <span style={{ fontWeight: 700, color: scoreColor(analysis.matchScore) }}>{analysis.matchScore}%</span>
                </div>
                <div style={{ height: 8, background: 'var(--border)', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', borderRadius: 4,
                    background: scoreColor(analysis.matchScore),
                    width: `${analysis.matchScore}%`,
                    transition: 'width 1s ease',
                  }} />
                </div>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 10, lineHeight: 1.6 }}>
                  {analysis.summary}
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                {/* Matched skills */}
                {analysis.matchedSkills?.length > 0 && (
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10, fontSize: 13, fontWeight: 600, color: 'var(--green)' }}>
                      <Check size={14} /> You already have ({analysis.matchedSkills.length})
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {analysis.matchedSkills.map((s) => (
                        <span key={s} style={{
                          padding: '4px 10px', borderRadius: 100, fontSize: 12,
                          background: 'var(--green-soft)', color: 'var(--green)',
                          border: '1px solid rgba(0,214,143,0.2)',
                        }}>{s}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Strengths */}
                {analysis.strengths?.length > 0 && (
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10, fontSize: 13, fontWeight: 600, color: 'var(--accent)' }}>
                      <TrendingUp size={14} /> Your strengths
                    </div>
                    <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {analysis.strengths.map((s, i) => (
                        <li key={i} style={{ fontSize: 13, color: 'var(--text-muted)', display: 'flex', gap: 6 }}>
                          <Target size={13} style={{ color: 'var(--accent)', flexShrink: 0, marginTop: 2 }} />{s}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Missing skills */}
              {analysis.missingSkills?.length > 0 && (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12, fontSize: 13, fontWeight: 600, color: 'var(--red)' }}>
                    <AlertCircle size={14} /> Skills to develop ({analysis.missingSkills.length})
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {analysis.missingSkills.map((item, i) => {
                      const pc = priorityColor[item.priority] || priorityColor.Low;
                      return (
                        <div key={i} style={{
                          padding: 14, borderRadius: 8,
                          background: 'var(--bg-elevated)',
                          border: `1px solid var(--border)`,
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                            <span style={{ fontWeight: 600, fontSize: 14, fontFamily: 'var(--font-head)' }}>{item.skill}</span>
                            <span style={{
                              padding: '2px 10px', borderRadius: 100, fontSize: 11, fontWeight: 600,
                              background: pc.bg, color: pc.color,
                            }}>{item.priority} Priority</span>
                          </div>
                          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 6, lineHeight: 1.5 }}>
                            {item.reason}
                          </p>
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6, fontSize: 12, color: 'var(--accent)' }}>
                            <BookOpen size={12} style={{ flexShrink: 0, marginTop: 2 }} />
                            <span>{item.howToLearn}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {analysis.missingSkills?.length === 0 && (
                <div style={{
                  textAlign: 'center', padding: '16px', borderRadius: 8,
                  background: 'var(--green-soft)', border: '1px solid rgba(0,214,143,0.2)',
                  color: 'var(--green)', fontSize: 14, fontWeight: 600,
                }}>
                  🎉 Great match! You have all the required skills for this role.
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const SpinnerTiny = ({ color = '#fff' }) => (
  <span style={{
    display: 'inline-block', width: 13, height: 13,
    border: `2px solid ${color}40`,
    borderTop: `2px solid ${color}`,
    borderRadius: '50%',
    animation: 'spin 0.7s linear infinite',
    flexShrink: 0,
  }} />
);

// ─── Main export ─────────────────────────────────────────────────────────────
const AIJobPanel = ({ job }) => {
  if (!job) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        fontSize: 12, fontWeight: 600, color: 'var(--accent)',
        letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 2,
      }}>
        <Zap size={13} /> AI-Powered Tools
      </div>
      <CoverLetterGenerator job={job} />
      <SkillGapAnalyzer    job={job} />
    </div>
  );
};

export default AIJobPanel;