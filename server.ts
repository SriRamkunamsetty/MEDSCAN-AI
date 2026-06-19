import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

// Initialize GoogleGenAI SDK with standard safety configuration
let ai: GoogleGenAI | null = null;
try {
  if (process.env.GEMINI_API_KEY) {
    ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
    console.log("[MEDSCAN AI] GoogleGenAI SDK initialized successfully.");
  } else {
    console.warn("[MEDSCAN AI] GEMINI_API_KEY is not defined. AI endpoints will run in simulator fallback mode.");
  }
} catch (error) {
  console.error("[MEDSCAN AI] Failed to initialize GoogleGenAI:", error);
}

// In-Memory Database for studies, patient clinical notes, models, audit logs
const INITIAL_PATIENTS = [
  {
    id: "PAT-1090",
    name: "Arthur Pendragon",
    age: 62,
    gender: "Male",
    mrn: "MRN-301-882",
    history: "Active dry cough for 3 weeks, dyspnea on exertion, low-grade fever. History of mild asthma.",
    imagingTimeline: [
      { id: "timeline-1", date: "2026-04-12", type: "PFT", finding: "FVC slightly reduced, matching obstructive airway history." },
      { id: "timeline-2", date: "2026-06-19", type: "X-Ray", finding: "High density patch (opacity) of lower lobe of right lung." }
    ]
  },
  {
    id: "PAT-5112",
    name: "Eleanor Vance",
    age: 41,
    gender: "Female",
    mrn: "MRN-502-119",
    history: "Severe localized headaches, visual aura, and persistent lightheadedness over the last month. No prior history of cerebrovascular incidents.",
    imagingTimeline: [
      { id: "timeline-3", date: "2026-05-30", type: "EEG", finding: "Mild nonspecific cerebral dysrhythmia." },
      { id: "timeline-4", date: "2026-06-19", type: "MRI", finding: "Suspected temporal lobe tumor with edema." }
    ]
  },
  {
    id: "PAT-2034",
    name: "Marcus Aurelius",
    age: 19,
    gender: "Male",
    mrn: "MRN-203-774",
    history: "Sudden twist injury to the knee during university soccer practice. Instability on weights with immediate soft swelling.",
    imagingTimeline: [
      { id: "timeline-5", date: "2026-06-19", type: "MRI", finding: "Suspected complete/partial ACL tear." }
    ]
  },
  {
    id: "PAT-8041",
    name: "Genevieve Dubois",
    age: 55,
    gender: "Female",
    mrn: "MRN-804-031",
    history: "Heavy smoker (30 pack-years). Routine screening scan. Experiencing light nocturnal diaphoresis.",
    imagingTimeline: [
      { id: "timeline-6", date: "2026-06-19", type: "CT", finding: "Solitary pulmonary nodule detected." }
    ]
  },
  {
    id: "PAT-1052",
    name: "Sarah Jenkins",
    age: 35,
    gender: "Female",
    mrn: "MRN-105-442",
    history: "Sudden right upper quadrant pain radiating to epigastrium after meals. Overweight with classic indicators.",
    imagingTimeline: [
      { id: "timeline-7", date: "2026-06-19", type: "Ultrasound", finding: "Cholelithiasis with positive Murphy sign." }
    ]
  }
];

