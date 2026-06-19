export type UserRole = 
  | 'radiologist' 
  | 'doctor' 
  | 'admin' 
  | 'diagnostic_center' 
  | 'student' 
  | 'super_admin';

export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  mrn: string; // Medical Record Number
  history: string;
  imagingTimeline: {
    id: string;
    date: string;
    type: string;
    finding: string;
  }[];
}

export interface Annotation {
  id: string;
  type: 'line' | 'rect' | 'text';
  coords: { x1: number; y1: number; x2?: number; y2?: number };
  text?: string;
  measuredValue?: string; // e.g. "12.4 mm"
  createdBy: string;
}

export interface MedicalStudy {
  id: string;
  patientId: string;
  patientName: string;
  mrn: string;
  modality: 'X-Ray' | 'CT' | 'MRI' | 'Ultrasound';
  bodyPart: string;
  studyDate: string;
  status: 'Unassigned' | 'Processing' | 'Pending Review' | 'Completed';
  priority: 'Routine' | 'Urgent' | 'STAT';
  imageUrl: string; 
  hasHeatmap: boolean;
  frames?: string[];
  heatmapOverlay?: string; // Canvas or transparent mask indicator overlay
  finding: string;
  confidence: number;
  recommendation: string;
  annotations: Annotation[];
  windowWidth: number;
  windowCenter: number;
  comments: { id: string; user: string; role: string; text: string; date: string }[];
}

export interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  role: string;
  action: string;
  studyId?: string;
  details: string;
  ipAddress: string;
  status: 'SUCCESS' | 'WARNING' | 'DENIED';
}

export interface AIModel {
  id: string;
  name: string;
  version: string;
  type: 'Classification' | 'Segmentation' | 'Explainable AI';
  accuracy: number;
  auc: number;
  activeStatus: 'Active' | 'Candidate' | 'In Testing';
  trafficAllocation: number; // For A/B Testing, e.g. 80%
  gpuMemory: string;
  latencyMs: number;
}

export interface ReportDraft {
  studyId: string;
  studyType: string;
  findings: string;
  clinicalHistory: string;
  impression: string;
  confidenceScore: number;
  recommendations: string;
  isApproved: boolean;
  approvedBy?: string;
  lastEditedBy?: string;
  lastEditedAt?: string;
}

// System Health/Queue Metrics
export interface GPUMetric {
  id: string;
  gpuName: string;
  utilization: number;
  memoryUsed: number;
  memoryTotal: number;
  temperature: number;
  inferenceCount: number;
}
