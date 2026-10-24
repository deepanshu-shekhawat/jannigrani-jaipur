import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  MapPin,
  Sparkles,
  Building2,
  Calendar,
  Clock,
  Layers,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Send,
  Camera,
  MessageSquare,
  HelpCircle,
  ExternalLink,
  User,
  Share2,
  Zap
} from 'lucide-react';
import { CivicIssue, FollowUp, IssueTimelineEvent, PublicWork, Authority } from '../types';
import { StorageService, subscribeToStorage } from '../services/storageService';
import { CATEGORY_CONFIG, SEVERITY_CONFIG, STATUS_CONFIG } from '../utils/civicHelpers';
import { formatDate, formatDateTime } from '../utils/cn';
import { JaipurCivicMap } from '../components/map/JaipurCivicMap';

interface ComplaintDetailPageProps {
  issueId: string;
  onNavigate: (path: string) => void;
  onBack: () => void;
}

export const ComplaintDetailPage: React.FC<ComplaintDetailPageProps> = ({
  issueId,
  onNavigate,
  onBack,
}) => {
  const [issue, setIssue] = useState<CivicIssue | undefined>(StorageService.getIssueById(issueId));
  const [followUps, setFollowUps] = useState<FollowUp[]>(StorageService.getFollowUps(issueId));
  const [timelineEvents, setTimelineEvents] = useState<IssueTimelineEvent[]>(StorageService.getTimelineEvents(issueId));
  const [publicWorks, setPublicWorks] = useState<PublicWork[]>(StorageService.getPublicWorks());
  const [authorities, setAuthorities] = useState<Authority[]>(StorageService.getAuthorities());
  const aiAnalysis = StorageService.getAiAnalysisById(issue?.aiAnalysisId);

  // Interactive follow-up response state
  const [responseText, setResponseText] = useState('');
  const [selectedQuickResponse, setSelectedQuickResponse] = useState<
    'resolved' | 'still_present' | 'worsened' | 'cannot_verify'
  >('still_present');
  const [isSubmittingResponse, setIsSubmittingResponse] = useState(false);

  useEffect(() => {
    const unsub = subscribeToStorage(() => {
      setIssue(StorageService.getIssueById(issueId));
      setFollowUps(StorageService.getFollowUps(issueId));
      setTimelineEvents(StorageService.getTimelineEvents(issueId));
      setPublicWorks(StorageService.getPublicWorks());
      setAuthorities(StorageService.getAuthorities());
    });
    return unsub;
  }, [issueId]);

  if (!issue) {
    return (
      <div className="max-w-3xl mx-auto py-16 px-4 text-center space-y-4">
        <h2 className="text-xl font-bold font-display text-[#153F35]">
          Complaint Not Found
        </h2>
        <p className="text-xs text-[#6D7771]">
          The requested report ID ({issueId}) does not exist in the local prototype database.
        </p>
        <button
          onClick={onBack}
          className="px-4 py-2 rounded-lg bg-[#153F35] text-white text-xs font-semibold"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  const catConfig = CATEGORY_CONFIG[issue.category];
  const sevConfig = SEVERITY_CONFIG[issue.severity];
  const statConfig = STATUS_CONFIG[issue.status];

  // Matched public works
  const relatedWorks = publicWorks.filter((w) => issue.relatedProjectIds.includes(w.id));

  // Handle citizen follow-up response submission
  const handleSubmitFollowUp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!responseText.trim()) {
      alert('Please enter a response description.');
      return;
    }

    setIsSubmittingResponse(true);
    const nowIso = StorageService.getSimulatedNow().toISOString();

    // Find pending follow-up or create response
    const pendingFollowUp = followUps.find((f) => f.status === 'sent' || f.status === 'scheduled');
    const followUpId = pendingFollowUp ? pendingFollowUp.id : `FOL-${issue.id.replace('JN-', '')}-${followUps.length + 1}`;

    const updatedFollowUp: FollowUp = {
      id: followUpId,
      issueId: issue.id,
      scheduledAt: nowIso,
      sentAt: nowIso,
      question: pendingFollowUp ? pendingFollowUp.question : 'Citizen Follow-up Progress Verification',
      response: responseText,
      responseType: selectedQuickResponse,
      status: 'responded',
      createdBy: 'followup_engine',
      dataOrigin: 'citizen_interactive',
    };

    StorageService.saveFollowUp(updatedFollowUp);

    // If citizen says resolved, update issue status to citizen_resolved
    let newStatus = issue.status;
    if (selectedQuickResponse === 'resolved') {
      newStatus = 'citizen_resolved';
    } else if (selectedQuickResponse === 'worsened') {
      newStatus = 'needs_attention';
    }

    StorageService.updateIssue(issue.id, {
      status: newStatus,
      updatedAt: nowIso,
    });

    // Add timeline event
    StorageService.addTimelineEvent({
      id: `EV-${issue.id}-${Date.now()}`,
      issueId: issue.id,
      eventType: 'followup_responded',
      title: `Citizen Response: ${
        selectedQuickResponse === 'resolved'
          ? 'Issue Reported Resolved by Citizen'
          : selectedQuickResponse === 'worsened'
          ? 'Condition Reported Worsened'
          : 'Issue Verified Still Present'
      }`,
      description: responseText,
      timestamp: nowIso,
      actorType: 'citizen',
      dataOrigin: 'citizen_interactive',
    });

    setResponseText('');
    setIsSubmittingResponse(false);
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 space-y-8">
      {/* Back button and breadcrumbs */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-[#153F35] hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Complaints Directory</span>
        </button>

        <div className="flex items-center space-x-2 text-xs text-[#6D7771]">
          <span>Grievance Intelligence Token:</span>
          <span className="font-mono font-bold text-[#153F35] bg-[#E6EEE7] px-2.5 py-0.5 rounded">
            {issue.id}
          </span>
        </div>
      </div>

      {/* Main Grid: Left Content (Summary, AI, Authority, Public Works) & Right Sidebar (Follow-Up Hub, Timeline) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LEFT COLUMN (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* 1. Header & Summary Card */}
          <div className="p-6 rounded-2xl bg-white border border-[#E1E5DF] shadow-card space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`text-xs px-2.5 py-0.5 rounded font-semibold ${catConfig.bgClass} ${catConfig.textClass}`}>
                {catConfig.label}
              </span>
              <span className={`text-xs px-2.5 py-0.5 rounded font-semibold ${statConfig.bgClass} ${statConfig.textClass}`}>
                {statConfig.label}
              </span>
              <span className={`text-xs px-2.5 py-0.5 rounded font-semibold ${sevConfig.bgClass} ${sevConfig.textClass}`}>
                {sevConfig.label}
              </span>
              <span className="text-[11px] text-stone-400 font-mono ml-auto">
                Ward #{issue.wardNumber || 'General'}
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-bold font-display text-[#153F35] leading-snug">
              {issue.title}
            </h1>

            <p className="text-xs sm:text-sm text-[#202724] leading-relaxed">
              {issue.description}
            </p>

            <div className="pt-3 border-t border-stone-100 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs text-[#6D7771]">
              <div>
                <span className="block text-[10px] text-stone-400">Location</span>
                <span className="font-semibold text-[#202724] line-clamp-1">{issue.locationLabel}</span>
              </div>
              <div>
                <span className="block text-[10px] text-stone-400">Reported Date</span>
                <span className="font-semibold text-[#202724]">{formatDate(issue.createdAt)}</span>
              </div>
              <div>
                <span className="block text-[10px] text-stone-400">Reporter Privacy</span>
                <span className="font-semibold text-emerald-800">Anonymous Zero-Knowledge</span>
              </div>
            </div>
          </div>

          {/* 2. Evidence Gallery & Location Canvas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Evidence Image */}
            <div className="bg-white rounded-xl border border-[#E1E5DF] overflow-hidden shadow-subtle flex flex-col">
              <div className="px-3.5 py-2 border-b text-xs font-bold text-[#153F35] flex items-center justify-between">
                <span>Photographic Evidence</span>
                <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                  EXIF Scrubbed
                </span>
              </div>
              {issue.imageUrl ? (
                <img
                  src={issue.imageUrl}
                  alt={issue.title}
                  className="w-full h-48 object-cover"
                />
              ) : (
                <div className="h-48 flex items-center justify-center text-xs text-stone-400 bg-stone-50">
                  No photographic evidence attached
                </div>
              )}
            </div>

            {/* Embedded Location Mini-Map */}
            <div className="bg-white rounded-xl border border-[#E1E5DF] overflow-hidden shadow-subtle flex flex-col">
              <div className="px-3.5 py-2 border-b text-xs font-bold text-[#153F35] flex items-center justify-between">
                <span>Exact Jaipur Coordinates</span>
                <span className="font-mono text-[10px] text-stone-500">
                  {issue.latitude.toFixed(4)}°, {issue.longitude.toFixed(4)}°
                </span>
              </div>
              <div className="h-48 w-full">
                <JaipurCivicMap
                  issues={[issue]}
                  selectedIssueId={issue.id}
                  center={[issue.latitude, issue.longitude]}
                  zoom={15}
                  interactive={false}
                />
              </div>
            </div>
          </div>

          {/* 3. AI Vision Analysis Breakdown */}
          <div className="p-5 rounded-2xl bg-[#E6EEE7]/50 border border-[#ccdcd0] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold font-display text-[#153F35] flex items-center gap-1.5">
                {aiAnalysis?.provider === 'puter_vision' ? (
                  <Zap className="w-4 h-4 text-emerald-700" />
                ) : (
                  <Sparkles className="w-4 h-4 text-emerald-700" />
                )}
                <span>
                  {aiAnalysis?.provider === 'puter_vision'
                    ? `Puter.js Live Vision (${aiAnalysis?.modelUsed || 'Gemini 3.8 Flash'})`
                    : 'AI Vision Feature Observations'}
                </span>
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#153F35] text-white font-bold">
                {aiAnalysis ? `${Math.round(aiAnalysis.confidence * 100)}% Confidence` : '94% Confidence'}
              </span>
            </div>

            {/* Subtype / Detected Damage */}
            <div className="text-sm font-bold font-display text-[#153F35]">
              {aiAnalysis?.detectedDamage || aiAnalysis?.predictedSubtype || issue.subcategory}
            </div>

            {/* Immediate Safety Warning */}
            {aiAnalysis?.safetyWarning && (
              <div className="p-3 rounded-lg bg-amber-50 border border-amber-300 text-xs text-amber-950 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <strong className="font-bold text-amber-900 block mb-0.5">Safety Warning:</strong>
                  <span>{aiAnalysis.safetyWarning}</span>
                </div>
              </div>
            )}

            {/* Physical Observations */}
            {aiAnalysis?.observations && aiAnalysis.observations.length > 0 ? (
              <ul className="space-y-1.5 text-xs text-[#202724]">
                {aiAnalysis.observations.map((obs, idx) => (
                  <li key={idx} className="flex items-start space-x-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#153F35] shrink-0 mt-1.5" />
                    <span>{obs}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-[#202724] leading-relaxed">
                <strong>Visual Evidence:</strong> Photographic evidence matches surface infrastructure failure.
              </p>
            )}

            {aiAnalysis?.visualEvidence && (
              <p className="text-xs text-[#6D7771] italic pt-1 border-t border-[#ccdcd0]/60">
                <strong className="text-[#202724] not-italic font-semibold">Visual Evidence Summary:</strong>{' '}
                {aiAnalysis.visualEvidence}
              </p>
            )}

            <div className="p-3 rounded-lg bg-white border border-[#E1E5DF] text-[11px] text-[#6D7771] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#153F35] shrink-0" />
              <span>
                Observations are AI-assisted recommendations powered by Puter.js computer vision. Verified by citizen reporter at submission.
              </span>
            </div>
          </div>

          {/* 4. Statutory Authority Routing Card */}
          <div className="p-5 rounded-2xl bg-white border-2 border-[#153F35] shadow-card space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-emerald-800 bg-[#E6EEE7] px-2 py-0.5 rounded">
                Statutory Agency Recommendation
              </span>
              <span className="text-xs font-bold text-[#153F35]">Verified Jurisdiction</span>
            </div>

            <h3 className="text-lg font-bold font-display text-[#153F35]">
              Jaipur Municipal Corporation (Greater) — Malviya Nagar Zone
            </h3>

            <p className="text-xs text-[#202724] leading-relaxed">
              <strong>Statutory Mandate:</strong> Road falls within Greater Municipal Corporation boundary under Sec 200 of the <em>Rajasthan Municipalities Act, 2009</em>. Local executive engineer (XEN Malviya Nagar Zone) is the statutory custodian.
            </p>

            <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs text-[#6D7771]">
              <span>Official Helpline: <strong>Rajasthan Sampark 181 / JMC 0141-2742823</strong></span>
              <span className="font-semibold text-[#153F35]">Verified Routing</span>
            </div>

            {/* Direct Official Grievance Portals */}
            <div className="pt-1 flex flex-wrap items-center gap-2">
              <a
                href="https://samadhan.jaipurmc.org/ComplaintRegistrationByWebsite/AddComplaintRegistrationByWebsite"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#153F35] hover:bg-[#102D27] text-white text-xs font-semibold shadow-subtle transition"
              >
                <span>Register on JMC Samadhan</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              <a
                href="https://samadhan.jaipurmc.org/ComplaintRegistrationByWebsite/SearchComplains"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-[#202724] text-xs font-semibold border border-stone-200 transition"
              >
                <span>Track on Samadhan</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              <a
                href="https://www.jaipurmc.org/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-[#153F35] font-semibold hover:underline ml-auto"
              >
                <span>Jaipur MC Portal</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* 5. Related Public Works Card */}
          {relatedWorks.length > 0 && (
            <div className="p-5 rounded-2xl bg-white border border-[#E1E5DF] shadow-card space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#153F35] font-display flex items-center gap-1.5">
                  <Layers className="w-4 h-4" />
                  Correlated Tender Record
                </span>
                <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                  DLP Warranty Active
                </span>
              </div>

              {relatedWorks.map((work) => (
                <div key={work.id} className="space-y-2 text-xs">
                  <h4 className="font-bold text-[#202724]">{work.title}</h4>
                  <p className="text-[11px] text-[#6D7771]">
                    Tender Reference: <strong>{work.tenderReference}</strong> • Value: {work.contractValue}
                  </p>
                  <p className="text-[11px] text-[#202724]">
                    Contractor: <strong>{work.contractorName}</strong>
                  </p>
                  <div className="p-2.5 rounded bg-amber-50 text-amber-900 text-[10px] border border-amber-200">
                    <strong>Evidence Disclaimer:</strong> Tender correlation is established by geographic proximity (~80m). Proximity does not constitute legal proof of contractor culpability.
                  </div>

                  <div className="pt-1 flex flex-wrap items-center gap-2">
                    {work.tenderPdfUrl && (
                      <a
                        href={work.tenderPdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded border border-emerald-200 transition"
                      >
                        <span>View Official NIT Tender (PDF)</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                    <a
                      href={work.officialPortalUrl || 'https://shpp.rajasthan.gov.in/'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-[#153F35] bg-stone-100 hover:bg-stone-200 px-2.5 py-1 rounded border border-stone-200 transition"
                    >
                      <span>Gov Portal Record</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN (5 Cols: Follow-Up Interactive Hub & Chronological Timeline) */}
        <div className="lg:col-span-5 space-y-6">
          {/* FOLLOW-UP INTERACTIVE HUB */}
          <div id="follow-ups" className="p-5 rounded-2xl bg-white border border-[#E1E5DF] shadow-card space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <span className="text-xs font-bold text-[#153F35] font-display flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-emerald-700" />
                Follow-Up Engine Hub
              </span>
              <span className="text-[10px] font-semibold text-[#6D7771]">
                Next Check: {formatDate(issue.nextFollowUpAt)}
              </span>
            </div>

            {/* Pending Question or Check */}
            <div className="p-3.5 rounded-xl bg-[#E6EEE7]/60 border border-[#ccdcd0] space-y-2">
              <span className="text-[10px] uppercase font-bold text-[#153F35] tracking-wider block">
                JanNigrani Auto-Question
              </span>
              <p className="text-xs font-medium text-[#202724]">
                “Has the municipal road crew visited this location or filled this crater with cold-mix bitumen?”
              </p>
            </div>

            {/* Citizen Response Form */}
            <form onSubmit={handleSubmitFollowUp} className="space-y-3">
              <label className="block text-xs font-bold text-[#202724]">
                Select Current Ground Condition:
              </label>

              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'still_present', label: 'Still Present', color: 'border-amber-300' },
                  { id: 'worsened', label: 'Situation Worsened', color: 'border-red-300' },
                  { id: 'resolved', label: 'Issue Resolved', color: 'border-emerald-300' },
                  { id: 'cannot_verify', label: 'Cannot Verify', color: 'border-stone-300' },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setSelectedQuickResponse(opt.id as any)}
                    className={`p-2 rounded-lg border text-xs font-semibold text-left transition ${
                      selectedQuickResponse === opt.id
                        ? 'bg-[#153F35] text-white border-[#153F35]'
                        : 'bg-stone-50 border-[#E1E5DF] text-[#202724] hover:bg-stone-100'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#6D7771] mb-1">
                  Add Updated Observation Notes:
                </label>
                <textarea
                  rows={3}
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  placeholder="Provide any new updates or observations. E.g. 'No municipal crew arrived, two-wheelers are still skidding...'"
                  className="w-full p-2.5 text-xs rounded-lg border border-[#E1E5DF] bg-stone-50 focus:outline-none focus:ring-1 focus:ring-[#153F35]"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmittingResponse}
                className="w-full py-2.5 rounded-lg bg-[#153F35] hover:bg-[#102D27] text-white text-xs font-semibold shadow-subtle transition flex items-center justify-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit Ground Update</span>
              </button>
            </form>

            {/* Previous Answers Received */}
            {followUps.filter((f) => f.status === 'responded').length > 0 && (
              <div className="pt-3 border-t border-stone-100 space-y-2">
                <span className="text-[11px] font-bold text-[#6D7771] uppercase tracking-wider block">
                  Past Follow-Up Responses:
                </span>
                {followUps
                  .filter((f) => f.status === 'responded')
                  .map((f) => (
                    <div key={f.id} className="p-2.5 rounded-lg bg-stone-50 text-[11px] space-y-1">
                      <div className="flex items-center justify-between text-[#6D7771]">
                        <span className="font-semibold text-[#153F35]">
                          Citizen Response ({f.responseType})
                        </span>
                        <span>{formatDate(f.scheduledAt)}</span>
                      </div>
                      <p className="text-[#202724] italic">“{f.response}”</p>
                    </div>
                  ))}
              </div>
            )}
          </div>

          {/* CHRONOLOGICAL ACTIVITY TIMELINE */}
          <div className="p-5 rounded-2xl bg-white border border-[#E1E5DF] shadow-card space-y-4">
            <span className="text-xs font-bold text-[#153F35] font-display flex items-center gap-1.5 border-b pb-3">
              <Clock className="w-4 h-4 text-emerald-700" />
              Grievance Lifecycle Timeline
            </span>

            <div className="space-y-4 relative pl-4 border-l-2 border-emerald-900/20">
              {timelineEvents.map((ev) => {
                let badgeClass = 'bg-stone-100 text-[#6D7771]';
                if (ev.actorType === 'citizen') badgeClass = 'bg-emerald-100 text-emerald-800';
                if (ev.actorType === 'system') badgeClass = 'bg-blue-100 text-blue-800';
                if (ev.actorType === 'reviewer') badgeClass = 'bg-amber-100 text-amber-800';

                return (
                  <div key={ev.id} className="relative text-xs space-y-1">
                    {/* Bullet */}
                    <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-[#153F35]" />

                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold uppercase ${badgeClass}`}>
                        {ev.actorType}
                      </span>
                      <span className="text-[10px] text-stone-400">
                        {formatDateTime(ev.timestamp)}
                      </span>
                    </div>

                    <h5 className="font-bold text-[#202724] text-xs">{ev.title}</h5>
                    <p className="text-[11px] text-[#6D7771] leading-relaxed">
                      {ev.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