const INITIAL_STUDIES = [
  {
    id: "STUDY-301",
    patientId: "PAT-1090",
    patientName: "Arthur Pendragon",
    mrn: "MRN-301-882",
    modality: "X-Ray",
    bodyPart: "Chest PA/Lateral",
    studyDate: "2026-06-19 08:30",
    status: "Pending Review",
    priority: "Urgent",
    imageUrl: "https://images.unsplash.com/photo-1559757175-5700dde675bc?q=80&w=800&auto=format&fit=crop",
    hasHeatmap: true,
    finding: "Patchy alveolar consolidation in the lower right lung field, suspicious of community-acquired lobar pneumonia or localized inflammatory infiltration.",
    confidence: 91.4,
    recommendation: "Correlation with leukocyte counts and clinical sputum culture evaluation. Follow-up chest radiograph in 10-14 days to monitor resolution progress.",
    windowWidth: 2000,
    windowCenter: 40,
    annotations: [
      { id: "a1", type: "rect" as const, coords: { x1: 520, y1: 380, x2: 680, y2: 590 }, text: "Lower right opacity zone", measuredValue: "Consolidation zone #1", createdBy: "Dr. Rachel Carter" }
    ],
    comments: [
      { id: "c1", user: "Dr. Rachel Carter", role: "Attending Physician", text: "Patient is symptomatic with high fever. AI findings match the localized auscultation crackles.", date: "2026-06-19 09:12" }
    ],
    frames: [
      "https://images.unsplash.com/photo-1559757175-5700dde675bc?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1559757117-ee75fdb4049e?q=80&w=800&auto=format&fit=crop"
    ]
  },
  {
    id: "STUDY-301-PREV",
    patientId: "PAT-1090",
    patientName: "Arthur Pendragon",
    mrn: "MRN-301-882",
    modality: "X-Ray",
    bodyPart: "Chest PA",
    studyDate: "2026-03-12 11:00",
    status: "Completed",
    priority: "Routine",
    imageUrl: "https://images.unsplash.com/photo-1559757117-ee75fdb4049e?q=80&w=800&auto=format&fit=crop",
    hasHeatmap: false,
    finding: "No active cardiopulmonary disease. Lungs are clear, bronchovascular markings are normal in course and caliber. Heart size is within normal limits.",
    confidence: 96.5,
    recommendation: "Routine checkup as scheduled. No follow-up imaging required at this time.",
    windowWidth: 2000,
    windowCenter: 50,
    annotations: [],
    comments: [],
    frames: [
      "https://images.unsplash.com/photo-1559757117-ee75fdb4049e?q=80&w=800&auto=format&fit=crop"
    ]
  },
  {
    id: "STUDY-502",
    patientId: "PAT-5112",
    patientName: "Eleanor Vance",
    mrn: "MRN-502-119",
    modality: "MRI",
    bodyPart: "Brain with Gadolinium",
    studyDate: "2026-06-19 09:15",
    status: "Pending Review",
    priority: "STAT",
    imageUrl: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?q=80&w=800&auto=format&fit=crop",
    hasHeatmap: true,
    finding: "Contrast-enhancing focal intra-axial mass lesion in the left temporal lobe measuring approximately 32mm with surrounding vasogenic edema and a 4mm lateral midline shift.",
    confidence: 95.8,
    recommendation: "Urgent neurosurgical consultation advised. Consider magnetic resonance spectroscopy (MRS) or stereotactic biopsy to determine precise histological grading.",
    windowWidth: 1000,
    windowCenter: 60,
    annotations: [
      { id: "a2", type: "rect" as const, coords: { x1: 290, y1: 220, x2: 440, y2: 360 }, text: "Mass lesion 32x28x30mm", measuredValue: "32.4 mm max", createdBy: "Dr. Keith Vance" }
    ],
    comments: [
      { id: "c2", user: "Dr. Keith Vance", role: "Radiologist", text: "Surrounding vasogenic edema appears moderately severe. Midline shift requires immediate attention.", date: "2026-06-19 09:40" }
    ],
    frames: [
      "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1559757164-ee074426fd9e?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1559757112-25de0b2e8b2f?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1516062423079-7ca13cca7c58?q=80&w=800&auto=format&fit=crop"
    ]
  },
  {
    id: "STUDY-502-PREV",
    patientId: "PAT-5112",
    patientName: "Eleanor Vance",
    mrn: "MRN-502-119",
    modality: "MRI",
    bodyPart: "Brain T1/T2 Weighted",
    studyDate: "2025-12-05 14:20",
    status: "Completed",
    priority: "Routine",
    imageUrl: "https://images.unsplash.com/photo-1559757112-25de0b2e8b2f?q=80&w=800&auto=format&fit=crop",
    hasHeatmap: false,
    finding: "Brain tissue exhibits unremarkable gray-white matter separation. No intra-axial or extra-axial mass lesions are identified. Ventricular distribution is standard size and shape.",
    confidence: 97.2,
    recommendation: "Annual monitoring or symptom-driven scan. Workstation parameters nominal.",
    windowWidth: 1000,
    windowCenter: 50,
    annotations: [],
    comments: [],
    frames: [
      "https://images.unsplash.com/photo-1559757112-25de0b2e8b2f?q=80&w=800&auto=format&fit=crop"
    ]
  },
  {
    id: "STUDY-203",
    patientId: "PAT-2034",
    patientName: "Marcus Aurelius",
    mrn: "MRN-203-774",
    modality: "MRI",
    bodyPart: "Right Knee Joint",
    studyDate: "2026-06-19 09:45",
    status: "Completed",
    priority: "Routine",
    imageUrl: "https://images.unsplash.com/photo-1582719471384-894fbb16e074?q=80&w=800&auto=format&fit=crop",
    hasHeatmap: true,
    finding: "Full-thickness fiber disruption at the mid-substance of the anterior cruciate ligament (ACL) with pivot shift bone bruising of the lateral femoral condyle and lateral tibial plateau.",
    confidence: 89.2,
    recommendation: "Referral to orthopedic surgery for reconstruction options. Passive mobilization recommended initially with cryotherapy support.",
    windowWidth: 800,
    windowCenter: 150,
    annotations: [
      { id: "a3", type: "line" as const, coords: { x1: 340, y1: 310, x2: 480, y2: 450 }, text: "Flipped mid-substance fibers", measuredValue: "18.2 mm gap", createdBy: "Dr. Keith Vance" }
    ],
    comments: [],
    frames: [
      "https://images.unsplash.com/photo-1582719471384-894fbb16e074?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1516062423079-7ca13cca7c58?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1559757117-ee75fdb4049e?q=80&w=800&auto=format&fit=crop"
    ]
  },
  {
    id: "STUDY-203-PREV",
    patientId: "PAT-2034",
    patientName: "Marcus Aurelius",
    mrn: "MRN-203-774",
    modality: "MRI",
    bodyPart: "Right Knee Joint",
    studyDate: "2025-08-10 10:00",
    status: "Completed",
    priority: "Routine",
    imageUrl: "https://images.unsplash.com/photo-1582719471384-894fbb16e074?q=80&w=800&auto=format&fit=crop",
    hasHeatmap: false,
    finding: "Normal structures of the right knee joint. Both meniscus and cruciate/collateral ligaments are intact and demonstrate uniform low signal intensity. No joint effusions or bone contusions.",
    confidence: 94.0,
    recommendation: "Maintain sports activity. No intervention or follow-up indicated.",
    windowWidth: 800,
    windowCenter: 100,
    annotations: [],
    comments: [],
    frames: [
      "https://images.unsplash.com/photo-1582719471384-894fbb16e074?q=80&w=800&auto=format&fit=crop"
    ]
  },
  {
    id: "STUDY-804",
    patientId: "PAT-8041",
    patientName: "Genevieve Dubois",
    mrn: "MRN-804-031",
    modality: "CT",
    bodyPart: "Chest High Resolution NDCT",
    studyDate: "2026-06-19 10:10",
    status: "Processing",
    priority: "Routine",
    imageUrl: "https://images.unsplash.com/photo-1559757164-ee074426fd9e?q=80&w=800&auto=format&fit=crop",
    hasHeatmap: false,
    finding: "Undergoing automated segmentation. AI analysis of Lung nodules is underway. Suspicious cluster in upper left lobe.",
    confidence: 93.1,
    recommendation: "System is performing automated spatial correlation with prior studies.",
    windowWidth: 1500,
    windowCenter: -500,
    annotations: [],
    comments: [],
    frames: [
      "https://images.unsplash.com/photo-1559757164-ee074426fd9e?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-15597571464?q=80&w=800&auto=format&fit=crop"
    ]
  },
  {
    id: "STUDY-804-PREV",
    patientId: "PAT-8041",
    patientName: "Genevieve Dubois",
    mrn: "MRN-804-031",
    modality: "CT",
    bodyPart: "Chest Low Dose CT",
    studyDate: "2025-03-15 09:00",
    status: "Completed",
    priority: "Routine",
    imageUrl: "https://images.unsplash.com/photo-15597571464?q=80&w=800&auto=format&fit=crop",
    hasHeatmap: false,
    finding: "Unremarkable screening CT of the chest. Lungs are well-inflated. No pleural thickening or pulmonary nodules observed.",
    confidence: 91.0,
    recommendation: "Routine annual high risk screening CT recommended to monitor status.",
    windowWidth: 1500,
    windowCenter: -450,
    annotations: [],
    comments: [],
    frames: [
      "https://images.unsplash.com/photo-15597571464?q=80&w=800&auto=format&fit=crop"
    ]
  },
  {
    id: "STUDY-105",
    patientId: "PAT-1052",
    patientName: "Sarah Jenkins",
    mrn: "MRN-105-442",
    modality: "Ultrasound",
    bodyPart: "Abdomen RUQ",
    studyDate: "2026-06-19 10:30",
    status: "Unassigned",
    priority: "Urgent",
    imageUrl: "https://images.unsplash.com/photo-1516062423079-7ca13cca7c58?q=80&w=800&auto=format&fit=crop",
    hasHeatmap: false,
    finding: "Multiple highly reflective echo-focus elements within the gallbladder lumen measuring up to 14mm with prominent distal acoustic shadowing and positional mobility.",
    confidence: 94.6,
    recommendation: "Surgical correlation for chronic cholelithiasis. Suggest outpatient laparoscopic cholecystectomy consult.",
    windowWidth: 400,
    windowCenter: 50,
    annotations: [],
    comments: [],
    frames: [
      "https://images.unsplash.com/photo-1516062423079-7ca13cca7c58?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1559757117-ee75fdb4049e?q=80&w=800&auto=format&fit=crop"
    ]
  },
  {
    id: "STUDY-105-PREV",
    patientId: "PAT-1052",
    patientName: "Sarah Jenkins",
    mrn: "MRN-105-442",
    modality: "Ultrasound",
    bodyPart: "Abdomen RUQ",
    studyDate: "2024-11-20 15:30",
    status: "Completed",
    priority: "Routine",
    imageUrl: "https://images.unsplash.com/photo-1516062423079-7ca13cca7c58?q=80&w=800&auto=format&fit=crop",
    hasHeatmap: false,
    finding: "Gallbladder structure is normal with thin mural borders (2mm). Luminal area is clear and free of mobile calculus, sludge or surrounding free fluid.",
    confidence: 95.0,
    recommendation: "No active follow-up needed.",
    windowWidth: 450,
    windowCenter: 60,
    annotations: [],
    comments: [],
    frames: [
      "https://images.unsplash.com/photo-1516062423079-7ca13cca7c58?q=80&w=800&auto=format&fit=crop"
    ]
  }
];

