import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  MapPin,
  List,
  Navigation,
  RotateCcw,
  PlusCircle,
  X,
  ChevronRight,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  Briefcase,
  Layers,
  Building2,
  FileCheck
} from 'lucide-react';
import { StorageService, subscribeToStorage } from '../services/storageService';
import { CivicCategory, CivicIssue, IssueSeverity, IssueStatus, PublicWork } from '../types';
import { CATEGORY_CONFIG, SEVERITY_CONFIG, STATUS_CONFIG } from '../utils/civicHelpers';
import { formatDate } from '../utils/cn';
import { JaipurCivicMap, JAIPUR_CENTER } from '../components/map/JaipurCivicMap';

interface MapPageProps {
  onNavigate: (path: string) => void;
  onSelectIssue: (issue: CivicIssue) => void;
  onReportAtLocation: (lat: number, lng: number) => void;
}

const JAIPUR_SEARCH_LOCALITIES = [
  { name: 'Malviya Nagar (Sector 2 / GT)', lat: 26.8538, lng: 75.8162 },
  { name: 'Mansarovar (VT Road)', lat: 26.8624, lng: 75.7675 },
  { name: 'Vaishali Nagar (Amrapali Circle)', lat: 26.9025, lng: 75.7410 },
  { name: 'Raja Park (LBS College)', lat: 26.8968, lng: 75.8290 },
  { name: 'C-Scheme (Statue Circle)', lat: 26.9085, lng: 75.8035 },
  { name: 'Tonk Road (Gopalpura)', lat: 26.8765, lng: 75.7984 },
  { name: 'Jagatpura (Mahal Road)', lat: 26.8228, lng: 75.8645 },
  { name: 'Jhotwara (Niwaru Road)', lat: 26.9452, lng: 75.7360 },
  { name: 'Sanganer (Stadium Road)', lat: 26.8148, lng: 75.7718 },
  { name: 'Vidyadhar Nagar (Central Spine)', lat: 26.9655, lng: 75.7812 },
  { name: 'Johari Bazar (Walled City)', lat: 26.9242, lng: 75.8265 },
];

