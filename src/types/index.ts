// JanNigrani Data Models and Types

export type CivicCategory =
  | 'roads_footpaths'
  | 'waste_sanitation'
  | 'drainage_waterlogging'
  | 'water_supply'
  | 'streetlights_electrical'
  | 'parks_public_spaces'
  | 'public_facilities'
  | 'accessibility'
  | 'uncertain_other';

export type IssueSeverity = 'low' | 'medium' | 'high' | 'critical';

export type IssueStatus =
  | 'submitted'
  | 'under_review'
  | 'awaiting_info'
  | 'routed_in_prototype'
  | 'in_progress'
  | 'citizen_resolved'
  | 'closed_in_demo'
  | 'needs_attention';

export type VerificationStatus =
  | 'unverified'
  | 'ai_suggested'
  | 'citizen_confirmed'
  | 'reviewer_verified'
  | 'official_gazette';

export type DataOrigin =
  | 'demo_seed'
  | 'citizen_submitted'
  | 'reviewer_verified'
  | 'official_sppp_gazette'
  | 'demo_fictional';

export interface CivicIssue {
  id: string; // e.g. JN-2026-1001
  title: string;
  description: string;
  category: CivicCategory;
  subcategory: string;
  severity: IssueSeverity;
  latitude: number;
  longitude: number;
  locationLabel: string;
  wardNumber?: number;
  zoneName?: string;
  createdAt: string;
  updatedAt: string;
  status: IssueStatus;
  reporterId: string;
  imageIds: string[];
  imageUrl?: string;
  aiAnalysisId?: string;
  authorityRecommendationId?: string;
  relatedProjectIds: string[];
  nextFollowUpAt: string;
  dataOrigin: DataOrigin;
  verificationStatus: VerificationStatus;
}

export interface AIAnalysis {
  id: string;
  issueId: string;
  provider: 'puter_vision' | 'deterministic_demo' | 'gemini_vision' | 'text_heuristics';
  mode: 'demo_fixture' | 'live_ai' | 'fallback';
  predictedCategory: CivicCategory;
  predictedSubtype: string;
  confidence: number; // 0 to 1
  observations: string[];
  visualEvidence?: string;
  textEvidence?: string;
  missingInformation: string[];
  suggestedQuestions: string[];
  suggestedUrgency: IssueSeverity;
  urgencyRationale: string;
  humanReviewRecommended: boolean;
  createdAt: string;
  citizenConfirmed: boolean;
  reviewStatus: 'pending' | 'accepted' | 'corrected' | 'flagged';
  safetyWarning?: string;
  detectedDamage?: string;
  modelUsed?: string;
}

export interface Authority {
  id: string; // e.g. AUTH_JMC_GREATER
  name: string;
  code: string;
  hindiName: string;
  responsibilityCategories: CivicCategory[];
  jurisdiction: string;
  statutoryAct: string;
  officialWebsite: string;
  complaintChannel: string;
  contactDetails: string;
  sourceIds: string[];
  verificationStatus: 'verified_official' | 'demo_model';
  lastVerifiedAt: string;
  complaintPortalUrl?: string; // e.g. JMC Samadhan Add Complaint
  trackComplaintUrl?: string;   // e.g. JMC Samadhan Search Complains
  tenderPortalUrl?: string;     // e.g. JMC JTender or JDA Tender EMD or eProc
  faqPortalUrl?: string;        // e.g. JDA MicroPortal FAQ
}

export interface AuthorityRecommendation {
  id: string;
  issueId: string;
  authorityId: string;
  authorityName: string;
  reason: string;
  statutoryBasis: string;
  confidence: 'high' | 'medium' | 'low';
  routingRuleId: string;
  sourceIds: string[];
  alternativeAuthorities: { authorityId: string; name: string; reason: string }[];
  verificationStatus: 'prototype_rule' | 'verified_jurisdiction';
}

export interface PublicWork {
  id: string; // e.g. PW-2026-081
  title: string;
  department: string;
  description: string;
  projectLocation: string;
  wardNumber?: number;
  zoneName?: string;
  latitude: number;
  longitude: number;
  tenderReference: string;
  publicationDate: string;
  projectStatus: 'tender_published' | 'bid_awarded' | 'in_progress' | 'completed' | 'dlp_active';
  contractorId?: string;
  contractorName?: string;
  contractValue?: string;
  dlpWarrantyExpiry?: string;
  officialPortalUrl?: string; // Official gov portal link (e.g. SHPP, JDA, JMC, eProc)
  tenderPdfUrl?: string;      // Direct PDF viewer url (e.g. JMC MstPdfViewer)
  contractorClass?: string;   // e.g. Class AA, Class A
  sourceIds: string[];
  dataOrigin: 'official_sppp_gazette' | 'demo_fictional';
  verificationStatus: 'verified_gazette' | 'preliminary_match' | 'unverified';
}

export interface Contractor {
  id: string;
  name: string;
  officialIdentifier: string;
  registrationGrade: string;
  projectIds: string[];
  sourceIds: string[];
  verificationStatus: 'verified_tender_bid' | 'demo_entity';
}

export interface FollowUp {
  id: string;
  issueId: string;
  scheduledAt: string;
  sentAt?: string;
  question: string;
  response?: string;
  responseType?: 'resolved' | 'still_present' | 'worsened' | 'cannot_verify';
  responsePhotoUrl?: string;
  status: 'scheduled' | 'sent' | 'responded' | 'overdue' | 'dismissed';
  createdBy: 'followup_engine' | 'reviewer';
  dataOrigin: 'demo_system' | 'citizen_interactive';
}

export interface IssueTimelineEvent {
  id: string;
  issueId: string;
  eventType: string;
  title: string;
  description: string;
  timestamp: string;
  actorType: 'system' | 'citizen' | 'reviewer' | 'authority_simulated';
  sourceId?: string;
  dataOrigin: string;
}

export interface DataSource {
  id: string;
  name: string;
  url: string;
  sourceType: 'gazette' | 'portal' | 'statute' | 'tender_database';
  retrievedAt: string;
  verificationStatus: 'official_active' | 'archived';
  notes: string;
}

export interface NotificationItem {
  id: string;
  issueId: string;
  title: string;
  message: string;
  timestamp: string;
  type: 'followup_due' | 'status_update' | 'ai_analyzed' | 'review_update';
  read: boolean;
  actionLink: string;
}

export type UserRole = 'public' | 'citizen' | 'admin';
