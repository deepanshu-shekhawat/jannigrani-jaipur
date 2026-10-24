import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  MapPin,
  Calendar,
  Clock,
  ArrowRight,
  PlusCircle,
  FileText
} from 'lucide-react';
import { StorageService, subscribeToStorage } from '../services/storageService';
import { CivicCategory, CivicIssue, IssueStatus } from '../types';
import { CATEGORY_CONFIG, SEVERITY_CONFIG, STATUS_CONFIG } from '../utils/civicHelpers';
import { formatDate } from '../utils/cn';

interface ComplaintsListPageProps {
  onNavigate: (path: string) => void;
  onSelectIssue: (issue: CivicIssue) => void;
}

export const ComplaintsListPage: React.FC<ComplaintsListPageProps> = ({
  onNavigate,
  onSelectIssue,
}) => {
  const [issues, setIssues] = useState<CivicIssue[]>(StorageService.getIssues());
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const unsub = subscribeToStorage(() => {
      setIssues(StorageService.getIssues());
    });
    return unsub;
  }, []);

  const filteredIssues = issues.filter((iss) => {
    if (statusFilter !== 'all' && iss.status !== statusFilter) return false;
    if (categoryFilter !== 'all' && iss.category !== categoryFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match = `${iss.title} ${iss.description} ${iss.locationLabel} ${iss.id}`.toLowerCase();
      if (!match.includes(q)) return false;
    }
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#153F35] font-display">
            Citizen Grievances Directory
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold font-display text-[#153F35]">
            My Complaints & Tracked Issues
          </h1>
          <p className="text-xs text-[#6D7771] mt-1">
            Browse and inspect verified municipal grievances across Jaipur.
          </p>
        </div>

        <button
          onClick={() => onNavigate('/report')}
          className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-[#153F35] hover:bg-[#102D27] text-white text-xs font-semibold shadow-subtle transition self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Report an Issue</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl bg-white border border-[#E1E5DF] shadow-subtle flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[#6D7771]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by ID (e.g. JN-2026-1001), locality, keyword..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-md border border-[#E1E5DF] bg-stone-50 focus:outline-none focus:ring-1 focus:ring-[#153F35]"
          />
        </div>

        <div className="flex items-center space-x-2">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs rounded-md border border-[#E1E5DF] bg-stone-50"
          >
            <option value="all">All Statuses ({issues.length})</option>
            {Object.entries(STATUS_CONFIG).map(([k, v]) => (
              <option key={k} value={k}>
                {v.label}
              </option>
            ))}
          </select>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs rounded-md border border-[#E1E5DF] bg-stone-50"
          >
            <option value="all">All Categories</option>
            {Object.entries(CATEGORY_CONFIG).map(([k, v]) => (
              <option key={k} value={k}>
                {v.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Issues Grid / List */}
      {filteredIssues.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-[#E1E5DF] space-y-3">
          <FileText className="w-10 h-10 text-stone-300 mx-auto" />
          <h4 className="text-sm font-bold text-[#153F35]">No Complaints Found</h4>
          <p className="text-xs text-[#6D7771]">
            No records matched your search filters. Try clearing your filters or file a new grievance.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredIssues.map((iss) => {
            const cat = CATEGORY_CONFIG[iss.category];
            const stat = STATUS_CONFIG[iss.status];
            const sev = SEVERITY_CONFIG[iss.severity];

            return (
              <div
                key={iss.id}
                onClick={() => onSelectIssue(iss)}
                className="p-5 rounded-2xl bg-white border border-[#E1E5DF] hover:border-[#153F35] shadow-subtle hover:shadow-card transition cursor-pointer flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono font-bold text-[#153F35] bg-[#E6EEE7] px-2 py-0.5 rounded text-[11px]">
                      {iss.id}
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded font-semibold ${stat.bgClass} ${stat.textClass}`}>
                      {stat.label}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold font-display text-[#202724] leading-snug">
                    {iss.title}
                  </h3>

                  <p className="text-xs text-[#6D7771] line-clamp-2 leading-relaxed">
                    {iss.description}
                  </p>
                </div>

                <div className="space-y-3 pt-2 border-t border-stone-100 text-xs">
                  <div className="flex items-center justify-between text-[11px] text-[#6D7771]">
                    <span className="flex items-center gap-1 line-clamp-1">
                      <MapPin className="w-3 h-3 text-[#153F35]" />
                      {iss.locationLabel}
                    </span>
                    <span className="shrink-0">{formatDate(iss.createdAt)}</span>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className={`text-[10px] px-2 py-0.5 rounded font-semibold ${cat.bgClass} ${cat.textClass}`}>
                      {cat.label}
                    </span>
                    <span className="text-[11px] text-[#153F35] font-semibold flex items-center gap-1">
                      Inspect Tracking Plan <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