export const MapPage: React.FC<MapPageProps> = ({
  onNavigate,
  onSelectIssue,
  onReportAtLocation,
}) => {
  const [issues, setIssues] = useState<CivicIssue[]>(StorageService.getIssues());
  const [works, setWorks] = useState<PublicWork[]>(StorageService.getPublicWorks());
  const [selectedIssue, setSelectedIssue] = useState<CivicIssue | null>(null);
  const [selectedWork, setSelectedWork] = useState<PublicWork | null>(null);

  // Layer filter: 'all' | 'issues' | 'works'
  const [layerFilter, setLayerFilter] = useState<'all' | 'issues' | 'works'>('all');

  // Issue Filters
  const [selectedCategory, setSelectedCategory] = useState<CivicCategory | 'all'>('all');
  const [selectedStatus, setSelectedStatus] = useState<IssueStatus | 'all'>('all');
  const [selectedSeverity, setSelectedSeverity] = useState<IssueSeverity | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isListView, setIsListView] = useState(false);
  const [listTab, setListTab] = useState<'issues' | 'works'>('issues');

  // Map viewport control
  const [mapCenter, setMapCenter] = useState<[number, number]>(JAIPUR_CENTER);
  const [mapZoom, setMapZoom] = useState(12);

  useEffect(() => {
    const unsub = subscribeToStorage(() => {
      setIssues(StorageService.getIssues());
      setWorks(StorageService.getPublicWorks());
    });
    return unsub;
  }, []);

  // Filter issues logic
  const filteredIssues = issues.filter((issue) => {
    if (selectedCategory !== 'all' && issue.category !== selectedCategory) return false;
    if (selectedStatus !== 'all' && issue.status !== selectedStatus) return false;
    if (selectedSeverity !== 'all' && issue.severity !== selectedSeverity) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchText = `${issue.title} ${issue.description} ${issue.locationLabel} ${issue.id}`.toLowerCase();
      if (!matchText.includes(q)) return false;
    }
    return true;
  });

  // Filter works logic
  const filteredWorks = works.filter((work) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchText = `${work.title} ${work.description} ${work.projectLocation} ${work.tenderReference} ${work.contractorName || ''} ${work.department}`.toLowerCase();
      if (!matchText.includes(q)) return false;
    }
    return true;
  });

  const handleReturnToJaipur = () => {
    setMapCenter(JAIPUR_CENTER);
    setMapZoom(12);
    setSelectedIssue(null);
    setSelectedWork(null);
  };

  const handleSelectLocality = (loc: typeof JAIPUR_SEARCH_LOCALITIES[0]) => {
    setMapCenter([loc.lat, loc.lng]);
    setMapZoom(15);
    setSearchQuery(loc.name);
  };

  const handleClearFilters = () => {
    setSelectedCategory('all');
    setSelectedStatus('all');
    setSelectedSeverity('all');
    setSearchQuery('');
    setLayerFilter('all');
  };

  const activeFilterCount =
    (selectedCategory !== 'all' ? 1 : 0) +
    (selectedStatus !== 'all' ? 1 : 0) +
    (selectedSeverity !== 'all' ? 1 : 0) +
    (layerFilter !== 'all' ? 1 : 0);

  return (
    <div className="relative h-[calc(100vh-6rem)] w-full overflow-hidden flex flex-col">
      {/* Top Floating Control Bar */}
      <div className="absolute top-4 left-4 right-4 z-30 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        {/* Left: Search & Filter Stack */}
        <div className="flex flex-wrap items-center gap-2 pointer-events-auto">
          {/* Locality Search Input */}
          <div className="relative w-64 sm:w-72 shadow-elevated rounded-lg">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#6D7771]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Jaipur locality, ward, or contractor..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-[#E1E5DF] bg-white text-[#202724] focus:outline-none focus:ring-2 focus:ring-[#153F35]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2.5 text-stone-400 hover:text-stone-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Layer Filter Toggle (All / Citizen Grievances / Road Contracts) */}
          <div className="bg-white border border-[#E1E5DF] shadow-elevated rounded-lg p-0.5 flex items-center text-xs">
            <button
              onClick={() => setLayerFilter('all')}
              className={`px-2.5 py-1.5 rounded-md font-medium transition ${
                layerFilter === 'all'
                  ? 'bg-[#153F35] text-white shadow-xs'
                  : 'text-[#6D7771] hover:text-[#202724]'
              }`}
            >
              All ({filteredIssues.length + filteredWorks.length})
            </button>
            <button
              onClick={() => setLayerFilter('issues')}
              className={`px-2.5 py-1.5 rounded-md font-medium transition flex items-center gap-1 ${
                layerFilter === 'issues'
                  ? 'bg-[#153F35] text-white shadow-xs'
                  : 'text-[#6D7771] hover:text-[#202724]'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
              <span>Grievances ({filteredIssues.length})</span>
            </button>
            <button
              onClick={() => setLayerFilter('works')}
              className={`px-2.5 py-1.5 rounded-md font-medium transition flex items-center gap-1 ${
                layerFilter === 'works'
                  ? 'bg-[#0F3D3E] text-white shadow-xs'
                  : 'text-[#6D7771] hover:text-[#202724]'
              }`}
            >
              <span className="w-2 h-2 rounded-xs bg-emerald-500 inline-block" />
              <span>Road Contracts ({filteredWorks.length})</span>
            </button>
          </div>

          {/* Category Dropdown Filter (only active when issues are visible) */}
          {layerFilter !== 'works' && (
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as any)}
              className="px-3 py-2 text-xs rounded-lg border border-[#E1E5DF] bg-white text-[#202724] shadow-elevated focus:outline-none focus:ring-1 focus:ring-[#153F35] pointer-events-auto"
            >
              <option value="all">All Categories ({issues.length})</option>
              {Object.entries(CATEGORY_CONFIG).map(([k, v]) => (
                <option key={k} value={k}>
                  {v.label}
                </option>
              ))}
            </select>
          )}

          {activeFilterCount > 0 && (
            <button
              onClick={handleClearFilters}
              className="px-2.5 py-2 text-xs rounded-lg bg-stone-100 hover:bg-stone-200 text-[#202724] shadow-subtle border border-[#E1E5DF] pointer-events-auto flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Clear ({activeFilterCount})</span>
            </button>
          )}
        </div>

        {/* Right: Actions (Return to Jaipur, Map/List Toggle, Report Here) */}
        <div className="flex items-center space-x-2 pointer-events-auto">
          <button
            onClick={handleReturnToJaipur}
            className="px-3 py-2 rounded-lg bg-white border border-[#E1E5DF] hover:bg-stone-50 text-xs font-semibold text-[#153F35] shadow-elevated transition flex items-center gap-1.5"
            title="Center map on Jaipur municipal core"
          >
            <Navigation className="w-3.5 h-3.5 text-[#153F35]" />
            <span className="hidden sm:inline">Return to Jaipur</span>
          </button>

          <button
            onClick={() => setIsListView(!isListView)}
            className="px-3 py-2 rounded-lg bg-white border border-[#E1E5DF] hover:bg-stone-50 text-xs font-semibold text-[#202724] shadow-elevated transition flex items-center gap-1.5"
          >
            <List className="w-3.5 h-3.5" />
            <span>{isListView ? 'Show Map' : 'List View'}</span>
          </button>

          <button
            onClick={() => onReportAtLocation(mapCenter[0], mapCenter[1])}
            className="px-3.5 py-2 rounded-lg bg-[#153F35] hover:bg-[#102D27] text-white text-xs font-semibold shadow-elevated transition flex items-center gap-1.5"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Report at This Location</span>
            <span className="sm:hidden">Report</span>
          </button>
        </div>
      </div>

      {/* Main View: Leaflet Canvas or List View */}
      {isListView ? (
        <div className="flex-1 bg-white overflow-y-auto p-4 sm:p-6 mt-16 max-w-5xl mx-auto w-full">
          {/* List View Tabs */}
          <div className="flex items-center space-x-2 border-b border-[#E1E5DF] pb-3 mb-4">
            <button
              onClick={() => setListTab('issues')}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition ${
                listTab === 'issues'
                  ? 'bg-[#153F35] text-white'
                  : 'bg-stone-100 text-[#6D7771] hover:text-[#202724]'
              }`}
            >
              Citizen Grievances ({filteredIssues.length})
            </button>
            <button
              onClick={() => setListTab('works')}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition ${
                listTab === 'works'
                  ? 'bg-[#0F3D3E] text-white'
                  : 'bg-stone-100 text-[#6D7771] hover:text-[#202724]'
              }`}
            >
              Official Road Contracts & Tenders ({filteredWorks.length})
            </button>
          </div>

          {listTab === 'issues' ? (
            <div className="divide-y divide-stone-100 border border-[#E1E5DF] rounded-xl overflow-hidden">
              {filteredIssues.map((iss) => {
                const cat = CATEGORY_CONFIG[iss.category];
                const stat = STATUS_CONFIG[iss.status];
                const sev = SEVERITY_CONFIG[iss.severity];

                return (
                  <div
                    key={iss.id}
                    onClick={() => onSelectIssue(iss)}
                    className="p-4 hover:bg-stone-50 cursor-pointer transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono font-bold text-[#153F35] bg-[#E6EEE7] px-2 py-0.5 rounded text-[11px]">
                          {iss.id}
                        </span>
                        <span className={`text-[10px] px-2 py-0.5 rounded font-semibold ${cat.bgClass} ${cat.textClass}`}>
                          {cat.label}
                        </span>
                        <span className={`text-[10px] px-2 py-0.5 rounded font-semibold ${stat.bgClass} ${stat.textClass}`}>
                          {stat.label}
                        </span>
                        <span className={`text-[10px] px-2 py-0.5 rounded font-semibold ${sev.bgClass} ${sev.textClass}`}>
                          {sev.label}
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-[#202724]">{iss.title}</h4>
                      <p className="text-xs text-[#6D7771] line-clamp-1">{iss.description}</p>
                      <p className="text-[11px] text-[#6D7771] flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-[#153F35]" />
                        {iss.locationLabel}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[11px] text-stone-400 block mb-1">
                        {formatDate(iss.createdAt)}
                      </span>
                      <button className="px-3 py-1 rounded bg-[#153F35] text-white text-[11px] font-semibold">
                        Inspect Details →
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredWorks.map((work) => {
                const portalUrl = work.officialPortalUrl || 'https://shpp.rajasthan.gov.in/';
                let portalDomain = 'Official Gov Portal';
                try {
                  portalDomain = new URL(portalUrl).hostname.replace('www.', '');
                } catch {
                  portalDomain = 'Official Gov Portal';
                }

                return (
                  <div
                    key={work.id}
                    className="p-4 rounded-xl border border-[#E1E5DF] bg-stone-50/50 hover:bg-stone-50 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs"
                  >
                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono font-bold text-[#0F3D3E] bg-emerald-50 px-2 py-0.5 rounded text-[11px]">
                          {work.tenderReference}
                        </span>
                        {work.projectStatus === 'dlp_active' ? (
                          <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-emerald-100 text-emerald-800">
                            🛡️ DLP Warranty Active
                          </span>
                        ) : (
                          <span className="text-[10px] px-2 py-0.5 rounded font-semibold bg-amber-100 text-amber-800">
                            In Progress
                          </span>
                        )}
                        <span className="text-[10px] px-2 py-0.5 rounded bg-stone-200 text-[#202724] font-medium">
                          {work.department}
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-[#202724]">{work.title}</h4>
                      <p className="text-xs text-[#6D7771] line-clamp-2">{work.description}</p>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-[11px]">
                        <div>
                          <strong className="text-stone-500">Contractor:</strong>{' '}
                          <span className="font-semibold text-[#153F35]">
                            {work.contractorName || 'Not Disclosed'}
                          </span>
                          {work.contractorClass && (
                            <span className="text-[10px] text-stone-500 block">
                              ({work.contractorClass})
                            </span>
                          )}
                        </div>
                        <div>
                          <strong className="text-stone-500">Contract Amount:</strong>{' '}
                          <span className="font-mono font-bold text-[#153F35]">
                            {work.contractValue || 'Under Bid'}
                          </span>
                        </div>
                        <div>
                          <strong className="text-stone-500">Warranty Expiry:</strong>{' '}
                          <span className="font-medium">
                            {work.dlpWarrantyExpiry ? formatDate(work.dlpWarrantyExpiry) : 'Standard'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 shrink-0 sm:w-48">
                      <a
                        href={portalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full px-3 py-2 rounded-lg bg-[#0F3D3E] hover:bg-[#0A2A2B] text-white text-[11px] font-bold transition flex items-center justify-center gap-1.5 shadow-subtle text-center"
                      >
                        <span>Visit {portalDomain}</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                      <button
                        onClick={() => {
                          setMapCenter([work.latitude, work.longitude]);
                          setMapZoom(16);
                          setSelectedWork(work);
                          setIsListView(false);
                        }}
                        className="w-full px-3 py-1.5 rounded-lg bg-white border border-[#E1E5DF] hover:bg-stone-100 text-[#153F35] text-[11px] font-semibold transition text-center"
                      >
                        Pinpoint on Map
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* Fullscreen Interactive Leaflet Canvas */
        <div className="flex-1 w-full relative">
          <JaipurCivicMap
            issues={filteredIssues}
            selectedIssueId={selectedIssue?.id}
            onSelectIssue={(iss) => {
              setSelectedIssue(iss);
              setSelectedWork(null);
            }}
            publicWorks={filteredWorks}
            selectedWorkId={selectedWork?.id}
            onSelectWork={(w) => {
              setSelectedWork(w);
              setSelectedIssue(null);
            }}
            showIssues={layerFilter === 'all' || layerFilter === 'issues'}
            showPublicWorks={layerFilter === 'all' || layerFilter === 'works'}
            onReportAtLocation={onReportAtLocation}
            center={mapCenter}
            zoom={mapZoom}
            interactive={true}
          />

          {/* Bottom Left: Selected Issue Marker Preview Drawer */}
          {selectedIssue && (
            <div className="absolute bottom-6 left-6 z-30 max-w-sm w-full bg-white rounded-2xl shadow-elevated border border-[#E1E5DF] p-4 animate-in slide-in-from-bottom-5">
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className="font-mono text-xs font-bold text-[#153F35] bg-[#E6EEE7] px-2.5 py-0.5 rounded">
                  {selectedIssue.id}
                </span>
                <button
                  onClick={() => setSelectedIssue(null)}
                  className="text-stone-400 hover:text-stone-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {selectedIssue.imageUrl && (
                <img
                  src={selectedIssue.imageUrl}
                  alt={selectedIssue.title}
                  className="w-full h-32 object-cover rounded-lg mb-2.5 border border-[#E1E5DF]"
                />
              )}

              <h4 className="text-xs font-bold font-display text-[#202724] leading-snug mb-1">
                {selectedIssue.title}
              </h4>
              <p className="text-[11px] text-[#6D7771] line-clamp-2 mb-2 leading-relaxed">
                {selectedIssue.description}
              </p>

              <div className="p-2 rounded bg-stone-50 border border-stone-100 text-[10px] text-[#6D7771] mb-3">
                <strong className="text-[#202724]">Location:</strong> {selectedIssue.locationLabel}
              </div>

              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] text-stone-400">
                  Reported {formatDate(selectedIssue.createdAt)}
                </span>
                <button
                  onClick={() => onSelectIssue(selectedIssue)}
                  className="px-3 py-1.5 rounded-md bg-[#153F35] text-white text-xs font-semibold hover:bg-[#102D27] transition flex items-center gap-1"
                >
                  <span>Inspect Intelligence</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Bottom Left: Selected Public Work / Contractor Preview Drawer */}
          {selectedWork && (
            <div className="absolute bottom-6 left-6 z-30 max-w-md w-full bg-white rounded-2xl shadow-elevated border border-[#0F3D3E]/20 p-4 animate-in slide-in-from-bottom-5">
              <div className="flex items-start justify-between gap-2 mb-2.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-xs font-bold text-[#0F3D3E] bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-100">
                    {selectedWork.tenderReference}
                  </span>
                  {selectedWork.projectStatus === 'dlp_active' ? (
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-emerald-600" />
                      DLP Warranty Active
                    </span>
                  ) : (
                    <span className="text-[10px] font-semibold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                      In Progress
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setSelectedWork(null)}
                  className="text-stone-400 hover:text-stone-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <h4 className="text-sm font-bold font-display text-[#153F35] leading-snug mb-1">
                {selectedWork.title}
              </h4>
              <p className="text-[11px] text-[#6D7771] line-clamp-2 mb-2 leading-relaxed">
                {selectedWork.description}
              </p>

              {/* Contract Information Grid */}
              <div className="p-3 rounded-xl bg-stone-50 border border-[#E1E5DF] text-xs space-y-1.5 mb-3">
                <div className="flex justify-between items-start gap-2">
                  <span className="text-stone-500 text-[11px]">Contractor:</span>
                  <div className="text-right">
                    <span className="font-bold text-[#202724] block">
                      {selectedWork.contractorName || 'Govt Enlisted Agency'}
                    </span>
                    {selectedWork.contractorClass && (
                      <span className="text-[10px] text-stone-500 font-medium">
                        {selectedWork.contractorClass}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex justify-between items-center text-[11px] pt-1 border-t border-stone-200/60">
                  <span className="text-stone-500">Department:</span>
                  <span className="font-medium text-[#202724]">{selectedWork.department}</span>
                </div>

                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-stone-500">Contract Value:</span>
                  <span className="font-mono font-bold text-[#153F35]">
                    {selectedWork.contractValue || 'Under Bid'}
                  </span>
                </div>

                {selectedWork.dlpWarrantyExpiry && (
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-stone-500">Warranty Expiry:</span>
                    <span className="font-bold text-emerald-800">
                      {formatDate(selectedWork.dlpWarrantyExpiry)}
                    </span>
                  </div>
                )}
              </div>

              {/* Action Buttons: Direct Gov Portal Link + Registry Details */}
              <div className="space-y-2">
                {selectedWork.tenderPdfUrl && (
                  <a
                    href={selectedWork.tenderPdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 px-3 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-subtle"
                  >
                    <span>View Official NIT Tender (PDF)</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
                <a
                  href={selectedWork.officialPortalUrl || 'https://shpp.rajasthan.gov.in/'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-3 rounded-lg bg-[#0F3D3E] hover:bg-[#0A2A2B] text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-subtle"
                >
                  <span>Visit Official Government Portal</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                <div className="flex items-center justify-between text-[11px] pt-1">
                  <span className="text-stone-400">
                    Published {formatDate(selectedWork.publicationDate)}
                  </span>
                  <button
                    onClick={() => onNavigate('/public-works')}
                    className="text-[#153F35] font-semibold hover:underline flex items-center gap-1"
                  >
                    <span>View in Tender Registry</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
