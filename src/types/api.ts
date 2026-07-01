export type ApiEnvelope<T> = {
  success: boolean;
  data: T;
  message: string;
  meta?: Record<string, unknown>;
};

export type AuthStaff = {
  id: number;
  username: string;
  name: string;
  email: string;
  phone: string | null;
  designation: string | null;
  district: string | null;
  role: string;
  osd_category: string | null;
  dashboard_slug: string;
};

export type AuthLoginData = {
  staff: AuthStaff;
  redirect_path: string;
};

export type PortalStats = {
  total_grievances: number;
  open_count: number;
  closed_count: number;
  new_today: number;
  grievances_30d: number;
  sla_breached_open: number;
  resolution_rate_pct: number;
  district_count: number;
  active_district_count: number;
  onboarded_categories: number;
  whatsapp_sessions_7d: number;
  median_reply_display: string;
  resolution_rate_display: string;
  resolved_on_time_display: string;
};

export type PortalDepartment = {
  slug: string;
  name: string;
  kind: string;
  count: number;
  open_count: number;
};

export type PortalGrievancePreview = {
  reference_number: string;
  citizen_label: string;
  district: string;
  category: string;
  status_label: string;
  sla_label: string;
  is_closed?: boolean;
  is_overdue?: boolean;
};

export type PortalPublicData = {
  stats: PortalStats;
  departments: PortalDepartment[];
  recent_grievances: PortalGrievancePreview[];
  whatsapp_url: string;
  app_version: string;
};

export type DashboardSummary = {
  total_count: number;
  new_count: number;
  in_progress_count: number;
  resolved_count: number;
  closed_count: number;
  sla_breached_count: number;
};

export type GrievanceAttachment = {
  id: number;
  file_path: string;
  mime_type: string;
  file_size: number;
  created_at: string;
};

export type GrievanceRow = {
  reference_number: string;
  district: string | null;
  category: string | null;
  status: string;
  status_label?: string;
  created_at: string;
  osd_category: string | null;
  geographic_district?: string | null;
  priority?: string;
  title?: string | null;
  citizen_name?: string | null;
  grievance_text?: string | null;
  attachments?: GrievanceAttachment[];
  attachment_url?: string | null;
};

export type PortalDashboardData = {
  summary: DashboardSummary;
  pending_count: number;
  recent_grievances: GrievanceRow[];
  kpi: Record<string, number>;
};

export type PortalOperationalData = {
  grievances: GrievanceRow[];
  summary: DashboardSummary;
  pending_count: number;
  kpi: Record<string, number>;
};

export type TimelineEvent = {
  id: number;
  event_type: string;
  title: string;
  description: string;
  actor_name: string | null;
  created_at: string;
};

export type PortalGrievanceDetailData = {
  grievance: GrievanceRow;
  allowed_statuses: string[];
  timeline: TimelineEvent[];
  audit_trail: Array<Record<string, unknown>>;
};

export type AnalyticsOverview = {
  total_grievances: number;
  open_count: number;
  closed_count: number;
  new_today: number;
  resolution_rate_pct: number;
  sla_breached_open: number;
};

export type PortalAnalyticsData = {
  bundle: {
    overview: AnalyticsOverview;
    status_breakdown: { items: Array<{ key: string; count: number; percentage: number }> };
    category_breakdown: { items: Array<{ key: string; count: number; percentage: number }> };
    top_districts: { items: Array<{ key: string; count: number }> };
    sla: Record<string, unknown>;
    funnel: { stages: Array<{ stage: string; label: string; count: number }> };
    trends_7d: { points: Array<{ period_label: string; submitted: number; resolved: number }> };
  };
  departments: { items: Array<Record<string, unknown>> };
  feedback: { total_ratings: number; average_rating: number | null };
};

export type MetadataConstants = {
  osd_categories: string[];
  osd_slugs: Record<string, string>;
  districts: string[];
  grievance_categories: string[];
  statuses: string[];
  priorities: string[];
  osd_workflow_statuses: string[];
};

export type OsdDashboardData = {
  osd_slug: string;
  osd_category: string;
  summary: Record<string, number>;
  pending_count: number;
};

export type OsdDepartmentContact = {
  id: number | null;
  department: string;
  officer_name: string;
  email: string;
};

export type OsdDepartmentContactRecord = {
  id: number;
  osd_category: string;
  department: string;
  officer_name: string;
  email: string;
  is_active: boolean;
};

export type OsdGrievanceDetailData = {
  grievance: GrievanceRow;
  allowed_statuses: string[];
  suggested_recipients: OsdDepartmentContact[];
  timeline: TimelineEvent[];
  forwards: Array<Record<string, unknown>>;
};

export type StaffAccount = {
  id: number;
  username: string;
  role: string;
  name: string;
  designation: string;
  district: string;
  email: string;
  phone: string;
  osd_category: string | null;
  whatsapp_enabled: boolean;
  is_active: boolean;
};

export type StaffListData = {
  items: StaffAccount[];
  manageable_roles: string[];
};

export type DepartmentGrievanceView = {
  reference_number: string;
  status: string;
  priority: string;
  osd_category: string;
  geographic_district: string;
  title: string;
  grievance_text: string;
  area: string;
  citizen_phone: string;
  citizen_name: string;
  sla_deadline_at: string | null;
  recipient_department: string;
  recipient_name: string;
  forwarded_at: string;
  token_expires_at: string | null;
  department_action_at: string | null;
  department_response_text: string | null;
  allowed_actions: string[];
};
