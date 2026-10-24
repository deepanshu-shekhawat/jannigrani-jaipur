import React, { useState } from 'react';
import {
  Building2,
  Search,
  ExternalLink,
  Phone,
  ShieldCheck,
  AlertTriangle,
  HelpCircle,
  ArrowRight,
  BookOpen
} from 'lucide-react';
import { AUTHORITIES_DATA } from '../data/seedData';
import { AuthorityRoutingEngine } from '../services/authorityRoutingEngine';
import { CivicCategory, AuthorityRecommendation } from '../types';
import { CATEGORY_CONFIG } from '../utils/civicHelpers';

export const AuthoritiesPage: React.FC = () => {
  const [authorities] = useState(AUTHORITIES_DATA);
  const [searchQuery, setSearchQuery] = useState('');

  // Interactive "Who is responsible?" simulator state
  const [simCategory, setSimCategory] = useState<CivicCategory>('roads_footpaths');
  const [simLocation, setSimLocation] = useState('JLN Marg');
  const [simResult, setSimResult] = useState<AuthorityRecommendation | null>(null);

  const handleTestRouting = () => {
    const result = AuthorityRoutingEngine.recommend({
      category: simCategory,
      latitude: 26.8610,
      longitude: 75.8110,
      locationLabel: simLocation,
      description: `Testing responsibility for ${simCategory} on ${simLocation}`,
    });
    setSimResult(result);
  };

  const filteredAuthorities = authorities.filter((auth) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match = `${auth.name} ${auth.hindiName} ${auth.jurisdiction} ${auth.statutoryAct}`.toLowerCase();
      if (!match.includes(q)) return false;
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 space-y-10">
      {/* Page Header */}
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-[#153F35] font-display">
          Statutory Directory & Jurisdiction Engine
        </span>
        <h1 className="text-2xl sm:text-3xl font-bold font-display text-[#153F35]">
          Jaipur Civic Authority Directory
        </h1>
        <p className="text-xs sm:text-sm text-[#6D7771] mt-1 max-w-3xl">
          Deterministic jurisdiction mapping across Jaipur Municipal Corporation (Greater & Heritage), Jaipur Development Authority (JDA), Public Works Department (PWD), and PHED.
        </p>
      </div>

      {/* Interactive "Who is Responsible?" Simulator Sandbox */}
      <div className="p-6 rounded-2xl bg-white border-2 border-[#153F35] shadow-card space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-3">
          <div className="flex items-center space-x-2">
            <HelpCircle className="w-5 h-5 text-[#153F35]" />
            <h2 className="text-base font-bold font-display text-[#153F35]">
              “किसका काम है?” — Interactive Authority Discovery Simulator
            </h2>
          </div>
          <span className="text-[10px] uppercase font-bold text-emerald-800 bg-[#E6EEE7] px-2 py-0.5 rounded">
            Statutory Rules Engine
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-[11px] font-semibold text-[#6D7771] mb-1">
              Select Civic Category:
            </label>
            <select
              value={simCategory}
              onChange={(e) => setSimCategory(e.target.value as CivicCategory)}
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
              Jaipur Corridor or Locality:
            </label>
            <select
              value={simLocation}
              onChange={(e) => setSimLocation(e.target.value)}
              className="w-full p-2 text-xs rounded-md border border-[#E1E5DF] bg-stone-50"
            >
              <option value="JLN Marg (100ft Master Plan Road)">JLN Marg (100ft Master Plan Corridor)</option>
              <option value="Sector-2 Malviya Nagar (Colony Road)">Sector-2 Malviya Nagar (Colony Road)</option>
              <option value="Johari Bazar (Walled City Heritage)">Johari Bazar (Walled City Heritage)</option>
              <option value="NH-52 Tonk Road Bypass Corridor">NH-52 Tonk Road Bypass Highway Corridor</option>
              <option value="Amrapali Marg Vaishali Nagar (Pipeline Leak)">Amrapali Marg (Drinking Water Pipeline Leak)</option>
              <option value="VT Road Mansarovar Market">VT Road Mansarovar Market</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={handleTestRouting}
              className="w-full p-2 rounded-md bg-[#153F35] hover:bg-[#102D27] text-white text-xs font-semibold shadow-subtle transition flex items-center justify-center gap-1.5"
            >
              <span>Determine Responsible Authority</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Simulator Output Result */}
        {simResult && (
          <div className="p-4 rounded-xl bg-[#E6EEE7] border border-[#ccdcd0] text-xs space-y-2 animate-in fade-in">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#153F35] text-sm">
                Target Authority: {simResult.authorityName}
              </span>
              <span className="px-2 py-0.5 rounded bg-[#153F35] text-white font-mono font-bold text-[10px]">
                {simResult.confidence.toUpperCase()} CONFIDENCE
              </span>
            </div>
            <p className="text-[#202724] leading-relaxed">
              <strong>Statutory Justification:</strong> {simResult.reason}
            </p>
            <div className="pt-2 border-t border-[#ccdcd0] flex items-center justify-between text-[11px] text-[#6D7771]">
              <span>Act: {simResult.statutoryBasis}</span>
              <span className="font-mono">Rule Ref: {simResult.routingRuleId}</span>
            </div>
          </div>
        )}
      </div>

      {/* Directory Search & Filter */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold font-display text-[#153F35]">
            Jaipur Municipal & State Authorities ({authorities.length})
          </h2>
          <div className="relative w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[#6D7771]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search authority, statutory act..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-md border border-[#E1E5DF] bg-white focus:outline-none focus:ring-1 focus:ring-[#153F35]"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredAuthorities.map((auth) => (
            <div
              key={auth.id}
              className="p-5 rounded-2xl bg-white border border-[#E1E5DF] shadow-subtle hover:shadow-card transition space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="font-mono text-xs font-bold text-[#153F35] bg-[#E6EEE7] px-2 py-0.5 rounded">
                    {auth.code}
                  </span>
                  <h3 className="text-sm font-bold font-display text-[#202724] mt-1">
                    {auth.name}
                  </h3>
                  <span className="text-xs text-[#6D7771] block">{auth.hindiName}</span>
                </div>
                <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Verified Official
                </span>
              </div>

              <div className="space-y-1.5 text-xs">
                <p className="text-[#6D7771]">
                  <strong>Jurisdiction:</strong> {auth.jurisdiction}
                </p>
                <p className="text-[#202724] bg-stone-50 p-2 rounded border border-stone-100">
                  <strong>Statutory Basis:</strong> {auth.statutoryAct}
                </p>
              </div>

              <div className="pt-2 border-t border-stone-100 space-y-2 text-xs">
                <div className="flex items-center justify-between text-[#6D7771]">
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-[#153F35]" />
                    {auth.complaintChannel}
                  </span>
                  <a
                    href={auth.officialWebsite}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#153F35] font-semibold hover:underline flex items-center gap-1"
                  >
                    <span>Official Portal</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                {/* Direct Action Links for Grievance & Tenders */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {auth.complaintPortalUrl && (
                    <a
                      href={auth.complaintPortalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2 py-1 rounded bg-[#153F35] text-white text-[10px] font-semibold flex items-center gap-1 hover:bg-[#102D27] transition"
                    >
                      <span>File Complaint Online</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  )}
                  {auth.trackComplaintUrl && (
                    <a
                      href={auth.trackComplaintUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2 py-1 rounded bg-stone-100 text-[#202724] border border-stone-200 text-[10px] font-semibold flex items-center gap-1 hover:bg-stone-200 transition"
                    >
                      <span>Track Complaint</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  )}
                  {auth.tenderPortalUrl && (
                    <a
                      href={auth.tenderPortalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2 py-1 rounded bg-amber-50 text-amber-900 border border-amber-200 text-[10px] font-semibold flex items-center gap-1 hover:bg-amber-100 transition"
                    >
                      <span>Tenders & EMD</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  )}
                  {auth.faqPortalUrl && (
                    <a
                      href={auth.faqPortalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2 py-1 rounded bg-emerald-50 text-emerald-900 border border-emerald-200 text-[10px] font-semibold flex items-center gap-1 hover:bg-emerald-100 transition"
                    >
                      <span>Citizen FAQ</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Official Government Portals & Public Registers Directory */}
      <div className="p-6 rounded-2xl bg-white border border-[#E1E5DF] shadow-card space-y-6">
        <div className="border-b pb-3">
          <span className="text-[10px] uppercase font-bold text-emerald-800 bg-[#E6EEE7] px-2 py-0.5 rounded">
            Verified External Directories
          </span>
          <h2 className="text-lg font-bold font-display text-[#153F35] mt-1">
            Official Rajasthan & Jaipur Civic Portal Links
          </h2>
          <p className="text-xs text-[#6D7771] mt-0.5">
            Direct access to government procurement systems, municipal grievance portals, and public tender document viewers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Group 1: Jaipur Municipal Corporation */}
          <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#153F35] font-display flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-[#153F35]" />
              Jaipur Municipal Corporation (JMC)
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <a
                  href="https://www.jaipurmc.org/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#153F35] font-semibold hover:underline flex items-center justify-between"
                >
                  <span>Official JMC Portal</span>
                  <ExternalLink className="w-3 h-3 text-[#6D7771]" />
                </a>
                <span className="text-[10px] text-stone-400 block">www.jaipurmc.org</span>
              </li>
              <li>
                <a
                  href="https://www.jaipurmc.org/presentation/Others/JTender.aspx"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#153F35] font-semibold hover:underline flex items-center justify-between"
                >
                  <span>JMC E-Tenders (JTender)</span>
                  <ExternalLink className="w-3 h-3 text-[#6D7771]" />
                </a>
                <span className="text-[10px] text-stone-400 block">Municipal tender publications</span>
              </li>
              <li>
                <a
                  href="https://www.jaipurmc.org/presentation/AboutMcjaipur/MstPdfViewer.aspx?Header=NIT%2FTender&Pageid=6&PdfName=Nit_17598_nitjmcdate48xenanz.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#153F35] font-semibold hover:underline flex items-center justify-between"
                >
                  <span>JMC NIT Tender Document Viewer</span>
                  <ExternalLink className="w-3 h-3 text-[#6D7771]" />
                </a>
                <span className="text-[10px] text-stone-400 block">Direct official PDF viewer</span>
              </li>
              <li>
                <a
                  href="https://samadhan.jaipurmc.org/ComplaintRegistrationByWebsite/AddComplaintRegistrationByWebsite"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-800 font-bold hover:underline flex items-center justify-between"
                >
                  <span>Samadhan: File Complaint Online</span>
                  <ExternalLink className="w-3 h-3 text-emerald-800" />
                </a>
                <span className="text-[10px] text-stone-400 block">Direct online grievance submission</span>
              </li>
              <li>
                <a
                  href="https://samadhan.jaipurmc.org/ComplaintRegistrationByWebsite/SearchComplains"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#153F35] font-semibold hover:underline flex items-center justify-between"
                >
                  <span>Samadhan: Search / Track Grievance</span>
                  <ExternalLink className="w-3 h-3 text-[#6D7771]" />
                </a>
                <span className="text-[10px] text-stone-400 block">Track complaint ticket resolution</span>
              </li>
            </ul>
          </div>

          {/* Group 2: Jaipur Development Authority */}
          <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#153F35] font-display flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-[#153F35]" />
              Jaipur Development Authority (JDA)
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <a
                  href="https://jda.urban.rajasthan.gov.in/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#153F35] font-semibold hover:underline flex items-center justify-between"
                >
                  <span>JDA Official Portal</span>
                  <ExternalLink className="w-3 h-3 text-[#6D7771]" />
                </a>
                <span className="text-[10px] text-stone-400 block">jda.urban.rajasthan.gov.in</span>
              </li>
              <li>
                <a
                  href="https://jdafa.rajasthan.gov.in/TenderEMD"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#153F35] font-semibold hover:underline flex items-center justify-between"
                >
                  <span>JDA Tender EMD Portal</span>
                  <ExternalLink className="w-3 h-3 text-[#6D7771]" />
                </a>
                <span className="text-[10px] text-stone-400 block">Financial Advisor tender bids</span>
              </li>
              <li>
                <a
                  href="https://jdaservice.rajasthan.gov.in/JDAMicroPortalProject/About/FAQDetail/1"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#153F35] font-semibold hover:underline flex items-center justify-between"
                >
                  <span>JDA Citizen Services & FAQ</span>
                  <ExternalLink className="w-3 h-3 text-[#6D7771]" />
                </a>
                <span className="text-[10px] text-stone-400 block">MicroPortal guidelines and citizen FAQs</span>
              </li>
            </ul>
          </div>

          {/* Group 3: Rajasthan State Public Procurement & eProc */}
          <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#153F35] font-display flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-[#153F35]" />
              State Procurement & eProcurement
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <a
                  href="https://shpp.rajasthan.gov.in/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#153F35] font-semibold hover:underline flex items-center justify-between"
                >
                  <span>SHPP State Procurement Portal</span>
                  <ExternalLink className="w-3 h-3 text-[#6D7771]" />
                </a>
                <span className="text-[10px] text-stone-400 block">shpp.rajasthan.gov.in</span>
              </li>
              <li>
                <a
                  href="https://www.eproc.rajasthan.gov.in/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#153F35] font-semibold hover:underline flex items-center justify-between"
                >
                  <span>Rajasthan eProc System</span>
                  <ExternalLink className="w-3 h-3 text-[#6D7771]" />
                </a>
                <span className="text-[10px] text-stone-400 block">eproc.rajasthan.gov.in</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
