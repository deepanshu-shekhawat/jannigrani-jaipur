import {
  CivicIssue,
  PublicWork,
  Authority,
  Contractor,
  FollowUp,
  IssueTimelineEvent,
  DataSource,
  NotificationItem,
  UserRole,
  AIAnalysis,
} from '../types';
import {
  INITIAL_CIVIC_ISSUES,
  PUBLIC_WORKS_DATA,
  AUTHORITIES_DATA,
  CONTRACTORS_DATA,
  INITIAL_FOLLOWUPS,
  INITIAL_TIMELINE_EVENTS,
  DATA_SOURCES,
  INITIAL_NOTIFICATIONS,
  INITIAL_AI_ANALYSIS,
} from '../data/seedData';

const STORAGE_KEYS = {
  ISSUES: 'jannigrani_issues_v3',
  PUBLIC_WORKS: 'jannigrani_public_works_v3',
  AUTHORITIES: 'jannigrani_authorities_v3',
  CONTRACTORS: 'jannigrani_contractors_v3',
  FOLLOWUPS: 'jannigrani_followups_v3',
  TIMELINE: 'jannigrani_timeline_v3',
  NOTIFICATIONS: 'jannigrani_notifications_v3',
  SOURCES: 'jannigrani_sources_v3',
  ROLE: 'jannigrani_user_role_v3',
  SIMULATION_OFFSET: 'jannigrani_simulation_offset_days_v3',
  AI_ANALYSIS: 'jannigrani_ai_analysis_v3',
};

// Event listener for reactivity across components
const storageListeners: Set<() => void> = new Set();

export const subscribeToStorage = (listener: () => void) => {
  storageListeners.add(listener);
  return () => {
    storageListeners.delete(listener);
  };
};

const notifyListeners = () => {
  storageListeners.forEach((fn) => {
    try {
      fn();
    } catch (e) {
      console.error('Storage listener error:', e);
    }
  });
};