const INITIAL_MODELS = [
  { id: "M1", name: "DeepVessel-ViT-Chest", version: "v4.2.1", type: "Classification" as const, accuracy: 0.962, auc: 0.985, activeStatus: "Active" as const, trafficAllocation: 90, gpuMemory: "4.8 GB", latencyMs: 145 },
  { id: "M2", name: "MONAI-Segmenter-U-Net++", version: "v5.0.3", type: "Segmentation" as const, accuracy: 0.941, auc: 0.963, activeStatus: "Active" as const, trafficAllocation: 100, gpuMemory: "6.2 GB", latencyMs: 280 },
  { id: "M3", name: "MedGrad-CAM-Explainer", version: "v2.1.2", type: "Explainable AI" as const, accuracy: 0.934, auc: 0.952, activeStatus: "Active" as const, trafficAllocation: 100, gpuMemory: "3.5 GB", latencyMs: 95 },
  { id: "M4", name: "DeepVessel-ViT-Candidate", version: "v4.3.0-RC1", type: "Classification" as const, accuracy: 0.975, auc: 0.991, activeStatus: "In Testing" as const, trafficAllocation: 10, gpuMemory: "4.9 GB", latencyMs: 130 }
];

const INITIAL_AUDITS = [
  { id: "LOG-101", timestamp: "2026-06-19 08:35:12", user: "Dr. Rachel Carter", role: "Attending Physician", action: "ACCESS_STUDY", studyId: "STUDY-301", details: "Viewed patient Arthur Pendragon Chest PA digital study. Access checked against active doctor role credentials.", ipAddress: "192.168.10.45", status: "SUCCESS" as const },
  { id: "LOG-102", timestamp: "2026-06-19 08:42:01", user: "MEDSCAN-AI Service", role: "Inference Engine", action: "DRAFT_REPORT", studyId: "STUDY-301", details: "Auto-generated structured findings for fracture candidates / Consolidation indicators on chest study.", ipAddress: "127.0.0.1", status: "SUCCESS" as const },
  { id: "LOG-103", timestamp: "2026-06-19 09:16:44", user: "Dr. Keith Vance", role: "Radiologist", action: "ACCESS_STUDY", studyId: "STUDY-502", details: "Accessed brain scan of Eleanor Vance. System successfully validated digital certificate and verified patient MRN.", ipAddress: "192.168.10.22", status: "SUCCESS" as const },
  { id: "LOG-104", timestamp: "2026-06-19 09:18:20", user: "Unauthorized-Staff", role: "Medical Assistant", action: "EDIT_STUDY_STATUS", studyId: "STUDY-502", details: "Attempted to modify priority status without authorized credentials.", ipAddress: "192.168.10.119", status: "DENIED" as const },
  { id: "LOG-105", timestamp: "2026-06-19 09:48:30", user: "Hospital Admin Portal", role: "Administrator", action: "AUDIT_EXPORT", details: "Exported HIPAA-compliant access registry for state certification audits.", ipAddress: "192.168.10.3", status: "SUCCESS" as const }
];

