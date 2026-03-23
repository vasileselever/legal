import { useState, useEffect, useCallback } from 'react';
import { AdminLayout } from './AdminLayout';
import { Card } from '../../components/ui/Card';
import { Spinner } from '../../components/ui/Spinner';
import { Badge } from '../../components/ui/Badge';
import { PageHeader } from '../../components/ui/PageHeader';
import {
  type DocumentTemplateListItem, type SessionListItem, type SessionDetail,
  type GeneratedDocumentDetail, type ClauseLibraryItem, type QualityCheckResult,
  type DocAutomationStats,
  getTemplates, getTemplate, getSessions, getSession, startSession, submitAnswers,
  generateDocument, getGeneratedDocuments, getGeneratedDocument, runQualityCheck,
  getClauses, getDocAutomationStats, abandonSession, deleteGeneratedDocument,
  createTemplate, updateTemplate, deleteTemplate,
  DOCUMENT_CATEGORIES, PRACTICE_AREAS, FIELD_TYPES, RISK_LEVELS,
  SESSION_STATUSES, LANGUAGES,
} from '../../api/documentAutomationService';

// ── Shared styles ────────────────────────────────────────────────────

const btn = (bg: string, fg = 'white'): React.CSSProperties => ({
  padding: '0.5rem 1rem', background: bg, color: fg, border: 'none',
  borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem',
});
const outlineBtn: React.CSSProperties = {
  ...btn('white', '#1a237e'), border: '1px solid #1a237e',
};
const inputStyle: React.CSSProperties = {
  width: '100%', padding: '0.6rem 0.75rem', border: '1px solid #ddd',
  borderRadius: '6px', fontSize: '0.9rem', boxSizing: 'border-box',
};
const labelStyle: React.CSSProperties = {
  display: 'block', fontWeight: 600, fontSize: '0.8rem', marginBottom: '0.3rem', color: '#555',
};
const selectStyle: React.CSSProperties = { ...inputStyle, background: 'white' };

type Tab = 'templates' | 'sessions' | 'documents' | 'clauses' | 'stats';

// ═════════════════════════════════════════════════════════════════════
// Main page
// ═════════════════════════════════════════════════════════════════════

