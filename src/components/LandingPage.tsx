import React from 'react';
import { Activity, Shield, Cpu, RefreshCw, Layers, Layout, Users, FileText, ChevronRight, Binary, Server } from 'lucide-react';

interface LandingPageProps {
  onStart: (role: string) => void;
}

export default function LandingPage({ onStart }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-teal-500 selection:text-slate-950 overflow-x-hidden">
      {/* Background glow effects */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-teal-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Header */}
      <header className="border-b border-slate-900 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-teal-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-teal-500/20">
              <Activity className="h-6 w-6 text-slate-950 stroke-[2.5]" />
            </div>
            <div>
              <span className="font-sans font-bold tracking-tight text-white text-xl">MED<span className="text-teal-400">SCAN</span></span>
              <span className="text-[10px] block font-mono text-slate-400 tracking-wider">AI PLATFORM</span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
            <a href="#features" className="hover:text-teal-400 transition-colors">Key Capability</a>
            <a href="#roles" className="hover:text-teal-400 transition-colors">Clinical Roles</a>
            <a href="#compliance" className="hover:text-teal-400 transition-colors">HIPAA Security</a>
            <a href="#devops" className="hover:text-teal-400 transition-colors">Integration Spec</a>
          </nav>

          <button 
            onClick={() => onStart('radiologist')}
            className="px-5 h-10 bg-white hover:bg-slate-100 text-slate-950 rounded-lg text-sm font-semibold tracking-tight transition-all shadow-md shadow-white/5 flex items-center gap-1.5"
          >
            Launch Core Platform <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-24 md:pt-32 md:pb-36 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-900 border border-slate-800 rounded-full text-xs font-medium text-teal-400 mb-8 shadow-inner">
          <span className="flex h-2 w-2 rounded-full bg-teal-400 animate-pulse" />
          ENTERPRISE CLINICAL COGNITION ENGINE v4.2
        </div>
        
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white max-w-5xl mx-auto leading-[1.1] mb-6">
          Universal Medical Imaging <br />
          <span className="bg-gradient-to-r from-teal-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent">Intelligence Platform</span>
        </h1>

        <p className="text-lg md:text-xl text-slate-400 max-w-3xl mx-auto mb-12 font-light leading-relaxed">
          Assisting radiologists, hospital administrations, diagnostic centers, and medical practitioners with deep diagnostic pipelines, explainable Grad-CAM heatmaps, automated report generation and Multi-Modal clinical reasoning.
        </p>

        {/* Call to Actions - Start by selecting role */}
        <div className="mb-20 max-w-5xl mx-auto">
          <p className="text-xs uppercase tracking-widest text-slate-500 font-semibold font-mono mb-4">Select clinical testing persona to launch app:</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { id: 'radiologist', label: 'Radiologist', desc: 'Annotations & reporting', color: 'border-teal-500/30 hover:border-teal-400' },
              { id: 'doctor', label: 'Attending Doctor', desc: 'Scan & report reviews', color: 'border-blue-500/30 hover:border-blue-400' },
              { id: 'diagnostic_center', label: 'Imaging Center', desc: 'Workflow & bulk ingest', color: 'border-cyan-500/30 hover:border-cyan-400' },
              { id: 'student', label: 'Medical Student', desc: 'Interactive tutoring / RAG', color: 'border-amber-500/30 hover:border-amber-400' },
              { id: 'admin', label: 'Hospital Admin', desc: 'Analytics & access logs', color: 'border-purple-500/30 hover:border-purple-400' },
              { id: 'super_admin', label: 'Super Admin', desc: 'Model registry & GPU', color: 'border-rose-500/30 hover:border-rose-400' },
            ].map((role) => (
              <button
                key={role.id}
                onClick={() => onStart(role.id)}
                className={`flex flex-col text-left p-4 rounded-xl bg-slate-900/60 border ${role.color} hover:bg-slate-900 transition-all cursor-pointer group hover:shadow-lg`}
              >
                <span className="font-semibold text-white group-hover:text-teal-300 transition-colors text-sm">{role.label}</span>
                <span className="text-[11px] text-slate-400 mt-1 leading-tight">{role.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Beautiful Mock UI */}
        <div className="relative max-w-5xl mx-auto rounded-2xl border border-slate-800 bg-slate-900/40 p-2 shadow-2xl overflow-hidden shadow-teal-500/5">
          <div className="h-6 flex items-center gap-1.5 px-3 border-b border-slate-800/80 bg-slate-950/60 rounded-t-xl mb-2 font-mono text-[10px] text-slate-500">
            <span className="h-2 w-2 rounded-full bg-slate-800" />
            <span className="h-2 w-2 rounded-full bg-slate-800" />
            <span className="h-2 w-2 rounded-full bg-slate-800" />
            <span className="ml-2 text-slate-400">MEDSCAN AI CLINICAL WORKSTATION - RAD-STUDY-CONTROLLER</span>
          </div>
          <img 
            src="https://images.unsplash.com/photo-1559757175-5700dde675bc?q=80&w=1200&auto=format&fit=crop" 
            alt="Chest Radiology Preview" 
            className="w-full h-80 object-cover rounded-lg filter contrast-125 opacity-80"
          />
          <div className="absolute inset-x-2 bottom-2 bg-gradient-to-t from-slate-950/90 to-slate-950/40 p-6 rounded-b-lg border-t border-slate-800 text-left flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-xs font-mono font-bold px-2 py-0.5 bg-red-500/20 text-red-400 rounded border border-red-500/30">PATIENT ID: MRN-301-882</span>
                <span className="text-xs font-mono font-bold px-2 py-0.5 bg-teal-500/20 text-teal-400 rounded border border-teal-500/30">AI FINDING ACCURACY: 91.4%</span>
              </div>
              <h3 className="font-semibold text-white">Chest Radiograph: Localized Lobar consolidation (Pneumonia)</h3>
              <p className="text-xs text-slate-400 mt-1">Saliency overlay calibrated using MONAI-based clinical spatial transformers.</p>
            </div>
            <button 
              onClick={() => onStart('radiologist')}
              className="px-6 h-11 bg-teal-500 text-slate-950 hover:bg-teal-400 rounded-lg text-sm font-semibold self-start md:self-auto transition-colors"
            >
              Analyze Live Study
            </button>
          </div>
        </div>
      </section>

      {/* Grid of Medical Imaging support */}
      <section id="features" className="py-20 bg-slate-950 border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-white mb-4">Core Clinical Modules Support</h2>
            <p className="text-slate-400 max-w-2xl mx-auto font-light">
              Enterprise pipelines optimizing computer vision inference across all high-frequency imaging modalities.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="p-6 rounded-xl bg-slate-900/40 border border-slate-900 hover:border-slate-800 transition-all">
              <div className="h-12 w-12 rounded-lg bg-teal-500/10 flex items-center justify-center text-teal-400 mb-6 font-mono font-bold text-lg">
                XR
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Chest & Bone X-Ray</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Fast classification of skeletal fractures, pulmonary consolidation zones, cardiomegaly signs, and tuberculous opacity patterns.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-slate-900/40 border border-slate-900 hover:border-slate-800 transition-all">
              <div className="h-12 w-12 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 mb-6 font-mono font-bold text-lg">
                CT
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">High-Res CT Ingestion</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Organ volume estimation, computerized lesion localization, pulmonary nodule tracking, and abdominal contrast mapping.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-slate-900/40 border border-slate-900 hover:border-slate-800 transition-all">
              <div className="h-12 w-12 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400 mb-6 font-mono font-bold text-lg">
                MR
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Advanced Tissue MRI</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Glioblastoma/tumor margin segmentation using U-Net networks, spine structural degeneration profiling, and muscle tear analysis.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-slate-900/40 border border-slate-900 hover:border-slate-800 transition-all">
              <div className="h-12 w-12 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400 mb-6 font-mono font-bold text-lg">
                US
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Ultrasound Support</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Interactive lesion diameter toolings, fetal measurements tracking, cholelithiasis acoustic shadow detection guides.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* RAG & Analytics section banner */}
      <section className="py-20 bg-slate-900/40 border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs text-teal-400 font-mono mb-4 font-bold uppercase tracking-wider">
              <Cpu className="h-3 w-3" /> State of the Art Explainability
            </div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white mb-6">
              Explainable AI via Grad-CAM & Multimodal Diagnosis
            </h2>
            <p className="text-slate-400 leading-relaxed mb-6 font-light">
              Do not rely on opaque predictions. Our explainable pipeline maps visual features directly onto the scan using saliency heatmaps, proving local voxel influences. 
            </p>
            <p className="text-slate-400 leading-relaxed mb-8 font-light">
              Our advanced Multi-Modal Diagnostic and Medical RAG Assistant synthesizes imaging studies with patient symptoms, lab markers (WBC, CRP), and medical textbooks, delivering transparent references and guidelines.
            </p>
            <div className="flex flex-wrap gap-4">
              <span className="px-3 py-1 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-400">Grad-CAM Saliency Maps</span>
              <span className="px-3 py-1 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-400">MONAI Segmentation Masks</span>
              <span className="px-3 py-1 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-400">Evidence-Based Citations</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-6 bg-slate-950 rounded-xl border border-slate-800 shadow-xl">
              <Shield className="h-8 w-8 text-teal-400 mb-4" />
              <h4 className="font-semibold text-white text-lg mb-1.5">HIPAA Audit Trail</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Full cryptographic tracking of study views, status edits, user logins, and database queries for absolute HIPAA compliance.
              </p>
            </div>

            <div className="p-6 bg-slate-950 rounded-xl border border-slate-800 shadow-xl">
              <RefreshCw className="h-8 w-8 text-blue-400 mb-4" />
              <h4 className="font-semibold text-white text-lg mb-1.5">Model Registry</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Active monitoring of ViT performance, inference times, A/B testing splits, GPU memory budgets, and hot-rollbacks.
              </p>
            </div>

            <div className="p-6 bg-slate-950 rounded-xl border border-slate-800 shadow-xl">
              <Layout className="h-8 w-8 text-cyan-400 mb-4" />
              <h4 className="font-semibold text-white text-lg mb-1.5">Radiology Copilot</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Bridges conversational medicine. Highlight nodules, request differential considerations, or compile tutoring materials instantly.
              </p>
            </div>

            <div className="p-6 bg-slate-950 rounded-xl border border-slate-800 shadow-xl">
              <Users className="h-8 w-8 text-purple-400 mb-4" />
              <h4 className="font-semibold text-white text-lg mb-1.5">Collaborative Review</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Simulated real-time cursor indicators, multi-user comments feed, scan history timelines, and draft report approvals.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Alert Warning Box Banner */}
      <section className="bg-slate-950 border-y border-slate-900 py-10 text-center">
        <div className="max-w-4xl mx-auto px-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-500/10 text-yellow-500 border border-yellow-500/30 text-xs rounded-full font-mono mb-4 font-bold">
            HEALTHCARE CLINICAL STIPULATION
          </div>
          <p className="text-sm font-mono text-slate-450 text-slate-300 italic max-w-2xl mx-auto">
            "MEDSCAN AI functions primarily as a decision support pipeline. All AI generated heatmaps, segmentation coordinates, drafts, and differential diagnosis considerations are intended for clinical backing. All outputs are clearly labeled as: AI-generated assistance requiring professional medical review."
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-slate-950 text-slate-500 text-xs text-center border-t border-slate-900">
        <p className="mb-2">MEDSCAN AI™ Co-developed with Hospital-Cluster AI Laboratories. All Rights Reserved. © 2026</p>
        <p>Enterprise HIPAA Secure Clinical Decoders. Port 3000 Ingress Routing Layer Active.</p>
      </footer>
    </div>
  );
}
