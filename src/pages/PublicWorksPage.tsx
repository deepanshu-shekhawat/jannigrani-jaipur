import React, { useState, useEffect } from 'react';
import {
  Search,
  Layers,
  Building2,
  Calendar,
  FileCheck,
  ShieldCheck,
  AlertTriangle,
  ExternalLink,
  ChevronRight,
  X,
  MapPin
} from 'lucide-react';
import { StorageService, subscribeToStorage } from '../services/storageService';
import { PublicWork, CivicIssue } from '../types';
import { formatDate } from '../utils/cn';

interface PublicWorksPageProps {
  onNavigate: (path: string) => void;
  onSelectIssue: (issue: CivicIssue) => void;
}

export const PublicWorksPage: React.FC<PublicWorksPageProps> = ({
  onNavigate,
  onSelectIssue,
}) => {
  const [works, setWorks] = useState<PublicWork[]>(StorageService.getPublicWorks());
  const [issues, setIssues] = useState<CivicIssue[]>(StorageService.getIssues());
  const [selectedWork, setSelectedWork] = useState<PublicWork | null>(null);

  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const unsub = subscribeToStorage(() => {
      setWorks(StorageService.getPublicWorks());
      setIssues(StorageService.getIssues());
    });
    return unsub;
  }, []);

  const filteredWorks = works.filter((w) => {
    if (departmentFilter !== 'all' && !w.department.toLowerCase().includes(departmentFilter.toLowerCase()))
      return false;
    if (statusFilter !== 'all' && w.projectStatus !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match = `${w.title} ${w.description} ${w.projectLocation} ${w.tenderReference} ${w.contractorName || ''}`.toLowerCase();
      if (!match.includes(q)) return false;
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 space-y-6">
      {/* Page Header */}
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-[#153F35] font-display">
          Public Records & Tender Accountability
        </span>
        <h1 className="text-2xl sm:text-3xl font-bold font-display text-[#153F35]">
          Jaipur Public Works & Tender Registry
        </h1>
        <p className="text-xs sm:text-sm text-[#6D7771] mt-1 max-w-3xl">
          Search verified civil contracts, road bitumen overlays, drainage tenders, and active Defect Liability Period (DLP) contractor warranties across Jaipur.
        </p>
      </div>

      {/* Accountability Legal Disclosure */}
      <div className="p-4 rounded-xl bg-stone-100 border border-stone-200 text-xs text-[#6D7771] flex items-start space-x-3">
        <ShieldCheck className="w-5 h-5 text-[#153F35] shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-bold text-[#202724]">Public Works Integrity Standard:</span>
          <p className="leading-relaxed">
            All records are indexed from the State Public Procurement Portal (SHPP Rajasthan), Rajasthan eProc, and municipal portals (Jaipur MC & JDA). Proximity of a public works contract to a citizen grievance does not automatically prove contractor culpability.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl bg-white border border-[#E1E5DF] shadow-subtle flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[#6D7771]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tender reference (e.g. NIT No. 38), contractor, locality..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-md border border-[#E1E5DF] bg-stone-50 focus:outline-none focus:ring-1 focus:ring-[#153F35]"
          />
        </div>

        <div className="flex items-center space-x-2">
          {/* Department Filter */}
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs rounded-md border border-[#E1E5DF] bg-stone-50"
          >
            <option value="all">All Departments</option>
            <option value="Greater">JMC Greater</option>
            <option value="Heritage">JMC Heritage</option>
            <option value="JDA">Jaipur Development Authority (JDA)</option>
            <option value="PHED">PHED (Water Works)</option>
            <option value="Smart City">Jaipur Smart City</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs rounded-md border border-[#E1E5DF] bg-stone-50"
          >
            <option value="all">All Statuses</option>
            <option value="dlp_active">DLP Warranty Active</option>
            <option value="in_progress">Work In Progress</option>
            <option value="tender_published">Tender Published</option>
            <option value="bid_awarded">Bid Awarded</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Works Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredWorks.map((work) => {
          const isDlp = work.projectStatus === 'dlp_active';
          return (
            <div
              key={work.id}
              onClick={() => setSelectedWork(work)}
              className="p-5 rounded-2xl bg-white border border-[#E1E5DF] hover:border-[#153F35] shadow-subtle hover:shadow-card transition cursor-pointer flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono font-bold text-[#153F35] bg-[#E6EEE7] px-2 py-0.5 rounded text-[11px]">
                    {work.tenderReference}
                  </span>
                  {isDlp ? (
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
                      DLP Warranty Active
                    </span>
                  ) : (
                    <span className="text-[10px] px-2 py-0.5 rounded bg-stone-100 text-stone-700 font-medium capitalize">
                      {work.projectStatus.replace('_', ' ')}
                    </span>
                  )}
                </div>

                <h3 className="text-sm font-bold font-display text-[#202724] leading-snug">
                  {work.title}
                </h3>

                <p className="text-xs text-[#6D7771] line-clamp-2 leading-relaxed">
                  {work.description}
                </p>
              </div>

              <div className="space-y-2 pt-3 border-t border-stone-100 text-xs">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-[#6D7771]">
                    Department: <strong className="text-[#202724]">{work.department}</strong>
                  </span>
                  <span className="font-mono font-bold text-[#153F35]">
                    {work.contractValue || 'Bid Pending'}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] text-[#6D7771]">
                  <span>
                    Contractor: <strong className="text-[#202724]">{work.contractorName || 'Not Disclosed'}</strong>
                    {work.contractorClass && (
                      <span className="text-[10px] text-stone-400 block">{work.contractorClass}</span>
                    )}
                  </span>
                  <span>{formatDate(work.publicationDate)}</span>
                </div>

                {work.dlpWarrantyExpiry && (
                  <div className="p-2 rounded bg-emerald-50/70 border border-emerald-200/60 text-[10px] text-emerald-900 flex items-center justify-between">
                    <span>Legal Defect Liability Expiry:</span>
                    <strong className="font-mono">{formatDate(work.dlpWarrantyExpiry)}</strong>
                  </div>
                )}

                <div className="pt-1 flex items-center justify-between gap-2 border-t border-stone-100">
                  <span className="text-[10px] text-stone-400">Official Record</span>
                  <div className="flex items-center gap-2">
                    {work.tenderPdfUrl && (
                      <a
                        href={work.tenderPdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-2 py-0.5 rounded border border-emerald-200 transition"
                      >
                        <span>NIT PDF</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    )}
                    <a
                      href={work.officialPortalUrl || 'https://shpp.rajasthan.gov.in/'}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-[#0F3D3E] hover:text-[#153F35] hover:underline"
                    >
                      <span>Visit Gov Portal</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Work Detail Drawer Modal */}
      {selectedWork && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-elevated border border-[#E1E5DF] max-w-2xl w-full p-6 space-y-5 max-h-[90vh] overflow-y-auto animate-in zoom-in-95">
            <div className="flex items-start justify-between">
              <div>
                <span className="font-mono text-xs font-bold text-[#153F35] bg-[#E6EEE7] px-2.5 py-0.5 rounded">
                  {selectedWork.tenderReference}
                </span>
                <h3 className="text-base font-bold font-display text-[#153F35] mt-1.5">
                  {selectedWork.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedWork(null)}
                className="text-stone-400 hover:text-stone-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-[#202724] leading-relaxed">
              {selectedWork.description}
            </p>

            <div className="p-4 rounded-xl bg-stone-50 border border-[#E1E5DF] grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="block text-[10px] text-stone-400">Department</span>
                <span className="font-semibold text-[#202724]">{selectedWork.department}</span>
              </div>
              <div>
                <span className="block text-[10px] text-stone-400">Contract Value</span>
                <span className="font-semibold text-[#153F35] font-mono">{selectedWork.contractValue || 'Under Bid'}</span>
              </div>
              <div>
                <span className="block text-[10px] text-stone-400">Contractor Name & Class</span>
                <span className="font-semibold text-[#202724] block">
                  {selectedWork.contractorName || 'Not Disclosed'}
                </span>
                {selectedWork.contractorClass && (
                  <span className="text-[10px] text-[#6D7771] block font-medium">
                    {selectedWork.contractorClass}
                  </span>
                )}
              </div>
              <div>
                <span className="block text-[10px] text-stone-400">Publication Date</span>
                <span className="font-semibold text-[#202724]">{formatDate(selectedWork.publicationDate)}</span>
              </div>
            </div>

            {selectedWork.dlpWarrantyExpiry && (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 space-y-1">
                <span className="font-bold flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-700" />
                  Active Defect Liability Period (DLP)
                </span>
                <p className="text-[11px] leading-relaxed text-emerald-800">
                  This work is legally under contractor guarantee until <strong>{formatDate(selectedWork.dlpWarrantyExpiry)}</strong>. Defective asphalt or cracked edging within this period must be repaired at contractor expense without fresh public tender costs.
                </p>
              </div>
            )}

            <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                {selectedWork.tenderPdfUrl && (
                  <a
                    href={selectedWork.tenderPdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-subtle transition"
                  >
                    <span>View Official NIT Tender (PDF)</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
                <a
                  href={selectedWork.officialPortalUrl || 'https://shpp.rajasthan.gov.in/'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-lg bg-[#0F3D3E] hover:bg-[#0A2A2B] text-white text-xs font-bold flex items-center gap-1.5 shadow-subtle transition"
                >
                  <span>Visit Official Gov Portal</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
              <button
                onClick={() => setSelectedWork(null)}
                className="px-4 py-2 rounded-lg bg-stone-100 hover:bg-stone-200 text-[#202724] text-xs font-semibold"
              >
                Close Registry Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
