import React, { useState, useEffect, useRef } from 'react';
import {
  ShieldAlert,
  Bell,
  MapPin,
  FileText,
  Building2,
  Clock,
  RotateCcw,
  Sparkles,
  ChevronDown,
  CheckCircle2,
  AlertTriangle,
  Menu,
  X,
  Compass,
  ArrowRight,
  UserCheck
} from 'lucide-react';
import { StorageService, subscribeToStorage } from '../services/storageService';
import { FollowUpEngine } from '../services/followUpEngine';
import { NotificationItem, UserRole } from '../types';
import { formatDate } from '../utils/cn';

interface NavbarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentPath, onNavigate }) => {
  const [role, setRole] = useState<UserRole>(StorageService.getUserRole());
  const [notifications, setNotifications] = useState<NotificationItem[]>(StorageService.getNotifications());
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isRoleOpen, setIsRoleOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [simulatedDate, setSimulatedDate] = useState<Date>(StorageService.getSimulatedNow());
  const [showResetModal, setShowResetModal] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const roleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsubscribe = subscribeToStorage(() => {
      setRole(StorageService.getUserRole());
      setNotifications(StorageService.getNotifications());
      setSimulatedDate(StorageService.getSimulatedNow());
    });

    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotifOpen(false);
      }
      if (roleRef.current && !roleRef.current.contains(e.target as Node)) {
        setIsRoleOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      unsubscribe();
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleAdvanceDays = (days: number) => {
    StorageService.advanceSimulationDays(days);
    const result = FollowUpEngine.runFollowUpEvaluation();
    if (result.newFollowUpsCount > 0) {
      // Trigger notification feedback
    }
  };

  const handleRunFollowUpCheck = () => {
    const result = FollowUpEngine.runFollowUpEvaluation();
    alert(`Follow-up check completed! Evaluated ${result.evaluatedIssuesCount} issues. Generated ${result.newFollowUpsCount} new scheduled follow-up actions.`);
  };

  const handleResetData = () => {
    StorageService.resetDemoData();
    setShowResetModal(false);
    onNavigate('/');
  };

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'Explore Map', path: '/map' },
    { label: 'Public Works', path: '/public-works' },
    { label: 'Authorities', path: '/authorities' },
    ...(role === 'citizen' || role === 'admin'
      ? [
          { label: 'Dashboard', path: '/dashboard' },
          { label: 'My Complaints', path: '/complaints' },
        ]
      : []),
    ...(role === 'admin' ? [{ label: 'Admin Workspace', path: '/admin' }] : []),
  ];

  return (
    <header className="sticky top-0 z-[100] bg-[#F7F7F2]/95 backdrop-blur-md border-b border-[#E1E5DF]">
      {/* Top Prototype & Time Simulation Bar */}
      <div className="bg-[#153F35] text-white text-xs py-1.5 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-700/80 text-emerald-100 uppercase tracking-wider">
              Prototype Mode
            </span>
            <span className="hidden sm:inline text-stone-200">
              Jaipur Civic Intelligence & Public Accountability Platform
            </span>
            <span className="text-emerald-300 font-medium hidden md:inline">
              • Simulated Date: {formatDate(simulatedDate.toISOString())}
            </span>
          </div>

          <div className="flex items-center space-x-1 sm:space-x-2 text-[11px]">
            <span className="text-stone-300 hidden lg:inline mr-1">Time Travel Simulator:</span>
            <button
              onClick={() => handleAdvanceDays(1)}
              className="px-2 py-0.5 rounded bg-[#102D27] hover:bg-[#1e594b] text-emerald-200 border border-emerald-800 transition"
              title="Advance time by 24 hours to trigger overnight follow-up checks"
            >
              +24 Hours
            </button>
            <button
              onClick={() => handleAdvanceDays(3)}
              className="px-2 py-0.5 rounded bg-[#102D27] hover:bg-[#1e594b] text-emerald-200 border border-emerald-800 transition"
              title="Advance time by 3 days to test milestone reminders"
            >
              +3 Days
            </button>
            <button
              onClick={handleRunFollowUpCheck}
              className="px-2 py-0.5 rounded bg-[#102D27] hover:bg-[#1e594b] text-emerald-200 border border-emerald-800 transition"
              title="Run Follow-Up Engine automated evaluation"
            >
              Run Check
            </button>
            <button
              onClick={() => setShowResetModal(true)}
              className="px-2 py-0.5 rounded bg-stone-800/80 hover:bg-stone-700 text-stone-300 transition flex items-center gap-1"
              title="Reset all demo data to initial Jaipur seed state"
            >
              <RotateCcw className="w-3 h-3" />
              <span className="hidden sm:inline">Reset</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div
            onClick={() => onNavigate('/')}
            className="flex items-center space-x-3 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-lg bg-[#153F35] flex items-center justify-center text-white shadow-subtle group-hover:bg-[#102D27] transition">
              <ShieldAlert className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-display font-bold text-lg text-[#153F35] tracking-tight">
                  JanNigrani
                </span>
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-[#E6EEE7] text-[#153F35]">
                  जयपुर
                </span>
              </div>
              <p className="text-[10px] text-[#6D7771] -mt-0.5 font-medium">
                Civic Intelligence Platform
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navLinks.map((link) => {
              const isActive = currentPath === link.path;
              return (
                <button
                  key={link.path}
                  onClick={() => onNavigate(link.path)}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-[#E6EEE7] text-[#153F35] font-semibold'
                      : 'text-[#202724] hover:text-[#153F35] hover:bg-stone-100'
                  }`}
                >
                  {link.label}
                </button>
              );
            })}
          </nav>

          {/* Right Action Controls: Role Switcher, Notifications, Report CTA */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Role Switcher */}
            <div className="relative" ref={roleRef}>
              <button
                onClick={() => setIsRoleOpen(!isRoleOpen)}
                className="flex items-center space-x-1.5 text-xs font-medium px-2.5 py-1.5 rounded-md border border-[#E1E5DF] bg-white hover:bg-stone-50 transition text-[#202724]"
              >
                <UserCheck className="w-3.5 h-3.5 text-[#153F35]" />
                <span className="capitalize hidden sm:inline">{role === 'public' ? 'Public Visitor' : role === 'citizen' ? 'Citizen' : 'Admin'}</span>
                <ChevronDown className="w-3 h-3 text-stone-400" />
              </button>

              {isRoleOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-white rounded-lg shadow-elevated border border-[#E1E5DF] py-1 z-[110] animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-3 py-1.5 text-[11px] font-semibold text-[#6D7771] uppercase tracking-wider border-b border-stone-100">
                    Switch Prototype Role
                  </div>
                  <button
                    onClick={() => {
                      StorageService.setUserRole('public');
                      setIsRoleOpen(false);
                      onNavigate('/');
                    }}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between ${
                      role === 'public' ? 'bg-[#E6EEE7] text-[#153F35] font-semibold' : 'text-stone-700 hover:bg-stone-50'
                    }`}
                  >
                    <span>Public Citizen (Standard)</span>
                    {role === 'public' && <CheckCircle2 className="w-3.5 h-3.5 text-[#153F35]" />}
                  </button>
                  <button
                    onClick={() => {
                      StorageService.setUserRole('citizen');
                      setIsRoleOpen(false);
                      onNavigate('/dashboard');
                    }}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between ${
                      role === 'citizen' ? 'bg-[#E6EEE7] text-[#153F35] font-semibold' : 'text-stone-700 hover:bg-stone-50'
                    }`}
                  >
                    <span>Signed-In Citizen</span>
                    {role === 'citizen' && <CheckCircle2 className="w-3.5 h-3.5 text-[#153F35]" />}
                  </button>
                  <button
                    onClick={() => {
                      StorageService.setUserRole('admin');
                      setIsRoleOpen(false);
                      onNavigate('/admin');
                    }}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between ${
                      role === 'admin' ? 'bg-[#E6EEE7] text-[#153F35] font-semibold' : 'text-stone-700 hover:bg-stone-50'
                    }`}
                  >
                    <span>Municipal Reviewer / Admin</span>
                    {role === 'admin' && <CheckCircle2 className="w-3.5 h-3.5 text-[#153F35]" />}
                  </button>
                </div>
              )}
            </div>

            {/* In-App Notification Bell */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className="relative p-2 rounded-md hover:bg-stone-100 text-[#202724] transition"
                aria-label="Notifications"
              >
                <Bell className="w-4 h-4 text-[#202724]" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-[#B94343] text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {isNotifOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-lg shadow-elevated border border-[#E1E5DF] py-2 z-[110]">
                  <div className="px-4 py-2 flex items-center justify-between border-b border-stone-100">
                    <span className="text-xs font-bold text-[#153F35] font-display uppercase tracking-wider">
                      Civic Notifications ({unreadCount} new)
                    </span>
                    {unreadCount > 0 && (
                      <button
                        onClick={() => StorageService.markAllNotificationsRead()}
                        className="text-[11px] text-[#6D7771] hover:text-[#153F35]"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-stone-100">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-xs text-[#6D7771]">
                        No notifications currently active.
                      </div>
                    ) : (
                      notifications.slice(0, 6).map((notif) => (
                        <div
                          key={notif.id}
                          onClick={() => {
                            StorageService.markNotificationRead(notif.id);
                            setIsNotifOpen(false);
                            onNavigate(notif.actionLink);
                          }}
                          className={`p-3 text-xs hover:bg-stone-50 cursor-pointer transition ${
                            !notif.read ? 'bg-[#F7F7F2]' : ''
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="font-semibold text-[#153F35] flex items-center gap-1.5">
                              {!notif.read && (
                                <span className="w-2 h-2 rounded-full bg-[#B94343] inline-block" />
                              )}
                              {notif.title}
                            </span>
                            <span className="text-[10px] text-stone-400 whitespace-nowrap">
                              {formatDate(notif.timestamp)}
                            </span>
                          </div>
                          <p className="text-[#6D7771] mt-1 line-clamp-2">{notif.message}</p>
                          <span className="text-[11px] text-[#153F35] font-medium mt-1 inline-flex items-center gap-1">
                            Respond to follow-up <ArrowRight className="w-3 h-3" />
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Primary Action Button */}
            <button
              onClick={() => onNavigate('/report')}
              className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-md bg-[#153F35] hover:bg-[#102D27] text-white text-xs sm:text-sm font-semibold shadow-subtle hover:shadow-card transition transform active:scale-95"
            >
              <span>Report an Issue</span>
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-1.5 rounded-md text-stone-600 hover:text-[#153F35]"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-[#E1E5DF] bg-white px-4 py-3 space-y-1">
          {navLinks.map((link) => (
            <button
              key={link.path}
              onClick={() => {
                onNavigate(link.path);
                setIsMobileMenuOpen(false);
              }}
              className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium ${
                currentPath === link.path ? 'bg-[#E6EEE7] text-[#153F35] font-semibold' : 'text-[#202724]'
              }`}
            >
              {link.label}
            </button>
          ))}
        </div>
      )}

      {/* Reset Confirmation Modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-elevated border border-[#E1E5DF] max-w-md w-full p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center space-x-3 text-[#B94343] mb-3">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="text-base font-bold font-display text-[#202724]">
                Reset Demo Dataset?
              </h3>
            </div>
            <p className="text-xs text-[#6D7771] leading-relaxed mb-5">
              This will erase any custom reports, follow-up responses, and simulated time offsets, restoring the initial 25 verified Jaipur complaints, tenders, and authorities.
            </p>
            <div className="flex items-center justify-end space-x-3">
              <button
                onClick={() => setShowResetModal(false)}
                className="px-3.5 py-1.5 rounded-md border border-[#E1E5DF] text-xs font-semibold text-[#202724] hover:bg-stone-50"
              >
                Cancel
              </button>
              <button
                onClick={handleResetData}
                className="px-3.5 py-1.5 rounded-md bg-[#B94343] hover:bg-red-800 text-white text-xs font-semibold shadow-subtle"
              >
                Yes, Reset Dataset
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