let studiesDb = [...INITIAL_STUDIES];
let auditsDb = [...INITIAL_AUDITS];
let modelsDb = [...INITIAL_MODELS];
let patientsDb = [...INITIAL_PATIENTS];

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '10mb' }));

  // API Endpoints Go Here FIRST

  // Get current state
  app.get("/api/studies", (req, res) => {
    res.json(studiesDb);
  });

  app.get("/api/patients", (req, res) => {
    res.json(patientsDb);
  });

  app.get("/api/models", (req, res) => {
    res.json(modelsDb);
  });

  app.get("/api/audits", (req, res) => {
    res.json(auditsDb);
  });

  // Keep auditing fresh
  app.post("/api/audits", (req, res) => {
    const { user, role, action, studyId, details, status } = req.body;
    const newLog = {
      id: "LOG-" + Math.floor(100 + Math.random() * 900),
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      user: user || "System user",
      role: role || "radiologist",
      action: action || "GENERIC_ACTION",
      studyId: studyId || undefined,
      details: details || "Action executed",
      ipAddress: req.ip || "192.168.1.1",
      status: status || "SUCCESS"
    };
    auditsDb.unshift(newLog);
    res.status(201).json(newLog);
  });

  // Create or upload study
  app.post("/api/studies/upload", (req, res) => {
    const { patientName, modality, bodyPart, priority, imageUrl, finding, recommendation } = req.body;
    const patientId = "PAT-" + Math.floor(1000 + Math.random() * 9000);
    const newPatient = {
      id: patientId,
      name: patientName,
      age: Math.floor(18 + Math.random() * 65),
      gender: (Math.random() > 0.5 ? "Male" as const : "Female" as const),
      mrn: "MRN-" + Math.floor(100 + Math.random() * 900) + "-MED",
      history: "Referred for diagnostic staging on " + modality + ".",
      imagingTimeline: [
        { id: "time-" + Date.now(), date: new Date().toISOString().split('T')[0], type: modality, finding: finding || "Indicated review required" }
      ]
    };

    const newStudyId = "STUDY-" + Math.floor(100 + Math.random() * 900);
    const newStudy = {
      id: newStudyId,
      patientId: patientId,
      patientName: patientName,
      mrn: newPatient.mrn,
      modality: modality,
      bodyPart: bodyPart,
      studyDate: new Date().toISOString().replace('T', ' ').slice(0, 16),
      status: "Pending Review" as const,
      priority: priority || "Routine",
      imageUrl: imageUrl || "https://images.unsplash.com/photo-1559757175-5700dde675bc?q=80&w=800&auto=format&fit=crop",
      hasHeatmap: true,
      finding: finding || "Infiltration and localized tissue congestion candidates detected by inference pipelines.",
      confidence: Math.round(85 + Math.random() * 14 * 10) / 10,
      recommendation: recommendation || "Nephrology or clinical radiology review suggested.",
      windowWidth: 1200,
      windowCenter: 40,
      annotations: [],
      comments: [],
      frames: [
        imageUrl || "https://images.unsplash.com/photo-1559757175-5700dde675bc?q=80&w=800&auto=format&fit=crop"
      ]
    };

    patientsDb.unshift(newPatient);
    studiesDb.unshift(newStudy);

    // Audit upload
    auditsDb.unshift({
      id: "LOG-" + Math.floor(100 + Math.random() * 900),
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      user: "Diagnostic Center Portal",
      role: "diagnostic_center",
      action: "UPLOAD_STUDY",
      studyId: newStudyId,
      details: `Bulk or manual ingest of ${modality} (${bodyPart}) scan. Generated patient clinical placeholder ${newPatient.name}.`,
      ipAddress: "192.168.1.55",
      status: "SUCCESS"
    });

    res.status(201).json({ study: newStudy, patient: newPatient });
  });

  // Edit Study Finding
  app.put("/api/studies/:id", (req, res) => {
    const studyId = req.params.id;
    const idx = studiesDb.findIndex(s => s.id === studyId);
    if (idx !== -1) {
      studiesDb[idx] = { ...studiesDb[idx], ...req.body };
      res.json(studiesDb[idx]);
    } else {
      res.status(404).json({ error: "Study not found" });
    }
  });

  // Model weight rollback or updating traffic allocations (Model Registry Management)
  app.post("/api/models/update", (req, res) => {
    const { id, trafficAllocation, activeStatus } = req.body;
    modelsDb = modelsDb.map(m => {
      if (m.id === id) {
        return {
          ...m,
          trafficAllocation: trafficAllocation !== undefined ? trafficAllocation : m.trafficAllocation,
          activeStatus: activeStatus !== undefined ? activeStatus : m.activeStatus
        };
      }
      return m;
    });

    // Auditor logs model modification
    auditsDb.unshift({
      id: "LOG-" + Math.floor(100 + Math.random() * 900),
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      user: "Super Admin Terminal",
      role: "super_admin",
      action: "MODEL_UPDATE",
      details: `Updated registry system weights or targets for model ID: ${id}. Traffic target adjusted to ${trafficAllocation}%.`,
      ipAddress: "192.168.1.200",
      status: "SUCCESS"
    });

    res.json({ success: true, models: modelsDb });
  });

  // 1. GENERATE estructured draft report using server-side Gemini API
  app.post("/api/generate-medical-report", async (req, res) => {
    const { studyId, modality, patientName, bodyPart, findingText, priority } = req.body;

    if (!ai) {
      // Return beautiful, highly comprehensive synthetic radiology draft report if GEMINI_API_KEY is not defined
      const fallbackReport = `[FALLBACK] DRAFT REPORT GENERATED BY SIMULATOR
=========================================
STUDY DETAILS:
ID: ${studyId || "STUDY-301"}
MODALITY: ${modality || "X-Ray"} | BODY REGION: ${bodyPart || "Chest"}
PRIORITY: ${priority || "Urgent"} | PATIENT: ${patientName || "Arthur Pendragon"}

Radiological Clinical Evaluation:
There is classic patchy area of increased lung consolidation identified at the bottom partition of the right pulmonary lobe. Visogenic borders are irregular with mild costophrenic angle blunting. No evidence of tension pneumothorax or acute osseous fracture.

PRIMARY IMPRESSION:
- LOBAR PNEUMONIA OR LOCALIZED LUNG INFILTRATIVE PROCESS of the lower right thoracic space.
- Grade II focal consolidation indices matching bacterial infection staging.

AI FINDINGS CLASSIFICATION STABILITY:
- Confidence: 91.4%
- Classification Model: ViT-Chest-V4

Assessing Care Guidelines:
Recommended correlation with absolute neutrophil count, blood cultures, and sputum cytology tests. Outpatient monitoring or supplemental oxygenation check is indicated.

--------------------------------------------------
NOTICE: AI-generated assistance requiring professional medical review.`;
      return res.json({ report: fallbackReport, isFallback: true });
    }

    try {
      const prompt = `You are an elite clinical radiology AI reporting assistant (MONAI and DeepVessel engine companion).
Generate a formal, highly technical and polished Structured Radiology Draft Report based on these clinical scan parameters:
- Patient Name: ${patientName}
- Scan Modality: ${modality}
- Anatomical Region: ${bodyPart}
- Core Image Finding Indicator: ${findingText}
- Study Priority Level: ${priority}

Please structure the response with elegant, clearly delimited corporate radiology sections:
1. CLINICAL DETAILS & PROCEDURAL PROTOCOL: Briefly mention anatomical scope.
2. DETAILED FINDINGS: Elaborate expertly on pulmonary/skeletal/tissue aspects with technical terms (e.g., density, blunting, contrast ratios). 
3. PRIMARY IMPRESSION: Top hierarchical diagnoses.
4. CONFIDENCE STAMP & RECOVERY ROADMAP: Suggest follow-ups (e.g. lab correlation, 2-week repeat radiograph, or MRI spectroscopy).

IMPORTANT DISCLOSURE AT END: Include the exact warning string: "AI-generated assistance requiring professional medical review."
Avoid markdown styling that is too chaotic, use neat bullet points and uppercase titles.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
      });

      const text = response.text;
      res.json({ report: text, isFallback: false });
    } catch (err: any) {
      console.error("Gemini report generation error:", err);
      res.status(500).json({ error: "Failed to communicate with AI model. Please verify your GEMINI_API_KEY.", message: err.message });
    }
  });

  // 2. RADIOLOGY COPILOT CHAT - allows radiologists and students to chat with scans, ask medical details, or request tutoring
  app.post("/api/copilot-chat", async (req, res) => {
    const { messages, studyId, modality, bodyPart, finding } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Messages array required" });
    }

    // Get the last message
    const lastUserMessage = messages[messages.length - 1]?.content || "Summarize this scan’s medical context";

    if (!ai) {
      // Simulated interactive responder
      const lower = lastUserMessage.toLowerCase();
      let responseText = "Under clinical medical scanner context, study " + (studyId || "STUDY") + " displays " + (finding || "possible anomalies") + ". ";
      if (lower.includes("explain") || lower.includes("what is")) {
        responseText += `The highlighted consolidation or lesion is marked as localized pixel-wise abnormalities. Grad-CAM displays peak saliency inside the marked rectangle. From a radiological training standpoint, this corresponds to tissue density variance. Recommended tracking by follow-up scanning is clinical standard of care.`;
      } else if (lower.includes("compare") || lower.includes("previous")) {
        responseText += `Comparing this with previous studies on file, patient Arthur Pendragon previously showed unremarkable respiratory density. This acute consolidation represents a sudden active clinical change.`;
      } else if (lower.includes("student") || lower.includes("teach") || lower.includes("notes")) {
        responseText += `TEACHING NOTES & RESIDENCY BRIEFING:
1. Lobar opacification is defined by alveolar air space filled with exudates/fluid.
2. Sillohette sign: If right lower lobe opacity obliterates the right hemidiaphragm but preserves the right heart border, the pathology is localized to the lower lobe.
3. Air bronchograms represent patent airways surrounded by consolidated lung tissue.`;
      } else {
        responseText += `As your Radiology Copilot, I suggest corroborating these findings of ${modality} ${bodyPart} with patient history. How would you like me to inspect this localized ROI or annotate?`;
      }

      responseText += `\n\n*AI-generated assistance requiring professional medical review.*`;
      return res.json({ response: responseText, isFallback: true });
    }

    try {
      // Build a short chat history prompt for Gemini
      const chatHistoryPrompt = messages.map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`).join("\n");
      const fullPrompt = `You are MEDSCAN AI Radiology Copilot, an advanced clinical companion for radiologists, physicians, and medical students.
We are examining this current active study:
- ID: ${studyId}
- Modality: ${modality}
- anatomical scope: ${bodyPart}
- Core finding: ${finding}

Here is the dialogue history:
${chatHistoryPrompt}

Provide a supportive, medically sound, and expert response. Speak with elite professional composure using accurate biomedical vocabulary. Suggest diagnostic hypotheses or differential diagnoses when relevant, and provide teaching notes or anatomy briefings if the user acts like a medical student. 
Include the warning footer "AI-generated assistance requiring professional medical review."`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: fullPrompt,
      });

      res.json({ response: response.text, isFallback: false });
    } catch (err: any) {
      console.error("Gemini Copilot chat error:", err);
      res.status(500).json({ error: "Failed to communicate with AI Copilot.", message: err.message });
    }
  });

  // 3. MULTI-MODAL DIAGNOSTIC AGENT - inputs image descriptors, symptoms, previous reports, lab scores to write differentials and risk scores
  app.post("/api/differential-agent", async (req, res) => {
    const { symptoms, labReports, previousHistory, imageFinding } = req.body;

    if (!ai) {
      // Return simulated Multi-Modal AI Analysis
      return res.json({
        analysis: `MULTI-MODAL DIFFERENTIAL ANALYSIS REPORT
==============================================
CLINICAL SUMMARY:
Symptoms reported: ${symptoms || "Dyspnea, elevated breath rate, fever"}
Lab results input: ${labReports || "Leukocytes 14,000/uL, CRP 45 mg/L"}
Previous Studies: ${previousHistory || "None active"}
Current Modality scan finding: ${imageFinding || "Chest consolidation lower right lobe"}

DIFFERENTIAL DIAGNOSES ANALYSIS:
1. Community Acquired Pneumonia (CAP) - Clinical Probability: 85%
   - Rationale: Matched dry cough, fever, elevated white blood cells (14k), and classic right lower lobe consolidation.
2. Atypical Bronchitis / Viral Pneumonitis - Clinical Probability: 40%
   - Rationale: High WBC and focal radiological consolidation makes bacterial etiology significantly more probable, though mycoplasma represents a secondary candidate.
3. Localized Atelectasis - Clinical Probability: 20%
   - Rationale: Sub-segmental volume loss can simulate focal opacities, but systemic fever and raised CRP markers strongly prioritize infectious agents.

AI DIAGNOSTIC STRATIFICATION RISK SCORE:
- High Severity (Category 3-A Intervention recommended)
- Score: 8.5 / 10

*AI-generated assistance requiring professional medical review.*`,
        isFallback: true
      });
    }

    try {
      const prompt = `You are the MEDSCAN AI Multi-Modal Diagnostic Agent.
Combine the following disparate inputs to generate an elite, structured differential diagnosis analysis and risk score assignment:

- Patient Chief Symptoms: ${symptoms || 'Not reported'}
- Lab Test Results: ${labReports || 'Not reported'}
- Historical Clinical Notes: ${previousHistory || 'None on file'}
- Active Scan Pathological Finding: ${imageFinding || 'Chest X-Ray patch opacity'}

Please output a neatly structured analysis:
1. CLINICAL SYNERGY: How the lab results and symptoms corroborate or conflict with the imaging findings.
2. DIFFERENTIAL CONSIDERATIONS: List 2-3 potential diagnoses with percentage probabilities and justification.
3. RISK SCORE & SEVERITY STRATIFICATION: Give a computed risk score from 1 to 10 (with detailed reasoning of patient vulnerability and acute indicators).
4. SUGGESTED TRIAGE STEPS: Clear next clinical investigations.

Ensure the medical warning is at the bottom: "AI-generated assistance requiring professional medical review."`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
      });

      res.json({ analysis: response.text, isFallback: false });
    } catch (err: any) {
      console.error("Multi-modal agent error:", err);
      res.status(500).json({ error: "Failed to communicate with Multi-Modal Agent.", message: err.message });
    }
  });

  // 4. KNOWLEDGE RAG SYSTEM: Search clinical guidelines and literature references
  app.post("/api/rag-search", async (req, res) => {
    const { query } = req.body;

    if (!query) {
      return res.status(400).json({ error: "Query is required" });
    }

    if (!ai) {
      // Mock guideline retrieval
      return res.json({
        citations: [
          { title: "Fleischner Society Guidelines for Pulmonic Nodules", author: "MacMahon et al.", year: "2017" },
          { title: "ATS/IDSA Diagnosis and Treatment of Community-Acquired Pneumonia", author: "Metlay et al.", year: "2019" }
        ],
        answer: `EVIDENCE-BASED RADIOLOGICAL CLINICAL GUIDELINE RESPONSE:
Regarding your query: "${query}"

1. LUNG NODULES: According to the 2017 Fleischner guidelines, solid solitary pulmonary nodules measuring <6 mm in low-risk patients require no active follow-up, whereas nodules measuring 6-8 mm demand a repeat CT at 6-12 months.
2. ACUTE PNEUMONIA: ATS/IDSA guidelines emphasize empiric antibiotic therapy target initiation within 4 hours of emergency admission when radiographic evidence confirms lobar consolidation with consistent systemic signs.
3. QUALITY CONTROL: High-contrast window styling (Window Level 40, Width 2000) is gold standard for examining alveolar structures.

*AI-generated assistance requiring professional medical review.*`,
        isFallback: true
      });
    }

    try {
      const prompt = `You are the MEDSCAN AI Medical Knowledge Base & RAG Assistant.
A user (radiologist, student, or physician) has requested evidence-based guidance on:
"${query}"

Synthesize an elite response pulling from established medical guidelines (e.g. Fleischner Society guidelines, ACR Criteria, ATS/IDSA pneumonia reports, WHO guidelines). 
Conclude with a 'SUPPORTING MEDICAL LITERATURE CITATIONS' section listing 2 relevant academic journals or guides.

Verify that the advice remains medically precise, safe, informative, and include the footer "AI-generated assistance requiring professional medical review."`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
      });

      res.json({
        answer: response.text,
        citations: [
          { title: "ACR Appropriateness Criteria®", author: "American College of Radiology", year: "2024" },
          { title: "Evidence-Based Imaging Clinical Pathways", author: "Journal of Medical Imaging", year: "2025" }
        ],
        isFallback: false
      });
    } catch (err: any) {
      console.error("RAG search error:", err);
      res.status(500).json({ error: "Failed to query clinical knowledge base.", message: err.message });
    }
  });


  // Serve static files / Vite Setup

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const PORT = 3000;
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[MEDSCAN AI] Server actively listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
