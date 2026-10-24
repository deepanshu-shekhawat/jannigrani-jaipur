import React, { useState, useEffect } from 'react';
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  MapPin,
  Sparkles,
  ArrowRight,
  Filter,
  Search,
  Activity,
  Layers,
  Building2,
  Calendar
} from 'lucide-react';
import { StorageService, subscribeToStorage } from '../services/storageService';
import { CivicIssue, FollowUp, IssueTimelineEvent } from '../types';
import { CATEGORY_CONFIG, SEVERITY_CONFIG, STATUS_CONFIG } from '../utils/civicHelpers';
import { formatDate, formatDateTime } from '../utils/cn';
import { JaipurCivicMap } from '../components/map/JaipurCivicMap';

interface DashboardPageProps {
  onNavigate: (path: string) => void;
  onSelectIssue: (issue: CivicIssue) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onNavigate,
  onSelectIssue,
}) => {
  const [issues, setIssues] = useState<CivicIssue[]>(StorageService.getIssues());
  const [followUps, setFollowUps] = useState<FollowUp[]>(StorageService.getFollowUps());
  const [timelineEvents, setTimelineEvents] = useState<IssueTimelineEvent[]>(StorageService.getTimelineEvents());

  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const unsub = subscribeToStorage(() => {
      setIssues(StorageService.getIssues());
      setFollowUps(StorageService.getFollowUps());
      setTimelineEvents(StorageService.getTimelineEvents());
    });
    return unsub;
  }, []);

  // Compute live prototype metrics dynamically from dataset
  const totalReports = issues.length;
  const awaitingReview = issues.filter((i) => i.status === 'under_review' || i.status === 'submitted' || i.status === 'needs_attention').length;
  const recentUpdates = issues.filter((i) => {
    const updated = new Date(i.updatedAt).getTime();
    const created = new Date(i.createdAt).getTime();
    return updated > created;
  }).length;
  const markedResolved = issues.filter((i) => i.status === 'citizen_resolved' || i.status === 'closed_in_demo').length;
  const pendingFollowUps = followUps.filter((f) => f.status === 'sent' || f.status === 'scheduled').length;

  // Filtered issues
  const filteredIssues = issues.filter((issue) => {
    if (categoryFilter !== 'all' && issue.category !== categoryFilter) return false;
    if (statusFilter !== 'all' && issue.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match = `${issue.title} ${issue.description} ${issue.locationLabel} ${issue.id}`.toLowerCase();
      if (!match.includes(q)) return false;
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#153F35] font-display">
            City Intelligence Overview
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold font-display text-[#153F35]">
            Jaipur Civic Dashboard
          </h1>
          <p className="text-xs text-[#6D7771] mt-1">
            Dynamic telemetry derived from {totalReports} indexed grievances across 250 municipal wards.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => onNavigate('/report')}
            className="px-4 py-2 rounded-lg bg-[#153F35] hover:bg-[#102D27] text-white text-xs font-semibold shadow-subtle transition"
          >
            + Report New Issue
          </button>
          <button
            onClick={() => onNavigate('/map')}
            className="px-4 py-2 rounded-lg border border-[#E1E5DF] bg-white hover:bg-stone-50 text-xs font-semibold text-[#153F35] shadow-subtle transition"
          >
            Open Full Map
          </button>
        </div>
      </div>

      {/* 5 Dynamic Summary Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="p-4 rounded-xl bg-white border border-[#E1E5DF] shadow-subtle space-y-1">
          <span className="text-[11px] font-semibold text-[#6D7771]">Total Reports</span>
          <div className="text-2xl font-bold font-display text-[#153F35]">{totalReports}</div>
          <span className="text-[10px] text-stone-400">Live local dataset</span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#E1E5DF] shadow-subtle space-y-1">
          <span className="text-[11px] font-semibold text-[#6D7771]">Awaiting Review</span>
          <div className="text-2xl font-bold font-display text-amber-700">{awaitingReview}</div>
          <span className="text-[10px] text-stone-400">Triage queue</span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#E1E5DF] shadow-subtle space-y-1">
          <span className="text-[11px] font-semibold text-[#6D7771]">Recent Updates</span>
          <div className="text-2xl font-bold font-display text-emerald-800">{recentUpdates}</div>
          <span className="text-[10px] text-stone-400">Active telemetry</span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#E1E5DF] shadow-subtle space-y-1">
          <span className="text-[11px] font-semibold text-[#6D7771]">Marked Resolved</span>
          <div className="text-2xl font-bold font-display text-[#153F35]">{markedResolved}</div>
          <span className="text-[10px] text-stone-400">Citizen verified</span>
        </div>

        <div className="col-span-2 md:col-span-1 p-4 rounded-xl bg-[#E6EEE7] border border-[#ccdcd0] shadow-subtle space-y-1">
          <span className="text-[11px] font-bold text-[#153F35]">Follow-Ups Due</span>
          <div className="text-2xl font-bold font-display text-[#153F35]">{pendingFollowUps}</div>
          <span className="text-[10px] text-emerald-800 font-medium">FollowUpEngine queue</span>
        </div>
      </div>

      {/* Mid Grid: Embedded Map & Activity Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Embedded Dashboard Mini-Map */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-[#E1E5DF] p-4 shadow-card space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#153F35] font-display flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" />
              Active Jaipur Hotspots
            </span>
            <button
              onClick={() => onNavigate('/map')}
              className="text-[11px] text-[#153F35] font-semibold hover:underline flex items-center gap-1"
            >
              <span>Explore fullscreen</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="h-72 w-full rounded-xl overflow-hidden border border-[#E1E5DF]">
            <JaipurCivicMap
              issues={issues}
              zoom={11}
              onSelectIssue={(iss) => onSelectIssue(iss)}
              interactive={true}
            />
          </div>
        </div>

        {/* Activity Stream (Simulated events labelled as prototype activity) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-[#E1E5DF] p-4 shadow-card flex flex-col">
          <div className="flex items-center justify-between border-b pb-3 mb-3">
            <span className="text-xs font-bold text-[#153F35] font-display flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5" />
              Recent Activity Feed
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-stone-100 text-[#6D7771]">
              Simulated Events
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 max-h-72 pr-1">
            {timelineEvents.slice(0, 7).map((ev) => (
              <div
                key={ev.id}
                onClick={() => {
                  const target = issues.find((i) => i.id === ev.issueId);
                  if (target) onSelectIssue(target);
                }}
                className="p-2.5 rounded-lg border border-stone-100 bg-[#F7F7F2] hover:border-[#153F35] cursor-pointer transition text-xs space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-[#153F35] text-[10px]">
                    {ev.issueId}
                  </span>
                  <span className="text-[10px] text-stone-400">
                    {formatDate(ev.timestamp)}
                  </span>
                </div>
                <h5 className="font-bold text-[#202724] text-[11px]">{ev.title}</h5>
                <p className="text-[10px] text-[#6D7771] line-clamp-1">{ev.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Reports Filterable Table */}
      <div className="bg-white rounded-2xl border border-[#E1E5DF] shadow-card overflow-hidden">
        {/* Table Filters Header */}
        <div className="p-4 sm:p-5 border-b border-[#E1E5DF] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <h3 className="text-sm font-bold font-display text-[#153F35]">
              Recent Grievance Reports ({filteredIssues.length})
            </h3>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Search */}
            <div className="relative w-48 sm:w-60">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-[#6D7771]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search description, locality..."
                className="w-full pl-8 pr-2 py-1.5 text-xs rounded-md border border-[#E1E5DF] bg-stone-50 focus:outline-none focus:ring-1 focus:ring-[#153F35]"
              />
            </div>

            {/* Category */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="text-xs px-2.5 py-1.5 rounded-md border border-[#E1E5DF] bg-stone-50"
            >
              <option value="all">All Categories</option>
              {Object.entries(CATEGORY_CONFIG).map(([k, v]) => (
                <option key={k} value={k}>
                  {v.label}
                </option>
              ))}
            </select>

            {/* Status */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs px-2.5 py-1.5 rounded-md border border-[#E1E5DF] bg-stone-50"
            >
              <option value="all">All Statuses</option>
              {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                <option key={k} value={k}>
                  {v.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Table Content */}
        {filteredIssues.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <FileText className="w-10 h-10 text-stone-300 mx-auto" />
            <h4 className="text-sm font-bold text-[#153F35]">No reports match your filters</h4>
            <p className="text-xs text-[#6D7771]">
              Try adjusting your search criteria or report a new civic issue in Jaipur.
            </p>
            <button
              onClick={() => onNavigate('/report')}
              className="px-4 py-2 rounded-lg bg-[#153F35] text-white text-xs font-semibold shadow-subtle"
            >
              Submit First Report
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F7F7F2] text-[#6D7771] border-b border-[#E1E5DF] font-semibold text-[11px]">
                <tr>
                  <th className="py-3 px-4">Report ID</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Next Follow-Up</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredIssues.map((iss) => {
                  const cat = CATEGORY_CONFIG[iss.category];
                  const stat = STATUS_CONFIG[iss.status];

                  return (
                    <tr
                      key={iss.id}
                      onClick={() => onSelectIssue(iss)}
                      className="hover:bg-stone-50 cursor-pointer transition"
                    >
                      <td className="py-3 px-4 font-mono font-bold text-[#153F35]">
                        {iss.id}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`text-[10px] px-2 py-0.5 rounded font-semibold ${cat.bgClass} ${cat.textClass}`}>
                          {cat.label}
                        </span>
                      </td>
                      <td className="py-3 px-4 max-w-xs">
                        <div className="font-bold text-[#202724] truncate">{iss.title}</div>
                        <div className="text-[11px] text-[#6D7771] truncate">{iss.description}</div>
                      </td>
                      <td className="py-3 px-4 max-w-xs text-[#6D7771] truncate">
                        {iss.locationLabel}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`text-[10px] px-2 py-0.5 rounded font-semibold ${stat.bgClass} ${stat.textClass}`}>
                          {stat.label}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-[#6D7771] whitespace-nowrap">
                        {formatDate(iss.nextFollowUpAt)}
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <button className="text-[11px] text-[#153F35] font-semibold hover:underline">
                          Details →
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