export default function DocumentAutomationPage() {
  const [tab, setTab] = useState<Tab>('templates');

  const tabs: { key: Tab; icon: string; label: string }[] = [
    { key: 'templates',  icon: '📄', label: 'Șabloane' },
    { key: 'sessions',   icon: '📝', label: 'Sesiuni' },
    { key: 'documents',  icon: '📁', label: 'Documente' },
    { key: 'clauses',    icon: '📚', label: 'Clauze' },
    { key: 'stats',      icon: '📊', label: 'Statistici' },
  ];

  return (
    <AdminLayout>
      <div style={{ padding: '2rem' }}>
        <PageHeader title="Automatizare Documente" subtitle="Generare documente juridice prin interviuri ghidate" />

        {/* Tab bar */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          {tabs.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} style={{
              padding: '0.55rem 1.1rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 600,
              fontSize: '0.85rem', border: tab === t.key ? '2px solid #1a237e' : '1px solid #ddd',
              background: tab === t.key ? '#e8eaf6' : 'white', color: tab === t.key ? '#1a237e' : '#555',
            }}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {tab === 'templates'  && <TemplatesPanel />}
        {tab === 'sessions'   && <SessionsPanel />}
        {tab === 'documents'  && <DocumentsPanel />}
        {tab === 'clauses'    && <ClausesPanel />}
        {tab === 'stats'      && <StatsPanel />}
      </div>
    </AdminLayout>
  );
}

// ═════════════════════════════════════════════════════════════════════
// Templates Panel
// ═════════════════════════════════════════════════════════════════════

function TemplatesPanel() {
  const [templates, setTemplates] = useState<DocumentTemplateListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState<number | ''>('');
  const [selected, setSelected] = useState<string | null>(null);
  const [showEditor, setShowEditor] = useState<'create' | string | null>(null); // 'create' or template id for edit

  const load = useCallback(() => {
    setLoading(true); setError('');
    getTemplates({
      search: search || undefined,
      category: catFilter !== '' ? catFilter : undefined,
    }).then(setTemplates).catch(e => setError(e.message)).finally(() => setLoading(false));
  }, [search, catFilter]);

  useEffect(() => { load(); }, [load]);

  if (showEditor) return <TemplateEditor editId={showEditor === 'create' ? null : showEditor} onBack={() => { setShowEditor(null); load(); }} />;
  if (selected) return <TemplateDetail id={selected} onBack={() => setSelected(null)} onEdit={(id) => setShowEditor(id)} onDeleted={() => { setSelected(null); load(); }} />;

  return (
    <>
      {/* Filters + Create button */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <input placeholder="Caută șablon..." value={search} onChange={e => setSearch(e.target.value)}
          style={{ ...inputStyle, maxWidth: 260 }} />
        <select value={catFilter} onChange={e => setCatFilter(e.target.value === '' ? '' : Number(e.target.value))}
          style={{ ...selectStyle, maxWidth: 240 }}>
          <option value="">Toate categoriile</option>
          {Object.entries(DOCUMENT_CATEGORIES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <div style={{ flex: 1 }} />
        <button onClick={() => setShowEditor('create')} style={btn('#1a237e')}>+ Șablon nou</button>
      </div>

      {error && <div style={{ color: '#c62828', marginBottom: '1rem' }}>{error}</div>}

      {loading ? <Spinner /> : templates.length === 0 ? (
        <Card><div style={{ padding: '2rem', textAlign: 'center', color: '#aaa' }}>Nu există șabloane.</div></Card>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(320px,1fr))', gap: '1rem' }}>
          {templates.map(t => (
            <Card key={t.id}>
              <div style={{ padding: '1.25rem', cursor: 'pointer' }} onClick={() => setSelected(t.id)}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontWeight: 700, fontSize: '1rem', color: '#1a237e' }}>{t.name}</span>
                  {t.isSystemTemplate && <Badge label="Sistem" color="#9e9e9e" />}
                </div>
                {t.description && <div style={{ fontSize: '0.82rem', color: '#666', marginBottom: '0.5rem', lineHeight: 1.4 }}>{t.description}</div>}
                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.4rem' }}>
                  <Badge label={DOCUMENT_CATEGORIES[t.category] ?? 'Altele'} color="#1a237e" />
                  <Badge label={PRACTICE_AREAS[t.practiceArea] ?? ''} color="#5c6bc0" />
                  <Badge label={LANGUAGES[t.language] ?? ''} color="#00796b" />
                </div>
                <div style={{ fontSize: '0.75rem', color: '#aaa', display: 'flex', gap: '1rem' }}>
                  <span>⏱ ~{t.estimatedMinutes} min</span>
                  <span>📋 {t.fieldCount} câmpuri</span>
                  <span>v{t.version}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}

// ═════════════════════════════════════════════════════════════════════
// Template Detail + Start Session
// ═════════════════════════════════════════════════════════════════════

function TemplateDetail({ id, onBack, onEdit, onDeleted }: { id: string; onBack: () => void; onEdit: (id: string) => void; onDeleted: () => void }) {
  const [tpl, setTpl] = useState<Awaited<ReturnType<typeof getTemplate>> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [starting, setStarting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    getTemplate(id).then(setTpl).catch(e => setError(e.message)).finally(() => setLoading(false));
  }, [id]);

  const handleStart = async () => {
    setStarting(true);
    try {
      const session = await startSession({ templateId: id });
      setSessionId(session.id);
    } catch (e: any) { setError(e.message); }
    setStarting(false);
  };

  const handleDelete = async () => {
    if (!confirm('Sigur doriți să ștergeți acest șablon?')) return;
    setDeleting(true);
    try {
      await deleteTemplate(id);
      onDeleted();
    } catch (e: any) { setError(e.message); setDeleting(false); }
  };

  if (sessionId) return <InterviewWizard sessionId={sessionId} onDone={() => setSessionId(null)} />;

  if (loading) return <Spinner />;
  if (error) return <div style={{ color: '#c62828' }}>{error}</div>;
  if (!tpl) return null;

  return (
    <>
      <button onClick={onBack} style={{ ...outlineBtn, marginBottom: '1rem' }}>← Înapoi</button>

      <Card>
        <div style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h2 style={{ margin: 0, color: '#1a237e' }}>{tpl.name}</h2>
              {tpl.description && <p style={{ color: '#666', margin: '0.5rem 0' }}>{tpl.description}</p>}
              <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                <Badge label={DOCUMENT_CATEGORIES[tpl.category] ?? 'Altele'} color="#1a237e" />
                <Badge label={PRACTICE_AREAS[tpl.practiceArea] ?? ''} color="#5c6bc0" />
                <Badge label={LANGUAGES[tpl.language] ?? ''} color="#00796b" />
                <Badge label={`v${tpl.version}`} color="#757575" />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button onClick={() => onEdit(id)} style={btn('#5c6bc0')}>✏ Editează</button>
              <button onClick={handleDelete} disabled={deleting} style={btn('#c62828')}>{deleting ? 'Se șterge...' : '🗑 Șterge'}</button>
              <button onClick={handleStart} disabled={starting} style={btn('#1a237e')}>
                {starting ? 'Se pornește...' : '▶ Începe Interviul'}
              </button>
            </div>
          </div>

          {/* Fields */}
          <h3 style={{ marginTop: '1.5rem', marginBottom: '0.75rem', color: '#333' }}>Câmpuri ({tpl.fields.length})</h3>
          {tpl.fields.length === 0 ? <p style={{ color: '#aaa' }}>Niciun câmp definit.</p> : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ background: '#f5f5f5', textAlign: 'left' }}>
                  <th style={{ padding: '0.5rem' }}>#</th>
                  <th style={{ padding: '0.5rem' }}>Cheie</th>
                  <th style={{ padding: '0.5rem' }}>Etichetă</th>
                  <th style={{ padding: '0.5rem' }}>Tip</th>
                  <th style={{ padding: '0.5rem' }}>Obligatoriu</th>
                  <th style={{ padding: '0.5rem' }}>Secțiune</th>
                </tr>
              </thead>
              <tbody>
                {tpl.fields.map((f, i) => (
                  <tr key={f.id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '0.5rem', color: '#aaa' }}>{i + 1}</td>
                    <td style={{ padding: '0.5rem', fontFamily: 'monospace', fontSize: '0.8rem' }}>{f.fieldKey}</td>
                    <td style={{ padding: '0.5rem' }}>{f.label}</td>
                    <td style={{ padding: '0.5rem' }}><Badge label={FIELD_TYPES[f.fieldType] ?? '?'} color="#5c6bc0" /></td>
                    <td style={{ padding: '0.5rem' }}>{f.isRequired ? '✅' : '—'}</td>
                    <td style={{ padding: '0.5rem', color: '#888' }}>{f.section ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* Clauses */}
          {tpl.clauseMappings.length > 0 && (
            <>
              <h3 style={{ marginTop: '1.5rem', marginBottom: '0.75rem', color: '#333' }}>Clauze ({tpl.clauseMappings.length})</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {tpl.clauseMappings.map(m => {
                  const risk = RISK_LEVELS[m.clauseRiskLevel];
                  return (
                    <div key={m.id} style={{ padding: '0.75rem 1rem', border: '1px solid #eee', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 600, fontSize: '0.88rem' }}>{m.clauseTitle}</span>
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        {risk && <Badge label={risk.label} color={risk.color} />}
                        {m.isRequired && <Badge label="Obligatorie" color="#c62828" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </Card>
    </>
  );
}

// ═════════════════════════════════════════════════════════════════════
// Interview Wizard
// ═════════════════════════════════════════════════════════════════════

function InterviewWizard({ sessionId, onDone }: { sessionId: string; onDone: () => void }) {
  const [session, setSession] = useState<SessionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [values, setValues] = useState<Record<string, string>>({});
  const [step, setStep] = useState(0);
  const [generatedDoc, setGeneratedDoc] = useState<GeneratedDocumentDetail | null>(null);

  useEffect(() => {
    setLoading(true);
    getSession(sessionId)
      .then(s => {
        setSession(s);
        const v: Record<string, string> = {};
        s.answers.forEach(a => { v[a.fieldId] = a.value; });
        s.fields.forEach(f => { if (!v[f.id] && f.defaultValue) v[f.id] = f.defaultValue; });
        setValues(v);
        setStep(s.currentFieldIndex);
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [sessionId]);

  if (loading) return <Spinner />;
  if (error && !session) return <div style={{ color: '#c62828' }}>{error}</div>;
  if (!session) return null;

  // Group fields by section
  const sections: { name: string; fields: typeof session.fields }[] = [];
  const sectionMap = new Map<string, typeof session.fields>();
  session.fields.forEach(f => {
    const sec = f.section ?? 'General';
    if (!sectionMap.has(sec)) { sectionMap.set(sec, []); sections.push({ name: sec, fields: sectionMap.get(sec)! }); }
    sectionMap.get(sec)!.push(f);
  });

  const currentSection = sections[step] ?? sections[sections.length - 1];
  const isLast = step >= sections.length - 1;
  const allRequiredAnswered = session.fields.filter(f => f.isRequired).every(f => values[f.id]?.trim());

  // Check conditional visibility
  const isVisible = (f: typeof session.fields[0]): boolean => {
    if (!f.conditionJson) return true;
    try {
      const cond = JSON.parse(f.conditionJson);
      const target = session.fields.find(x => x.fieldKey === cond.field);
      if (!target) return true;
      const actual = values[target.id] ?? '';
      if (cond.operator === 'eq') return actual.toLowerCase() === (cond.value ?? '').toLowerCase();
      if (cond.operator === 'neq') return actual.toLowerCase() !== (cond.value ?? '').toLowerCase();
      if (cond.operator === 'notempty') return actual.trim().length > 0;
      return true;
    } catch { return true; }
  };

  const handleSave = async () => {
    setSaving(true); setError('');
    try {
      const answers = Object.entries(values).map(([fieldId, value]) => ({ fieldId, value }));
      const updated = await submitAnswers(sessionId, { answers });
      setSession(updated);
    } catch (e: any) { setError(e.message); }
    setSaving(false);
  };

  const handleGenerate = async () => {
    setGenerating(true); setError('');
    try {
      // Save latest answers first
      const answers = Object.entries(values).map(([fieldId, value]) => ({ fieldId, value }));
      await submitAnswers(sessionId, { answers });
      const doc = await generateDocument(sessionId);
      setGeneratedDoc(doc);
    } catch (e: any) { setError(e.message); }
    setGenerating(false);
  };

  if (generatedDoc) {
    return <GeneratedDocumentView doc={generatedDoc} onBack={onDone} />;
  }

  const statusInfo = SESSION_STATUSES[session.status];

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <button onClick={onDone} style={outlineBtn}>← Înapoi</button>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          {statusInfo && <Badge label={statusInfo.label} color={statusInfo.color} />}
          <span style={{ fontSize: '0.85rem', color: '#666' }}>{session.progressPercent}% completat</span>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ height: 6, borderRadius: 3, background: '#e0e0e0', marginBottom: '1rem' }}>
        <div style={{ height: '100%', borderRadius: 3, background: '#1a237e', width: `${session.progressPercent}%`, transition: 'width 0.3s' }} />
      </div>

      <Card>
        <div style={{ padding: '1.5rem' }}>
          <h2 style={{ margin: '0 0 0.25rem', color: '#1a237e' }}>{session.templateName}</h2>
          <div style={{ fontSize: '0.85rem', color: '#888', marginBottom: '1.25rem' }}>
            Secțiunea {step + 1} / {sections.length}: <strong>{currentSection.name}</strong>
          </div>

          {error && <div style={{ color: '#c62828', marginBottom: '1rem', fontSize: '0.85rem' }}>⚠ {error}</div>}

          {/* Fields in current section */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {currentSection.fields.filter(isVisible).map(f => (
              <FieldInput key={f.id} field={f} value={values[f.id] ?? ''} onChange={v => setValues(prev => ({ ...prev, [f.id]: v }))} />
            ))}
          </div>

          {/* Navigation */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {step > 0 && <button onClick={() => setStep(s => s - 1)} style={outlineBtn}>← Înapoi</button>}
              <button onClick={handleSave} disabled={saving} style={btn('#5c6bc0')}>{saving ? 'Se salvează...' : '💾 Salvează'}</button>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {!isLast && <button onClick={() => { handleSave(); setStep(s => s + 1); }} style={btn('#1a237e')}>Următoarea →</button>}
              {isLast && (
                <button onClick={handleGenerate} disabled={generating || !allRequiredAnswered}
                  style={{ ...btn(allRequiredAnswered ? '#2e7d32' : '#bdbdbd'), cursor: allRequiredAnswered ? 'pointer' : 'not-allowed' }}>
                  {generating ? 'Se generează...' : '📄 Generează Document'}
                </button>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Section dots */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '1rem' }}>
        {sections.map((s, i) => (
          <button key={i} onClick={() => setStep(i)} title={s.name}
            style={{ width: 12, height: 12, borderRadius: '50%', border: 'none', cursor: 'pointer',
              background: i === step ? '#1a237e' : i < step ? '#5c6bc0' : '#ddd' }} />
        ))}
      </div>
    </>
  );
}

// ═════════════════════════════════════════════════════════════════════
// Field Input Component
// ═════════════════════════════════════════════════════════════════════

function FieldInput({ field, value, onChange }: { field: SessionDetail['fields'][0]; value: string; onChange: (v: string) => void }) {
  const { fieldType, label, helpText, isRequired, optionsJson } = field;
  const options: string[] = optionsJson ? (() => { try { return JSON.parse(optionsJson); } catch { return []; } })() : [];

  return (
    <div>
      <label style={labelStyle}>
        {label} {isRequired && <span style={{ color: '#c62828' }}>*</span>}
      </label>
      {helpText && <div style={{ fontSize: '0.75rem', color: '#999', marginBottom: '0.35rem' }}>{helpText}</div>}

      {fieldType === 6 /* Boolean */ ? (
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          {['true', 'false'].map(v => (
            <label key={v} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', cursor: 'pointer', fontSize: '0.9rem' }}>
              <input type="radio" checked={value === v} onChange={() => onChange(v)} />
              {v === 'true' ? 'Da' : 'Nu'}
            </label>
          ))}
        </div>
      ) : fieldType === 7 /* SingleChoice */ ? (
        <select value={value} onChange={e => onChange(e.target.value)} style={selectStyle}>
          <option value="">— Alegeți —</option>
          {options.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      ) : fieldType === 8 /* MultipleChoice */ ? (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {options.map(o => {
            const selected = value.split(',').map(s => s.trim()).filter(Boolean);
            const checked = selected.includes(o);
            return (
              <label key={o} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', cursor: 'pointer', fontSize: '0.88rem' }}>
                <input type="checkbox" checked={checked} onChange={() => {
                  const next = checked ? selected.filter(s => s !== o) : [...selected, o];
                  onChange(next.join(', '));
                }} />
                {o}
              </label>
            );
          })}
        </div>
      ) : fieldType === 2 /* TextArea */ ? (
        <textarea value={value} onChange={e => onChange(e.target.value)} rows={4} style={{ ...inputStyle, resize: 'vertical' }} />
      ) : fieldType === 5 /* Date */ ? (
        <input type="date" value={value} onChange={e => onChange(e.target.value)} style={inputStyle} />
      ) : fieldType === 3 || fieldType === 4 /* Number/Currency */ ? (
        <input type="number" value={value} onChange={e => onChange(e.target.value)} style={inputStyle} step={fieldType === 4 ? '0.01' : '1'} />
      ) : (
        <input type={fieldType === 9 ? 'email' : fieldType === 10 ? 'tel' : 'text'}
          value={value} onChange={e => onChange(e.target.value)} style={inputStyle}
          placeholder={fieldType === 11 ? 'CNP (13 cifre)' : fieldType === 12 ? 'CUI' : undefined} />
      )}
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════
// Generated Document Viewer
// ═════════════════════════════════════════════════════════════════════

function GeneratedDocumentView({ doc, onBack }: { doc: GeneratedDocumentDetail; onBack: () => void }) {
  const [qa, setQa] = useState<QualityCheckResult | null>(null);
  const [runningQa, setRunningQa] = useState(false);
  const [showEn, setShowEn] = useState(false);

  const handleQa = async () => {
    setRunningQa(true);
    try { const r = await runQualityCheck(doc.id); setQa(r); } catch { /* ignore */ }
    setRunningQa(false);
  };

  return (
    <>
      <button onClick={onBack} style={{ ...outlineBtn, marginBottom: '1rem' }}>← Înapoi</button>

      <Card>
        <div style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem' }}>
            <div>
              <h2 style={{ margin: 0, color: '#1a237e' }}>{doc.title}</h2>
              <div style={{ fontSize: '0.8rem', color: '#aaa', marginTop: '0.25rem' }}>
                v{doc.version} · {LANGUAGES[doc.language]} · {new Date(doc.createdAt).toLocaleString('ro-RO')}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {doc.contentHtmlEn && (
                <button onClick={() => setShowEn(!showEn)} style={outlineBtn}>
                  {showEn ? '🇷🇴 Română' : '🇬🇧 English'}
                </button>
              )}
              <button onClick={handleQa} disabled={runningQa} style={btn('#5c6bc0')}>
                {runningQa ? 'Se verifică...' : '✅ Verificare calitate'}
              </button>
              <button onClick={() => {
                const w = window.open('', '_blank');
                if (w) { w.document.write(showEn && doc.contentHtmlEn ? doc.contentHtmlEn : doc.contentHtml); w.document.close(); w.print(); }
              }} style={btn('#00796b')}>🖨 Printează</button>
            </div>
          </div>

          {/* Quality check results */}
          {qa && (
            <div style={{ padding: '1rem', borderRadius: '8px', marginBottom: '1rem',
              background: qa.passed ? '#e8f5e9' : '#ffebee', border: `1px solid ${qa.passed ? '#a5d6a7' : '#ef9a9a'}` }}>
              <div style={{ fontWeight: 700, marginBottom: '0.5rem', color: qa.passed ? '#2e7d32' : '#c62828' }}>
                {qa.passed ? '✅ Verificare trecută' : '❌ Probleme detectate'} · Scor lizibilitate: {qa.readabilityScore}/100
              </div>
              {qa.issues.length > 0 && (
                <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.85rem' }}>
                  {qa.issues.map((issue, i) => (
                    <li key={i} style={{ color: issue.severity === 'Error' ? '#c62828' : '#f57c00', marginBottom: '0.25rem' }}>
                      <strong>[{issue.severity}]</strong> {issue.message}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* Document preview */}
          <div style={{ border: '1px solid #e0e0e0', borderRadius: '8px', padding: '2rem', background: 'white', minHeight: 300 }}
            dangerouslySetInnerHTML={{ __html: showEn && doc.contentHtmlEn ? doc.contentHtmlEn : doc.contentHtml }} />
        </div>
      </Card>
    </>
  );
}

// ═════════════════════════════════════════════════════════════════════
// Sessions Panel
// ═════════════════════════════════════════════════════════════════════

function SessionsPanel() {
  const [sessions, setSessions] = useState<SessionListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState<number | ''>('');
  const [activeSession, setActiveSession] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true); setError('');
    getSessions({ status: statusFilter !== '' ? statusFilter : undefined })
      .then(setSessions).catch(e => setError(e.message)).finally(() => setLoading(false));
  }, [statusFilter]);

  useEffect(() => { load(); }, [load]);

  if (activeSession) return <InterviewWizard sessionId={activeSession} onDone={() => { setActiveSession(null); load(); }} />;

  return (
    <>
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value === '' ? '' : Number(e.target.value))} style={{ ...selectStyle, maxWidth: 200 }}>
          <option value="">Toate statusurile</option>
          {Object.entries(SESSION_STATUSES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
      </div>

      {error && <div style={{ color: '#c62828', marginBottom: '1rem' }}>{error}</div>}

      {loading ? <Spinner /> : sessions.length === 0 ? (
        <Card><div style={{ padding: '2rem', textAlign: 'center', color: '#aaa' }}>Nu există sesiuni.</div></Card>
      ) : (
        <Card>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ background: '#f5f5f5', textAlign: 'left' }}>
                <th style={{ padding: '0.6rem' }}>Titlu</th>
                <th style={{ padding: '0.6rem' }}>Șablon</th>
                <th style={{ padding: '0.6rem' }}>Status</th>
                <th style={{ padding: '0.6rem' }}>Progres</th>
                <th style={{ padding: '0.6rem' }}>Creat</th>
                <th style={{ padding: '0.6rem' }}>Acțiuni</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map(s => {
                const st = SESSION_STATUSES[s.status];
                return (
                  <tr key={s.id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '0.6rem', fontWeight: 600 }}>{s.title || s.templateName}</td>
                    <td style={{ padding: '0.6rem' }}>{s.templateName}</td>
                    <td style={{ padding: '0.6rem' }}>{st && <Badge label={st.label} color={st.color} />}</td>
                    <td style={{ padding: '0.6rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ flex: 1, height: 6, borderRadius: 3, background: '#e0e0e0', maxWidth: 80 }}>
                          <div style={{ height: '100%', borderRadius: 3, background: st?.color ?? '#1a237e', width: `${s.progressPercent}%` }} />
                        </div>
                        <span style={{ fontSize: '0.8rem', color: '#888' }}>{s.progressPercent}%</span>
                      </div>
                    </td>
                    <td style={{ padding: '0.6rem', color: '#888', fontSize: '0.8rem' }}>{new Date(s.createdAt).toLocaleDateString('ro-RO')}</td>
                    <td style={{ padding: '0.6rem' }}>
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        {s.status === 1 && <button onClick={() => setActiveSession(s.id)} style={btn('#1a237e', 'white')}>Continuă</button>}
                        {s.status === 2 && <button onClick={() => setActiveSession(s.id)} style={btn('#2e7d32', 'white')}>Generează</button>}
                        {s.status === 1 && <button onClick={async () => { await abandonSession(s.id); load(); }} style={btn('#9e9e9e', 'white')}>Abandonează</button>}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      )}
    </>
  );
}

// ═════════════════════════════════════════════════════════════════════
// Documents Panel
// ═════════════════════════════════════════════════════════════════════

function DocumentsPanel() {
  const [docs, setDocs] = useState<Awaited<ReturnType<typeof getGeneratedDocuments>>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewDoc, setViewDoc] = useState<GeneratedDocumentDetail | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    getGeneratedDocuments().then(setDocs).catch(e => setError(e.message)).finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const openDoc = async (id: string) => {
    try { const d = await getGeneratedDocument(id); setViewDoc(d); } catch (e: any) { setError(e.message); }
  };

  if (viewDoc) return <GeneratedDocumentView doc={viewDoc} onBack={() => { setViewDoc(null); load(); }} />;

  return (
    <>
      {error && <div style={{ color: '#c62828', marginBottom: '1rem' }}>{error}</div>}
      {loading ? <Spinner /> : docs.length === 0 ? (
        <Card><div style={{ padding: '2rem', textAlign: 'center', color: '#aaa' }}>Nu există documente generate.</div></Card>
      ) : (
        <Card>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ background: '#f5f5f5', textAlign: 'left' }}>
                <th style={{ padding: '0.6rem' }}>Titlu</th>
                <th style={{ padding: '0.6rem' }}>Categorie</th>
                <th style={{ padding: '0.6rem' }}>Limbă</th>
                <th style={{ padding: '0.6rem' }}>Versiune</th>
                <th style={{ padding: '0.6rem' }}>Lizibilitate</th>
                <th style={{ padding: '0.6rem' }}>Creat</th>
                <th style={{ padding: '0.6rem' }}>Acțiuni</th>
              </tr>
            </thead>
            <tbody>
              {docs.map(d => (
                <tr key={d.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '0.6rem', fontWeight: 600, color: '#1a237e', cursor: 'pointer' }} onClick={() => openDoc(d.id)}>{d.title}</td>
                  <td style={{ padding: '0.6rem' }}><Badge label={DOCUMENT_CATEGORIES[d.category] ?? 'Altele'} color="#1a237e" /></td>
                  <td style={{ padding: '0.6rem' }}>{LANGUAGES[d.language]}</td>
                  <td style={{ padding: '0.6rem' }}>v{d.version}</td>
                  <td style={{ padding: '0.6rem' }}>{d.readabilityScore != null ? `${d.readabilityScore}/100` : '—'}</td>
                  <td style={{ padding: '0.6rem', color: '#888', fontSize: '0.8rem' }}>{new Date(d.createdAt).toLocaleDateString('ro-RO')}</td>
                  <td style={{ padding: '0.6rem' }}>
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <button onClick={() => openDoc(d.id)} style={btn('#1a237e')}>Vizualizare</button>
                      <button onClick={async () => { await deleteGeneratedDocument(d.id); load(); }}
                        style={btn('#c62828')}>Șterge</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </>
  );
}

// ═════════════════════════════════════════════════════════════════════
// Clauses Panel
// ═════════════════════════════════════════════════════════════════════

function ClausesPanel() {
  const [clauses, setClauses] = useState<ClauseLibraryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [riskFilter, setRiskFilter] = useState<number | ''>('');
  const [expanded, setExpanded] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    getClauses({
      search: search || undefined,
      riskLevel: riskFilter !== '' ? riskFilter : undefined,
    }).then(setClauses).catch(e => setError(e.message)).finally(() => setLoading(false));
  }, [search, riskFilter]);

  useEffect(() => { load(); }, [load]);

  return (
    <>
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <input placeholder="Caută clauze..." value={search} onChange={e => setSearch(e.target.value)} style={{ ...inputStyle, maxWidth: 260 }} />
        <select value={riskFilter} onChange={e => setRiskFilter(e.target.value === '' ? '' : Number(e.target.value))} style={{ ...selectStyle, maxWidth: 200 }}>
          <option value="">Toate nivelurile de risc</option>
          {Object.entries(RISK_LEVELS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
      </div>

      {error && <div style={{ color: '#c62828', marginBottom: '1rem' }}>{error}</div>}

      {loading ? <Spinner /> : clauses.length === 0 ? (
        <Card><div style={{ padding: '2rem', textAlign: 'center', color: '#aaa' }}>Nu există clauze.</div></Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {clauses.map(c => {
            const risk = RISK_LEVELS[c.riskLevel];
            const isOpen = expanded === c.id;
            return (
              <Card key={c.id}>
                <div style={{ padding: '1rem 1.25rem', cursor: 'pointer' }} onClick={() => setExpanded(isOpen ? null : c.id)}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <span style={{ fontWeight: 700, color: '#1a237e' }}>{c.title}</span>
                      {risk && <Badge label={risk.label} color={risk.color} />}
                      {c.isMandatory && <Badge label="Obligatorie" color="#c62828" />}
                    </div>
                    <span style={{ fontSize: '1.2rem', color: '#aaa' }}>{isOpen ? '▲' : '▼'}</span>
                  </div>
                  {isOpen && (
                    <div style={{ marginTop: '0.75rem' }}>
                      <div style={{ background: '#f5f5f5', padding: '0.75rem', borderRadius: '6px', fontSize: '0.88rem', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                        {c.content}
                      </div>
                      {c.commentary && <div style={{ marginTop: '0.5rem', fontSize: '0.82rem', color: '#666' }}>💬 {c.commentary}</div>}
                      {c.applicableLaw && <div style={{ marginTop: '0.25rem', fontSize: '0.8rem', color: '#888' }}>📖 {c.applicableLaw}</div>}
                      {c.legalReferences && <div style={{ marginTop: '0.25rem', fontSize: '0.8rem', color: '#888' }}>📚 {c.legalReferences}</div>}
                      <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                        <Badge label={DOCUMENT_CATEGORIES[c.category] ?? 'Altele'} color="#1a237e" />
                        <Badge label={PRACTICE_AREAS[c.practiceArea] ?? ''} color="#5c6bc0" />
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </>
  );
}

// ═════════════════════════════════════════════════════════════════════
// Stats Panel
// ═════════════════════════════════════════════════════════════════════

function StatsPanel() {
  const [stats, setStats] = useState<DocAutomationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getDocAutomationStats().then(setStats).catch(e => setError(e.message)).finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;
  if (error) return <div style={{ color: '#c62828' }}>{error}</div>;
  if (!stats) return null;

  const statCards = [
    { label: 'Șabloane', value: stats.totalTemplates, icon: '📄', color: '#1a237e' },
    { label: 'Sesiuni totale', value: stats.totalSessions, icon: '📝', color: '#5c6bc0' },
    { label: 'Sesiuni completate', value: stats.completedSessions, icon: '✅', color: '#2e7d32' },
    { label: 'Documente generate', value: stats.totalGeneratedDocuments, icon: '📁', color: '#00796b' },
    { label: 'Clauze în bibliotecă', value: stats.totalClauses, icon: '📚', color: '#f57c00' },
    { label: 'Completare medie', value: `${Math.round(stats.averageCompletionPercent)}%`, icon: '📊', color: '#7b1fa2' },
  ];

  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        {statCards.map((s, i) => (
          <Card key={i}>
            <div style={{ padding: '1.25rem', textAlign: 'center' }}>
              <div style={{ fontSize: '1.6rem', marginBottom: '0.25rem' }}>{s.icon}</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: '0.82rem', color: '#888' }}>{s.label}</div>
            </div>
          </Card>
        ))}
      </div>

      {Object.keys(stats.documentsByCategory).length > 0 && (
        <Card>
          <div style={{ padding: '1.25rem' }}>
            <h3 style={{ margin: '0 0 1rem', color: '#333' }}>Documente pe categorie</h3>
            {Object.entries(stats.documentsByCategory).map(([cat, count]) => (
              <div key={cat} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid #f5f5f5' }}>
                <span style={{ fontSize: '0.88rem' }}>{cat}</span>
                <span style={{ fontWeight: 700, color: '#1a237e' }}>{count}</span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </>
  );
}

// ═════════════════════════════════════════════════════════════════════
// Template Editor (Create / Edit)
// ═════════════════════════════════════════════════════════════════════

interface FieldDraft {
  key: string;
  fieldKey: string;
  label: string;
  labelEn: string;
  helpText: string;
  fieldType: number;
  sortOrder: number;
  section: string;
  isRequired: boolean;
  defaultValue: string;
  optionsJson: string;
}

const emptyField = (): FieldDraft => ({
  key: crypto.randomUUID(),
  fieldKey: '', label: '', labelEn: '', helpText: '',
  fieldType: 1, sortOrder: 0, section: '', isRequired: true,
  defaultValue: '', optionsJson: '',
});

function TemplateEditor({ editId, onBack }: { editId: string | null; onBack: () => void }) {
  const isCreate = editId === null;

  const [loading, setLoading] = useState(!isCreate);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<number>(2);
  const [practiceArea, setPracticeArea] = useState<number>(1);
  const [language, setLanguage] = useState<number>(1);
  const [estimatedMinutes, setEstimatedMinutes] = useState(10);
  const [tags, setTags] = useState('');
  const [bodyTemplate, setBodyTemplate] = useState('');
  const [bodyTemplateEn, setBodyTemplateEn] = useState('');
  const [isActive, setIsActive] = useState(true);

  // Fields
  const [fields, setFields] = useState<FieldDraft[]>([emptyField()]);

  // Section for the editor tabs
  const [editorTab, setEditorTab] = useState<'general' | 'body' | 'fields'>('general');

  // Load existing template for editing
  useEffect(() => {
    if (isCreate) return;
    setLoading(true);
    getTemplate(editId!)
      .then(t => {
        setName(t.name);
        setDescription(t.description ?? '');
        setCategory(t.category);
        setPracticeArea(t.practiceArea);
        setLanguage(t.language);
        setEstimatedMinutes(t.estimatedMinutes);
        setTags(t.tags ?? '');
        setBodyTemplate(t.bodyTemplate);
        setBodyTemplateEn(t.bodyTemplateEn ?? '');
        setIsActive(t.isActive);
        if (t.fields.length > 0) {
          setFields(t.fields.map(f => ({
            key: f.id,
            fieldKey: f.fieldKey,
            label: f.label,
            labelEn: f.labelEn ?? '',
            helpText: f.helpText ?? '',
            fieldType: f.fieldType,
            sortOrder: f.sortOrder,
            section: f.section ?? '',
            isRequired: f.isRequired,
            defaultValue: f.defaultValue ?? '',
            optionsJson: f.optionsJson ?? '',
          })));
        }
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [editId, isCreate]);

  const addField = () => {
    setFields(prev => [...prev, { ...emptyField(), sortOrder: prev.length + 1 }]);
  };

  const removeField = (key: string) => {
    setFields(prev => prev.filter(f => f.key !== key));
  };

  const updateField = (key: string, patch: Partial<FieldDraft>) => {
    setFields(prev => prev.map(f => f.key === key ? { ...f, ...patch } : f));
  };

  const moveField = (key: string, dir: -1 | 1) => {
    setFields(prev => {
      const idx = prev.findIndex(f => f.key === key);
      if (idx < 0) return prev;
      const target = idx + dir;
      if (target < 0 || target >= prev.length) return prev;
      const copy = [...prev];
      [copy[idx], copy[target]] = [copy[target], copy[idx]];
      return copy.map((f, i) => ({ ...f, sortOrder: i + 1 }));
    });
  };

  const handleSave = async () => {
    setError(''); setSuccess('');
    if (!name.trim()) { setError('Numele șablonului este obligatoriu'); return; }
    if (!bodyTemplate.trim()) { setError('Corpul șablonului (HTML) este obligatoriu'); return; }

    setSaving(true);
    try {
      // For field DTOs: if the key looks like a UUID and wasn't just generated, it's an existing field
      const fieldDtos = fields.filter(f => f.fieldKey.trim()).map((f, i) => {
        // Check if this is an existing field ID (looks like UUID)
        const isExistingFieldId = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(f.key);
        return {
          id: isExistingFieldId ? f.key : undefined,
          fieldKey: f.fieldKey.trim(),
          label: f.label.trim() || f.fieldKey.trim(),
          labelEn: f.labelEn || undefined,
          helpText: f.helpText || undefined,
          fieldType: f.fieldType,
          sortOrder: i + 1,
          section: f.section || undefined,
          isRequired: f.isRequired,
          defaultValue: f.defaultValue || undefined,
          optionsJson: f.optionsJson || undefined,
        };
      });

      if (isCreate) {
        await createTemplate({
          name: name.trim(),
          description: description || undefined,
          category,
          practiceArea,
          language,
          bodyTemplate,
          bodyTemplateEn: bodyTemplateEn || undefined,
          estimatedMinutes,
          tags: tags || undefined,
          fields: fieldDtos.map(f => ({ ...f, id: undefined })),
        });
        setSuccess('Șablon creat cu succes!');
      } else {
        await updateTemplate(editId!, {
          name: name.trim(),
          description: description || undefined,
          category,
          practiceArea,
          language,
          bodyTemplate,
          bodyTemplateEn: bodyTemplateEn || undefined,
          estimatedMinutes,
          tags: tags || undefined,
          isActive,
          fields: fieldDtos,
        });
        setSuccess('Șablon actualizat cu succes!');
      }
      setTimeout(onBack, 800);
    } catch (e: any) {
      setError(e.message);
    }
    setSaving(false);
  };

  if (loading) return <Spinner />;

  const editorTabs = [
    { key: 'general' as const, label: '⚙ General' },
    { key: 'body' as const, label: '📝 Corp document' },
    { key: 'fields' as const, label: `📋 Câmpuri (${fields.filter(f => f.fieldKey.trim()).length})` },
  ];

  return (
    <>
      <button onClick={onBack} style={{ ...outlineBtn, marginBottom: '1rem' }}>← Înapoi la lista de șabloane</button>

      <Card>
        <div style={{ padding: '1.5rem' }}>
          <h2 style={{ margin: '0 0 1rem', color: '#1a237e' }}>
            {isCreate ? '+ Creare șablon nou' : `✏ Editare: ${name}`}
          </h2>

          {error && <div style={{ padding: '0.75rem', background: '#ffebee', border: '1px solid #ef9a9a', borderRadius: '6px', color: '#c62828', marginBottom: '1rem', fontSize: '0.85rem' }}>⚠ {error}</div>}
          {success && <div style={{ padding: '0.75rem', background: '#e8f5e9', border: '1px solid #a5d6a7', borderRadius: '6px', color: '#2e7d32', marginBottom: '1rem', fontSize: '0.85rem' }}>✅ {success}</div>}

          {/* Editor tabs */}
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', borderBottom: '2px solid #e0e0e0', paddingBottom: '0.5rem' }}>
            {editorTabs.map(t => (
              <button key={t.key} onClick={() => setEditorTab(t.key)} style={{
                padding: '0.5rem 1rem', border: 'none', borderRadius: '6px 6px 0 0', cursor: 'pointer',
                fontWeight: 600, fontSize: '0.85rem',
                background: editorTab === t.key ? '#1a237e' : 'transparent',
                color: editorTab === t.key ? 'white' : '#666',
              }}>
                {t.label}
              </button>
            ))}
          </div>

          {/* ── Tab: General ── */}
          {editorTab === 'general' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={labelStyle}>Numele șablonului <span style={{ color: '#c62828' }}>*</span></label>
                  <input value={name} onChange={e => setName(e.target.value)} style={inputStyle} placeholder="Ex: Contract de prestări servicii" />
                </div>
                <div>
                  <label style={labelStyle}>Categorie</label>
                  <select value={category} onChange={e => setCategory(Number(e.target.value))} style={selectStyle}>
                    {Object.entries(DOCUMENT_CATEGORIES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Domeniu de practică</label>
                  <select value={practiceArea} onChange={e => setPracticeArea(Number(e.target.value))} style={selectStyle}>
                    {Object.entries(PRACTICE_AREAS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Limba</label>
                  <select value={language} onChange={e => setLanguage(Number(e.target.value))} style={selectStyle}>
                    {Object.entries(LANGUAGES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Timp estimat completare (minute)</label>
                  <input type="number" min={1} value={estimatedMinutes} onChange={e => setEstimatedMinutes(Number(e.target.value))} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Tag-uri (separate prin virgulă)</label>
                  <input value={tags} onChange={e => setTags(e.target.value)} style={inputStyle} placeholder="contract,servicii,B2B" />
                </div>
              </div>
              <div>
                <label style={labelStyle}>Descriere</label>
                <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} style={{ ...inputStyle, resize: 'vertical' }}
                  placeholder="Descriere scurtă a șablonului..." />
              </div>
              {!isCreate && (
                <div>
                  <label style={{ ...labelStyle, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input type="checkbox" checked={isActive} onChange={e => setIsActive(e.target.checked)} />
                    Șablon activ
                  </label>
                </div>
              )}
            </div>
          )}

          {/* ── Tab: Body Template ── */}
          {editorTab === 'body' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={labelStyle}>Corp document (HTML) — Română <span style={{ color: '#c62828' }}>*</span></label>
                <div style={{ fontSize: '0.75rem', color: '#999', marginBottom: '0.35rem' }}>
                  Folosiți {'{{'}<code>nume_camp</code>{'}}'}  pentru câmpuri care vor fi completate la interviu.
                </div>
                <textarea value={bodyTemplate} onChange={e => setBodyTemplate(e.target.value)} rows={16}
                  style={{ ...inputStyle, fontFamily: 'monospace', fontSize: '0.82rem', resize: 'vertical' }}
                  placeholder={'<h1 style="text-align:center">TITLU CONTRACT</h1>\n<p>Nr. {{numar_contract}} din {{data_contract}}</p>\n...'} />
              </div>
              <div>
                <label style={labelStyle}>Corp document (HTML) — Engleză (opțional)</label>
                <textarea value={bodyTemplateEn} onChange={e => setBodyTemplateEn(e.target.value)} rows={10}
                  style={{ ...inputStyle, fontFamily: 'monospace', fontSize: '0.82rem', resize: 'vertical' }}
                  placeholder="English version of the template body..." />
              </div>
              {/* Preview */}
              {bodyTemplate && (
                <div>
                  <label style={labelStyle}>Previzualizare</label>
                  <div style={{ border: '1px solid #e0e0e0', borderRadius: '8px', padding: '1.5rem', background: '#fafafa', maxHeight: 400, overflow: 'auto' }}
                    dangerouslySetInnerHTML={{ __html: bodyTemplate }} />
                </div>
              )}
            </div>
          )}

          {/* ── Tab: Fields ── */}
          {editorTab === 'fields' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <span style={{ fontSize: '0.85rem', color: '#666' }}>{fields.filter(f => f.fieldKey.trim()).length} câmpuri definite</span>
                <button onClick={addField} style={btn('#5c6bc0')}>+ Adaugă câmp</button>
              </div>

              {fields.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#aaa' }}>
                  Niciun câmp. Apăsați „+ Adaugă câmp" pentru a începe.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {fields.map((f, idx) => (
                    <div key={f.key} style={{ border: '1px solid #e0e0e0', borderRadius: '8px', padding: '1rem', background: '#fafafa' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#1a237e' }}>Câmp #{idx + 1}</span>
                        <div style={{ display: 'flex', gap: '0.3rem' }}>
                          <button onClick={() => moveField(f.key, -1)} disabled={idx === 0}
                            style={{ ...btn('#e0e0e0', '#333'), padding: '0.25rem 0.5rem', fontSize: '0.75rem', opacity: idx === 0 ? 0.4 : 1 }}>▲</button>
                          <button onClick={() => moveField(f.key, 1)} disabled={idx === fields.length - 1}
                            style={{ ...btn('#e0e0e0', '#333'), padding: '0.25rem 0.5rem', fontSize: '0.75rem', opacity: idx === fields.length - 1 ? 0.4 : 1 }}>▼</button>
                          <button onClick={() => removeField(f.key)} style={{ ...btn('#ffebee', '#c62828'), padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}>✕</button>
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.6rem' }}>
                        <div>
                          <label style={{ ...labelStyle, fontSize: '0.72rem' }}>Cheie câmp (ID) *</label>
                          <input value={f.fieldKey} onChange={e => updateField(f.key, { fieldKey: e.target.value })}
                            style={{ ...inputStyle, fontSize: '0.82rem', fontFamily: 'monospace' }} placeholder="nume_camp" />
                        </div>
                        <div>
                          <label style={{ ...labelStyle, fontSize: '0.72rem' }}>Etichetă (RO) *</label>
                          <input value={f.label} onChange={e => updateField(f.key, { label: e.target.value })}
                            style={{ ...inputStyle, fontSize: '0.82rem' }} placeholder="Numele câmpului" />
                        </div>
                        <div>
                          <label style={{ ...labelStyle, fontSize: '0.72rem' }}>Etichetă (EN)</label>
                          <input value={f.labelEn} onChange={e => updateField(f.key, { labelEn: e.target.value })}
                            style={{ ...inputStyle, fontSize: '0.82rem' }} placeholder="Field name" />
                        </div>
                        <div>
                          <label style={{ ...labelStyle, fontSize: '0.72rem' }}>Tip câmp</label>
                          <select value={f.fieldType} onChange={e => updateField(f.key, { fieldType: Number(e.target.value) })}
                            style={{ ...selectStyle, fontSize: '0.82rem' }}>
                            {Object.entries(FIELD_TYPES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                          </select>
                        </div>
                        <div>
                          <label style={{ ...labelStyle, fontSize: '0.72rem' }}>Secțiune</label>
                          <input value={f.section} onChange={e => updateField(f.key, { section: e.target.value })}
                            style={{ ...inputStyle, fontSize: '0.82rem' }} placeholder="Ex: Date contract" />
                        </div>
                        <div>
                          <label style={{ ...labelStyle, fontSize: '0.72rem' }}>Valoare implicită</label>
                          <input value={f.defaultValue} onChange={e => updateField(f.key, { defaultValue: e.target.value })}
                            style={{ ...inputStyle, fontSize: '0.82rem' }} />
                        </div>
                        <div style={{ gridColumn: '1 / -1' }}>
                          <label style={{ ...labelStyle, fontSize: '0.72rem' }}>Text ajutor</label>
                          <input value={f.helpText} onChange={e => updateField(f.key, { helpText: e.target.value })}
                            style={{ ...inputStyle, fontSize: '0.82rem' }} placeholder="Instrucțiuni pentru completare" />
                        </div>
                        {(f.fieldType === 7 || f.fieldType === 8) && (
                          <div style={{ gridColumn: '1 / -1' }}>
                            <label style={{ ...labelStyle, fontSize: '0.72rem' }}>Opțiuni JSON</label>
                            <input value={f.optionsJson} onChange={e => updateField(f.key, { optionsJson: e.target.value })}
                              style={{ ...inputStyle, fontSize: '0.82rem', fontFamily: 'monospace' }}
                              placeholder='["Opțiune 1","Opțiune 2","Opțiune 3"]' />
                          </div>
                        )}
                        <div>
                          <label style={{ ...labelStyle, fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <input type="checkbox" checked={f.isRequired} onChange={e => updateField(f.key, { isRequired: e.target.checked })} />
                            Obligatoriu
                          </label>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Save button */}
          <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.75rem', borderTop: '1px solid #e0e0e0', paddingTop: '1rem' }}>
            <button onClick={handleSave} disabled={saving} style={btn('#1a237e')}>
              {saving ? 'Se salvează...' : isCreate ? '💾 Crează șablonul' : '💾 Salvează modificările'}
            </button>
            <button onClick={onBack} style={outlineBtn}>Anulează</button>
          </div>
        </div>
      </Card>
    </>
  );
}
