import { CivicCategory, IssueSeverity, IssueStatus } from '../types';

export const CATEGORY_CONFIG: Record<
  CivicCategory,
  { label: string; hindiLabel: string; bgClass: string; textClass: string; borderClass: string; pinColor: string }
> = {
  roads_footpaths: {
    label: 'Roads & Footpaths',
    hindiLabel: 'सड़क एवं फुटपाथ',
    bgClass: 'bg-amber-50',
    textClass: 'text-amber-800',
    borderClass: 'border-amber-200',
    pinColor: '#D97706',
  },
  waste_sanitation: {
    label: 'Waste & Sanitation',
    hindiLabel: 'कचरा एवं स्वच्छता',
    bgClass: 'bg-emerald-50',
    textClass: 'text-emerald-800',
    borderClass: 'border-emerald-200',
    pinColor: '#059669',
  },
  drainage_waterlogging: {
    label: 'Drainage & Waterlogging',
    hindiLabel: 'नाली एवं जलभराव',
    bgClass: 'bg-blue-50',
    textClass: 'text-blue-800',
    borderClass: 'border-blue-200',
    pinColor: '#2563EB',
  },
  water_supply: {
    label: 'Water Supply (PHED)',
    hindiLabel: 'पेयजल आपूर्ति',
    bgClass: 'bg-cyan-50',
    textClass: 'text-cyan-800',
    borderClass: 'border-cyan-200',
    pinColor: '#0891B2',
  },
  streetlights_electrical: {
    label: 'Streetlights & Electrical',
    hindiLabel: 'स्ट्रीटलाइट एवं बिजली',
    bgClass: 'bg-yellow-50',
    textClass: 'text-yellow-800',
    borderClass: 'border-yellow-200',
    pinColor: '#CA8A04',
  },
  parks_public_spaces: {
    label: 'Parks & Public Spaces',
    hindiLabel: 'पार्क एवं सार्वजनिक स्थल',
    bgClass: 'bg-green-50',
    textClass: 'text-green-800',
    borderClass: 'border-green-200',
    pinColor: '#16A34A',
  },
  public_facilities: {
    label: 'Public Facilities',
    hindiLabel: 'सार्वजनिक सुविधाएं',
    bgClass: 'bg-indigo-50',
    textClass: 'text-indigo-800',
    borderClass: 'border-indigo-200',
    pinColor: '#4F46E5',
  },
  accessibility: {
    label: 'Accessibility & Safety',
    hindiLabel: 'सुगम्यता एवं सुरक्षा',
    bgClass: 'bg-purple-50',
    textClass: 'text-purple-800',
    borderClass: 'border-purple-200',
    pinColor: '#9333EA',
  },
  uncertain_other: {
    label: 'Unclassified / Other',
    hindiLabel: 'अन्य / असत्यापित',
    bgClass: 'bg-stone-100',
    textClass: 'text-stone-700',
    borderClass: 'border-stone-200',
    pinColor: '#78716C',
  },
};

export const SEVERITY_CONFIG: Record<
  IssueSeverity,
  { label: string; bgClass: string; textClass: string; dotClass: string }
> = {
  low: {
    label: 'Low Severity',
    bgClass: 'bg-stone-100',
    textClass: 'text-stone-700',
    dotClass: 'bg-stone-400',
  },
  medium: {
    label: 'Medium Severity',
    bgClass: 'bg-amber-50',
    textClass: 'text-amber-800',
    dotClass: 'bg-amber-500',
  },
  high: {
    label: 'High Urgency',
    bgClass: 'bg-orange-50',
    textClass: 'text-orange-800',
    dotClass: 'bg-orange-500',
  },
  critical: {
    label: 'Critical Hazard',
    bgClass: 'bg-red-50',
    textClass: 'text-red-800',
    dotClass: 'bg-red-600 animate-pulse',
  },
};

export const STATUS_CONFIG: Record<
  IssueStatus,
  { label: string; bgClass: string; textClass: string }
> = {
  submitted: {
    label: 'Grievance Submitted',
    bgClass: 'bg-stone-100',
    textClass: 'text-stone-700',
  },
  under_review: {
    label: 'Under Preliminary Review',
    bgClass: 'bg-blue-50',
    textClass: 'text-blue-700',
  },
  awaiting_info: {
    label: 'Awaiting Citizen Response',
    bgClass: 'bg-yellow-50',
    textClass: 'text-yellow-800',
  },
  routed_in_prototype: {
    label: 'Authority Identified (Simulated)',
    bgClass: 'bg-sage',
    textClass: 'text-forest',
  },
  in_progress: {
    label: 'Action In Progress (Demo)',
    bgClass: 'bg-amber-50',
    textClass: 'text-amber-900',
  },
  citizen_resolved: {
    label: 'Citizen Reported Resolved',
    bgClass: 'bg-emerald-50',
    textClass: 'text-emerald-800',
  },
  closed_in_demo: {
    label: 'Closed in Prototype',
    bgClass: 'bg-stone-200',
    textClass: 'text-stone-600',
  },
  needs_attention: {
    label: 'Escalation Alert',
    bgClass: 'bg-red-50',
    textClass: 'text-red-700',
  },
};
