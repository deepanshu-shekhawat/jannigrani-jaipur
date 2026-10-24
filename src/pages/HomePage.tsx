import React, { useState, useEffect } from 'react';
import {
  ArrowRight,
  MapPin,
  Sparkles,
  Building2,
  FileText,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Layers,
  ChevronRight,
  ExternalLink,
  Search,
  Activity,
  AlertCircle
} from 'lucide-react';
import { StorageService, subscribeToStorage } from '../services/storageService';
import { CivicIssue, PublicWork } from '../types';
import { CATEGORY_CONFIG, SEVERITY_CONFIG, STATUS_CONFIG } from '../utils/civicHelpers';
import { formatDate } from '../utils/cn';
import { JaipurCivicMap } from '../components/map/JaipurCivicMap';

interface HomePageProps {
  onNavigate: (path: string) => void;
  onSelectIssue: (issue: CivicIssue) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate, onSelectIssue }) => {
  const [issues, setIssues] = useState<CivicIssue[]>(StorageService.getIssues());
  const [publicWorks, setPublicWorks] = useState<PublicWork[]>(StorageService.getPublicWorks());

  useEffect(() => {
    const unsub = subscribeToStorage(() => {
      setIssues(StorageService.getIssues());
      setPublicWorks(StorageService.getPublicWorks());
    });
    return unsub;
  }, []);

  // Compute live prototype metrics
  const totalReports = issues.length;
  const underReviewCount = issues.filter((i) => i.status === 'under_review' || i.status === 'needs_attention').length;
  const routedCount = issues.filter((i) => i.status === 'routed_in_prototype' || i.status === 'in_progress').length;
  const resolvedCount = issues.filter((i) => i.status === 'citizen_resolved' || i.status === 'closed_in_demo').length;

  const sampleIssue = issues[0] || null;
  const sampleWork = publicWorks[0] || null;

  return (
    <div className="space-y-24 pb-20">
      {/* 1. HERO SECTION (Editorial Phenomenon-Studio Aesthetic) */}
      <section className="relative pt-12 md:pt-20 px-4 sm:px-6 max-w-7xl mx-auto">
        <div className="space-y-6 max-w-3xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#E6EEE7] border border-[#ccdcd0] text-[#153F35] text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-[#153F35] animate-pulse" />
            <span>Jaipur Civic Intelligence Platform</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold font-display text-[#153F35] tracking-tight leading-[1.08]">
            Your city has issues. <br />
            <span className="text-stone-500 font-medium">Now it has a way forward.</span>
          </h1>

          <p className="text-base sm:text-xl text-[#6D7771] leading-relaxed max-w-2xl font-normal">
            Report civic problems, discover the right authority, explore public records, and follow what happens next.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => onNavigate('/report')}
              className="px-6 py-3.5 rounded-lg bg-[#153F35] hover:bg-[#102D27] text-white text-sm font-semibold shadow-card hover:shadow-hover transition transform active:scale-95 flex items-center gap-2"
            >
              <span>Report a Problem</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onNavigate('/map')}
              className="px-6 py-3.5 rounded-lg border border-[#E1E5DF] bg-white hover:bg-stone-50 text-[#153F35] text-sm font-semibold shadow-subtle transition flex items-center gap-2"
            >
              <span>Explore the Civic Map</span>
              <MapPin className="w-4 h-4 text-[#153F35]" />
            </button>
          </div>

          <p className="text-xs text-[#6D7771] pt-1 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#153F35]" />
            <span>Built for transparent reporting and evidence-led civic accountability.</span>
          </p>
        </div>

        {/* HERO VISUAL: High-Quality Product Composition Preview */}
        <div className="mt-14 relative rounded-2xl border border-[#E1E5DF] bg-white p-4 sm:p-6 shadow-elevated overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Embedded Live Map Composition */}
            <div className="lg:col-span-7 h-80 sm:h-96 rounded-xl overflow-hidden border border-[#E1E5DF] relative isolate z-0">
              <JaipurCivicMap
                issues={issues.slice(0, 10)}
                publicWorks={publicWorks}
                zoom={12}
                onSelectIssue={(iss) => onSelectIssue(iss)}
                onSelectWork={(work) => onNavigate('/public-works')}
                interactive={true}
              />
              <div className="absolute top-3 left-3 z-10 pointer-events-none bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-lg shadow-card border border-[#E1E5DF] text-xs">
                <span className="font-bold text-[#153F35]">Live Jaipur Civic & Road Works Layer</span>
                <span className="text-[10px] text-[#6D7771] block">
                  {issues.length} Citizen Hotspots • {publicWorks.length} Road Contracts & Tenders
                </span>
              </div>
            </div>

            {/* Overlapping Connected Product Intelligence Cards */}
            <div className="lg:col-span-5 space-y-4">
              {/* Card 1: Sample Road Damage Grievance */}
              {sampleIssue && (
                <div
                  onClick={() => onSelectIssue(sampleIssue)}
                  className="p-4 rounded-xl border border-[#E1E5DF] bg-[#F7F7F2] hover:border-[#153F35] transition cursor-pointer space-y-2"
                >
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-mono font-bold text-[#153F35] bg-[#E6EEE7] px-2 py-0.5 rounded">
                      {sampleIssue.id}
                    </span>
                    <span className="text-[#6D7771]">{formatDate(sampleIssue.createdAt)}</span>
                  </div>
                  <h4 className="text-xs font-bold text-[#202724] line-clamp-1">
                    {sampleIssue.title}
                  </h4>
                  <p className="text-[11px] text-[#6D7771] line-clamp-2">
                    {sampleIssue.description}
                  </p>
                  <div className="flex items-center gap-2 pt-1">
                    <span className="text-[10px] px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-semibold">
                      Roads & Footpaths
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold">
                      JMC Greater (Malviya Nagar)
                    </span>
                  </div>
                </div>
              )}

              {/* Card 2: AI Analysis Insight Card */}
              <div className="p-4 rounded-xl border border-emerald-900/10 bg-[#E6EEE7]/50 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#153F35] flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
                    AI Vision & Statutory Routing
                  </span>
                  <span className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                    94% Confidence
                  </span>
                </div>
                <p className="text-[11px] text-[#202724] leading-relaxed">
                  Visible evidence: Circular asphalt crater with disintegrated aggregate. Correlated to Sec 200 of Rajasthan Municipalities Act 2009.
                </p>
              </div>

              {/* Card 3: Connected Tender NIT 38 Match */}
              {sampleWork && (
                <div
                  onClick={() => onNavigate('/public-works')}
                  className="p-3.5 rounded-xl border border-[#E1E5DF] bg-white hover:border-[#153F35] transition cursor-pointer text-xs space-y-1"
                >
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="font-bold text-[#153F35] uppercase tracking-wider">
                      Proximity Tender Match (80m)
                    </span>
                    <span className="text-emerald-700 font-semibold">DLP Active</span>
                  </div>
                  <h5 className="text-[11px] font-bold text-[#202724] line-clamp-1">
                    {sampleWork.title}
                  </h5>
                  <p className="text-[10px] text-[#6D7771]">
                    Tender: {sampleWork.tenderReference} • {sampleWork.contractorName}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 2. PROBLEM STATEMENT SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="border-t border-[#E1E5DF] pt-16">
          <div className="max-w-2xl mb-12 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#153F35] font-display">
              The Civic Disconnect
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold font-display text-[#153F35]">
              A civic issue is only the beginning.
            </h2>
            <p className="text-sm text-[#6D7771] leading-relaxed">
              When problems arise on our streets, the path from citizen grievance to municipal resolution is obstructed by institutional ambiguity and broken communication loops.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {[
              {
                num: '01',
                title: 'Institutional Ping-Pong',
                desc: 'Citizens often do not know whether a road belongs to JMC, JDA, or PWD, leading to complaints being repeatedly transferred and dismissed.',
              },
              {
                num: '02',
                title: 'Evidence Ambiguity',
                desc: 'Reports frequently lack precise coordinates or structured photographic evidence required for engineering triage.',
              },
              {
                num: '03',
                title: 'Buried Public Records',
                desc: 'Citizens have no easy way to discover if a newly damaged road is still covered under a contractor’s legal Defect Liability Period (DLP).',
              },
              {
                num: '04',
                title: 'One-Way Silence',
                desc: 'Filing a complaint often leads to a dead end without scheduled follow-ups, timeline tracking, or verification requests.',
              },
              {
                num: '05',
                title: 'Isolated Hotspots',
                desc: 'Repeated local failures across neighborhoods remain invisible without geospatial intelligence linking recurring issues.',
              },
            ].map((prob) => (
              <div
                key={prob.num}
                className="p-5 rounded-xl border border-[#E1E5DF] bg-white space-y-2 hover:border-[#153F35] transition"
              >
                <span className="font-mono text-sm font-bold text-[#153F35]">
                  {prob.num}
                </span>
                <h3 className="text-sm font-bold font-display text-[#202724]">
                  {prob.title}
                </h3>
                <p className="text-xs text-[#6D7771] leading-relaxed">
                  {prob.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. HOW IT WORKS (Capture, Understand, Route, Follow up) */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="border-t border-[#E1E5DF] pt-16">
          <div className="max-w-2xl mb-12 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#153F35] font-display">
              Four-Stage Engine
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold font-display text-[#153F35]">
              How JanNigrani Works
            </h2>
            <p className="text-sm text-[#6D7771] leading-relaxed">
              From natural voice capture to statutory routing and automated timeline monitoring.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              {
                step: '01',
                title: 'Capture',
                subtitle: 'Evidence & Location',
                desc: 'Share a photo, pin the exact spot on OpenStreetMap, and speak your description in Hindi or English using Web Speech transcription.',
                tag: 'Multi-Modal Input',
              },
              {
                step: '02',
                title: 'Understand',
                subtitle: 'AI Feature Extraction',
                desc: 'The vision model analyzes surface textures, depth hazard indicators, and classifies the problem into verified civic taxonomies.',
                tag: 'Computer Vision',
              },
              {
                step: '03',
                title: 'Route',
                subtitle: 'Statutory Discovery',
                desc: 'The deterministic rules engine matches jurisdiction boundaries (JMC Greater, Heritage, JDA, PWD, PHED) under statutory acts.',
                tag: 'Rules Engine',
              },
              {
                step: '04',
                title: 'Follow Up',
                subtitle: 'Continuous Monitoring',
                desc: 'The Follow-Up Engine schedules milestone checks at 24h, 3d, and 7d, asking contextual verification questions and updating the timeline.',
                tag: 'FollowUpEngine',
              },
            ].map((item) => (
              <div
                key={item.step}
                className="p-6 rounded-2xl border border-[#E1E5DF] bg-white relative space-y-3 hover:shadow-card transition"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-[#153F35] bg-[#E6EEE7] px-2.5 py-1 rounded">
                    Stage {item.step}
                  </span>
                  <span className="text-[10px] text-[#6D7771] font-semibold">
                    {item.tag}
                  </span>
                </div>
                <h3 className="text-base font-bold font-display text-[#153F35]">
                  {item.title} <span className="text-stone-400 font-normal">— {item.subtitle}</span>
                </h3>
                <p className="text-xs text-[#6D7771] leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. PRODUCT PREVIEW & LIVE METRICS DASHBOARD */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="rounded-2xl border border-[#E1E5DF] bg-[#F7F7F2] p-6 sm:p-10 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#153F35] font-display">
                Prototype Dataset Live State
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold font-display text-[#153F35]">
                Civic Intelligence Dashboard
              </h2>
            </div>
            <button
              onClick={() => onNavigate('/dashboard')}
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-[#153F35] hover:bg-[#102D27] text-white text-xs font-semibold shadow-subtle transition"
            >
              <span>Open Full Dashboard</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* 4 Dynamic Metric Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-white border border-[#E1E5DF] space-y-1">
              <span className="text-[11px] text-[#6D7771] font-semibold">Total Grievances</span>
              <div className="text-2xl font-bold font-display text-[#153F35]">{totalReports}</div>
              <span className="text-[10px] text-stone-400">Indexed in Jaipur database</span>
            </div>

            <div className="p-4 rounded-xl bg-white border border-[#E1E5DF] space-y-1">
              <span className="text-[11px] text-[#6D7771] font-semibold">Under Review / Urgent</span>
              <div className="text-2xl font-bold font-display text-amber-700">{underReviewCount}</div>
              <span className="text-[10px] text-stone-400">Awaiting reviewer triage</span>
            </div>

            <div className="p-4 rounded-xl bg-white border border-[#E1E5DF] space-y-1">
              <span className="text-[11px] text-[#6D7771] font-semibold">Routed in Prototype</span>
              <div className="text-2xl font-bold font-display text-emerald-800">{routedCount}</div>
              <span className="text-[10px] text-stone-400">Statutory authority assigned</span>
            </div>

            <div className="p-4 rounded-xl bg-white border border-[#E1E5DF] space-y-1">
              <span className="text-[11px] text-[#6D7771] font-semibold">Citizen Confirmed Resolved</span>
              <div className="text-2xl font-bold font-display text-[#153F35]">{resolvedCount}</div>
              <span className="text-[10px] text-stone-400">Verified via follow-ups</span>
            </div>
          </div>

          {/* Recent Reports Mini-Table */}
          <div className="bg-white rounded-xl border border-[#E1E5DF] overflow-hidden">
            <div className="px-5 py-3 border-b border-[#E1E5DF] flex items-center justify-between text-xs">
              <span className="font-bold text-[#153F35] font-display">
                Recent Civic Grievance Reports (Jaipur)
              </span>
              <span className="text-[10px] text-[#6D7771]">Demonstration Records</span>
            </div>

            <div className="divide-y divide-stone-100">
              {issues.slice(0, 5).map((iss) => {
                const stat = STATUS_CONFIG[iss.status];
                const cat = CATEGORY_CONFIG[iss.category];
                return (
                  <div
                    key={iss.id}
                    onClick={() => onSelectIssue(iss)}
                    className="px-5 py-3.5 hover:bg-stone-50 cursor-pointer transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono font-bold text-[#153F35] text-[11px]">
                          {iss.id}
                        </span>
                        <span className={`text-[10px] px-2 py-0.5 rounded font-semibold ${cat.bgClass} ${cat.textClass}`}>
                          {cat.label}
                        </span>
                        <span className={`text-[10px] px-2 py-0.5 rounded font-semibold ${stat.bgClass} ${stat.textClass}`}>
                          {stat.label}
                        </span>
                      </div>
                      <h4 className="font-bold text-[#202724]">{iss.title}</h4>
                      <p className="text-[11px] text-[#6D7771] flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-[#153F35]" />
                        {iss.locationLabel}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[11px] text-[#6D7771]">
                        Reported {formatDate(iss.createdAt)}
                      </span>
                      <span className="text-[10px] text-[#153F35] font-semibold block">
                        Inspect Intelligence →
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* 5. PUBLIC WORKS & ACCOUNTABILITY SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center border-t border-[#E1E5DF] pt-16">
          <div className="lg:col-span-6 space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-[#153F35] font-display">
              Public Works & Defect Liability
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold font-display text-[#153F35] leading-tight">
              Evidence-Led Municipal Accountability
            </h2>
            <p className="text-xs sm:text-sm text-[#6D7771] leading-relaxed">
              JanNigrani cross-references citizen grievances with official public works gazettes, tender notices, and contractor warranty periods. If a road was recently constructed under NIT No. 38, citizens can verify whether repairs fall under the contractor’s legal Defect Liability Period (DLP).
            </p>
            <div className="p-3.5 rounded-lg bg-stone-100 border border-stone-200 text-xs text-[#6D7771]">
              <strong className="text-[#202724]">Non-Accusatory Standard:</strong> Proximity to an active tender is an informational indicator. JanNigrani does not make unsubstantiated claims of contractor liability without statutory audit confirmation.
            </div>
            <div>
              <button
                onClick={() => onNavigate('/public-works')}
                className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-[#153F35] text-white text-xs font-semibold hover:bg-[#102D27] transition shadow-subtle"
              >
                <span>Explore Public Works Explorer</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="lg:col-span-6 bg-white rounded-2xl border border-[#E1E5DF] p-6 shadow-card space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <span className="text-xs font-bold text-[#153F35] font-display">
                Featured Verified Tender Record
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#E6EEE7] text-[#153F35]">
                SHPP & JMC Verified
              </span>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-mono font-bold text-stone-500">
                NIT No. 38 XEN MNZ (Tender ID: 2026_DLB_603503_1)
              </span>
              <h4 className="text-sm font-bold text-[#202724]">
                Construction of Damar Road Around Sector-2 Shateshwar Mahadev Temple Park
              </h4>
              <p className="text-xs text-[#6D7771]">
                Contract Value: <strong>₹ 48,75,000</strong> • Department: JMC Greater Malviya Nagar Zone
              </p>
              <div className="p-2.5 rounded bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-900 flex items-center justify-between">
                <span>Contractor: <strong>Shree Krishna Infrastructure</strong></span>
                <span className="font-bold">DLP Warranty: Valid to Mar 2029</span>
              </div>
              <div className="pt-1 flex items-center gap-2">
                <a
                  href="https://www.jaipurmc.org/presentation/AboutMcjaipur/MstPdfViewer.aspx?Header=NIT%2FTender&Pageid=6&PdfName=Nit_17598_nitjmcdate48xenanz.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 hover:text-emerald-950 underline"
                >
                  <span>View Official NIT Tender (PDF)</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
                <span className="text-stone-300">•</span>
                <a
                  href="https://shpp.rajasthan.gov.in/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-[#153F35] hover:underline"
                >
                  <span>SHPP Rajasthan</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. CLOSING CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="rounded-3xl bg-[#153F35] text-white p-8 sm:p-14 text-center space-y-5 shadow-elevated">
          <span className="text-xs uppercase tracking-wider text-emerald-300 font-semibold font-display">
            Active Citizen Participation
          </span>
          <h2 className="text-3xl sm:text-5xl font-bold font-display text-white">
            Start with what you see.
          </h2>
          <p className="text-xs sm:text-sm text-stone-300 max-w-lg mx-auto leading-relaxed">
            Report what is broken, discover the responsible authority, and help maintain Jaipur’s public infrastructure through evidence and follow-up.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
            <button
              onClick={() => onNavigate('/report')}
              className="px-6 py-3 rounded-lg bg-white text-[#153F35] hover:bg-stone-100 text-xs sm:text-sm font-bold shadow-subtle transition"
            >
              Report a Civic Issue
            </button>
            <button
              onClick={() => onNavigate('/map')}
              className="px-6 py-3 rounded-lg border border-emerald-700 hover:bg-[#102D27] text-white text-xs sm:text-sm font-semibold transition"
            >
              Explore Jaipur on the Map
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
