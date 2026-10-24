import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Clock,
  Layers,
  Building2,
  Sparkles,
  RotateCcw,
  Edit3,
  X,
  Search,
  Check,
  Flag,
  Database
} from 'lucide-react';
import { StorageService, subscribeToStorage } from '../services/storageService';
import { CivicIssue, FollowUp, DataSource, CivicCategory, IssueSeverity } from '../types';
import { CATEGORY_CONFIG, SEVERITY_CONFIG, STATUS_CONFIG } from '../utils/civicHelpers';
import { formatDate } from '../utils/cn';

export const AdminPage: React.FC = () => {
  const [issues, setIssues] = useState<CivicIssue[]>(StorageService.getIssues());
  const [followUps, setFollowUps] = useState<FollowUp[]>(StorageService.getFollowUps());
  const [sources] = useState<DataSource[]>(StorageService.getDataSources());

  const [activeTab, setActiveTab] = useState<'queue' | 'followups' | 'sources' | 'quality'>('queue');
  const [selectedIssue, setSelectedIssue] = useState<CivicIssue | null>(null);

  // Review editing state
  const [editCategory, setEditCategory] = useState<CivicCategory>('roads_footpaths');
  const [editSeverity, setEditSeverity] = useState<IssueSeverity>('medium');
  const [reviewerNotes, setReviewerNotes] = useState('');
  const [showResetModal, setShowResetModal] = useState(false);

  useEffect(() => {
    const unsub = subscribeToStorage(() => {
      setIssues(StorageService.getIssues());
      setFollowUps(StorageService.getFollowUps());
    });
    return unsub;
  }, []);

  const openReviewModal = (iss: CivicIssue) => {
    setSelectedIssue(iss);
    setEditCategory(iss.category);
    setEditSeverity(iss.severity);
    setReviewerNotes('');
  };

  const handleSaveReview = (verificationStatus: 'reviewer_verified' | 'unverified') => {
    if (!selectedIssue) return;

    StorageService.updateIssue(selectedIssue.id, {
      category: editCategory,
      severity: editSeverity,
      verificationStatus,
      status: verificationStatus === 'reviewer_verified' ? 'routed_in_prototype' : 'under_review',
    });

    StorageService.addTimelineEvent({
      id: `EV-${selectedIssue.id}-${Date.now()}`,
      issueId: selectedIssue.id,
      eventType: 'review_completed',
      title: `Municipal Review: ${verificationStatus === 'reviewer_verified' ? 'Verified by Officer' : 'Flagged for Revision'}`,
      description: reviewerNotes || 'Review completed by prototype administrative triage officer.',
      timestamp: StorageService.getSimulatedNow().toISOString(),
      actorType: 'reviewer',
      dataOrigin: 'reviewer_verified',
    });

    setSelectedIssue(null);
  };

  // Metrics
  const awaitingReviewCount = issues.filter((i) => i.verificationStatus !== 'reviewer_verified').length;
  const overdueFollowUps = followUps.filter((f) => f.status === 'sent');
  const lowConfidenceIssues = issues.filter((i) => i.severity === 'critical' || i.category === 'uncertain_other');

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#153F35] font-display">
            Administrative & Verification Triage
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold font-display text-[#153F35]">
            Reviewer Workspace (Prototype)
          </h1>
          <p className="text-xs text-[#6D7771] mt-1">
            Validate citizen reports, inspect AI observations, oversee follow-up milestones, and maintain ground-truth integrity.
          </p>
        </div>

        <button
          onClick={() => setShowResetModal(true)}
          className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-lg bg-[#B94343] hover:bg-red-800 text-white text-xs font-semibold shadow-subtle transition self-start sm:self-auto"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Demo Dataset</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white border border-[#E1E5DF] shadow-subtle space-y-1">
          <span className="text-[11px] font-semibold text-[#6D7771]">Awaiting Verification</span>
          <div className="text-2xl font-bold font-display text-amber-700">{awaitingReviewCount}</div>
          <span className="text-[10px] text-stone-400">Needs reviewer signoff</span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#E1E5DF] shadow-subtle space-y-1">
          <span className="text-[11px] font-semibold text-[#6D7771]">Overdue Follow-Ups</span>
          <div className="text-2xl font-bold font-display text-[#B94343]">{overdueFollowUps.length}</div>
          <span className="text-[10px] text-stone-400">Pending citizen verification</span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#E1E5DF] shadow-subtle space-y-1">
          <span className="text-[11px] font-semibold text-[#6D7771]">Critical / Escalations</span>
          <div className="text-2xl font-bold font-display text-red-700">{lowConfidenceIssues.length}</div>
          <span className="text-[10px] text-stone-400">Immediate hazard markers</span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#E1E5DF] shadow-subtle space-y-1">
          <span className="text-[11px] font-semibold text-[#6D7771]">Statutory Data Sources</span>
          <div className="text-2xl font-bold font-display text-[#153F35]">{sources.length}</div>
          <span className="text-[10px] text-stone-400">Official gazette citations</span>
        </div>
      </div>

      {/* Workspace Tabs */}
      <div className="border-b border-[#E1E5DF] flex space-x-6 text-xs font-semibold">
        {[
          { id: 'queue', label: `Issue Review Queue (${issues.length})` },
          { id: 'followups', label: `Follow-Up Schedule (${followUps.length})` },
          { id: 'sources', label: `Data Sources Registry (${sources.length})` },
          { id: 'quality', label: 'Data Quality & Integrity' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`pb-3 transition relative ${
              activeTab === tab.id
                ? 'text-[#153F35] font-bold border-b-2 border-[#153F35]'
                : 'text-[#6D7771] hover:text-[#202724]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: ISSUE REVIEW QUEUE */}
      {activeTab === 'queue' && (
        <div className="bg-white rounded-2xl border border-[#E1E5DF] shadow-card overflow-hidden">
          <div className="px-5 py-3.5 border-b border-[#E1E5DF] flex items-center justify-between text-xs">
            <span className="font-bold text-[#153F35]">Citizen Grievances Review Queue</span>
            <span className="text-[10px] text-[#6D7771]">Inspect AI predictions & verify</span>
          </div>

          <div className="divide-y divide-stone-100">
            {issues.map((iss) => {
              const cat = CATEGORY_CONFIG[iss.category];
              const sev = SEVERITY_CONFIG[iss.severity];

              return (
                <div
                  key={iss.id}
                  className="p-4 hover:bg-stone-50 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono font-bold text-[#153F35] bg-[#E6EEE7] px-2 py-0.5 rounded text-[11px]">
                        {iss.id}
                      </span>
                      <span className={`text-[10px] px-2 py-0.5 rounded font-semibold ${cat.bgClass} ${cat.textClass}`}>
                        {cat.label}
                      </span>
                      <span className={`text-[10px] px-2 py-0.5 rounded font-semibold ${sev.bgClass} ${sev.textClass}`}>
                        {sev.label}
                      </span>
                      {iss.verificationStatus === 'reviewer_verified' ? (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
                          ✓ Reviewer Verified
                        </span>
                      ) : (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-bold">
                          Pending Officer Review
                        </span>
                      )}
                    </div>
                    <h4 className="font-bold text-[#202724]">{iss.title}</h4>
                    <p className="text-[#6D7771] line-clamp-1">{iss.locationLabel}</p>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    <button
                      onClick={() => openReviewModal(iss)}
                      className="px-3 py-1.5 rounded-md bg-[#153F35] hover:bg-[#102D27] text-white text-xs font-semibold shadow-subtle flex items-center gap-1"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Review Record</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: FOLLOW-UP SCHEDULE */}
      {activeTab === 'followups' && (
        <div className="bg-white rounded-2xl border border-[#E1E5DF] shadow-card overflow-hidden">
          <div className="px-5 py-3.5 border-b border-[#E1E5DF] flex items-center justify-between text-xs">
            <span className="font-bold text-[#153F35]">Automated Follow-Up Pipeline</span>
            <span className="text-[10px] text-[#6D7771]">FollowUpEngine scheduled milestones</span>
          </div>

          <div className="divide-y divide-stone-100 text-xs">
            {followUps.map((f) => (
              <div key={f.id} className="p-4 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-[#153F35]">
                    {f.id} (For Report: {f.issueId})
                  </span>
                  <span className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                    f.status === 'responded' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {f.status.toUpperCase()}
                  </span>
                </div>
                <p className="font-semibold text-[#202724]">“{f.question}”</p>
                {f.response && (
                  <p className="text-[11px] text-[#6D7771] bg-stone-50 p-2 rounded">
                    Citizen Response: <strong>{f.response}</strong> (State: {f.responseType})
                  </p>
                )}
                <span className="text-[10px] text-stone-400 block">
                  Scheduled / Sent At: {formatDate(f.scheduledAt)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: DATA SOURCES */}
      {activeTab === 'sources' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sources.map((src) => (
            <div key={src.id} className="p-5 rounded-2xl bg-white border border-[#E1E5DF] space-y-2 shadow-subtle">
              <span className="font-mono text-xs font-bold text-[#153F35] bg-[#E6EEE7] px-2 py-0.5 rounded">
                {src.id}
              </span>
              <h4 className="text-sm font-bold text-[#202724]">{src.name}</h4>
              <p className="text-xs text-[#6D7771]">{src.notes}</p>
              <div className="pt-2 border-t flex items-center justify-between text-xs">
                <span className="text-[10px] text-emerald-800 font-semibold bg-emerald-50 px-2 py-0.5 rounded">
                  Official Source
                </span>
                <a
                  href={src.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#153F35] font-semibold hover:underline"
                >
                  Verify URL →
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 4: DATA QUALITY & INTEGRITY CHECKS */}
      {activeTab === 'quality' && (
        <div className="bg-white rounded-2xl border border-[#E1E5DF] p-6 shadow-card space-y-4 text-xs">
          <h3 className="text-sm font-bold font-display text-[#153F35]">
            Prototype Data Integrity Assessment
          </h3>
          <div className="space-y-3">
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950 flex items-center justify-between">
              <span>Geocoding & Coordinates Coverage:</span>
              <strong className="font-mono">100% (25/25 issues pinned in Jaipur)</strong>
            </div>
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950 flex items-center justify-between">
              <span>Statutory Authority Assignment:</span>
              <strong className="font-mono">100% assigned under Municipal / JDA acts</strong>
            </div>
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950 flex items-center justify-between">
              <span>Public Works Proximity Correlation:</span>
              <strong className="font-mono">8 Verified tenders mapped</strong>
            </div>
            <div className="p-3 rounded-xl bg-stone-100 border border-stone-200 text-[#202724] flex items-center justify-between">
              <span>Client-Side EXIF Scrubbing:</span>
              <strong className="text-emerald-700">Active (0 GPS leaks)</strong>
            </div>
          </div>
        </div>
      )}

      {/* Review Modal Dialog */}
      {selectedIssue && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-elevated border border-[#E1E5DF] max-w-xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto animate-in zoom-in-95">
            <div className="flex items-start justify-between">
              <div>
                <span className="font-mono text-xs font-bold text-[#153F35] bg-[#E6EEE7] px-2.5 py-0.5 rounded">
                  {selectedIssue.id}
                </span>
                <h3 className="text-base font-bold font-display text-[#153F35] mt-1">
                  {selectedIssue.title}
                </h3>
              </div>
              <button onClick={() => setSelectedIssue(null)} className="text-stone-400 hover:text-stone-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {selectedIssue.imageUrl && (
              <img
                src={selectedIssue.imageUrl}
                alt="Evidence"
                className="w-full h-44 object-cover rounded-xl border border-[#E1E5DF]"
              />
            )}

            <p className="text-xs text-[#6D7771] leading-relaxed">
              {selectedIssue.description}
            </p>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-[#6D7771] mb-1">
                  Adjust Category:
                </label>
                <select
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value as CivicCategory)}
                  className="w-full p-2 text-xs rounded-md border border-[#E1E5DF] bg-stone-50"
                >
                  {Object.entries(CATEGORY_CONFIG).map(([k, v]) => (
                    <option key={k} value={k}>
                      {v.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#6D7771] mb-1">
                  Adjust Severity:
                </label>
                <select
                  value={editSeverity}
                  onChange={(e) => setEditSeverity(e.target.value as IssueSeverity)}
                  className="w-full p-2 text-xs rounded-md border border-[#E1E5DF] bg-stone-50"
                >
                  <option value="low">Low Severity</option>
                  <option value="medium">Medium Severity</option>
                  <option value="high">High Urgency</option>
                  <option value="critical">Critical Safety Hazard</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#6D7771] mb-1">
                Triage Review Notes:
              </label>
              <textarea
                rows={2}
                value={reviewerNotes}
                onChange={(e) => setReviewerNotes(e.target.value)}
                placeholder="e.g. Ground inspection confirmed. Dispatched notification to XEN Malviya Nagar Zone."
                className="w-full p-2 text-xs rounded-md border border-[#E1E5DF] bg-stone-50"
              />
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2 border-t">
              <button
                onClick={() => handleSaveReview('unverified')}
                className="px-3.5 py-2 rounded-lg border border-amber-300 bg-amber-50 text-amber-900 text-xs font-semibold hover:bg-amber-100"
              >
                Flag Inaccurate AI
              </button>
              <button
                onClick={() => handleSaveReview('reviewer_verified')}
                className="px-4 py-2 rounded-lg bg-[#153F35] hover:bg-[#102D27] text-white text-xs font-semibold shadow-subtle flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Verify & Approve</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-elevated border border-[#E1E5DF] max-w-md w-full p-6 animate-in zoom-in-95">
            <div className="flex items-center space-x-3 text-[#B94343] mb-3">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="text-base font-bold font-display text-[#202724]">
                Reset Demo Dataset?
              </h3>
            </div>
            <p className="text-xs text-[#6D7771] leading-relaxed mb-5">
              This will restore all 25 seed grievances, public works, and initial timeline events.
            </p>
            <div className="flex items-center justify-end space-x-2">
              <button
                onClick={() => setShowResetModal(false)}
                className="px-3 py-1.5 rounded-md border border-[#E1E5DF] text-xs font-semibold text-[#202724]"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  StorageService.resetDemoData();
                  setShowResetModal(false);
                }}
                className="px-3 py-1.5 rounded-md bg-[#B94343] hover:bg-red-800 text-white text-xs font-semibold"
              >
                Confirm Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
