/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Activity, 
  Search, 
  SlidersHorizontal, 
  Upload, 
  Database, 
  FileText, 
  ShieldAlert, 
  Brain, 
  Maximize2, 
  RotateCcw, 
  Tag, 
  CornerDownRight, 
  User, 
  Users, 
  History, 
  Cpu, 
  BookOpen, 
  Plus, 
  MessageSquare, 
  Sparkles, 
  CheckCircle, 
  Clock, 
  RefreshCw, 
  FileCheck, 
  Layers, 
  Eye, 
  Workflow, 
  Lock, 
  FileSignature, 
  Binary, 
  AlertTriangle,
  ZoomIn,
  ZoomOut,
  Sliders,
  ChevronRight,
  Info,
  Trash2,
  Calendar,
  Layers2,
  Split,
  Download
} from 'lucide-react';
import { MedicalStudy, UserRole, Annotation, AIModel, AuditLog, Patient } from './types';

export default function App() {
  // Authentication & RBAC Simulation
  const [currentUser, setCurrentUser] = useState<string>('');
  const [userRole, setUserRole] = useState<UserRole>('radiologist');
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  // Core Clinical State
  const [studies, setStudies] = useState<MedicalStudy[]>([]);
  const [selectedStudy, setSelectedStudy] = useState<MedicalStudy | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [modelsRegistry, setModelsRegistry] = useState<AIModel[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [activeTab, setActiveTab] = useState<'workstation' | 'analytics' | 'audit' | 'models' | 'patients'>('workstation');

  // Comparison & Multi-Slice Viewer State
  const [isComparisonMode, setIsComparisonMode] = useState<boolean>(false);
  const [previousStudy, setPreviousStudy] = useState<MedicalStudy | null>(null);
  const [currentFrameIndex, setCurrentFrameIndex] = useState<number>(0);
  const [showExportReportModal, setShowExportReportModal] = useState<boolean>(false);

  // Automatically sync/find prior baseline scan when active study or studies database updates
  useEffect(() => {
    if (selectedStudy && studies.length > 0) {
      const prior = studies.find(s => s.patientId === selectedStudy.patientId && s.id !== selectedStudy.id);
      setPreviousStudy(prior || null);
    } else {
      setPreviousStudy(null);
    }
  }, [selectedStudy, studies]);

  // Interactive DICOM Viewer Workstation Tweaks
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [panX, setPanX] = useState<number>(0);
  const [panY, setPanY] = useState<number>(0);
  const [windowWidth, setWindowWidth] = useState<number>(1500);
  const [windowCenter, setWindowCenter] = useState<number>(50);
  const [activeAnnotationType, setActiveAnnotationType] = useState<'none' | 'rect' | 'line' | 'comment'>('none');
  const [showHeatmap, setShowHeatmap] = useState<boolean>(true);
  const [heatmapOpacity, setHeatmapOpacity] = useState<number>(0.65);
  const [draftCommentText, setDraftCommentText] = useState<string>('');

  // Saliency simulation target coordinates (where AI attention layer focuses on)
  const [saliencyPoint, setSaliencyPoint] = useState<{ x: number; y: number }>({ x: 580, y: 450 });

  // Canvas drawing ref and coordinate states
  const viewerContainerRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef<boolean>(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const [currentMouseCoords, setCurrentMouseCoords] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDrawingActive, setIsDrawingActive] = useState<boolean>(false);

  // AI Reporting Draft State
  const [reportText, setReportText] = useState<string>('');
  const [isGeneratingReport, setIsGeneratingReport] = useState<boolean>(false);
  const [editedFindings, setEditedFindings] = useState<string>('');
  const [editedRecommendations, setEditedRecommendations] = useState<string>('');
  const [reportApprovedStatus, setReportApprovedStatus] = useState<boolean>(false);

  // Copilot Interactive State
  const [copilotHistory, setCopilotHistory] = useState<{ role: 'user' | 'assistant'; content: string }[]>([
    { role: 'assistant', content: "Welcome to MEDSCAN AI Radiology Copilot. I have mapped this study and initialized the visual saliency map weights. You can ask me to explain localized opacities, teach medical residency notes, or analyze clinical indications." }
  ]);
  const [copilotQuery, setCopilotQuery] = useState<string>('');
  const [isWaitingCopilot, setIsWaitingCopilot] = useState<boolean>(false);

  // Multi-Modal AI Agent Inputs
  const [symptomsInput, setSymptomsInput] = useState<string>('Acute persistent dry cough, dyspnea on continuous exertion, localized chest pressure for 2 weeks');
  const [labsInput, setLabsInput] = useState<string>('Leukocytes 13,800/uL (Elevated), Hematocrit 44%, C-Reactive Protein (CRP) 42 mg/L');
  const [historyInput, setHistoryInput] = useState<string>('Mild asthma in adolescence. Former cigarette smoker (Quit 6 years ago, 8 pack-years). No thoracic trauma.');
  const [multiModalOutput, setMultiModalOutput] = useState<string>('');
  const [isAnalyzingMultiModal, setIsAnalyzingMultiModal] = useState<boolean>(false);

  // Medical Knowledge RAG Retrieval
  const [ragQuery, setRagQuery] = useState<string>('Fleischner pulmonary nodules follow up guidelines for adults');
  const [ragResult, setRagResult] = useState<{ answer: string; citations: { title: string; author: string; year: string }[] } | null>(null);
  const [isSearchingRag, setIsSearchingRag] = useState<boolean>(false);

  // Ingestion form state
  const [showUploadModal, setShowUploadModal] = useState<boolean>(false);
  const [uploadForm, setUploadForm] = useState({
    patientName: '',
    modality: 'X-Ray' as MedicalStudy['modality'],
    bodyPart: 'Chest AP/Lateral',
    priority: 'Routine' as MedicalStudy['priority'],
    finding: '',
    recommendation: '',
    imageUrl: ''
  });

  // Search & Filter controls
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterModality, setFilterModality] = useState<string>('ALL');
  const [filterPriority, setFilterPriority] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  // Simulated metrics
  const [sysMetrics, setSysMetrics] = useState({
    gpuTemp: 64,
    gpuUtil: 84,
    gpuMemUsed: 14.5,
    gpuMemMax: 24.0,
    apiLatency: 142,
    processingQueue: 1
  });

  // Load initial content from custom backend API
  const fetchStudies = async (shouldSelectFirst = false) => {
    try {
      const res = await fetch('/api/studies');
      if (res.ok) {
        const data: MedicalStudy[] = await res.json();
        setStudies(data);
        if (data.length > 0) {
          if (shouldSelectFirst || !selectedStudy) {
            setSelectedStudy(data[0]);
            setEditedFindings(data[0].finding);
            setEditedRecommendations(data[0].recommendation);
            setWindowWidth(data[0].windowWidth);
            setWindowCenter(data[0].windowCenter);
          } else {
            // keep selection synced
            const updatedSelected = data.find(s => s.id === selectedStudy.id);
            if (updatedSelected) {
              setSelectedStudy(updatedSelected);
            }
          }
        }
      }
    } catch (e) {
      console.error("Error fetching studies:", e);
    }
  };

  const fetchPatients = async () => {
    try {
      const res = await fetch('/api/patients');
      if (res.ok) {
        const data = await res.json();
        setPatients(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchModels = async () => {
    try {
      const res = await fetch('/api/models');
      if (res.ok) {
        const data = await res.json();
        setModelsRegistry(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchAudits = async () => {
    try {
      const res = await fetch('/api/audits');
      if (res.ok) {
        const data = await res.json();
        setAuditLogs(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchStudies(true);
    fetchPatients();
    fetchModels();
    fetchAudits();
  }, []);

  // Sync metrics simulation
  useEffect(() => {
    const timer = setInterval(() => {
      setSysMetrics(prev => ({
        ...prev,
        gpuUtil: Math.min(100, Math.max(40, prev.gpuUtil + (Math.random() > 0.5 ? 5 : -5))),
        gpuTemp: Math.min(85, Math.max(55, prev.gpuTemp + (Math.random() > 0.5 ? 1 : -1))),
        gpuMemUsed: Math.min(23.9, Math.max(10.2, Math.round((prev.gpuMemUsed + (Math.random() > 0.5 ? 0.3 : -0.3)) * 10) / 10))
      }));
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  // Log automated auditable events inside server of secure transactions
  const postAuditEvent = async (action: string, details: string, level: 'SUCCESS' | 'WARNING' | 'DENIED' = 'SUCCESS') => {
    try {
      await fetch('/api/audits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user: currentUser || `User (${userRole})`,
          role: userRole,
          action,
          studyId: selectedStudy?.id,
          details,
          status: level
        })
      });
      fetchAudits();
    } catch (e) {
      console.error("Failed to generate audit trail:", e);
    }
  };

  // Sign in sequence
  const handleAuthLogin = (selectedName: string, roleSelected: UserRole) => {
    setCurrentUser(selectedName);
    setUserRole(roleSelected);
    setIsLoggedIn(true);
    // Audit authorization
    postAuditEvent("USER_LOGIN", `Authenticated HIPAA credentials successfully. Authorization level granted: ${roleSelected.toUpperCase()}`);
  };

  // Manage study selections
  const handleSelectStudy = (study: MedicalStudy) => {
    setSelectedStudy(study);
    setEditedFindings(study.finding);
    setEditedRecommendations(study.recommendation);
    setWindowWidth(study.windowWidth);
    setWindowCenter(study.windowCenter);
    // Reset workstation values
    setZoomLevel(1);
    setPanX(0);
    setPanY(0);
    setReportText('');
    setReportApprovedStatus(false);
    setCurrentFrameIndex(0);
    
    // Auto populate coordinates to match pathological sites
    if (study.id === 'STUDY-301') setSaliencyPoint({ x: 580, y: 450 });
    else if (study.id === 'STUDY-502') setSaliencyPoint({ x: 380, y: 300 });
    else if (study.id === 'STUDY-203') setSaliencyPoint({ x: 420, y: 380 });
    else setSaliencyPoint({ x: 450, y: 400 });

    // Copilot initial greeting
    setCopilotHistory([
      { role: 'assistant', content: `Initialized context for study ${study.id} (${study.patientName}, MRN: ${study.mrn}). Visual heatmap segments are active on the diagnostic pane. How can I assist you in characterizing this ${study.modality}?` }
    ]);

    postAuditEvent("ACCESS_STUDY", `Accessed patient scan structure. Modality: ${study.modality}, Priority: ${study.priority}`);
  };

  // Handle PACS Sliders
  const handleWindowReset = () => {
    if (selectedStudy) {
      setWindowWidth(selectedStudy.windowWidth);
      setWindowCenter(selectedStudy.windowCenter);
      setZoomLevel(1);
      setPanX(0);
      setPanY(0);
    }
  };

  // Trigger Gemini-crafted report draft
  const handleGenAiReport = async () => {
    if (!selectedStudy) return;
    setIsGeneratingReport(true);
    setReportText('Awaiting model inference response on clinical vision embeddings...');

    try {
      const response = await fetch('/api/generate-medical-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studyId: selectedStudy.id,
          modality: selectedStudy.modality,
          patientName: selectedStudy.patientName,
          bodyPart: selectedStudy.bodyPart,
          findingText: editedFindings,
          priority: selectedStudy.priority
        })
      });

      if (response.ok) {
        const data = await response.json();
        setReportText(data.report);
        postAuditEvent("AI_DRAFT_REPORT", `Generated structured LLM reporting prototype via Gemini-3.5 API. Fallback state: ${data.isFallback}`);
      } else {
        setReportText("Inference pipeline experienced an API latency timeout. Verify your GEMINI_API_KEY value.");
      }
    } catch (e: any) {
      setReportText(`Inference failed on server-side model routing: ${e.message}`);
    } finally {
      setIsGeneratingReport(false);
    }
  };

  // Apply Changes back to persistent in-memory database
  const handleSaveStudyEdits = async () => {
    if (!selectedStudy) return;
    try {
      const res = await fetch(`/api/studies/${selectedStudy.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          finding: editedFindings,
          recommendation: editedRecommendations,
          status: 'Pending Review'
        })
      });
      if (res.ok) {
        await fetchStudies(false);
        postAuditEvent("EDIT_STUDY_FINDINGS", `Committed clinical report edits. New diagnostic impression: "${editedFindings.slice(0, 45)}..."`);
        alert("Clinical diagnostic corrections saved successfully. Study remains synced to database.");
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Approve final diagnostic findings draft
  const handleApproveReport = () => {
    if (!selectedStudy) return;
    setReportApprovedStatus(true);
    postAuditEvent("APPROVE_FINAL_REPORT", `Approved radiology structured report. Digitally signed as "${currentUser}" (MEMBER ROLE: ${userRole.toUpperCase()})`);
    
    // Update offline status to completed
    fetch(`/api/studies/${selectedStudy.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: 'Completed'
      })
    }).then(() => fetchStudies(false));
  };

  // Ingest manual or custom scan
  const handleIngestStudy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadForm.patientName) return;

    try {
      const res = await fetch('/api/studies/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(uploadForm)
      });
      if (res.ok) {
        await fetchStudies(true); // reload and auto-select newly uploaded study
        await fetchPatients();
        setShowUploadModal(false);
        // reset form
        setUploadForm({
          patientName: '',
          modality: 'X-Ray',
          bodyPart: 'Chest AP/Lateral',
          priority: 'Routine',
          finding: '',
          recommendation: '',
          imageUrl: ''
        });
        alert("Study received into primary PACS server pipeline. Neural vision transformer inferences completed successfully.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Radiology Copilot Dialogue
  const handleSendCopilotQuery = async () => {
    if (!copilotQuery.trim() || !selectedStudy) return;

    const userMsg = { role: 'user' as const, content: copilotQuery };
    setCopilotHistory(prev => [...prev, userMsg]);
    setCopilotQuery('');
    setIsWaitingCopilot(true);

    try {
      const response = await fetch('/api/copilot-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...copilotHistory, userMsg],
          studyId: selectedStudy.id,
          modality: selectedStudy.modality,
          bodyPart: selectedStudy.bodyPart,
          finding: editedFindings
        })
      });

      if (response.ok) {
        const data = await response.json();
        setCopilotHistory(prev => [...prev, { role: 'assistant', content: data.response }]);
        postAuditEvent("COPILOT_CHAT", `Queried Radiology AI Copilot. Question: ${userMsg.content.slice(0,40)}`);
      } else {
        setCopilotHistory(prev => [...prev, { role: 'assistant', content: "Our diagnostic copilot process encountered a communications lag. Please check if your key is configured." }]);
      }
    } catch (e: any) {
      setCopilotHistory(prev => [...prev, { role: 'assistant', content: `Network disruption on copilot stream: ${e.message}` }]);
    } finally {
      setIsWaitingCopilot(false);
    }
  };

  // Multi-Modal diagnostic assessment trigger
  const handleRunMultiModalAgent = async () => {
    setIsAnalyzingMultiModal(true);
    setMultiModalOutput('AI Agent synthesizing physical attributes, history, and physiological lab patterns...');

    try {
      const res = await fetch('/api/differential-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symptoms: symptomsInput,
          labReports: labsInput,
          previousHistory: historyInput,
          imageFinding: selectedStudy ? editedFindings : 'Consolidation indicated'
        })
      });

      if (res.ok) {
        const data = await res.json();
        setMultiModalOutput(data.analysis);
        postAuditEvent("MULTIMODAL_AGENT", `Completed patient symptom/lab sensor fusion diagnostic matrix analysis.`);
      } else {
        setMultiModalOutput("Pipeline communication errored. Check backend logs.");
      }
    } catch (e: any) {
      setMultiModalOutput(`API exception: ${e.message}`);
    } finally {
      setIsAnalyzingMultiModal(false);
    }
  };

  // Render and execute clinical PDF report printing / saving
  const handlePrintPDFReport = () => {
    if (!selectedStudy) return;
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Print document generation blocked. Please permit pop-ups to export this PDF diagnostic summary.");
      return;
    }
    
    const annotationsHtml = selectedStudy.annotations && selectedStudy.annotations.length > 0
      ? selectedStudy.annotations.map((ann, idx) => `
          <tr style="border-bottom: 1px solid #e1e8f0;">
            <td style="padding: 10px; font-family: monospace; font-weight: bold; color: #1e293b;">TAG-${idx+1}</td>
            <td style="padding: 10px; text-transform: uppercase; font-size: 11px; font-weight: 600; color: #475569;">${ann.type} Annotation</td>
            <td style="padding: 10px; color: #0f172a;">${ann.text || 'Pathological Region'}</td>
            <td style="padding: 10px; font-weight: bold; color: #dc2626;">${ann.measuredValue || 'Visual Identification'}</td>
            <td style="padding: 10px; font-size: 11px; color: #64748b;">${ann.createdBy || 'Medscan Assistant'}</td>
          </tr>
        `).join("")
      : '<tr><td colspan="5" style="padding: 16px; text-align: center; color: #64748b; font-style: italic;">No diagnostic annotation highlights registered for this study in viewport.</td></tr>';

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>MEDSCAN_AI_Report_${selectedStudy.id}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
            body { font-family: 'Inter', sans-serif; color: #1e293b; padding: 45px; line-height: 1.6; background-color: #ffffff; }
            .header { display: flex; justify-content: space-between; align-items: flex-end; border-bottom: 4px solid #0f172a; padding-bottom: 24px; margin-bottom: 35px; }
            .logo-title { font-size: 26px; font-weight: 800; letter-spacing: -0.75px; margin: 0; color: #0f172a; text-transform: uppercase; }
            .tagline { font-size: 11px; color: #475569; margin: 4px 0 0 0; font-weight: 500; letter-spacing: 0.5px; }
            .clearance-badge { background: #fee2e2; color: #991b1b; padding: 5px 10px; border-radius: 6px; font-size: 10px; font-weight: bold; letter-spacing: 1px; text-transform: uppercase; border: 1px solid #fecaca; }
            .meta-grid { display: grid; grid-template-cols: repeat(2, 1fr); gap: 20px; margin-bottom: 40px; background: #f8fafc; padding: 24px; border-radius: 12px; border: 1px solid #e2e8f0; }
            .meta-item { font-size: 13px; color: #334155; }
            .meta-label { font-weight: 700; color: #64748b; font-size: 10px; text-transform: uppercase; letter-spacing: 1px; display: block; margin-bottom: 4px; }
            .meta-value { font-size: 14px; font-weight: 600; color: #0f172a; }
            .section-block { margin-bottom: 35px; }
            h3 { font-size: 12px; text-transform: uppercase; letter-spacing: 1.5px; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; margin-bottom: 16px; color: #0f172a; font-weight: 800; }
            p { font-size: 14px; color: #334155; margin: 0 0 12px 0; }
            .findings-text { font-size: 15px; color: #0f172a; font-weight: 500; font-style: italic; background-color: #f1f5f9; padding: 18px; border-radius: 8px; border-left: 4px solid #0284c7; }
            table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 13px; }
            th { text-align: left; background: #f8fafc; padding: 12px 10px; font-weight: 700; color: #475569; border-bottom: 2px solid #e2e8f0; text-transform: uppercase; font-size: 10px; letter-spacing: 0.5px; }
            .footer { text-align: center; margin-top: 75px; font-size: 10px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 25px; line-height: 1.5; }
            @media print {
              body { padding: 20px; }
              .meta-grid { background: #ffffff !important; border: 1px solid #cbd5e1; }
              .findings-text { background-color: #ffffff !important; border: 1px solid #cbd5e1; border-left: 4px solid #0f172a; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <h1 class="logo-title">MEDSCAN AI Diagnostics</h1>
              <p class="tagline">Cloud PACS Universal Healthcare Intelligence Registry</p>
            </div>
            <div style="text-align: right;">
              <span class="clearance-badge">HIPAA Classified Summary</span>
              <p style="font-size: 11px; color: #64748b; margin: 8px 0 0 0; font-weight: 500;">Date Exported: ${new Date().toLocaleString()}</p>
            </div>
          </div>

          <div class="meta-grid">
            <div class="meta-item"><span class="meta-label">Patient Demographics</span><span class="meta-value">${selectedStudy.patientName}</span></div>
            <div class="meta-item"><span class="meta-label">Medical Record Number (MRN)</span><span class="meta-value">${selectedStudy.mrn}</span></div>
            <div class="meta-item"><span class="meta-label font-bold">Anatomical Procedure</span><span class="meta-value">${selectedStudy.modality} • ${selectedStudy.bodyPart}</span></div>
            <div class="meta-item"><span class="meta-label">PACS Access Token</span><span class="meta-value" style="font-family: monospace;">${selectedStudy.id}</span></div>
            <div class="meta-item"><span class="meta-label">Study Date & Acquisition Time</span><span class="meta-value">${selectedStudy.studyDate}</span></div>
            <div class="meta-item"><span class="meta-label">AI Pipeline Safety Index</span><span class="meta-value text-sky-600">${selectedStudy.confidence}% Confidence Rating</span></div>
          </div>

          <div class="section-block">
            <h3>Diagnostic Finding Interpretation</h3>
            <div class="findings-text">"${editedFindings || selectedStudy.finding}"</div>
          </div>

          <div class="section-block">
            <h3>Suggested Management & Recommendations</h3>
            <p style="font-size: 14px; font-weight: 500; color: #1e293b;">${editedRecommendations || selectedStudy.recommendation}</p>
          </div>

          <div class="section-block">
            <h3>Registered PACS Pathological Region Annotations & Metrics</h3>
            <table>
              <thead>
                <tr>
                  <th style="width: 10%;">Ref ID</th>
                  <th style="width: 20%;">Mark Type</th>
                  <th style="width: 35%;">Structural Description</th>
                  <th style="width: 20%;">Computed Dimensions</th>
                  <th style="width: 15%;">Operator Tag</th>
                </tr>
              </thead>
              <tbody>
                ${annotationsHtml}
              </tbody>
            </table>
          </div>

          <div class="footer">
            <p style="font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px; color: #64748b; margin-bottom: 4px;">CONFIDENTIAL RECORD • HEALTH INSURANCE PORTABILITY AND ACCOUNTABILITY ACT PROTECTED</p>
            <p>Important Notice: This clinical draft is compiled dynamically using machine learning neural inference. Final diagnostic clearance and therapeutic pathways must be designated and signed off by a certified physician.</p>
          </div>
          <script>
            window.onload = function() {
              setTimeout(function(){
                window.print();
              }, 400);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
    postAuditEvent("EXPORT_PDF", `Generated and triggered HIPAA print workflow for report ${selectedStudy.id}`);
  };

  // Download structured clinical JSON telemetry
  const handleExportJSONReport = () => {
    if (!selectedStudy) return;
    const reportData = {
      pacs_identifier: selectedStudy.id,
      patient_id: selectedStudy.patientId,
      patient_full_name: selectedStudy.patientName,
      medical_record_number: selectedStudy.mrn,
      imaging_modality: selectedStudy.modality,
      anatomical_focus: selectedStudy.bodyPart,
      acquisition_date: selectedStudy.studyDate,
      clinical_finding_draft: editedFindings || selectedStudy.finding,
      assisted_followup_recommendations: editedRecommendations || selectedStudy.recommendation,
      annotations_trace_manifest: selectedStudy.annotations || [],
      neural_confidence_score: selectedStudy.confidence,
      regulatory_clearance: "HIPAA-SECURED-EXPORT",
      exporting_physician_handle: currentUser || "PACS Operator",
      export_timestamp: new Date().toISOString()
    };
    
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(reportData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `MEDSCAN_DiagnosticReport_${selectedStudy.id}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    postAuditEvent("EXPORT_JSON", `Downloaded structured telemetry JSON report for PACS study ${selectedStudy.id}`);
  };

  // RAG Search implementation
  const handleRagSearch = async () => {
    if (!ragQuery.trim()) return;
    setIsSearchingRag(true);

    try {
      const res = await fetch('/api/rag-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: ragQuery })
      });

      if (res.ok) {
        const data = await res.json();
        setRagResult({
          answer: data.answer,
          citations: data.citations || []
        });
        postAuditEvent("RAG_SEARCH", `Searched guidelines and databases for: "${ragQuery.slice(0, 30)}"`);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSearchingRag(false);
    }
  };

  // Super Admin Traffic Controller
  const handleUpdateModelAllocation = async (modelId: string, value: number) => {
    try {
      const res = await fetch('/api/models/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: modelId, trafficAllocation: value })
      });
      if (res.ok) {
        fetchModels();
        postAuditEvent("MODEL_TRAFFIC_TWEAK", `Altered A/B routing parameter for model ${modelId} to ${value}%.`);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Interactivity Handlers for Drawing Custom CAD/PACS Annotations
  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (activeAnnotationType === 'none' || !selectedStudy) return;
    const rect = viewerContainerRef.current?.getBoundingClientRect();
    if (!rect) return;

    // Relative mouse position
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    isDraggingRef.current = true;
    dragStartRef.current = { x: clickX, y: clickY };
    setCurrentMouseCoords({ x: clickX, y: clickY });
    setIsDrawingActive(true);
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;
    const rect = viewerContainerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const currentX = e.clientX - rect.left;
    const currentY = e.clientY - rect.top;
    setCurrentMouseCoords({ x: currentX, y: currentY });
  };

  const handleCanvasMouseUp = async () => {
    if (!isDraggingRef.current || !selectedStudy || activeAnnotationType === 'none') return;
    isDraggingRef.current = false;
    setIsDrawingActive(false);

    // Calculate width or distance
    const dx = Math.abs(currentMouseCoords.x - dragStartRef.current.x);
    const dy = Math.abs(currentMouseCoords.y - dragStartRef.current.y);
    const distanceVal = Math.round(Math.sqrt(dx * dx + dy * dy) * 0.15 * 10) / 10; // calibration factor

    const label = activeAnnotationType === 'rect' ? 'Region of Interest' : 'Pathology Dimension';
    const computedMetric = `${distanceVal} mm`;

    const newAnnotation: Annotation = {
      id: "a" + Date.now(),
      type: activeAnnotationType === 'comment' ? 'text' : activeAnnotationType,
      coords: {
        x1: dragStartRef.current.x,
        y1: dragStartRef.current.y,
        x2: currentMouseCoords.x,
        y2: currentMouseCoords.y
      },
      text: label,
      measuredValue: computedMetric,
      createdBy: currentUser || 'Radiologist'
    };

    const updatedAnnotations = [...selectedStudy.annotations, newAnnotation];

    // Save back to backend DB
    try {
      const res = await fetch(`/api/studies/${selectedStudy.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ annotations: updatedAnnotations })
      });
      if (res.ok) {
        await fetchStudies();
        postAuditEvent("ADD_ANNOTATION", `Created local ${activeAnnotationType} measuring marker: "${computedMetric}"`);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const clearAnnotations = async () => {
    if (!selectedStudy) return;
    try {
      const res = await fetch(`/api/studies/${selectedStudy.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ annotations: [] })
      });
      if (res.ok) {
        await fetchStudies();
        postAuditEvent("CLEAR_ANNOTATIONS", `Cleared diagnostic vector measurements.`);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Add Comment feature
  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draftCommentText.trim() || !selectedStudy) return;

    const newComment = {
      id: "c" + Date.now(),
      user: currentUser || "Dr. Staff",
      role: userRole,
      text: draftCommentText,
      date: new Date().toISOString().replace('T', ' ').slice(0, 16)
    };

    const updatedComments = [...selectedStudy.comments, newComment];

    try {
      const res = await fetch(`/api/studies/${selectedStudy.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ comments: updatedComments })
      });
      if (res.ok) {
        await fetchStudies();
        setDraftCommentText('');
        postAuditEvent("ADD_STUDY_COMMENT", `Contributed collaborative diagnostic note: "${draftCommentText.slice(0, 30)}..."`);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Filter Studies
  const filteredStudies = studies.filter(s => {
    const matchesSearch = s.patientName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          s.mrn.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          s.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesModality = filterModality === 'ALL' || s.modality === filterModality;
    const matchesPriority = filterPriority === 'ALL' || s.priority === filterPriority;
    const matchesStatus = filterStatus === 'ALL' || s.status === filterStatus;
    return matchesSearch && matchesModality && matchesPriority && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-[#070b12] text-[#f1f5f9] font-sans antialiased flex flex-col selection:bg-cyan-500 selection:text-black">
      
      {/* AUTH SCREEN INJECTION COUPLING (Role Picker Modal Overlay) */}
      {!isLoggedIn && (
        <div id="auth-overlay" className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
          <div className="w-full max-w-2xl bg-gradient-to-b from-[#131b2e] to-[#0a0f1d] border border-cyan-500/30 p-8 rounded-2xl shadow-2xl relative overflow-hidden">
            
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl -z-10" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl -z-10" />

            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 bg-cyan-950/50 border border-cyan-500/40 px-3 py-1.5 rounded-full text-xs font-semibold tracking-wider text-cyan-400 uppercase mb-4">
                <Brain className="w-4 h-4 text-cyan-400 animate-pulse" />
                Medical Artificial Intelligence Platform
              </div>
              <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-cyan-400 bg-clip-text text-transparent">
                MEDSCAN AI
              </h1>
              <p className="text-slate-400 mt-2 text-sm max-w-md mx-auto">
                Enterprise-Grade Universal Medical Imaging Intelligence Platform for radiology workstations, diagnostic validation, and smart workflow integration.
              </p>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl mb-6 text-xs text-slate-400 leading-relaxed">
              <div className="flex gap-2 items-start text-amber-500/90 font-medium mb-1">
                <ShieldAlert className="w-4 h-4 flex-shrink-0" />
                <span>HIPAA & SECURE CLINICAL PIPELINE WORKSTATION</span>
              </div>
              This is a secondary clinical decision aid. AI findings must be recognized as auxiliary tools. All final outputs are marked: 
              <span className="text-cyan-400 font-semibold italic"> "AI-generated assistance requiring professional medical review."</span>
            </div>

            <h3 className="text-xs font-bold uppercase text-slate-400 mb-3 tracking-wider flex items-center gap-1.5">
              <Users className="w-4 h-4 text-slate-400" />
              Select Authorized User Category (Enterprise Role)
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {[
                { name: "Dr. Keith Vance", role: "radiologist" as const, desc: "Acknowledge findings, annotate studies, approve reports.", color: "border-emerald-500/20 hover:border-emerald-500 text-emerald-400 bg-emerald-500/5 hover:bg-emerald-500/10" },
                { name: "Dr. Rachel Carter", role: "doctor" as const, desc: "Order analyses, view annotations, clinical consultations.", color: "border-blue-500/20 hover:border-blue-500 text-blue-400 bg-blue-500/5 hover:bg-blue-500/10" },
                { name: "Diagnostic Tech", role: "diagnostic_center" as const, desc: "Bulk upload studies, handle intake priority pipelines.", color: "border-purple-500/20 hover:border-purple-500 text-purple-400 bg-purple-500/5 hover:bg-purple-500/10" },
                { name: "Resident Student", role: "student" as const, desc: "Learn anomalies, review visual tutor explanations.", color: "border-amber-500/20 hover:border-amber-500 text-amber-400 bg-amber-500/5 hover:bg-amber-500/10" },
                { name: "System Controller", role: "super_admin" as const, desc: "Model parameters, rollbacks, full system audit logs.", color: "border-red-500/20 hover:border-red-500 text-red-500 bg-red-500/5 hover:bg-red-500/10" },
                { name: "Chief Officer", role: "admin" as const, desc: "Inspect clinical KPIs, verify compliance traces.", color: "border-cyan-500/20 hover:border-cyan-500 text-cyan-400 bg-cyan-500/5 hover:bg-cyan-500/10" }
              ].map((role) => (
                <button
                  key={role.role}
                  id={`role-btn-${role.role}`}
                  onClick={() => handleAuthLogin(role.name, role.role)}
                  className={`border p-3.5 rounded-xl text-left transition-all hover:scale-[1.02] flex flex-col justify-between h-32 relative ${role.color}`}
                >
                  <div>
                    <span className="font-bold block text-sm text-slate-100">{role.name}</span>
                    <span className="text-[10px] uppercase font-semibold tracking-wider opacity-85">{role.role.replace('_', ' ')}</span>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-tight mt-1">{role.desc}</p>
                </button>
              ))}
            </div>

            <div className="mt-6 pt-5 border-t border-slate-800 text-center">
              <span className="text-[10px] text-slate-500 tracking-wider">
                DEVELOPMENT DEV-BUILD • CONTAINER ENGINE ACTIVE PORT: 3000
              </span>
            </div>
          </div>
        </div>
      )}

      {/* HEADER BAR */}
      <header id="main-header" className="border-b border-slate-800 bg-[#0b1329] px-6 py-3.5 flex flex-col lg:flex-row justify-between items-center gap-4 sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-900/30">
            <Brain className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-lg tracking-wider text-white">MEDSCAN <span className="text-cyan-400">AI</span></span>
              <span className="bg-cyan-500/10 text-cyan-400 text-[9px] px-2 py-0.5 rounded border border-cyan-500/20 uppercase tracking-widest font-black">ENTERPRISE v4.2</span>
            </div>
            <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Universal Radiology Decision Support & Workflow Workstation</p>
          </div>
        </div>

        {/* Audit / Compliance Ticker */}
        <div className="hidden xl:flex items-center gap-4 bg-slate-900/75 border border-slate-800 px-4 py-1.5 rounded-xl text-xs max-w-md">
          <span className="text-emerald-500 flex items-center gap-1.5 font-bold shrink-0">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            SECURE LINK TO LOCAL DATABASES
          </span>
          <span className="text-slate-400 text-[10px] line-clamp-1">
            HIPAA Audit Active • Logs dispatched on study access / ROI draws
          </span>
        </div>

        {/* User Badge & Sign Out */}
        <div className="flex items-center gap-3">
          <div className="bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-1 flex items-center gap-2.5">
            <User className="w-4 h-4 text-cyan-400" />
            <div className="text-left">
              <span className="text-xs font-semibold block text-slate-100">{currentUser || "Anonymous User"}</span>
              <span className="text-[9px] text-cyan-400 uppercase tracking-wider font-extrabold">{userRole.replace('_', ' ')}</span>
            </div>
          </div>
          
          <button 
            id="sign-out-btn"
            onClick={() => {
              setIsLoggedIn(false);
              setCurrentUser('');
            }}
            className="bg-slate-920 text-slate-400 hover:text-white border border-slate-800 hover:border-slate-700 px-3 py-1.5 rounded-xl text-xs transition"
          >
            Log Out
          </button>
        </div>
      </header>

      {/* QUICK STATUS TICKER BAR */}
      <section className="bg-[#0c1222] border-b border-slate-800/80 px-6 py-2 flex flex-wrap justify-between items-center text-[11px] text-slate-400 gap-3">
        <div className="flex items-center gap-5">
          <span className="flex items-center gap-1.5"><Cpu className="w-3.5 h-3.5 text-cyan-400" /> GPU Temp: <strong className="text-slate-200">{sysMetrics.gpuTemp}°C</strong></span>
          <span className="flex items-center gap-1.5"><Activity className="w-3.5 h-3.5 text-cyan-400" /> GPU Load: <strong className="text-slate-200">{sysMetrics.gpuUtil}%</strong></span>
          <span className="flex items-center gap-1.5"><Database className="w-3.5 h-3.5 text-cyan-400" /> VRAM Allocation: <strong className="text-slate-200">{sysMetrics.gpuMemUsed} / {sysMetrics.gpuMemMax} GB</strong></span>
        </div>
        <div className="flex items-center gap-4">
          <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono">REST API: 3000</span>
          <span>Time: <span className="font-mono text-slate-200">2026-06-19 10:52 UTC</span></span>
        </div>
      </section>

      {/* CORE CONTENT LAYOUT */}
      <main className="flex-1 flex flex-col xl:flex-row overflow-hidden">
        
        {/* TAB WORKSPACE ACCORDION SWITCHER */}
        <section className="w-full xl:w-20 border-r border-slate-800 bg-[#080d19] flex xl:flex-col items-center justify-center xl:justify-start gap-4 p-3 overflow-x-auto xl:overflow-x-visible shrink-0">
          {[
            { id: 'workstation', label: 'Workstation', icon: Maximize2, desc: 'PACS Viewer' },
            { id: 'patients', label: 'Patients', icon: Users, desc: 'Clinical Records' },
            { id: 'models', label: 'Models', icon: Brain, desc: 'A/B Registry' },
            { id: 'analytics', label: 'KPI Panel', icon: Activity, desc: 'System Metrics' },
            { id: 'audit', label: 'Audits', icon: FileSignature, desc: 'Security HIPAA' }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`workspace-tab-${tab.id}`}
                onClick={() => {
                  setActiveTab(tab.id as any);
                  postAuditEvent("SWITCH_TAB", `Switched clinical workspace to: ${tab.label}`);
                }}
                className={`relative w-14 h-14 rounded-xl flex flex-col items-center justify-center transition-all ${
                  isActive 
                    ? 'bg-cyan-500/15 border-2 border-cyan-500 text-cyan-400' 
                    : 'bg-slate-900/60 border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
                title={tab.desc}
              >
                <Icon className="w-5 h-5 mb-0.5" />
                <span className="text-[8px] font-bold uppercase tracking-wider truncate max-w-full text-center">{tab.label}</span>
                {isActive && <span className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-3 bg-cyan-400 rounded-l hidden xl:block" />}
              </button>
            );
          })}
        </section>

        {/* WORKSTATION VIEW (The core feature) */}
        {activeTab === 'workstation' && (
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden bg-[#05080f]">
            
            {/* STUDIES DIRECTORY (LEFT COLUMN) */}
            <div className="w-full md:w-80 lg:w-[350px] border-r border-slate-800 flex flex-col shrink-0 bg-[#0a0f1d] max-h-[85vh] md:max-h-none overflow-y-auto">
              
              {/* Directory Header with Actions */}
              <div className="p-4 border-b border-indigo-950 bg-slate-900/50 flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold uppercase text-slate-300 tracking-wider flex items-center gap-1.5">
                    <Database className="w-3.5 h-3.5 text-cyan-500" />
                    Imaging Research Registry
                  </h3>
                  <p className="text-[10px] text-slate-400">{filteredStudies.length} matching datasets active</p>
                </div>

                {/* Dropdown/Ingest activation based on permissions */}
                {(userRole === 'radiologist' || userRole === 'diagnostic_center' || userRole === 'super_admin') && (
                  <button
                    id="trigger-upload"
                    onClick={() => setShowUploadModal(true)}
                    className="bg-cyan-600/20 hover:bg-cyan-600 text-cyan-400 hover:text-white border border-cyan-500/30 hover:border-cyan-500 p-1.5 rounded-lg text-xs transition flex items-center gap-1 font-bold"
                    title="Ingest single or batch DICOM study"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Ingest
                  </button>
                )}
              </div>

              {/* SEARCH & FILTERS CONTROLS */}
              <div className="p-3 border-b border-slate-800 bg-[#090d18] grid gap-2">
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-2.5 pointer-events-none">
                    <Search className="h-3 w-3 text-slate-400" />
                  </span>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search Patient, MRN or ID..."
                    className="w-full pl-8 pr-2 py-1.5 bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-lg text-xs placeholder-slate-500 text-slate-200 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-3 gap-1.5 text-[10px]">
                  <div>
                    <label className="text-slate-500 block mb-0.5 uppercase tracking-tighter">Modality</label>
                    <select
                      value={filterModality}
                      onChange={(e) => setFilterModality(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 p-1 rounded font-semibold text-slate-300 focus:outline-none focus:border-cyan-500"
                    >
                      <option value="ALL">All Tools</option>
                      <option value="X-Ray">X-Ray</option>
                      <option value="CT">CT Scan</option>
                      <option value="MRI">MRI Scan</option>
                      <option value="Ultrasound">Ultrasound</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-slate-500 block mb-0.5 uppercase tracking-tighter">Priority</label>
                    <select
                      value={filterPriority}
                      onChange={(e) => setFilterPriority(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 p-1 rounded font-semibold text-slate-300 focus:outline-none"
                    >
                      <option value="ALL">All Risks</option>
                      <option value="Routine">Routine</option>
                      <option value="Urgent">Urgent</option>
                      <option value="STAT">STAT</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-slate-500 block mb-0.5 uppercase tracking-tighter">PACS Status</label>
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 p-1 rounded font-semibold text-slate-300 focus:outline-none"
                    >
                      <option value="ALL">All States</option>
                      <option value="Unassigned">Unassigned</option>
                      <option value="Processing">Processing</option>
                      <option value="Pending Review">Review Pending</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* STUDIES CONTAINER GRID */}
              <div className="flex-1 overflow-y-auto division divide-y divide-slate-800/80">
                {filteredStudies.map((study) => {
                  const isCur = selectedStudy?.id === study.id;
                  let priorityColor = 'bg-slate-800 text-slate-300';
                  if (study.priority === 'STAT') priorityColor = 'bg-red-950 text-red-400 border border-red-800/50';
                  else if (study.priority === 'Urgent') priorityColor = 'bg-amber-950/80 text-amber-500 border border-amber-800/45';

                  let statusColor = 'text-slate-400 bg-slate-900';
                  if (study.status === 'Completed') statusColor = 'text-emerald-400 bg-emerald-950/40 border border-emerald-900/40';
                  else if (study.status === 'Pending Review') statusColor = 'text-cyan-400 bg-cyan-950/40 border border-cyan-900/40 animate-pulse';

                  return (
                    <button
                      key={study.id}
                      id={`study-card-${study.id}`}
                      onClick={() => handleSelectStudy(study)}
                      className={`w-full text-left p-3.5 transition-all flex gap-3 relative ${
                        isCur 
                          ? 'bg-[#121c33] border-l-4 border-cyan-500' 
                          : 'hover:bg-slate-900/50 bg-slate-900/20'
                      }`}
                    >
                      {/* Modality Icon Preview */}
                      <div className="w-12 h-12 rounded bg-slate-950 flex flex-col justify-between p-1 shrink-0 border border-slate-800 text-center relative overflow-hidden">
                        <span className="text-[10px] font-black tracking-tight text-slate-300">{study.modality}</span>
                        <Layers className="w-5 h-5 mx-auto text-slate-500" />
                        <span className="text-[8px] bg-cyan-500 text-black absolute bottom-0 left-0 right-0 font-bold block leading-relaxed">{study.id.split('-')[1]}</span>
                      </div>

                      {/* Study details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1 mb-0.5">
                          <span className="text-xs font-bold text-slate-200 truncate">{study.patientName}</span>
                          <span className={`text-[8px] uppercase font-black px-1.5 py-0.2 rounded ${priorityColor}`}>
                            {study.priority}
                          </span>
                        </div>

                        <div className="text-[10px] text-slate-400 flex items-center justify-between mt-1">
                          <span>MRN: <strong className="text-slate-300 font-mono">{study.mrn}</strong></span>
                          <span className="text-slate-500 text-[9px]">{study.studyDate}</span>
                        </div>

                        <div className="text-[10px] text-slate-400 mt-1 truncate">
                          Scope: <span className="text-slate-300 font-semibold">{study.bodyPart}</span>
                        </div>

                        {/* Badges bar */}
                        <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-800/50">
                          <span className={`text-[9px] font-semibold px-2 py-0.5 rounded ${statusColor}`}>
                            • {study.status}
                          </span>
                          <span className="text-[10px] text-cyan-400 font-semibold flex items-center gap-1 bg-slate-950/85 px-1.5 py-0.2 rounded">
                            <Binary className="w-3 h-3 text-cyan-500" />
                            {study.confidence}% Conf.
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })}

                {filteredStudies.length === 0 && (
                  <div className="p-8 text-center text-slate-500">
                    <Activity className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                    <p className="text-xs">No matching studies in primary pipeline.</p>
                  </div>
                )}
              </div>
            </div>

            {/* PACS DICOM VIEW WORKSTATION (CENTER COLUMN) */}
            <div className="flex-1 border-r border-slate-800 flex flex-col bg-[#05070c] relative">
              
              {/* Workstation PACS Header */}
              {selectedStudy ? (
                <>
                  <div className="p-3 bg-slate-900/50 border-b border-slate-800 flex flex-wrap justify-between items-center gap-3">
                    <div className="flex items-center gap-4">
                      {/* Active Patient Flag */}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-cyan-400 uppercase tracking-wide">Active Diagnostic Workstation</span>
                          <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-400 uppercase font-mono font-bold tracking-normal">{selectedStudy.id}</span>
                        </div>
                        <h2 className="text-sm font-black text-white flex items-center gap-1.5">
                          {selectedStudy.patientName} 
                          <span className="text-slate-400 font-normal text-xs">(MRN: {selectedStudy.mrn})</span>
                        </h2>
                      </div>
                    </div>

                    {/* Windowing Tools Indicator */}
                    <div className="flex items-center gap-2 bg-slate-950/80 p-1.5 rounded-lg border border-slate-800">
                      <span className="text-[10px] text-slate-400 px-1">Windowing:</span>
                      <span className="bg-slate-900 border border-slate-800 text-[10px] font-mono text-cyan-400 px-2 py-0.5 rounded">W: {windowWidth}</span>
                      <span className="bg-slate-900 border border-slate-800 text-[10px] font-mono text-cyan-400 px-2 py-0.5 rounded">C: {windowCenter}</span>
                    </div>

                    {/* Quick Resetter */}
                    <button 
                      onClick={handleWindowReset}
                      className="bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 px-3 py-1 rounded text-[11px] font-medium transition flex items-center gap-1 shrink-0"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      PACS Reset
                    </button>

                    {/* Comparison Mode Toggle */}
                    <button 
                      onClick={() => {
                        setIsComparisonMode(prev => {
                          const nextVal = !prev;
                          postAuditEvent("TOGGLE_COMPARISON_MODE", `Toggled clinical previous-scan comparison mode ${nextVal ? 'ON' : 'OFF'}`);
                          return nextVal;
                        });
                      }}
                      className={`px-3 py-1 rounded text-[11px] font-semibold transition flex items-center gap-1.5 border shrink-0 ${
                        isComparisonMode 
                          ? 'bg-cyan-500 text-black border-cyan-400 shadow shadow-cyan-500/40 font-bold' 
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                      }`}
                      title="Split view to compare active study against prior historical scan"
                    >
                      <Split className="w-3.5 h-3.5" />
                      {isComparisonMode ? 'Split Mode Active' : 'Comparison Mode'}
                    </button>

                    {/* Report Export Button */}
                    <button 
                      onClick={() => {
                        setShowExportReportModal(true);
                        postAuditEvent("OPEN_EXPORT_MODAL", "Opened diagnostic annotations and clinical metrics report generation hub");
                      }}
                      className="bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white border border-cyan-500/30 px-3 py-1 rounded text-[11px] font-extrabold transition flex items-center gap-1.5 shadow-md shadow-indigo-950 shrink-0"
                    >
                      <Download className="w-3.5 h-3.5 text-white" />
                      Export Report
                    </button>
                  </div>

                  {/* MAIN PACS VIEWER WORKBENCH */}
                  <div className="flex-1 flex flex-col min-h-0 relative select-none">
                    
                    {/* Floating Info Overlay (top corner of PACS console) */}
                    <div className="absolute top-4 left-4 z-20 pointer-events-none bg-black/80 backdrop-blur border border-slate-800 p-3 rounded-lg text-[10px] text-slate-300 font-mono tracking-wider space-y-1">
                      <div>PATIENT: {selectedStudy.patientName}</div>
                      <div>AGE/SEX: {patients.find(p=>p.id===selectedStudy.patientId)?.age || 45}Y / {patients.find(p=>p.id===selectedStudy.patientId)?.gender || "M"}</div>
                      <div>STUDY STUDY_ID: {selectedStudy.id}</div>
                      <div>MODALITY: {selectedStudy.modality} ({selectedStudy.bodyPart})</div>
                      <div>IMAGE MATRIX: 2048 x 2048 (16-bit)</div>
                      <div className="text-cyan-400 font-bold">MONAI Inference Model: DeepVessel-ViT</div>
                    </div>

                    {/* RIGHT PACS PANEL WORK PREVIEW CONTROLS (Floating toolbar right hand side) */}
                    <div className="absolute top-4 right-4 z-20 flex flex-col gap-2 bg-slate-950/90 backdrop-blur border border-slate-800 p-2 rounded-xl">
                      
                      {/* Zoom controls */}
                      <div className="flex flex-col border-b border-slate-800/80 pb-2">
                        <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest text-center mb-1">ZOOM</span>
                        <div className="flex gap-1">
                          <button 
                            onClick={() => setZoomLevel(prev => Math.min(3, prev + 0.25))}
                            className="bg-slate-900 hover:bg-slate-800 hover:text-cyan-400 p-1.5 rounded border border-slate-850"
                            title="Zoom In"
                          >
                            <ZoomIn className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => setZoomLevel(prev => Math.max(0.5, prev - 0.25))}
                            className="bg-slate-900 hover:bg-slate-800 hover:text-cyan-400 p-1.5 rounded border border-slate-850"
                            title="Zoom Out"
                          >
                            <ZoomOut className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Diagnostic HUD Annotation layer buttons */}
                      <div className="flex flex-col border-b border-slate-800/80 pb-2">
                        <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest text-center mb-1">ROI CAD</span>
                        <div className="grid grid-cols-2 gap-1">
                          <button
                            onClick={() => {
                              setActiveAnnotationType('rect');
                              postAuditEvent("SELECT_ANNOTATION_TOOL", "Activated PACS rectangular CAD selector");
                            }}
                            className={`p-1.5 rounded border text-xs font-semibold ${
                              activeAnnotationType === 'rect' ? 'bg-cyan-500 text-black border-cyan-400' : 'bg-slate-900 hover:bg-slate-800 border-slate-850 text-slate-400'
                            }`}
                            title="Draw Rectangular Region of Interest"
                          >
                            Rect
                          </button>
                          <button
                            onClick={() => {
                              setActiveAnnotationType('line');
                              postAuditEvent("SELECT_ANNOTATION_TOOL", "Activated PACS millimeter line measurement ruler");
                            }}
                            className={`p-1.5 rounded border text-xs font-semibold ${
                              activeAnnotationType === 'line' ? 'bg-cyan-500 text-black border-cyan-400' : 'bg-slate-900 hover:bg-slate-800 border-slate-850 text-slate-400'
                            }`}
                            title="Measure Linear Path Length"
                          >
                            Line
                          </button>
                        </div>
                      </div>

                      {/* Heatmap overlay settings toggle */}
                      <div className="flex flex-col gap-1 pb-1">
                        <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest text-center">HEATMAP</span>
                        <button
                          onClick={() => {
                            setShowHeatmap(p => {
                              postAuditEvent("TOGGLE_HEATMAP", `Turned neural CAM heatmap ${!p ? 'ON' : 'OFF'}`);
                              return !p;
                            });
                          }}
                          className={`w-full py-1 px-2 text-[10px] font-bold rounded border ${
                            showHeatmap ? 'bg-cyan-950 text-cyan-400 border-cyan-500/50' : 'bg-slate-900 text-slate-500 border-slate-850'
                          }`}
                        >
                          {showHeatmap ? "● GRAD-CAM active" : "○ CAM disabled"}
                        </button>
                        <div className="mt-1">
                          <label className="text-[8px] text-slate-500 flex justify-between">
                            <span>SALIENCY:</span>
                            <span>{Math.round(heatmapOpacity * 100)}%</span>
                          </label>
                          <input
                            type="range"
                            min="0.1"
                            max="1"
                            step="0.05"
                            value={heatmapOpacity}
                            onChange={(e) => setHeatmapOpacity(parseFloat(e.target.value))}
                            className="w-full accent-cyan-400"
                          />
                        </div>
                      </div>

                      {/* Clear markings */}
                      {selectedStudy.annotations.length > 0 && (
                        <button
                          onClick={clearAnnotations}
                          className="text-[9px] text-red-400 hover:text-white bg-red-950/40 hover:bg-red-950 border border-red-900/50 p-1.5 rounded text-center transition mt-1 font-semibold flex items-center justify-center gap-1"
                        >
                          <Trash2 className="w-3 h-3" />
                          Unmark ROI
                        </button>
                      )}
                    </div>

                    {/* CENTER INTERACTIVE STAGE */}
                    <div 
                      ref={viewerContainerRef}
                      onMouseDown={handleCanvasMouseDown}
                      onMouseMove={handleCanvasMouseMove}
                      onMouseUp={handleCanvasMouseUp}
                      onWheel={(e) => {
                        if (selectedStudy && selectedStudy.frames && selectedStudy.frames.length > 1) {
                          e.preventDefault();
                          if (e.deltaY > 0) {
                            setCurrentFrameIndex(prev => Math.min(selectedStudy.frames!.length - 1, prev + 1));
                          } else {
                            setCurrentFrameIndex(prev => Math.max(0, prev - 1));
                          }
                        }
                      }}
                      className={`flex-1 flex overflow-hidden min-h-[460px] relative bg-black border border-slate-900 ${
                        activeAnnotationType !== 'none' ? 'cursor-crosshair' : 'cursor-default'
                      }`}
                    >
                      {isComparisonMode ? (
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 divide-x divide-slate-800 h-full w-full">
                          {/* PANEL A: ACTIVE WORKSTATION VIEW */}
                          <div className="relative flex flex-col items-center justify-center p-2 h-full overflow-hidden select-none">
                            <span className="absolute top-3 left-3 z-20 bg-cyan-500/20 text-cyan-400 text-[9px] font-black px-2 py-0.5 rounded border border-cyan-500/30 uppercase tracking-widest flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                              Active Exam: {selectedStudy.id}
                            </span>

                            {selectedStudy.frames && selectedStudy.frames.length > 1 && (
                              <span className="absolute top-3 right-3 z-20 bg-slate-900/90 text-[9px] font-bold px-2 py-0.5 rounded border border-slate-800 text-slate-300">
                                Slice {currentFrameIndex + 1} of {selectedStudy.frames.length}
                              </span>
                            )}

                            <div 
                              className="relative transition-transform duration-100 flex items-center justify-center"
                              style={{
                                transform: `scale(${zoomLevel}) translate(${panX}px, ${panY}px)`,
                                filter: `contrast(${(windowWidth / 1000) * 100}%) brightness(${(windowCenter / 150) * 100}%)`
                              }}
                            >
                              <img 
                                src={selectedStudy.frames && selectedStudy.frames[currentFrameIndex] ? selectedStudy.frames[currentFrameIndex] : selectedStudy.imageUrl} 
                                alt="Diagnostic Workstation Active Frame"
                                className="max-h-[360px] max-w-full rounded object-contain border border-slate-850"
                                referrerPolicy="no-referrer"
                              />

                              {/* GRAD-CAM HEATMAP OVERLAY */}
                              {showHeatmap && selectedStudy.hasHeatmap && (
                                <div 
                                  className="absolute inset-0 bg-transparent mix-blend-color-dodge overflow-hidden pointer-events-none"
                                  style={{ opacity: heatmapOpacity }}
                                >
                                  <svg className="w-full h-full absolute inset-0">
                                    <defs>
                                      <radialGradient id="grad-cam-saliency-split" cx={`${saliencyPoint.x / 8}%`} cy={`${saliencyPoint.y / 6}%`} r="30%">
                                        <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.80" />
                                        <stop offset="25%" stopColor="#f59e0b" stopOpacity="0.55" />
                                        <stop offset="60%" stopColor="#10b981" stopOpacity="0.30" />
                                        <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.0" />
                                      </radialGradient>
                                    </defs>
                                    <rect width="100%" height="100%" fill="url(#grad-cam-saliency-split)" />
                                  </svg>
                                </div>
                              )}

                              {/* ACTIVE ANNOTATIONS */}
                              <svg className="absolute inset-x-0 inset-y-0 w-full h-full pointer-events-none z-15">
                                {selectedStudy.annotations.map((ann) => {
                                  if (ann.type === 'rect') {
                                    return (
                                      <g key={ann.id}>
                                        <rect
                                          x={ann.coords.x1}
                                          y={ann.coords.y1}
                                          width={Math.abs((ann.coords.x2 ?? ann.coords.x1) - ann.coords.x1)}
                                          height={Math.abs((ann.coords.y2 ?? ann.coords.y1) - ann.coords.y1)}
                                          fill="none"
                                          stroke="#22d3ee"
                                          strokeWidth="2"
                                          strokeDasharray="4 2"
                                        />
                                        <rect
                                          x={ann.coords.x1}
                                          y={ann.coords.y1 - 20}
                                          width="140"
                                          height="18"
                                          fill="#06b6d4"
                                          className="opacity-90"
                                          rx="2"
                                        />
                                        <text
                                          x={ann.coords.x1 + 4}
                                          y={ann.coords.y1 - 7}
                                          fill="#000000"
                                          fontFamily="sans-serif"
                                          fontSize="9px"
                                          fontWeight="bold"
                                        >
                                          {ann.text}: {ann.measuredValue}
                                        </text>
                                      </g>
                                    );
                                  } else if (ann.type === 'line') {
                                    return (
                                      <g key={ann.id}>
                                        <line
                                          x1={ann.coords.x1}
                                          y1={ann.coords.y1}
                                          x2={ann.coords.x2 ?? ann.coords.x1}
                                          y2={ann.coords.y2 ?? ann.coords.y1}
                                          stroke="#e11d48"
                                          strokeWidth="2.5"
                                        />
                                        <circle cx={ann.coords.x1} cy={ann.coords.y1} r="4" fill="#e11d48" />
                                        <circle cx={ann.coords.x2 ?? ann.coords.x1} cy={ann.coords.y2 ?? ann.coords.y1} r="4" fill="#e11d48" />
                                        <rect
                                          x={(ann.coords.x1 + (ann.coords.x2 ?? ann.coords.x1)) / 2 - 40}
                                          y={(ann.coords.y1 + (ann.coords.y2 ?? ann.coords.y1)) / 2 - 22}
                                          width="80"
                                          height="16"
                                          fill="#b91c1c"
                                          rx="2"
                                        />
                                        <text
                                          x={(ann.coords.x1 + (ann.coords.x2 ?? ann.coords.x1)) / 2 - 32}
                                          y={(ann.coords.y1 + (ann.coords.y2 ?? ann.coords.y1)) / 2 - 10}
                                          fill="#ffffff"
                                          fontFamily="sans-serif"
                                          fontSize="9px"
                                          fontWeight="bold"
                                        >
                                          {ann.measuredValue}
                                        </text>
                                      </g>
                                    );
                                  }
                                  return null;
                                })}

                                {isDrawingActive && (
                                  <>
                                    {activeAnnotationType === 'rect' && (
                                      <rect
                                        x={Math.min(dragStartRef.current.x, currentMouseCoords.x)}
                                        y={Math.min(dragStartRef.current.y, currentMouseCoords.y)}
                                        width={Math.abs(currentMouseCoords.x - dragStartRef.current.x)}
                                        height={Math.abs(currentMouseCoords.y - dragStartRef.current.y)}
                                        fill="rgba(34, 211, 238, 0.15)"
                                        stroke="#22d3ee"
                                        strokeWidth="2"
                                      />
                                    )}
                                    {activeAnnotationType === 'line' && (
                                      <line
                                        x1={dragStartRef.current.x}
                                        y1={dragStartRef.current.y}
                                        x2={currentMouseCoords.x}
                                        y2={currentMouseCoords.y}
                                        stroke="#e11d48"
                                        strokeWidth="2"
                                        strokeDasharray="3 3"
                                      />
                                    )}
                                  </>
                                )}
                              </svg>
                            </div>
                          </div>

                          {/* PANEL B: PRIOR COMPARISON VIEW OR PACS PLACEHOLDER */}
                          {previousStudy ? (
                            <div className="relative flex flex-col items-center justify-center p-2 h-full overflow-hidden bg-[#02050b] select-none">
                              <span className="absolute top-3 left-3 z-20 bg-amber-500/20 text-amber-400 text-[9px] font-black px-2 py-0.5 rounded border border-amber-500/30 uppercase tracking-widest flex items-center gap-1">
                                <History className="w-3 h-3 text-amber-400" />
                                Prior Scan: {previousStudy.id} ({previousStudy.studyDate})
                              </span>

                              <div 
                                className="relative flex items-center justify-center"
                                style={{
                                  filter: `contrast(${(windowWidth / 1000) * 100}%) brightness(${(windowCenter / 150) * 100}%)`
                                }}
                              >
                                <img 
                                  src={previousStudy.imageUrl} 
                                  alt="Prior Baseline Scan Frame"
                                  className="max-h-[360px] max-w-full rounded object-contain border border-slate-850 opacity-80"
                                  referrerPolicy="no-referrer"
                                />

                                {previousStudy.annotations && previousStudy.annotations.length > 0 && (
                                  <svg className="absolute inset-x-0 inset-y-0 w-full h-full pointer-events-none z-15">
                                    {previousStudy.annotations.map((ann) => {
                                      if (ann.type === 'rect') {
                                        return (
                                          <g key={ann.id}>
                                            <rect
                                              x={ann.coords.x1}
                                              y={ann.coords.y1}
                                              width={Math.abs((ann.coords.x2 ?? ann.coords.x1) - ann.coords.x1)}
                                              height={Math.abs((ann.coords.y2 ?? ann.coords.y1) - ann.coords.y1)}
                                              fill="none"
                                              stroke="#f59e0b"
                                              strokeWidth="2"
                                              strokeDasharray="4 2"
                                            />
                                          </g>
                                        );
                                      }
                                      return null;
                                    })}
                                  </svg>
                                )}
                              </div>

                              <div className="absolute bottom-3 left-3 right-3 bg-slate-900/90 border border-slate-800 p-2 rounded-lg text-[10px] text-slate-300">
                                <span className="text-[8px] uppercase tracking-wider font-extrabold text-amber-400 block mb-0.5">Historical Findings Summary:</span>
                                <p className="line-clamp-2 text-slate-400 leading-tight">{previousStudy.finding}</p>
                              </div>
                            </div>
                          ) : (
                            <div className="flex-1 flex flex-col items-center justify-center p-6 h-full text-center bg-[#030611] text-slate-500">
                              <ShieldAlert className="w-8 h-8 text-amber-500/70 mb-3 animate-pulse" />
                              <span className="text-[9px] text-amber-400 font-black uppercase tracking-widest mb-1.5 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-800/25">PACS Database Query Result</span>
                              <p className="text-xs text-slate-300 max-w-xs leading-relaxed font-sans">
                                No prior diagnostic imaging records exist for patient <span className="font-bold text-white">{selectedStudy.patientName}</span> within our federated cloud repositories.
                              </p>
                              <span className="text-[9px] text-slate-600 mt-3 font-mono">STATUS: 404_HISTORICAL_BASELINE_VACANT</span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <>
                          {/* MEDICAL DIAGNOSTIC BASE IMAGE */}
                          <div 
                            className="relative transition-transform duration-100"
                            style={{
                              transform: `scale(${zoomLevel}) translate(${panX}px, ${panY}px)`,
                              filter: `contrast(${(windowWidth / 1000) * 100}%) brightness(${(windowCenter / 150) * 100}%)`
                            }}
                          >
                            <img 
                              src={selectedStudy.frames && selectedStudy.frames[currentFrameIndex] ? selectedStudy.frames[currentFrameIndex] : selectedStudy.imageUrl} 
                              alt="Primary Study Viewer Diagnostic Frame"
                              className="max-h-[75vh] max-w-full rounded object-contain border border-slate-800"
                              referrerPolicy="no-referrer"
                            />

                            {/* NEURAL NETWORK ATTENTION GRAD-CAM HEATMAP OVERLAY */}
                            {showHeatmap && selectedStudy.hasHeatmap && (
                              <div 
                                className="absolute inset-0 bg-transparent mix-blend-color-dodge overflow-hidden pointer-events-none"
                                style={{ opacity: heatmapOpacity }}
                              >
                                <svg className="w-full h-full absolute inset-0">
                                  <defs>
                                    <radialGradient id="grad-cam-saliency" cx={`${saliencyPoint.x / 8}%`} cy={`${saliencyPoint.y / 6}%`} r="30%">
                                      <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.80" />
                                      <stop offset="25%" stopColor="#f59e0b" stopOpacity="0.55" />
                                      <stop offset="60%" stopColor="#10b981" stopOpacity="0.30" />
                                      <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.0" />
                                    </radialGradient>
                                  </defs>
                                  <rect width="100%" height="100%" fill="url(#grad-cam-saliency)" />
                                </svg>
                              </div>
                            )}

                            {/* RENDER COMPLETED CAD / PACS ANNOTATIONS VECTORS */}
                            <svg className="absolute inset-x-0 inset-y-0 w-full h-full pointer-events-none z-15">
                              {selectedStudy.annotations.map((ann) => {
                                if (ann.type === 'rect') {
                                  return (
                                    <g key={ann.id}>
                                      <rect
                                        x={ann.coords.x1}
                                        y={ann.coords.y1}
                                        width={Math.abs((ann.coords.x2 ?? ann.coords.x1) - ann.coords.x1)}
                                        height={Math.abs((ann.coords.y2 ?? ann.coords.y1) - ann.coords.y1)}
                                        fill="none"
                                        stroke="#22d3ee"
                                        strokeWidth="2"
                                        strokeDasharray="4 2"
                                      />
                                      <rect
                                        x={ann.coords.x1}
                                        y={ann.coords.y1 - 20}
                                        width="140"
                                        height="18"
                                        fill="#06b6d4"
                                        className="opacity-90"
                                        rx="2"
                                      />
                                      <text
                                        x={ann.coords.x1 + 4}
                                        y={ann.coords.y1 - 7}
                                        fill="#000000"
                                        fontFamily="sans-serif"
                                        fontSize="10px"
                                        fontWeight="bold"
                                      >
                                        {ann.text}: {ann.measuredValue}
                                      </text>
                                    </g>
                                  );
                                } else if (ann.type === 'line') {
                                  return (
                                    <g key={ann.id}>
                                      <line
                                        x1={ann.coords.x1}
                                        y1={ann.coords.y1}
                                        x2={ann.coords.x2 ?? ann.coords.x1}
                                        y2={ann.coords.y2 ?? ann.coords.y1}
                                        stroke="#e11d48"
                                        strokeWidth="2.5"
                                      />
                                      <circle cx={ann.coords.x1} cy={ann.coords.y1} r="4" fill="#e11d48" />
                                      <circle cx={ann.coords.x2 ?? ann.coords.x1} cy={ann.coords.y2 ?? ann.coords.y1} r="4" fill="#e11d48" />
                                      <rect
                                        x={(ann.coords.x1 + (ann.coords.x2 ?? ann.coords.x1)) / 2 - 40}
                                        y={(ann.coords.y1 + (ann.coords.y2 ?? ann.coords.y1)) / 2 - 22}
                                        width="80"
                                        height="16"
                                        fill="#b91c1c"
                                        rx="2"
                                      />
                                      <text
                                        x={(ann.coords.x1 + (ann.coords.x2 ?? ann.coords.x1)) / 2 - 32}
                                        y={(ann.coords.y1 + (ann.coords.y2 ?? ann.coords.y1)) / 2 - 10}
                                        fill="#ffffff"
                                        fontFamily="sans-serif"
                                        fontSize="9px"
                                        fontWeight="bold"
                                      >
                                        {ann.measuredValue}
                                      </text>
                                    </g>
                                  );
                                }
                                return null;
                              })}

                              {/* ACTIVE DRAGGING INDICATOR */}
                              {isDrawingActive && (
                                <>
                                  {activeAnnotationType === 'rect' && (
                                    <rect
                                      x={Math.min(dragStartRef.current.x, currentMouseCoords.x)}
                                      y={Math.min(dragStartRef.current.y, currentMouseCoords.y)}
                                      width={Math.abs(currentMouseCoords.x - dragStartRef.current.x)}
                                      height={Math.abs(currentMouseCoords.y - dragStartRef.current.y)}
                                      fill="rgba(34, 211, 238, 0.15)"
                                      stroke="#22d3ee"
                                      strokeWidth="2"
                                    />
                                  )}
                                  {activeAnnotationType === 'line' && (
                                    <line
                                      x1={dragStartRef.current.x}
                                      y1={dragStartRef.current.y}
                                      x2={currentMouseCoords.x}
                                      y2={currentMouseCoords.y}
                                      stroke="#e11d48"
                                      strokeWidth="2"
                                      strokeDasharray="3 3"
                                    />
                                  )}
                                </>
                              )}
                            </svg>
                          </div>

                          {/* Instruction Help Tip */}
                          <span className="absolute bottom-4 left-4 bg-slate-900/90 border border-slate-800 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 flex items-center gap-1.5 select-none animate-bounce z-20">
                            <Info className="w-3.5 h-3.5 text-cyan-400" />
                            {activeAnnotationType !== 'none' 
                              ? `DRAG mouse to place annotation marker on CAD lesion zone.` 
                              : `Choose Rect or Line tool on the right panel to annotate ROI.`
                            }
                          </span>

                          {selectedStudy.frames && selectedStudy.frames.length > 1 && (
                            <span className="absolute top-4 right-4 bg-slate-900/90 border border-slate-850 px-3 py-1 rounded-md text-xs font-bold text-cyan-400 font-mono z-20">
                              SLICE {currentFrameIndex + 1} OF {selectedStudy.frames.length}
                            </span>
                          )}
                        </>
                      )}
                    </div>

                    {/* SERIES SCROLLER (CT/MRI MULTI-SLICE CYCLE ENGINE) */}
                    {selectedStudy.frames && selectedStudy.frames.length > 1 && (
                      <div className="p-3 bg-[#080d19] border-t border-slate-850 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs select-none">
                        <div className="flex items-center gap-2">
                          <Layers className="w-4 h-4 text-cyan-400" />
                          <div>
                            <span className="font-bold text-slate-200">Interactive Volume Slices</span>
                            <span className="text-[10px] text-slate-400 block">Use slider, arrow triggers, or mouse wheel to cycle</span>
                          </div>
                        </div>

                        {/* Slider Strip */}
                        <div className="flex items-center gap-2 overflow-x-auto py-0.5 max-w-full">
                          {selectedStudy.frames.map((frameUrl, idx) => (
                            <button
                              key={idx}
                              onClick={() => {
                                setCurrentFrameIndex(idx);
                                postAuditEvent("CYCLE_SLICE", `Selected slice index ${idx + 1} of ${selectedStudy.frames!.length} for study ${selectedStudy.id}`);
                              }}
                              className={`w-10 h-10 rounded border overflow-hidden shrink-0 transition-all ${
                                currentFrameIndex === idx 
                                  ? 'border-cyan-400 shadow shadow-cyan-500/50 scale-105 ring-1 ring-cyan-500/50' 
                                  : 'border-slate-800 opacity-55 hover:opacity-100 hover:border-slate-600'
                              }`}
                            >
                              <img src={frameUrl} alt={`Slice ${idx + 1}`} className="w-full h-full object-cover" />
                            </button>
                          ))}
                        </div>

                        {/* Pagination Selector */}
                        <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 px-3 py-1 rounded-xl shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              setCurrentFrameIndex(prev => Math.max(0, prev - 1));
                            }}
                            disabled={currentFrameIndex === 0}
                            className={`px-1.5 py-0.5 rounded text-[10px] uppercase font-bold tracking-wide transition ${
                              currentFrameIndex === 0 ? 'text-slate-600 cursor-not-allowed' : 'text-slate-300 hover:text-cyan-400 hover:bg-slate-800'
                            }`}
                          >
                            Prev
                          </button>
                          
                          <span className="font-mono text-cyan-400 font-bold tracking-tight px-1 text-xs text-center min-w-[70px]">
                            Slice {currentFrameIndex + 1} / {selectedStudy.frames.length}
                          </span>

                          <button
                            type="button"
                            onClick={() => {
                              setCurrentFrameIndex(prev => Math.min(selectedStudy.frames!.length - 1, prev + 1));
                            }}
                            disabled={currentFrameIndex === selectedStudy.frames.length - 1}
                            className={`px-1.5 py-0.5 rounded text-[10px] uppercase font-bold tracking-wide transition ${
                              currentFrameIndex === selectedStudy.frames.length - 1 ? 'text-slate-600 cursor-not-allowed' : 'text-slate-300 hover:text-cyan-400 hover:bg-slate-800'
                            }`}
                          >
                            Next
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Window parameters adjuster sliders */}
                    <div className="p-3.5 bg-[#0a0f1d] border-t border-slate-850 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-slate-400 font-bold">Contrast - Window Width (Hounsfield Scale):</span>
                          <span className="text-cyan-400 font-mono">{windowWidth} HU</span>
                        </div>
                        <input
                          type="range"
                          min="100"
                          max="4000"
                          step="50"
                          value={windowWidth}
                          onChange={(e) => setWindowWidth(parseInt(e.target.value))}
                          className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                        />
                      </div>
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-slate-400 font-bold">Brightness - Window Center (Level):</span>
                          <span className="text-cyan-400 font-mono">{windowCenter} HU</span>
                        </div>
                        <input
                          type="range"
                          min="-1000"
                          max="1500"
                          step="25"
                          value={windowCenter}
                          onChange={(e) => setWindowCenter(parseInt(e.target.value))}
                          className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                        />
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center flex-col text-slate-500">
                  <Activity className="w-12 h-12 text-slate-700 animate-spin mb-4" />
                  <p>Initializing main medical image console frame...</p>
                </div>
              )}
            </div>

            {/* AI DECISION STABILIZATION HUB & REPORT COPILOT (RIGHT COLUMN) */}
            <div className="w-full md:w-90 lg:w-[420px] shrink-0 border-t md:border-t-0 border-slate-800 bg-[#080d19] flex flex-col max-h-[85vh] md:max-h-none overflow-y-auto">
              
              {/* Tab options in active workspace */}
              <div className="bg-[#0b1329] border-b border-slate-855 px-3 py-2 grid grid-cols-3 gap-1">
                {[
                  { id: 'copilot', label: 'Copilot Chat', icon: MessageSquare },
                  { id: 'reports', label: 'Report Drafts', icon: FileCheck },
                  { id: 'multimodal', label: 'Multi-Modal AI', icon: Sparkles }
                ].map(pTab => (
                  <button
                    key={pTab.id}
                    onClick={() => setActiveTab('workstation')} // ensure basic tab, then manage panel
                    className={`py-1.5 px-2 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1 transition ${
                      activeTab === 'workstation' ? 'text-cyan-400 bg-slate-900/60 border border-slate-800' : 'text-slate-500'
                    }`}
                  >
                    <pTab.icon className="w-3 h-3" />
                    {pTab.label}
                  </button>
                ))}
              </div>

              {/* REPORT DRAFTS GENERATION */}
              {selectedStudy && (
                <div className="p-4 flex-1 flex flex-col gap-4">
                  
                  {/* Current Active Finding Segment */}
                  <div className="bg-slate-950/60 border border-slate-855 rounded-xl p-3.5 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wide flex items-center gap-1">
                        <Activity className="w-3.5 h-3.5 text-cyan-400" />
                        Inference Diagnostics
                      </h4>
                      <span className="text-[10px] text-cyan-400 font-mono font-bold bg-cyan-950 px-2 py-0.5 rounded">
                        Neural certainty: {selectedStudy.confidence}%
                      </span>
                    </div>

                    <div>
                      <label className="text-[10px] text-slate-500 block uppercase font-bold tracking-widest mb-1">Visual Saliency Findings</label>
                      <textarea
                        value={editedFindings}
                        onChange={(e) => setEditedFindings(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 min-h-16"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] text-slate-500 block uppercase font-bold tracking-widest mb-1">Assisted Guidelines Recommendation</label>
                      <textarea
                        value={editedRecommendations}
                        onChange={(e) => setEditedRecommendations(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 min-h-16"
                      />
                    </div>

                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        onClick={handleSaveStudyEdits}
                        className="bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[#f1f5f9] text-xs py-1.5 px-3 rounded font-bold transition flex items-center gap-1"
                      >
                        Save Corrections
                      </button>
                    </div>
                  </div>

                  {/* AI REPORT GENERATION COMPILATION */}
                  <div className="bg-gradient-to-b from-slate-900 to-indigo-950/20 border border-indigo-950 p-4 rounded-xl space-y-3 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-xs font-black uppercase text-slate-200 tracking-wider flex items-center gap-1.5">
                          <CheckCircle className="w-4 h-4 text-cyan-400" />
                          Structured Radiology Draft
                        </h4>
                        <button
                          onClick={handleGenAiReport}
                          disabled={isGeneratingReport}
                          className="bg-cyan-500 hover:bg-cyan-600 disabled:bg-slate-800 text-black disabled:text-slate-500 text-xs py-1 px-2.5 rounded-lg font-bold transition flex items-center gap-1 shadow-lg shadow-cyan-900/20"
                        >
                          <RefreshCw className={`w-3 h-3 ${isGeneratingReport ? 'animate-spin' : ''}`} />
                          {isGeneratingReport ? 'Drafting...' : 'Autobuild Report'}
                        </button>
                      </div>

                      {/* Display warning */}
                      <p className="text-[9px] text-[#222] bg-cyan-400/90 font-bold px-2 py-1 rounded select-none uppercase tracking-wide">
                        AI-generated assistance requiring professional medical review.
                      </p>

                      <div className="mt-3 bg-slate-950 p-3 rounded-lg border border-slate-855 min-h-[160px] h-60 overflow-y-auto text-xs font-mono text-slate-300 leading-relaxed whitespace-pre-line select-text">
                        {reportText || (
                          <span className="text-slate-600 italic">
                            Click 'Autobuild Report' button above to run Gemini AI on core vision transformer embeddings & physiological telemetry.
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-indigo-950 flex flex-wrap gap-2 justify-between items-center bg-[#070c18] -mx-4 -mb-4 p-3 rounded-b-xl">
                      <div className="text-[10px] text-slate-400 flex items-center gap-1">
                        <FileSignature className="w-3.5 h-3.5 text-slate-400" />
                        Signed by: <strong>{currentUser || "Not Authenticated"}</strong>
                      </div>

                      {reportApprovedStatus ? (
                        <span className="bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 text-[10px] font-bold px-2.5 py-1 rounded flex items-center gap-1 select-none">
                          <CheckCircle className="w-3 h-3" />
                          DIGITALLY SIGNED & DISPATCHED
                        </span>
                      ) : (
                        <button
                          onClick={handleApproveReport}
                          className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] uppercase tracking-wider px-3.5 py-1.5 rounded-lg shadow transition"
                        >
                          Validate & Sign PACS File
                        </button>
                      )}
                    </div>
                  </div>

                  {/* EXPERT RADIOLOGY COPILOT CHAT */}
                  <div className="bg-[#0a0f1d] border border-slate-800 p-3.5 rounded-xl flex flex-col h-80">
                    <h4 className="text-xs font-bold uppercase text-slate-300 mb-2 tracking-wider flex items-center gap-1.5 border-b border-slate-850 pb-2">
                      <Brain className="w-4 h-4 text-purple-400 animate-pulse" />
                      Dynamic Radiology Workspace Copilot
                    </h4>

                    {/* Quick helper triggers */}
                    <div className="flex gap-1.5 mb-2 overflow-x-auto pb-1 shrink-0 text-[9px] font-semibold">
                      <button 
                        onClick={() => {
                          setCopilotQuery("Explain possible opacities or consolidation markers under ATS instructions.");
                          postAuditEvent("QUICK_PROMPT", "Clicked quick explanation prompt");
                        }}
                        className="bg-slate-900 border border-slate-850 hover:bg-slate-800 text-slate-300 px-2.5 py-1 rounded shrink-0"
                      >
                        Explain Consolidation
                      </button>
                      <button 
                        onClick={() => {
                          setCopilotQuery("What are the core student reference notes or silhouette signs for this anatomical view?");
                          postAuditEvent("QUICK_PROMPT", "Clicked resident student notes prompt");
                        }}
                        className="bg-slate-900 border border-slate-850 hover:bg-slate-800 text-slate-300 px-2.5 py-1 rounded shrink-0"
                      >
                        Student Notes
                      </button>
                      <button 
                        onClick={() => {
                          setCopilotQuery("Synthesize standard clinical follow-up recommendations comparing this to recent studies.");
                        }}
                        className="bg-slate-900 border border-slate-850 hover:bg-slate-800 text-slate-300 px-2.5 py-1 rounded shrink-0"
                      >
                        Compare Previous
                      </button>
                    </div>

                    {/* Discussion dialogue screen */}
                    <div className="flex-1 overflow-y-auto bg-slate-950 p-2 rounded border border-slate-850 space-y-2 mb-2 text-[11px] leading-relaxed">
                      {copilotHistory.map((h, i) => (
                        <div key={i} className={`p-2 rounded-lg ${h.role === 'user' ? 'bg-[#121c33] border-l-2 border-cyan-500 ml-4' : 'bg-slate-900 mr-4'}`}>
                          <div className="flex justify-between items-center mb-1 text-[9px] font-bold uppercase tracking-wider text-slate-500">
                            <span>{h.role === 'user' ? 'Clinical User' : 'Medscan Gemini Assistant'}</span>
                            <span className="font-mono text-[8px] italic">{new Date().toISOString().split('T')[0]}</span>
                          </div>
                          <p className="text-slate-300 text-xs font-sans select-text whitespace-pre-line">{h.content}</p>
                        </div>
                      ))}
                      {isWaitingCopilot && (
                        <div className="p-2 rounded bg-slate-900/40 text-slate-500 text-[11px] animate-pulse">
                          Assistant generating expert clinical interpretation matrix...
                        </div>
                      )}
                    </div>

                    {/* Text Field */}
                    <div className="flex gap-1.5 shrink-0">
                      <input
                        type="text"
                        value={copilotQuery}
                        onChange={(e) => setCopilotQuery(e.target.value)}
                        onKeyDown={(e) => h => e.key === 'Enter' && handleSendCopilotQuery()}
                        placeholder="Inquire with copilot regarding pathology ROI..."
                        className="flex-1 bg-slate-950 border border-slate-800 text-xs rounded p-2 focus:outline-none focus:border-purple-500"
                      />
                      <button
                        onClick={handleSendCopilotQuery}
                        className="bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs px-3 rounded-lg transition"
                      >
                        Ask
                      </button>
                    </div>
                  </div>

                  {/* CHAT/COLLABORATIVE DISCUSSION FORUMS (COMMENTS PANEL) */}
                  <div className="bg-[#090e1a] border border-slate-850 rounded-xl p-3.5 space-y-3">
                    <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-blue-400" />
                      Collaborative Clinical Discussion
                    </h4>

                    {selectedStudy.comments.length > 0 ? (
                      <div className="space-y-2 h-36 overflow-y-auto pr-1 bg-slate-950 p-2 rounded border border-slate-855 text-[10px]">
                        {selectedStudy.comments.map((comm) => (
                          <div key={comm.id} className="border-b border-slate-900 pb-2 last:border-0">
                            <div className="flex justify-between text-slate-500">
                              <span className="font-bold text-slate-300">{comm.user} ({comm.role})</span>
                              <span className="font-mono">{comm.date}</span>
                            </div>
                            <p className="text-slate-400 mt-0.5">{comm.text}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-slate-500 italic text-[10px]">No case group conference discussions on this study.</p>
                    )}

                    <form onSubmit={handleAddComment} className="flex gap-1">
                      <input
                        type="text"
                        value={draftCommentText}
                        onChange={(e) => setDraftCommentText(e.target.value)}
                        placeholder="Add professional consult annotation notes..."
                        className="flex-1 bg-slate-950 border border-slate-800 text-xs rounded p-1.5 focus:outline-none text-slate-200"
                      />
                      <button
                        type="submit"
                        className="bg-blue-600/25 hover:bg-blue-600 text-blue-400 hover:text-white border border-blue-500/30 text-xs px-2.5 rounded transition font-bold"
                      >
                        Post
                      </button>
                    </form>
                  </div>

                  {/* CLINICAL LITERATURE RETRIEVAL (RAG COMPONENT) */}
                  <div className="bg-[#0a0f1d] border border-slate-800 p-4 rounded-xl space-y-3">
                    <h4 className="text-xs font-bold uppercase text-slate-300 tracking-wider flex items-center gap-1.5 border-b border-slate-850 pb-2">
                      <BookOpen className="w-4 h-4 text-emerald-400" />
                      Evidence-Based Guidelines Assistant (Knowledge Base)
                    </h4>
                    
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={ragQuery}
                        onChange={(e) => setRagQuery(e.target.value)}
                        placeholder="Query guidelines, e.g. solid nodule criteria..."
                        className="flex-1 bg-slate-950 border border-slate-800 text-xs rounded p-2 focus:outline-none focus:border-emerald-500 text-slate-200"
                      />
                      <button
                        onClick={handleRagSearch}
                        disabled={isSearchingRag}
                        className="bg-emerald-600/20 hover:bg-emerald-600 text-emerald-400 hover:text-white border border-emerald-500/30 px-3.5 py-1.5 rounded-lg text-xs transition font-black"
                      >
                        Search
                      </button>
                    </div>

                    {isSearchingRag && (
                      <div className="text-[10px] text-slate-500 animate-pulse">Running semantic synthesis search across ACR & Fleischner literature indexes...</div>
                    )}

                    {ragResult && (
                      <div className="bg-slate-950 p-3 rounded border border-slate-855 text-xs text-slate-300 space-y-2 max-h-56 overflow-y-auto leading-relaxed select-text font-sans">
                        <div className="whitespace-pre-line text-[11px] text-slate-300">{ragResult.answer}</div>
                        
                        {ragResult.citations.length > 0 && (
                          <div className="pt-2 border-t border-slate-900">
                            <span className="text-[9px] font-bold uppercase text-slate-500 block mb-1">Literature Citations:</span>
                            {ragResult.citations.map((c, i) => (
                              <div key={i} className="text-[10px] text-emerald-400">
                                • {c.title} — <span className="text-slate-400">{c.author} ({c.year})</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                </div>
              )}

            </div>
          </div>
        )}

        {/* MULTI-MODAL DIAGNOSTIC MODULE PANEL (UNDER SEPARATE TAB) */}
        {activeTab === 'workstation' && (
          <div className="hidden lg:flex w-96 border-l border-slate-800 bg-[#090e1b] flex-col p-4 overflow-y-auto select-none shrink-0 max-h-[85vh] xl:max-h-none">
            <div className="flex items-center gap-2 mb-3 border-b border-indigo-950 pb-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <h3 className="text-xs font-bold uppercase text-slate-300 tracking-wider">Multi-Modal AI Classifier Matrix</h3>
            </div>

            <p className="text-[10px] text-slate-400 mb-4 leading-relaxed">
              Synthesize clinical lab assays, symptoms, patient health vectors, and visual indications to formulate initial differential consideration scores.
            </p>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="text-slate-400 font-bold block mb-1">Chief Presenting Symptoms:</label>
                <textarea
                  value={symptomsInput}
                  onChange={(e) => setSymptomsInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-300 focus:outline-none min-h-[64px]"
                />
              </div>

              <div>
                <label className="text-slate-400 font-bold block mb-1">Physiological Assays & Sepsis Indicators:</label>
                <textarea
                  value={labsInput}
                  onChange={(e) => setLabsInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-300 focus:outline-none min-h-[64px]"
                />
              </div>

              <div>
                <label className="text-slate-400 font-bold block mb-1">Historical Risk Profile / Lifestyle:</label>
                <textarea
                  value={historyInput}
                  onChange={(e) => setHistoryInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-300 focus:outline-none min-h-[64px]"
                />
              </div>

              <button
                onClick={handleRunMultiModalAgent}
                disabled={isAnalyzingMultiModal}
                className="w-full bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 disabled:from-slate-800 disabled:to-slate-800 text-slate-100 font-black text-xs py-2 px-4 rounded-xl shadow-lg shadow-cyan-900/20 uppercase tracking-widest transition"
              >
                {isAnalyzingMultiModal ? "Calculating..." : "Compute Synergy Differential"}
              </button>

              {multiModalOutput && (
                <div className="bg-slate-950 p-4 rounded-xl border border-indigo-950 space-y-2">
                  <div className="flex justify-between items-center pb-1.5 border-b border-indigo-950 text-[10px] font-bold text-cyan-400">
                    <span>SEVERITY INDEX COMPUTATION</span>
                    <span className="text-slate-400 uppercase">HIPAA Trace Secure</span>
                  </div>
                  <div className="text-slate-300 whitespace-pre-line font-mono text-[11px] leading-relaxed select-text">
                    {multiModalOutput}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* PATIENT CLINICAL HISTORY DIRECTORY TAB */}
        {activeTab === 'patients' && (
          <div className="flex-1 p-6 bg-[#05080f] overflow-y-auto space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
                  <Users className="w-5 h-5 text-cyan-400" />
                  Primary Patient Management & Chart Timelines
                </h2>
                <p className="text-xs text-slate-400">Integrated EHR directory syncing patient identification with DICOM parameters</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {patients.map(pat => (
                <div key={pat.id} className="bg-[#0c1223] border border-slate-800 p-5 rounded-2xl space-y-4">
                  <div className="flex justify-between items-start border-b border-slate-800 pb-3">
                    <div>
                      <h3 className="font-extrabold text-slate-200 text-base">{pat.name}</h3>
                      <div className="text-xs text-slate-400 mt-1">
                        Age: <strong className="text-slate-300">{pat.age}</strong> | Gender: <strong className="text-slate-300">{pat.gender}</strong>
                      </div>
                    </div>
                    <span className="bg-slate-950 border border-slate-800 text-cyan-400 font-mono text-xs px-2.5 py-0.5 rounded">
                      {pat.mrn}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-500 uppercase tracking-widest font-black block mb-1">Clinical Intake Profile & Symptoms</span>
                    <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-2.5 rounded border border-slate-900">{pat.history}</p>
                  </div>

                  <div className="space-y-2">
                    <span className="text-[10px] text-slate-500 uppercase tracking-widest font-black block">Medical Imaging Chronology Timeline</span>
                    <div className="relative border-l border-slate-800 ml-2.5 pl-4 space-y-3">
                      {pat.imagingTimeline.map((item, index) => (
                        <div key={index} className="relative">
                          <span className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-cyan-400 border border-slate-950" />
                          <div className="text-[11px] text-slate-500 font-semibold">{item.date} • {item.type} Analysis</div>
                          <div className="text-xs text-slate-300 mt-0.5">{item.finding}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AI MODEL LIFECYCLE MANAGEMENT TAB */}
        {activeTab === 'models' && (
          <div className="flex-1 p-6 bg-[#05080f] overflow-y-auto space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
                  <Brain className="w-5 h-5 text-cyan-400 animate-pulse" />
                  Neural Network Model Registry & Traffic Weights
                </h2>
                <p className="text-xs text-slate-400">Manage deployment status, inference parameters, and A/B traffic split indicators</p>
              </div>
              <div className="text-xs text-slate-400 font-mono">
                System Latency target: &lt; 300ms
              </div>
            </div>

            <div className="bg-[#0b1329] border border-cyan-500/10 p-4 rounded-xl text-xs text-slate-300 leading-relaxed flex gap-3 items-start">
              <ShieldAlert className="w-5 h-5 text-cyan-400 shrink-0" />
              <div>
                <span className="font-bold text-slate-200 block mb-0.5">Role-Based Registry Traffic Alteration Controls</span>
                Super Administrators can live-adjust weights for testing new EfficientNet or MONAI models. Standard users enjoy read-only telemetry permissions.
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {modelsRegistry.map(model => (
                <div key={model.id} className="bg-[#0c1223] border border-slate-800 p-5 rounded-2xl relative overflow-hidden flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <span className="bg-slate-950 text-slate-400 text-[10px] px-2 py-0.5 rounded font-mono border border-slate-900">{model.id}</span>
                        <h3 className="font-extrabold text-slate-100 text-sm mt-1">{model.name}</h3>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        model.activeStatus === 'Active' ? 'bg-emerald-950 text-emerald-400' : 'bg-amber-950 text-amber-400'
                      }`}>
                        {model.activeStatus}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 py-2 border-y border-slate-800/80 text-xs mb-4">
                      <div>
                        <span className="text-slate-500 block text-[9px] uppercase tracking-wider font-extrabold">Neural accuracy</span>
                        <strong className="text-slate-200 text-xs font-mono">{Math.round(model.accuracy*1000)/10}%</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[9px] uppercase tracking-wider font-extrabold">AUC score</span>
                        <strong className="text-slate-200 text-xs font-mono">{model.auc}</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[9px] uppercase tracking-wider font-extrabold">GPU Latency</span>
                        <strong className="text-slate-200 text-xs font-mono">{model.latencyMs} ms</strong>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-400 mb-4">
                      <span>Neural Engine Type: <strong className="text-slate-200">{model.type}</strong></span>
                      <span>Target VRAM: <strong className="text-indigo-400 font-mono">{model.gpuMemory}</strong></span>
                    </div>
                  </div>

                  {/* Traffic slider control for A/B rollout testing */}
                  <div className="bg-slate-950/70 py-3 px-4 rounded-xl border border-slate-900 space-y-2">
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="text-slate-400 font-bold">Traffic Allocation (Weight):</span>
                      <span className="text-cyan-400 font-mono font-black">{model.trafficAllocation}%</span>
                    </div>

                    {userRole === 'super_admin' ? (
                      <input
                        type="range"
                        min="0"
                        max="100"
                        step="5"
                        value={model.trafficAllocation}
                        onChange={(e) => handleUpdateModelAllocation(model.id, parseInt(e.target.value))}
                        className="w-full accent-cyan-400 h-1.5 appearance-none cursor-pointer"
                      />
                    ) : (
                      <div className="w-full h-1.5 bg-slate-800 rounded relative">
                        <div className="bg-cyan-500 h-1.5 rounded" style={{ width: `${model.trafficAllocation}%` }} />
                      </div>
                    )}
                    <span className="text-[9px] text-slate-500 block text-right font-medium">
                      {userRole === 'super_admin' ? "★ SLIDER ACTIVE • Commit values to backend" : "Read-only. Needs Super Admin level permission"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ANALYTICS INTEGRATION PREVIEW */}
        {activeTab === 'analytics' && (
          <div className="flex-1 p-6 bg-[#05080f] overflow-y-auto space-y-6">
            <div className="border-b border-slate-800 pb-3">
              <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
                <Activity className="w-5 h-5 text-cyan-400" />
                Departmental Clinical Diagnostics KPI Dashboard
              </h2>
              <p className="text-xs text-slate-400">Aggregated workspace performance parameters across active study pools</p>
            </div>

            {/* Top row cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { title: "Studies processed", value: studies.length, delta: "+12% this week", color: "text-cyan-400" },
                { title: "Avg AI Process Time", value: `${sysMetrics.apiLatency} ms`, delta: "-14ms target optimization", color: "text-indigo-400" },
                { title: "HIPAA Clearance Rate", value: "100%", delta: "0 errors flagged", color: "text-emerald-400" },
                { title: "Active GPU Cluster Size", value: "3 Nodes", delta: "Railway / RunPod hosting model", color: "text-purple-400" }
              ].map((kpi, idx) => (
                <div key={idx} className="bg-[#0c1223] border border-slate-800 p-4 rounded-xl space-y-2">
                  <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-widest">{kpi.title}</span>
                  <div className={`text-2xl font-black ${kpi.color}`}>{kpi.value}</div>
                  <span className="text-[10px] text-slate-500 block">{kpi.delta}</span>
                </div>
              ))}
            </div>

            {/* Custom SVG Diagnostic Volumes Graph */}
            <div className="bg-[#0c1223] p-5 rounded-2xl border border-slate-800 space-y-3">
              <h3 className="text-sm font-bold text-slate-200">Processing Study Volumetric Timeline (Hourly logs)</h3>
              <div className="h-60 w-full relative pt-4">
                <svg className="w-full h-full" viewBox="0 0 800 200">
                  <defs>
                    <linearGradient id="area-gradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  
                  {/* Grid Lines */}
                  <line x1="0" y1="40" x2="800" y2="40" stroke="#1e293b" strokeDasharray="3 3" />
                  <line x1="0" y1="90" x2="800" y2="90" stroke="#1e293b" strokeDasharray="3 3" />
                  <line x1="0" y1="140" x2="800" y2="140" stroke="#1e293b" strokeDasharray="3 3" />
                  
                  {/* Plot Path */}
                  <path
                    d="M 50,150 L 150,110 L 250,130 L 350,70 L 450,90 L 550,50 L 650,80 L 750,40"
                    fill="none"
                    stroke="#06b6d4"
                    strokeWidth="3.5"
                  />

                  {/* Shaded Area */}
                  <path
                    d="M 50,150 L 150,110 L 250,130 L 350,70 L 450,90 L 550,50 L 650,80 L 750,40 L 750,180 L 50,180 Z"
                    fill="url(#area-gradient)"
                  />

                  {/* Points circles */}
                  {[
                    {x: 50, y: 150, val: "22"},
                    {x: 150, y: 110, val: "48"},
                    {x: 250, y: 130, val: "35"},
                    {x: 350, y: 70, val: "91"},
                    {x: 450, y: 90, val: "72"},
                    {x: 550, y: 50, val: "135"},
                    {x: 650, y: 80, val: "90"},
                    {x: 750, y: 40, val: "164"}
                  ].map((pt, i) => (
                    <g key={i}>
                      <circle cx={pt.x} cy={pt.y} r="5.5" fill="#06b6d4" stroke="#000" strokeWidth="2" />
                      <text x={pt.x - 10} y={pt.y - 12} fill="#06b6d4" fontSize="10px" fontWeight="bold">{pt.val}</text>
                    </g>
                  ))}
                </svg>
              </div>
              <div className="flex justify-between text-slate-500 text-[10px] uppercase font-bold px-4">
                <span>08:00 AM</span>
                <span>09:00 AM</span>
                <span>10:00 AM</span>
                <span>11:00 AM</span>
                <span>12:00 PM</span>
                <span>01:00 PM (Est.)</span>
                <span>02:00 PM (Live)</span>
              </div>
            </div>
          </div>
        )}

        {/* HIPAA SECURITY AUDIT TRACE LOG TAB */}
        {activeTab === 'audit' && (
          <div className="flex-1 p-6 bg-[#05080f] overflow-y-auto space-y-6">
            <div className="border-b border-slate-800 pb-3 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
                  <FileSignature className="w-5 h-5 text-emerald-400" />
                  HIPAA-Compliant Diagnostic Access Records & Audit Trail
                </h2>
                <p className="text-xs text-slate-400">Cryptographically persistent security logging measuring study access and classification commits</p>
              </div>
              
              <button
                onClick={() => {
                  fetchAudits();
                  postAuditEvent("REQUEST_REFRESH_AUDIT", "Triggered manual audit logs database refresh call.");
                }}
                className="bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 px-3 py-1 text-xs rounded-xl flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" />
                Refresh DB Call
              </button>
            </div>

            <div className="bg-[#0c1223] rounded-2xl border border-slate-855 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs bg-transparent">
                  <thead className="bg-[#0e172e] text-slate-400 uppercase tracking-widest text-[9px] font-black border-b border-slate-800">
                    <tr>
                      <th className="py-3 px-4">Time Stamp</th>
                      <th className="py-3 px-4">Operator Name</th>
                      <th className="py-3 px-4">Role Clearance</th>
                      <th className="py-3 px-4">Action Token</th>
                      <th className="py-3 px-4">Target PACS ID</th>
                      <th className="py-3 px-4">Network / Terminal IP</th>
                      <th className="py-3 px-4 text-right">Clearance Outcome</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono text-[11px] text-slate-300">
                    {auditLogs.map((log) => {
                      let statusBadge = 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/40';
                      if (log.status === 'DENIED') {
                        statusBadge = 'bg-red-950/85 text-red-500 border border-red-800/50';
                      } else if (log.status === 'WARNING') {
                        statusBadge = 'bg-amber-950/80 text-amber-500 border border-amber-800/50';
                      }

                      return (
                        <tr key={log.id} className="hover:bg-slate-900/50">
                          <td className="py-3.5 px-4 text-slate-500">{log.timestamp}</td>
                          <td className="py-3.5 px-4 font-sans font-bold text-slate-200">{log.user}</td>
                          <td className="py-3.5 px-4 font-sans"><span className="text-cyan-400 uppercase tracking-wide text-[9px] font-bold bg-slate-950 px-2 py-0.5 rounded">{log.role}</span></td>
                          <td className="py-3.5 px-4 font-sans">
                            <div className="text-slate-300 font-medium">{log.action}</div>
                            <div className="text-[10px] text-slate-500 mt-0.5 max-w-sm line-clamp-1">{log.details}</div>
                          </td>
                          <td className="py-3.5 px-4 text-indigo-400 font-bold">{log.studyId || "SYSTEM"}</td>
                          <td className="py-3.5 px-4 text-slate-500">{log.ipAddress}</td>
                          <td className="py-3.5 px-4 text-right">
                            <span className={`text-[9px] font-black uppercase px-2 py-0.8 rounded ${statusBadge}`}>
                              {log.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* SINGLE & BULK UPLOAD MODAL */}
      {showUploadModal && (
        <div id="upload-modal" className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-[#0e1528] border border-cyan-500/30 p-6 rounded-2xl shadow-2xl relative">
            <button 
              onClick={() => setShowUploadModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-100 text-sm font-bold p-1 bg-slate-900 border border-slate-800 rounded"
            >
              ✕
            </button>
            <h3 className="text-base font-extrabold text-white mb-2 flex items-center gap-1.5 uppercase tracking-wide">
              <Upload className="w-5 h-5 text-cyan-400" />
              Ingest Medical Imaging Scans Into PACS Repository
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Enter diagnostic metadata credentials. Medscan AI models will run Vision Transformer classification pipelines directly upon insertion.
            </p>

            <form onSubmit={handleIngestStudy} className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 font-bold block mb-1">Patient Identity (Full Name)</label>
                <input
                  type="text"
                  required
                  value={uploadForm.patientName}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, patientName: e.target.value }))}
                  placeholder="e.g. Cassandra Troy"
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="text-xs text-slate-400 font-bold block mb-1">Scan Modality</label>
                  <select
                    value={uploadForm.modality}
                    onChange={(e) => setUploadForm(prev => ({ ...prev, modality: e.target.value as any }))}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs text-slate-300 focus:outline-none"
                  >
                    <option value="X-Ray">X-Ray (Plain Film)</option>
                    <option value="CT">CT Scan (Tomography)</option>
                    <option value="MRI">MRI Scan (Resonance)</option>
                    <option value="Ultrasound">Ultrasound Imaging</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-slate-400 font-bold block mb-1">Diagnostic Priority</label>
                  <select
                    value={uploadForm.priority}
                    onChange={(e) => setUploadForm(prev => ({ ...prev, priority: e.target.value as any }))}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs text-slate-300 focus:outline-none"
                  >
                    <option value="Routine">Routine (Typical queue)</option>
                    <option value="Urgent">Urgent (24h reviews)</option>
                    <option value="STAT">STAT (Immediate emergent)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-400 font-bold block mb-1">Anatomical Scope & Side Indicators</label>
                <input
                  type="text"
                  value={uploadForm.bodyPart}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, bodyPart: e.target.value }))}
                  placeholder="e.g. Brain with Contrast, Chest PA"
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 font-bold block mb-1">Mock Scanner Imaging Frame URL</label>
                <select
                  value={uploadForm.imageUrl}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, imageUrl: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs text-slate-300 focus:outline-none"
                >
                  <option value="">Default Chest X-Ray Film</option>
                  <option value="https://images.unsplash.com/photo-1559757148-5c350d0d3c56?q=80&w=800&auto=format&fit=crop">Symmetrical Brain MRI Slice</option>
                  <option value="https://images.unsplash.com/photo-1582719471384-894fbb16e074?q=80&w=800&auto=format&fit=crop">Anterior Knee Joint MRI</option>
                  <option value="https://images.unsplash.com/photo-1516062423079-7ca13cca7c58?q=80&w=800&auto=format&fit=crop">Abdominal Gallbladder Ultrasound Frame</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="text-xs text-slate-400 font-bold block mb-1">AI Finding Prediction Indicator</label>
                  <input
                    type="text"
                    value={uploadForm.finding}
                    onChange={(e) => setUploadForm(prev => ({ ...prev, finding: e.target.value }))}
                    placeholder="e.g. Solitary pulmonary nodule 6.5mm"
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 font-bold block mb-1">AI Suggested Recommendation</label>
                  <input
                    type="text"
                    value={uploadForm.recommendation}
                    onChange={(e) => setUploadForm(prev => ({ ...prev, recommendation: e.target.value }))}
                    placeholder="e.g. Schedule surveillance CT 6m"
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 text-[10px] text-slate-400">
                <span className="text-amber-500 font-extrabold flex items-center gap-1 mb-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  PACS METADATA COMPLIANCE (HIPAA SECURE)
                </span>
                Uploading simulates medical PACS gateway ingest protocols. The studies will automatically appear on the left hand menu directory for validation review.
              </div>

              <button
                type="submit"
                className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-black text-xs py-2 px-4 rounded-xl uppercase tracking-wider transition"
              >
                Assemble & Commit Study Ingest
              </button>
            </form>
          </div>
        </div>
      )}

      {/* DIAGNOSTIC REPORT EXPORT CENTER MODAL */}
      {showExportReportModal && selectedStudy && (
        <div id="export-report-modal" className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto">
          <div className="w-full max-w-4xl bg-[#0b0f19] border border-cyan-500/20 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 bg-slate-900 border-b border-slate-800 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-gradient-to-br from-cyan-500 to-indigo-500 rounded-lg text-black">
                  <FileText className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-wider">Diagnostic Intelligence Export Center</h3>
                  <span className="text-[10px] text-slate-400 font-medium">HIPAA Compliant Case Export Control Hub</span>
                </div>
              </div>
              <button 
                onClick={() => setShowExportReportModal(false)}
                className="text-slate-400 hover:text-slate-100 text-xs font-bold p-1 bg-slate-800 border border-slate-700 rounded transition"
              >
                ✕ Close
              </button>
            </div>

            {/* Modal Content Split Grid */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-12 overflow-y-auto">
              {/* Left Column: Visual Print Sheet Preview (md:span-7) */}
              <div className="md:col-span-12 lg:col-span-7 p-5 bg-[#05070c] border-r border-slate-800 flex flex-col space-y-4 overflow-y-auto">
                <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest block">Clinical Report Paper Preview</span>
                
                {/* Paper Body */}
                <div className="bg-white text-slate-900 p-6 rounded-xl border border-slate-200 shadow-lg text-left space-y-4 max-h-[500px] overflow-y-auto select-text font-sans">
                  {/* Paper Header */}
                  <div className="flex justify-between items-start border-b-2 border-slate-900 pb-3">
                    <div>
                      <h4 className="text-base font-extrabold text-slate-950 uppercase tracking-tight">MEDSCAN AI Diagnostics</h4>
                      <p className="text-[9px] text-slate-500 font-semibold uppercase tracking-wider">Cloud Clinical PACS Registry</p>
                    </div>
                    <div className="text-right">
                      <span className="bg-red-50 text-red-700 text-[8px] font-bold uppercase border border-red-200 px-1.5 py-0.5 rounded">HIPAA Document</span>
                      <p className="text-[9px] text-slate-500 mt-1">Acq ID: #{selectedStudy.id}</p>
                    </div>
                  </div>

                  {/* Patient demographics panel */}
                  <div className="grid grid-cols-2 gap-3 bg-slate-55 shadow-sm border border-slate-205 p-3 rounded-md text-xs">
                    <div><span className="text-[9px] font-bold text-slate-400 uppercase block">Patient Name</span><strong>{selectedStudy.patientName}</strong></div>
                    <div><span className="text-[9px] font-bold text-slate-400 uppercase block">Medical Record Number</span><strong>{selectedStudy.mrn}</strong></div>
                    <div className="col-span-2 border-t border-slate-200/80 pt-1.5 mt-0.5" />
                    <div><span className="text-[9px] font-bold text-slate-400 uppercase block">Procedure</span><strong>{selectedStudy.modality} • {selectedStudy.bodyPart}</strong></div>
                    <div><span className="text-[9px] font-bold text-slate-400 uppercase block">Study Date</span><strong>{selectedStudy.studyDate}</strong></div>
                  </div>

                  {/* Findings */}
                  <div>
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-1">Radiography Findings Summary</span>
                    <div className="p-3 bg-slate-100 rounded text-xs text-slate-900 font-serif border-l-4 border-cyan-600 leading-relaxed italic">
                      "{editedFindings || selectedStudy.finding}"
                    </div>
                  </div>

                  {/* Recommendations */}
                  <div>
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-1">Assisted Guidelines & Recommendations</span>
                    <p className="text-xs text-slate-700 leading-relaxed">
                      {editedRecommendations || selectedStudy.recommendation}
                    </p>
                  </div>

                  {/* Annotations listings */}
                  <div>
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-1">Image Annotations & Metric Measurements ({selectedStudy.annotations.length})</span>
                    {selectedStudy.annotations.length > 0 ? (
                      <table className="w-full text-left text-[11px] border-collapse bg-white mt-1.5">
                        <thead>
                          <tr className="bg-slate-150 border-b border-slate-200 text-slate-600">
                            <th className="p-1.5 font-bold">Ref No.</th>
                            <th className="p-1.5 font-bold">Type</th>
                            <th className="p-1.5 font-bold">Diagnostic Target</th>
                            <th className="p-1.5 font-bold">Measured Value</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100/90 text-slate-800">
                          {selectedStudy.annotations.map((ann, i) => (
                            <tr key={ann.id}>
                              <td className="p-1.5 font-mono font-bold text-slate-900">TAG-{i+1}</td>
                              <td className="p-1.5 capitalize font-medium text-slate-500">{ann.type} ROI</td>
                              <td className="p-1.5">{ann.text || 'Pathology Zone'}</td>
                              <td className="p-1.5 font-bold text-red-650">{ann.measuredValue || 'Visual Evaluation'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <p className="text-[11px] text-slate-400 italic">No region markings registered on the diagnostic stage currently.</p>
                    )}
                  </div>

                  {/* Disclaimer */}
                  <div className="border-t border-slate-200 pt-3 text-[8px] text-slate-400 text-center leading-normal">
                    This clinically-graded report card was assembled using neural model tracking registers. Attending physician validator sign-off is mandatory.
                  </div>
                </div>
              </div>

              {/* Right Column: Execution Controls (md:span-5) */}
              <div className="md:col-span-12 lg:col-span-5 p-5 bg-[#090d18] flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Export Data Targets</span>
                    <h4 className="text-sm font-bold text-white">Choose Downstream Delivery Protocols</h4>
                    <p className="text-xs text-slate-400 mt-1">Select structured medical objects for electronic medical records (EMR) or printable validation files.</p>
                  </div>

                  <div className="space-y-3">
                    {/* JSON Block */}
                    <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-slate-100 flex items-center gap-1">
                          <Binary className="w-3.5 h-3.5 text-cyan-400" />
                          Structured JSON Data
                        </span>
                        <span className="text-[8px] font-bold text-cyan-400 bg-cyan-950 px-1.5 py-0.5 rounded tracking-wider font-mono">INTEGRATION</span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        Contains patient demographics, confidence scales, audit logs, and coordinates of exact visual annotations for direct HL7/FHIR EHR synchronization.
                      </p>
                      <button
                        type="button"
                        onClick={handleExportJSONReport}
                        className="w-full bg-slate-900 border border-slate-800 text-white font-bold p-2 rounded-lg text-xs hover:bg-slate-800 hover:border-slate-700 transition flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5 text-cyan-400" strokeWidth={2.5} />
                        Download PACS JSON Report
                      </button>
                    </div>

                    {/* PDF Block */}
                    <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-slate-100 flex items-center gap-1">
                          <FileCheck className="w-3.5 h-3.5 text-indigo-400" />
                          Printable Clinical PDF Document
                        </span>
                        <span className="text-[8px] font-bold text-indigo-400 bg-indigo-950 px-1.5 py-0.5 rounded tracking-wider font-mono">HIPAA READY</span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        Compiles an official diagnostic hospital-grade ledger. Fits standard page configurations for immediate saving as PDF or direct physical printing.
                      </p>
                      <button
                        type="button"
                        onClick={handlePrintPDFReport}
                        className="w-full bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-extrabold p-2 rounded-lg text-xs transition flex items-center justify-center gap-1.5 shadow cursor-pointer"
                      >
                        <FileText className="w-3.5 h-3.5 text-white" />
                        Generate & Print Clinical PDF
                      </button>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-850 space-y-2 text-[10px] text-slate-400 leading-relaxed shrink-0">
                  <span className="text-cyan-400 font-extrabold flex items-center gap-1">
                    <ShieldAlert className="w-4 h-4 text-cyan-400" />
                    HIPAA EXPORT CLEARANCE STATEMENT
                  </span>
                  Executing exports assigns an auditing token to trace the current session ID, workstation identity, and active radiologist credentials. All downloads are logged for regulatory compliance.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
