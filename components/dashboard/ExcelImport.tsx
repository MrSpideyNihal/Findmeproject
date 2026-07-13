'use client';

import { useState, useCallback, useRef } from 'react';
import {
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ChevronRight,
  ChevronLeft,
  Check,
  X,
  Loader2,
  Users,
  Search,
  CheckSquare,
  Square,
  RotateCcw,
} from 'lucide-react';
import { useToast } from '@/components/ToastProvider';
import { parseWorkbook, type ParsedProject } from '@/lib/parseExcel';



interface ExcelImportProps {
  onClose: () => void;
  onImportComplete: () => void;
}

type Step = 'upload' | 'review' | 'importing' | 'results';

interface ImportResult {
  inserted: number;
  failed: { index: number; title: string; errors: string[] }[];
  total: number;
}

export default function ExcelImport({ onClose, onImportComplete }: ExcelImportProps) {
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Step management
  const [step, setStep] = useState<Step>('upload');

  // Upload step
  const [dragActive, setDragActive] = useState(false);
  const [fileName, setFileName] = useState('');
  const [parsing, setParsing] = useState(false);
  const [parseError, setParseError] = useState('');

  // Review step
  const [projects, setProjects] = useState<ParsedProject[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);

  // Import step
  const [importProgress, setImportProgress] = useState(0);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);

  // ── File handling ───────────────────────────────────────────────────────────

  const processFile = useCallback(async (file: File) => {
    if (!file.name.match(/\.xlsx?$/i)) {
      setParseError('Please upload an Excel file (.xlsx or .xls)');
      return;
    }

    setParsing(true);
    setParseError('');
    setFileName(file.name);

    try {
      // Dynamic import of SheetJS
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const XLSX = (await import('xlsx')) as any;

      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });

      const parsed = parseWorkbook(workbook, XLSX.utils.sheet_to_json);

      if (parsed.length === 0) {
        setParseError('No projects found in this Excel file. Make sure it has the correct format with Batch No., Student Name, and Title columns.');
        setParsing(false);
        return;
      }

      setProjects(parsed);
      // Select all by default
      setSelected(new Set(parsed.map((_, i) => i)));
      setStep('review');
    } catch (err) {
      console.error('Excel parse error:', err);
      setParseError(
        'Failed to parse the Excel file. Please make sure it\'s a valid .xlsx file.'
      );
    } finally {
      setParsing(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragActive(false);
      const file = e.dataTransfer.files[0];
      if (file) processFile(file);
    },
    [processFile]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) processFile(file);
    },
    [processFile]
  );

  // ── Selection helpers ───────────────────────────────────────────────────────

  const toggleSelect = (idx: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  const selectAll = () => setSelected(new Set(filteredProjects.map((_, i) => projects.indexOf(filteredProjects[i]))));
  const deselectAll = () => setSelected(new Set());

  const filteredProjects = projects.filter((p) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.title.toLowerCase().includes(q) ||
      p.groupName.toLowerCase().includes(q) ||
      p.batchName.toLowerCase().includes(q) ||
      p.mentorName.toLowerCase().includes(q) ||
      p.members.some((m) => m.name.toLowerCase().includes(q))
    );
  });

  // ── Import ──────────────────────────────────────────────────────────────────

  const handleImport = async () => {
    const selectedProjects = projects.filter((_, i) => selected.has(i));
    if (selectedProjects.length === 0) {
      showToast('Please select at least one project to import', 'error');
      return;
    }

    setStep('importing');
    setImportProgress(0);

    // Strip warnings and internal fields before sending
    const cleanedProjects = selectedProjects.map((proj) => {
      const cleaned = { ...proj } as Partial<ParsedProject>;
      delete cleaned.warnings;
      delete cleaned._sheetName;
      return cleaned;
    });

    const BATCH_SIZE = 15;
    const totalBatches = Math.ceil(cleanedProjects.length / BATCH_SIZE);
    let totalInserted = 0;
    const allFailed: ImportResult['failed'] = [];

    for (let batch = 0; batch < totalBatches; batch++) {
      const start = batch * BATCH_SIZE;
      const batchProjects = cleanedProjects.slice(start, start + BATCH_SIZE);

      try {
        const res = await fetch('/api/projects/bulk', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ projects: batchProjects }),
        });

        const data = await res.json();

        if (res.ok || res.status === 207) {
          totalInserted += data.inserted || 0;
          if (data.failed) {
            allFailed.push(
              ...data.failed.map((f: ImportResult['failed'][0]) => ({
                ...f,
                index: f.index + start,
              }))
            );
          }
        } else {
          // Whole batch failed
          for (let j = 0; j < batchProjects.length; j++) {
            allFailed.push({
              index: start + j,
              title: batchProjects[j]?.title || 'Unknown',
              errors: [data.error || 'Import failed'],
            });
          }
        }
      } catch {
        for (let j = 0; j < batchProjects.length; j++) {
          allFailed.push({
            index: start + j,
            title: batchProjects[j]?.title || 'Unknown',
            errors: ['Network error — please check your connection'],
          });
        }
      }

      setImportProgress(Math.round(((batch + 1) / totalBatches) * 100));
    }

    setImportResult({
      inserted: totalInserted,
      failed: allFailed,
      total: cleanedProjects.length,
    });
    setStep('results');

    if (totalInserted > 0) {
      onImportComplete();
    }
  };

  // ── Reset ───────────────────────────────────────────────────────────────────

  const reset = () => {
    setStep('upload');
    setProjects([]);
    setSelected(new Set());
    setFileName('');
    setParseError('');
    setImportResult(null);
    setImportProgress(0);
    setSearchQuery('');
    setExpandedIdx(null);
  };

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="excel-import-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="excel-import-modal">
        {/* Header */}
        <div className="excel-import-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <FileSpreadsheet size={22} color="var(--accent-secondary)" />
            <div>
              <h2 style={{ fontWeight: 700, fontSize: '1.2rem' }}>Import Projects from Excel</h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.125rem' }}>
                Upload your Excel file to bulk import projects
              </p>
            </div>
          </div>
          <button onClick={onClose} className="excel-import-close" aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {/* Step Indicator */}
        <div className="excel-import-steps">
          {[
            { key: 'upload', label: 'Upload', icon: Upload },
            { key: 'review', label: 'Review', icon: Search },
            { key: 'importing', label: 'Import', icon: Loader2 },
            { key: 'results', label: 'Results', icon: CheckCircle2 },
          ].map(({ key, label, icon: Icon }, i) => {
            const stepOrder = ['upload', 'review', 'importing', 'results'];
            const currentIdx = stepOrder.indexOf(step);
            const thisIdx = stepOrder.indexOf(key);
            const isActive = thisIdx === currentIdx;
            const isDone = thisIdx < currentIdx;
            return (
              <div key={key} className="excel-import-step-item">
                {i > 0 && (
                  <div
                    className="excel-import-step-line"
                    style={{
                      background: isDone ? 'var(--accent-primary)' : 'var(--border-secondary)',
                    }}
                  />
                )}
                <div
                  className={`excel-import-step-circle ${isActive ? 'active' : ''} ${isDone ? 'done' : ''}`}
                >
                  {isDone ? <Check size={14} /> : <Icon size={14} />}
                </div>
                <span
                  className="excel-import-step-label"
                  style={{
                    color: isActive ? 'var(--text-primary)' : isDone ? 'var(--accent-primary-light)' : 'var(--text-muted)',
                    fontWeight: isActive ? 600 : 400,
                  }}
                >
                  {label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Content */}
        <div className="excel-import-content">
          {/* ── STEP: Upload ───────────────────────────────────────────── */}
          {step === 'upload' && (
            <div className="animate-fade-in">
              <div
                className={`excel-import-dropzone ${dragActive ? 'drag-active' : ''}`}
                onDragEnter={(e) => { e.preventDefault(); setDragActive(true); }}
                onDragLeave={(e) => { e.preventDefault(); setDragActive(false); }}
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileSelect}
                  style={{ display: 'none' }}
                />

                {parsing ? (
                  <div style={{ textAlign: 'center' }}>
                    <Loader2 size={40} className="animate-spin" color="var(--accent-primary-light)" style={{ margin: '0 auto 1rem' }} />
                    <p style={{ fontWeight: 600, marginBottom: '0.25rem' }}>Parsing Excel file...</p>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{fileName}</p>
                  </div>
                ) : (
                  <div style={{ textAlign: 'center' }}>
                    <div className="excel-import-dropzone-icon">
                      <Upload size={32} />
                    </div>
                    <p style={{ fontWeight: 600, fontSize: '1rem', marginBottom: '0.375rem' }}>
                      Drop your Excel file here
                    </p>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                      or click to browse • .xlsx / .xls
                    </p>
                    <span className="btn btn-secondary btn-sm" style={{ pointerEvents: 'none' }}>
                      Choose File
                    </span>
                  </div>
                )}
              </div>

              {parseError && (
                <div className="excel-import-error">
                  <XCircle size={16} />
                  {parseError}
                </div>
              )}

              <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-secondary)' }}>
                <p style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.5rem', color: 'var(--accent-secondary)' }}>
                  💡 Supported Format
                </p>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  Excel files with columns like <strong>Batch No.</strong>, <strong>Student Name</strong>, <strong>Email</strong>, <strong>Title of Project</strong>, <strong>Guide Name</strong>, etc. The AIML Alumni Connect format is fully supported.
                </p>
              </div>
            </div>
          )}

          {/* ── STEP: Review ───────────────────────────────────────────── */}
          {step === 'review' && (
            <div className="animate-fade-in">
              {/* Summary bar */}
              <div className="excel-import-summary">
                <div>
                  <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent-primary-light)' }}>
                    {projects.length}
                  </span>
                  <span style={{ color: 'var(--text-secondary)', marginLeft: '0.5rem', fontSize: '0.9rem' }}>
                    projects found from <strong>{fileName}</strong>
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--accent-secondary)', fontWeight: 600 }}>
                    {selected.size} selected
                  </span>
                </div>
              </div>

              {/* Search + Select controls */}
              <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '200px', position: 'relative' }}>
                  <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search projects, members, batches..."
                    className="form-input"
                    style={{ paddingLeft: '2.25rem', fontSize: '0.85rem' }}
                  />
                </div>
                <button onClick={selectAll} className="btn btn-secondary btn-sm">
                  <CheckSquare size={14} /> Select All
                </button>
                <button onClick={deselectAll} className="btn btn-secondary btn-sm">
                  <Square size={14} /> Deselect All
                </button>
              </div>

              {/* Projects list */}
              <div className="excel-import-projects-list">
                {filteredProjects.map((project) => {
                  const realIdx = projects.indexOf(project);
                  const isSelected = selected.has(realIdx);
                  const hasWarnings = project.warnings.length > 0;
                  const isExpanded = expandedIdx === realIdx;

                  return (
                    <div
                      key={realIdx}
                      className={`excel-import-project-card ${isSelected ? 'selected' : ''} ${hasWarnings ? 'has-warnings' : ''}`}
                      style={{
                        background: 'var(--bg-card)',
                        border: `1px solid ${isSelected ? 'rgba(124, 58, 237, 0.4)' : hasWarnings ? 'rgba(245, 158, 11, 0.3)' : 'var(--border-secondary)'}`,
                        borderRadius: 'var(--radius-md)',
                        overflow: 'hidden',
                        color: 'var(--text-primary)',
                        fontSize: '0.9rem',
                        lineHeight: 1.5,
                        transition: 'all 0.2s',
                        flexShrink: 0,
                      }}
                    >
                      <div
                        className="excel-import-project-header"
                        onClick={() => toggleSelect(realIdx)}
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '0.75rem',
                          padding: '0.875rem 1rem',
                          cursor: 'pointer',
                        }}
                      >
                        <div className="excel-import-checkbox">
                          {isSelected ? (
                            <CheckSquare size={18} color="var(--accent-primary-light)" />
                          ) : (
                            <Square size={18} color="var(--text-muted)" />
                          )}
                        </div>

                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.375rem' }}>
                            <span className="tag tag-cyan" style={{ fontSize: '0.7rem' }}>{project.groupName}</span>
                            <span className="tag tag-amber" style={{ fontSize: '0.7rem' }}>{project.batchName}</span>
                            {project._sheetName && (
                              <span className="tag" style={{ fontSize: '0.7rem' }}>{project._sheetName}</span>
                            )}
                          </div>
                          <h4 style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.25rem' }}>
                            {project.title}
                          </h4>
                          <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                              <Users size={12} /> {project.members.length} members
                            </span>
                            {project.mentorName && (
                              <span>Guide: {project.mentorName}</span>
                            )}
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          {hasWarnings && (
                            <span className="excel-import-warning-badge">
                              <AlertTriangle size={12} /> {project.warnings.length}
                            </span>
                          )}
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setExpandedIdx(isExpanded ? null : realIdx);
                            }}
                            style={{ padding: '0.25rem 0.5rem' }}
                          >
                            <ChevronRight
                              size={14}
                              style={{
                                transition: 'transform 0.2s',
                                transform: isExpanded ? 'rotate(90deg)' : 'none',
                              }}
                            />
                          </button>
                        </div>
                      </div>

                      {/* Expanded details */}
                      {isExpanded && (
                        <div className="excel-import-project-details animate-fade-in">
                          {/* Members */}
                          <div style={{ marginBottom: '0.75rem' }}>
                            <h5 style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                              Team Members
                            </h5>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
                              {project.members.map((m, mi) => (
                                <span
                                  key={mi}
                                  style={{
                                    fontSize: '0.75rem',
                                    padding: '0.2rem 0.5rem',
                                    background: m.isLead ? 'rgba(245, 158, 11, 0.15)' : 'var(--bg-secondary)',
                                    border: `1px solid ${m.isLead ? 'rgba(245, 158, 11, 0.3)' : 'var(--border-secondary)'}`,
                                    borderRadius: '999px',
                                    color: m.isLead ? 'var(--accent-tertiary)' : 'var(--text-secondary)',
                                  }}
                                >
                                  {m.name} {m.isLead && '⭐'}
                                </span>
                              ))}
                            </div>
                          </div>

                          {/* Tags */}
                          {project.tags.length > 0 && (
                            <div style={{ marginBottom: '0.75rem' }}>
                              <h5 style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                                Tags
                              </h5>
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
                                {project.tags.map((tag, ti) => (
                                  <span key={ti} className="tag" style={{ fontSize: '0.7rem' }}>{tag}</span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Abstract preview */}
                          <div style={{ marginBottom: '0.75rem' }}>
                            <h5 style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                              Abstract / Remarks
                            </h5>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5, maxHeight: '5rem', overflow: 'auto' }}>
                              {project.abstract.slice(0, 400)}{project.abstract.length > 400 ? '...' : ''}
                            </p>
                          </div>

                          {/* Warnings */}
                          {hasWarnings && (
                            <div>
                              <h5 style={{ fontSize: '0.8rem', fontWeight: 600, color: '#f59e0b', marginBottom: '0.5rem' }}>
                                ⚠️ Warnings
                              </h5>
                              <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                {project.warnings.map((w, wi) => (
                                  <li key={wi} style={{ fontSize: '0.75rem', color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                                    <AlertTriangle size={11} /> {w}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {filteredProjects.length === 0 && (
                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                  No projects match your search.
                </div>
              )}
            </div>
          )}

          {/* ── STEP: Importing ────────────────────────────────────────── */}
          {step === 'importing' && (
            <div className="animate-fade-in" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
              <Loader2
                size={48}
                className="animate-spin"
                color="var(--accent-primary-light)"
                style={{ margin: '0 auto 1.5rem' }}
              />
              <h3 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>Importing Projects...</h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '0.9rem' }}>
                Importing {selected.size} projects in batches. Please don&apos;t close this window.
              </p>

              <div className="excel-import-progress-bar">
                <div
                  className="excel-import-progress-fill"
                  style={{ width: `${importProgress}%` }}
                />
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.75rem' }}>
                {importProgress}% complete
              </p>
            </div>
          )}

          {/* ── STEP: Results ──────────────────────────────────────────── */}
          {step === 'results' && importResult && (
            <div className="animate-fade-in" style={{ padding: '1rem 0' }}>
              {/* Success / Failure summary */}
              <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                {importResult.inserted > 0 ? (
                  <CheckCircle2
                    size={56}
                    color="#34d399"
                    style={{ margin: '0 auto 1rem' }}
                  />
                ) : (
                  <XCircle
                    size={56}
                    color="#f87171"
                    style={{ margin: '0 auto 1rem' }}
                  />
                )}

                <h3 style={{ fontWeight: 700, fontSize: '1.25rem', marginBottom: '0.375rem' }}>
                  {importResult.inserted > 0 ? 'Import Complete! 🎉' : 'Import Failed'}
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  {importResult.inserted} of {importResult.total} projects imported successfully
                </p>
              </div>

              {/* Stats cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <div className="stat-card" style={{ padding: '1rem' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#34d399' }}>
                    {importResult.inserted}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Imported</div>
                </div>
                <div className="stat-card" style={{ padding: '1rem' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: importResult.failed.length > 0 ? '#f87171' : 'var(--text-muted)' }}>
                    {importResult.failed.length}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Failed</div>
                </div>
                <div className="stat-card" style={{ padding: '1rem' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent-secondary)' }}>
                    {importResult.total}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Total</div>
                </div>
              </div>

              {/* Failed projects list */}
              {importResult.failed.length > 0 && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <h4 style={{ fontWeight: 600, fontSize: '0.9rem', color: '#f87171', marginBottom: '0.75rem' }}>
                    Failed Projects
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '200px', overflowY: 'auto' }}>
                    {importResult.failed.map((f, i) => (
                      <div
                        key={i}
                        style={{
                          padding: '0.75rem',
                          background: 'rgba(239, 68, 68, 0.08)',
                          border: '1px solid rgba(239, 68, 68, 0.2)',
                          borderRadius: 'var(--radius-md)',
                          fontSize: '0.8rem',
                        }}
                      >
                        <strong style={{ color: '#fca5a5' }}>{f.title}</strong>
                        <div style={{ color: '#f87171', marginTop: '0.25rem' }}>
                          {f.errors.join(', ')}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="excel-import-footer">
          {step === 'upload' && (
            <button onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
          )}

          {step === 'review' && (
            <>
              <button onClick={reset} className="btn btn-secondary">
                <ChevronLeft size={16} /> Back
              </button>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <span style={{ alignSelf: 'center', fontSize: '0.85rem', color: 'var(--text-secondary)', marginRight: '0.5rem' }}>
                  {selected.size} / {projects.length} selected
                </span>
                <button
                  onClick={handleImport}
                  className="btn btn-primary"
                  disabled={selected.size === 0}
                >
                  Import {selected.size} Projects <ChevronRight size={16} />
                </button>
              </div>
            </>
          )}

          {step === 'results' && (
            <>
              <button onClick={reset} className="btn btn-secondary">
                <RotateCcw size={16} /> Import More
              </button>
              <button onClick={onClose} className="btn btn-primary">
                Done <Check size={16} />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