export const StorageService = {
  init() {
    if (!localStorage.getItem(STORAGE_KEYS.ISSUES) || !localStorage.getItem(STORAGE_KEYS.PUBLIC_WORKS)) {
      this.resetDemoData();
    }
  },

  resetDemoData() {
    localStorage.setItem(STORAGE_KEYS.ISSUES, JSON.stringify(INITIAL_CIVIC_ISSUES));
    localStorage.setItem(STORAGE_KEYS.PUBLIC_WORKS, JSON.stringify(PUBLIC_WORKS_DATA));
    localStorage.setItem(STORAGE_KEYS.AUTHORITIES, JSON.stringify(AUTHORITIES_DATA));
    localStorage.setItem(STORAGE_KEYS.CONTRACTORS, JSON.stringify(CONTRACTORS_DATA));
    localStorage.setItem(STORAGE_KEYS.FOLLOWUPS, JSON.stringify(INITIAL_FOLLOWUPS));
    localStorage.setItem(STORAGE_KEYS.TIMELINE, JSON.stringify(INITIAL_TIMELINE_EVENTS));
    localStorage.setItem(STORAGE_KEYS.SOURCES, JSON.stringify(DATA_SOURCES));
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(INITIAL_NOTIFICATIONS));
    localStorage.setItem(STORAGE_KEYS.ROLE, 'public');
    localStorage.setItem(STORAGE_KEYS.SIMULATION_OFFSET, '0');
    localStorage.setItem(STORAGE_KEYS.AI_ANALYSIS, JSON.stringify(INITIAL_AI_ANALYSIS));
    notifyListeners();
  },

  // AI Analysis Records
  getAiAnalyses(): Record<string, AIAnalysis> {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.AI_ANALYSIS);
      return data ? JSON.parse(data) : INITIAL_AI_ANALYSIS;
    } catch {
      return INITIAL_AI_ANALYSIS;
    }
  },

  getAiAnalysisById(id?: string): AIAnalysis | undefined {
    if (!id) return undefined;
    const all = this.getAiAnalyses();
    return all[id];
  },

  saveAiAnalysis(analysis: AIAnalysis) {
    const all = this.getAiAnalyses();
    all[analysis.id] = analysis;
    localStorage.setItem(STORAGE_KEYS.AI_ANALYSIS, JSON.stringify(all));
    notifyListeners();
  },

  // Issues
  getIssues(): CivicIssue[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ISSUES);
      return data ? JSON.parse(data) : INITIAL_CIVIC_ISSUES;
    } catch {
      return INITIAL_CIVIC_ISSUES;
    }
  },

  getIssueById(id: string): CivicIssue | undefined {
    const issues = this.getIssues();
    return issues.find((issue) => issue.id.toLowerCase() === id.toLowerCase());
  },

  saveIssue(newIssue: CivicIssue) {
    const issues = this.getIssues();
    const existingIndex = issues.findIndex((i) => i.id === newIssue.id);
    if (existingIndex >= 0) {
      issues[existingIndex] = newIssue;
    } else {
      issues.unshift(newIssue);
    }
    localStorage.setItem(STORAGE_KEYS.ISSUES, JSON.stringify(issues));
    notifyListeners();
  },

  updateIssue(id: string, updates: Partial<CivicIssue>) {
    const issues = this.getIssues();
    const index = issues.findIndex((i) => i.id === id);
    if (index >= 0) {
      issues[index] = { ...issues[index], ...updates, updatedAt: new Date().toISOString() };
      localStorage.setItem(STORAGE_KEYS.ISSUES, JSON.stringify(issues));
      notifyListeners();
    }
  },

  // Public Works
  getPublicWorks(): PublicWork[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PUBLIC_WORKS);
      if (!data) return PUBLIC_WORKS_DATA;
      const parsed: PublicWork[] = JSON.parse(data);
      // Auto-upgrade cache if new contracts or officialPortalUrls are added
      if (!parsed || parsed.length < PUBLIC_WORKS_DATA.length || !parsed.some((p) => p.officialPortalUrl)) {
        localStorage.setItem(STORAGE_KEYS.PUBLIC_WORKS, JSON.stringify(PUBLIC_WORKS_DATA));
        return PUBLIC_WORKS_DATA;
      }
      return parsed;
    } catch {
      return PUBLIC_WORKS_DATA;
    }
  },

  getPublicWorkById(id: string): PublicWork | undefined {
    const works = this.getPublicWorks();
    return works.find((w) => w.id === id);
  },

  // Authorities
  getAuthorities(): Authority[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.AUTHORITIES);
      return data ? JSON.parse(data) : AUTHORITIES_DATA;
    } catch {
      return AUTHORITIES_DATA;
    }
  },

  // Contractors
  getContractors(): Contractor[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CONTRACTORS);
      return data ? JSON.parse(data) : CONTRACTORS_DATA;
    } catch {
      return CONTRACTORS_DATA;
    }
  },

  // Follow-ups
  getFollowUps(issueId?: string): FollowUp[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.FOLLOWUPS);
      const all: FollowUp[] = data ? JSON.parse(data) : INITIAL_FOLLOWUPS;
      if (issueId) {
        return all.filter((f) => f.issueId === issueId);
      }
      return all;
    } catch {
      return INITIAL_FOLLOWUPS;
    }
  },

  saveFollowUp(followUp: FollowUp) {
    const followUps = this.getFollowUps();
    const idx = followUps.findIndex((f) => f.id === followUp.id);
    if (idx >= 0) {
      followUps[idx] = followUp;
    } else {
      followUps.unshift(followUp);
    }
    localStorage.setItem(STORAGE_KEYS.FOLLOWUPS, JSON.stringify(followUps));
    notifyListeners();
  },

  // Timeline
  getTimelineEvents(issueId?: string): IssueTimelineEvent[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TIMELINE);
      const all: IssueTimelineEvent[] = data ? JSON.parse(data) : INITIAL_TIMELINE_EVENTS;
      if (issueId) {
        return all.filter((e) => e.issueId === issueId).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
      }
      return all.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    } catch {
      return INITIAL_TIMELINE_EVENTS;
    }
  },

  addTimelineEvent(event: IssueTimelineEvent) {
    const events = this.getTimelineEvents();
    events.push(event);
    localStorage.setItem(STORAGE_KEYS.TIMELINE, JSON.stringify(events));
    notifyListeners();
  },

  // Data Sources
  getDataSources(): DataSource[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SOURCES);
      return data ? JSON.parse(data) : DATA_SOURCES;
    } catch {
      return DATA_SOURCES;
    }
  },

  // Notifications
  getNotifications(): NotificationItem[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
      return data ? JSON.parse(data) : INITIAL_NOTIFICATIONS;
    } catch {
      return INITIAL_NOTIFICATIONS;
    }
  },

  addNotification(notif: NotificationItem) {
    const notifs = this.getNotifications();
    notifs.unshift(notif);
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifs));
    notifyListeners();
  },

  markNotificationRead(id: string) {
    const notifs = this.getNotifications();
    const target = notifs.find((n) => n.id === id);
    if (target) {
      target.read = true;
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifs));
      notifyListeners();
    }
  },

  markAllNotificationsRead() {
    const notifs = this.getNotifications();
    notifs.forEach((n) => (n.read = true));
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifs));
    notifyListeners();
  },

  // User Role
  getUserRole(): UserRole {
    return (localStorage.getItem(STORAGE_KEYS.ROLE) as UserRole) || 'public';
  },

  setUserRole(role: UserRole) {
    localStorage.setItem(STORAGE_KEYS.ROLE, role);
    notifyListeners();
  },

  // Time Machine / Simulation
  getSimulationOffsetDays(): number {
    return parseFloat(localStorage.getItem(STORAGE_KEYS.SIMULATION_OFFSET) || '0');
  },

  advanceSimulationDays(days: number) {
    const current = this.getSimulationOffsetDays();
    const updated = current + days;
    localStorage.setItem(STORAGE_KEYS.SIMULATION_OFFSET, updated.toString());
    notifyListeners();
  },

  resetSimulationClock() {
    localStorage.setItem(STORAGE_KEYS.SIMULATION_OFFSET, '0');
    notifyListeners();
  },

  getSimulatedNow(): Date {
    const offsetDays = this.getSimulationOffsetDays();
    const base = new Date('2026-10-24T19:00:00Z');
    base.setTime(base.getTime() + offsetDays * 24 * 60 * 60 * 1000);
    return base;
  }
};

// Auto-initialize on import
StorageService.init();
