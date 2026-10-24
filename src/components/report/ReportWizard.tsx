import React, { useState, useRef, useEffect } from 'react';
import {
  Mic,
  MicOff,
  Upload,
  Camera,
  MapPin,
  Sparkles,
  ArrowRight,
  X,
  Volume2,
  VolumeX,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Trash2,
  Image as ImageIcon,
  Languages
} from 'lucide-react';
import { CivicIssue, AIAnalysis, AuthorityRecommendation, CivicCategory, IssueSeverity } from '../../types';
import { SAMPLE_IMAGE_FIXTURES } from '../../data/seedData';
import { ImageAnalysisProvider, TextAnalysisProvider } from '../../services/aiProvider';
import { AuthorityRoutingEngine } from '../../services/authorityRoutingEngine';
import { PublicWorksMatcher, WorkMatchResult } from '../../services/publicWorksMatcher';
import { FollowUpEngine } from '../../services/followUpEngine';
import { StorageService } from '../../services/storageService';
import { LocationPickerMap } from '../map/LocationPickerMap';
import { JAIPUR_CENTER } from '../map/JaipurCivicMap';

interface ReportWizardProps {
  onComplete: (issueId: string) => void;
  onCancel: () => void;
  initialCoords?: { lat: number; lng: number };
}

// Browser SpeechRecognition interface
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export const ReportWizard: React.FC<ReportWizardProps> = ({
  onComplete,
  onCancel,
  initialCoords,
}) => {
  // Input 1: Text / Voice State
  const [description, setDescription] = useState('');
  const [speechLanguage, setSpeechLanguage] = useState<'en-IN' | 'hi-IN'>('hi-IN');
  const [isListening, setIsListening] = useState(false);
  const [voiceNotice, setVoiceNotice] = useState<string | null>(null);
  const [isSpeakingAloud, setIsSpeakingAloud] = useState(false);

  // Input 2: Image State
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [selectedFixtureId, setSelectedFixtureId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Input 3: Location State
  const [latitude, setLatitude] = useState(initialCoords?.lat || JAIPUR_CENTER[0]);
  const [longitude, setLongitude] = useState(initialCoords?.lng || JAIPUR_CENTER[1]);
  const [locationLabel, setLocationLabel] = useState('Sector-2, Malviya Nagar, Jaipur');

  // Submission & Processing State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittingPhase, setSubmittingPhase] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const baseTextRef = useRef<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cleanup speech synthesis on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore
        }
      }
    };
  }, []);

  // Toggle Speech-to-Text Dictation
  const handleToggleVoiceInput = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setVoiceNotice('Speech recognition is not supported in this browser. Please type directly.');
      return;
    }

    if (isListening) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          console.warn('Error stopping speech recognition:', e);
        }
        recognitionRef.current = null;
      }
      setIsListening(false);
      setVoiceNotice(null);
      return;
    }

    try {
      baseTextRef.current = description.trim();
      const recognition = new SpeechRecognition();
      recognition.lang = speechLanguage;
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
        setVoiceNotice(
          speechLanguage === 'hi-IN'
            ? 'सुन रहे हैं (हिंदी)... बोलिए (Listening in Hindi... speak clearly into microphone)'
            : 'Listening (English)... Speak clearly into your microphone'
        );
      };

      recognition.onresult = (event: any) => {
        let finalTranscript = '';
        let interimTranscript = '';
        for (let i = 0; i < event.results.length; ++i) {
          const res = event.results[i];
          if (res.isFinal) {
            finalTranscript += res[0].transcript + ' ';
          } else {
            interimTranscript += res[0].transcript;
          }
        }
        const base = baseTextRef.current;
        const spoken = (finalTranscript + interimTranscript).trim();
        const combined = base ? `${base} ${spoken}` : spoken;
        setDescription(combined);
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition notice:', event.error);
        if (event.error === 'no-speech') {
          setVoiceNotice('No speech detected. Please speak closer to microphone or retry.');
          return;
        }
        if (event.error === 'not-allowed') {
          setVoiceNotice('Microphone access blocked. Please allow microphone permissions in your browser.');
        } else {
          setVoiceNotice(`Microphone status: ${event.error}. You can also type directly.`);
        }
        setIsListening(false);
        recognitionRef.current = null;
      };

      recognition.onend = () => {
        setIsListening(false);
        recognitionRef.current = null;
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (e: any) {
      console.error('Speech recognition start failed:', e);
      setIsListening(false);
      setVoiceNotice('Could not initialize microphone. Please check permissions.');
    }
  };

  // Text-to-Speech Read Aloud
  const handleToggleReadAloud = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      alert('Speech synthesis (read aloud) is not supported in this browser.');
      return;
    }

    if (isSpeakingAloud) {
      window.speechSynthesis.cancel();
      setIsSpeakingAloud(false);
      return;
    }

    const textToRead = description.trim();
    if (!textToRead) {
      setVoiceNotice('Please type or dictate your grievance description first.');
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.lang = speechLanguage;
    utterance.rate = 0.95;

    const voices = window.speechSynthesis.getVoices();
    const matchingVoice = voices.find((v) =>
      speechLanguage === 'hi-IN'
        ? v.lang.includes('hi') || v.name.toLowerCase().includes('hindi')
        : v.lang.includes('en-IN') || (v.lang.includes('en') && !v.lang.includes('hi'))
    );
    if (matchingVoice) {
      utterance.voice = matchingVoice;
    }

    utterance.onstart = () => setIsSpeakingAloud(true);
    utterance.onend = () => setIsSpeakingAloud(false);
    utterance.onerror = () => setIsSpeakingAloud(false);

    window.speechSynthesis.speak(utterance);
  };

  // Handle File Upload
  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (JPG, PNG, WebP).');
      return;
    }
    setImageFile(file);
    setSelectedFixtureId(null);
    const reader = new FileReader();
    reader.onload = () => {
      setImageUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Handle Drag & Drop
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  // Handle Sample Preset Select
  const handleSelectSampleFixture = (fixture: typeof SAMPLE_IMAGE_FIXTURES[0]) => {
    setSelectedFixtureId(fixture.id);
    setImageUrl(fixture.url);
    setImageFile(null);
    if (!description.trim()) {
      setDescription(
        speechLanguage === 'hi-IN'
          ? `${fixture.name} — स्थानीय नागरिकों और वाहनों के लिए बाधा उत्पन्न हो रही है।`
          : `${fixture.name} observed. Causing severe inconvenience and hazard to road users.`
      );
    }
  };

  // Clear Image
  const handleRemoveImage = () => {
    setImageFile(null);
    setImageUrl(null);
    setSelectedFixtureId(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Single-Step Report Submission
  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!description.trim()) {
      setErrorMessage('Please provide a description of the issue (type or speak).');
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      // Phase 1: Automated AI Analysis (Computer Vision + Text Analysis)
      setSubmittingPhase('AI analyzing damage & visual evidence...');
      const analysisResponse = await ImageAnalysisProvider.analyze({
        imageFile: imageFile || undefined,
        imageUrl: imageUrl || undefined,
        fixtureId: selectedFixtureId || undefined,
        description: description.trim(),
      });

      const aiResult: AIAnalysis = analysisResponse.analysis;
      const detectedCategory: CivicCategory = aiResult.predictedCategory || 'roads_footpaths';
      const detectedSeverity: IssueSeverity = aiResult.suggestedUrgency || 'medium';

      // Phase 2: Statutory Authority Discovery (Rajasthan Acts & Municipal Rules)
      setSubmittingPhase('Determining statutory jurisdiction (JMC/JDA/PWD)...');
      const authorityRec: AuthorityRecommendation = AuthorityRoutingEngine.recommend({
        category: detectedCategory,
        latitude,
        longitude,
        locationLabel,
        description: description.trim(),
      });

      // Phase 3: Public Works & Tender Proximity Matching
      setSubmittingPhase('Checking SHPP tender database & Defect Liability Period (DLP)...');
      const matchedWorks: WorkMatchResult[] = PublicWorksMatcher.findRelatedWorks(
        latitude,
        longitude,
        detectedCategory,
        2500
      );

      // Phase 4: Construct and Save Issue
      setSubmittingPhase('Registering civic report & scheduling follow-ups...');
      const newId = `JN-2026-${Math.floor(1000 + Math.random() * 9000)}`;
      const nowIso = StorageService.getSimulatedNow().toISOString();

      // Clean Title derivation
      let cleanTitle = description.trim().split('\n')[0].slice(0, 75);
      if (cleanTitle.length < 15 && aiResult.detectedDamage) {
        cleanTitle = `${aiResult.detectedDamage} near ${locationLabel.split(',')[0]}`;
      }

      const newIssue: CivicIssue = {
        id: newId,
        title: cleanTitle,
        description: description.trim(),
        category: detectedCategory,
        subcategory: aiResult.predictedSubtype || 'Reported Civic Anomaly',
        severity: detectedSeverity,
        latitude,
        longitude,
        locationLabel,
        createdAt: nowIso,
        updatedAt: nowIso,
        status: 'routed_in_prototype',
        reporterId: 'CITIZEN_ANON_' + Math.floor(100 + Math.random() * 900),
        imageIds: imageUrl ? [`IMG-${newId}-A`] : [],
        imageUrl: imageUrl || undefined,
        aiAnalysisId: aiResult.id,
        authorityRecommendationId: authorityRec.id,
        relatedProjectIds: matchedWorks.slice(0, 2).map((w) => w.work.id),
        nextFollowUpAt: new Date(new Date(nowIso).getTime() + 24 * 60 * 60 * 1000).toISOString(),
        dataOrigin: 'citizen_submitted',
        verificationStatus: 'citizen_confirmed',
      };

      // Save to localStorage
      StorageService.saveIssue(newIssue);

      // Save AI analysis with reference
      StorageService.saveAiAnalysis({
        ...aiResult,
        issueId: newId,
      });

      // Add timeline creation event
      StorageService.addTimelineEvent({
        id: `EV-${newId}-1`,
        issueId: newId,
        eventType: 'issue_created',
        title: 'Civic Grievance Filed',
        description: `Grievance registered at ${locationLabel} with photo evidence & automated computer vision triage.`,
        timestamp: nowIso,
        actorType: 'citizen',
        dataOrigin: 'citizen_submitted',
      });

      // Add authority routing timeline event
      StorageService.addTimelineEvent({
        id: `EV-${newId}-2`,
        issueId: newId,
        eventType: 'authority_routed',
        title: `Routed to ${authorityRec.authorityName}`,
        description: authorityRec.reason,
        timestamp: nowIso,
        actorType: 'system',
        dataOrigin: 'system-generated',
      });

      // Schedule automated 24h follow-up in FollowUpEngine
      const initialFollowUp = {
        id: `FOL-${newId.replace('JN-', '')}-1`,
        issueId: newId,
        scheduledAt: new Date(new Date(nowIso).getTime() + 24 * 60 * 60 * 1000).toISOString(),
        question: FollowUpEngine.generateContextualQuestion(detectedCategory, 1),
        status: 'scheduled' as const,
        createdBy: 'followup_engine' as const,
        dataOrigin: 'demo_system' as const,
      };
      StorageService.saveFollowUp(initialFollowUp);

      // Successfully finished -> redirect to complaint details
      onComplete(newId);
    } catch (err: any) {
      console.error('Failed to submit civic issue:', err);
      setErrorMessage(`Failed to submit report: ${err?.message || 'Unexpected error'}`);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 md:py-12">
      {/* Top Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E1E5DF] pb-6">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#E6EEE7] border border-[#ccdcd0] text-[#153F35] text-xs font-semibold mb-2">
            <span className="w-2 h-2 rounded-full bg-[#153F35] animate-pulse" />
            <span>Quick Civic Report • त्वरित नागरिक शिकायत</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-display text-[#153F35] tracking-tight">
            Report a Problem in Jaipur
          </h1>
          <p className="text-xs sm:text-sm text-[#6D7771] mt-1">
            Provide what is broken, attach a photo, and set the location. AI will categorize, route to the correct municipal authority, and check contractor warranties automatically.
          </p>
        </div>

        <button
          type="button"
          onClick={onCancel}
          className="self-start sm:self-center px-3.5 py-1.5 rounded-lg border border-[#E1E5DF] bg-white text-xs font-semibold text-[#6D7771] hover:text-[#202724] hover:bg-stone-50 transition"
        >
          Cancel
        </button>
      </div>

      {errorMessage && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-bold">Missing Information</h4>
            <p className="mt-0.5">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Main Single-Step Form */}
      <form onSubmit={handleSubmitReport} className="space-y-8">
        {/* INPUT 1: TEXT & AUDIO (VOICE) */}
        <div className="p-6 rounded-2xl bg-white border border-[#E1E5DF] shadow-subtle space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-100 pb-3">
            <div className="flex items-center space-x-2">
              <span className="w-6 h-6 rounded-full bg-[#153F35] text-white text-xs font-bold flex items-center justify-center">
                1
              </span>
              <h2 className="text-sm font-bold font-display text-[#153F35]">
                Describe the Issue (Text or Voice)
              </h2>
            </div>

            {/* Language Selector & TTS */}
            <div className="flex items-center space-x-2">
              <div className="flex items-center rounded-lg border border-[#E1E5DF] p-0.5 bg-stone-50 text-[11px] font-semibold">
                <button
                  type="button"
                  onClick={() => setSpeechLanguage('hi-IN')}
                  className={`px-2.5 py-1 rounded-md transition ${
                    speechLanguage === 'hi-IN'
                      ? 'bg-[#153F35] text-white shadow-xs'
                      : 'text-[#6D7771] hover:text-[#202724]'
                  }`}
                >
                  हिंदी (Hindi)
                </button>
                <button
                  type="button"
                  onClick={() => setSpeechLanguage('en-IN')}
                  className={`px-2.5 py-1 rounded-md transition ${
                    speechLanguage === 'en-IN'
                      ? 'bg-[#153F35] text-white shadow-xs'
                      : 'text-[#6D7771] hover:text-[#202724]'
                  }`}
                >
                  English
                </button>
              </div>

              {description.trim() && (
                <button
                  type="button"
                  onClick={handleToggleReadAloud}
                  className="p-1.5 rounded-lg border border-[#E1E5DF] hover:bg-stone-50 text-[#6D7771] hover:text-[#153F35] transition"
                  title={isSpeakingAloud ? 'Stop reading aloud' : 'Read description aloud (Text-to-Speech)'}
                >
                  {isSpeakingAloud ? (
                    <VolumeX className="w-4 h-4 text-[#B94343]" />
                  ) : (
                    <Volume2 className="w-4 h-4" />
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Text Area */}
          <div className="relative">
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={
                speechLanguage === 'hi-IN'
                  ? 'समस्या के बारे में बताएं... उदाहरण: "सेक्टर 2 मालवीय नगर मंदिर के पास सड़क पर बहुत गहरा गड्ढा है, गाड़ियाँ फिसल रही हैं..." या नीचे माइक बटन दबाकर बोलें।'
                  : 'Describe what is damaged or broken... (e.g. Deep pothole on Sector 2 main approach road causing scooters to swerve, broken streetlight with dangling live wires)... or click mic to dictate.'
              }
              className="w-full p-4 rounded-xl border border-[#E1E5DF] bg-[#F7F7F2] text-xs sm:text-sm text-[#202724] focus:outline-none focus:ring-2 focus:ring-[#153F35] focus:bg-white transition leading-relaxed"
            />

            {/* Quick Word Suggestions */}
            <div className="flex flex-wrap items-center gap-1.5 mt-2">
              <span className="text-[11px] text-[#6D7771] mr-1">Quick Jaipur tags:</span>
              {[
                { en: 'Deep Pothole / सड़क का गड्ढा', hi: 'सड़क पर गहरा गड्ढा है' },
                { en: 'Garbage Dump Overflow / कचरे का ढेर', hi: 'कचरे का डिब्बा भर गया है' },
                { en: 'Broken Streetlight / बंद स्ट्रीटलाइट', hi: 'स्ट्रीटलाइट टूटी हुई है' },
                { en: 'Water Pipe Leak / पानी लीकेज', hi: 'पेयजल पाइपलाइन फूट गई है' },
              ].map((tag, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    const text = speechLanguage === 'hi-IN' ? tag.hi : tag.en;
                    setDescription((prev) => (prev ? `${prev} • ${text}` : text));
                  }}
                  className="px-2.5 py-1 rounded-md bg-stone-100 hover:bg-[#E6EEE7] text-stone-700 hover:text-[#153F35] text-[11px] font-medium border border-stone-200 transition"
                >
                  {tag.en}
                </button>
              ))}
            </div>
          </div>

          {/* Voice Mic Record Control */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={handleToggleVoiceInput}
                className={`inline-flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold transition ${
                  isListening
                    ? 'bg-[#B94343] text-white shadow-card animate-pulse'
                    : 'bg-[#153F35] text-white hover:bg-[#102D27] shadow-subtle'
                }`}
              >
                {isListening ? (
                  <>
                    <MicOff className="w-4 h-4" />
                    <span>Stop Recording (रोकें)</span>
                  </>
                ) : (
                  <>
                    <Mic className="w-4 h-4 text-emerald-300" />
                    <span>Speak Grievance (माइक से बोलें)</span>
                  </>
                )}
              </button>

              <span className="text-[11px] text-[#6D7771]">
                {isListening
                  ? 'Listening actively... speak clearly.'
                  : 'Web Speech audio dictation in Hindi & English.'}
              </span>
            </div>

            {description && (
              <button
                type="button"
                onClick={() => setDescription('')}
                className="text-[11px] text-stone-400 hover:text-stone-600 flex items-center gap-1 self-start sm:self-center"
              >
                <Trash2 className="w-3 h-3" />
                <span>Clear text</span>
              </button>
            )}
          </div>

          {voiceNotice && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center space-x-2 animate-in fade-in">
              <Mic className="w-4 h-4 text-emerald-700 shrink-0 animate-pulse" />
              <span>{voiceNotice}</span>
            </div>
          )}
        </div>

        {/* INPUT 2: IMAGE / PHOTO */}
        <div className="p-6 rounded-2xl bg-white border border-[#E1E5DF] shadow-subtle space-y-4">
          <div className="flex items-center space-x-2 border-b border-stone-100 pb-3">
            <span className="w-6 h-6 rounded-full bg-[#153F35] text-white text-xs font-bold flex items-center justify-center">
              2
            </span>
            <div>
              <h2 className="text-sm font-bold font-display text-[#153F35]">
                Attach Photograph Evidence
              </h2>
              <p className="text-[11px] text-[#6D7771]">
                Upload your camera photo, or test with verified Jaipur prototype samples below.
              </p>
            </div>
          </div>

          {/* Hidden File Input */}
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFileSelect(e.target.files[0]);
              }
            }}
          />

          {/* Active Image Preview or Drag & Drop Zone */}
          {imageUrl ? (
            <div className="relative rounded-xl border border-[#E1E5DF] bg-[#F7F7F2] p-4 flex flex-col sm:flex-row items-center gap-4">
              <img
                src={imageUrl}
                alt="Civic damage preview"
                className="w-full sm:w-48 h-36 object-cover rounded-lg border border-[#E1E5DF] shadow-subtle"
              />
              <div className="flex-1 space-y-1.5 text-xs">
                <div className="flex items-center space-x-2 text-emerald-700 font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Photo Evidence Attached</span>
                </div>
                <p className="text-[#6D7771]">
                  {imageFile
                    ? `Uploaded: ${imageFile.name} (${(imageFile.size / 1024).toFixed(1)} KB)`
                    : 'Selected from verified Jaipur demonstration fixtures.'}
                </p>
                <div className="pt-2 flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 rounded-lg border border-[#E1E5DF] bg-white hover:bg-stone-50 font-semibold text-stone-700 transition"
                  >
                    Change Photo
                  </button>
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 font-semibold transition flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`rounded-xl border-2 border-dashed p-6 text-center cursor-pointer transition ${
                isDragging
                  ? 'border-[#153F35] bg-[#E6EEE7]/50'
                  : 'border-[#E1E5DF] hover:border-[#153F35] hover:bg-stone-50/50'
              }`}
            >
              <div className="w-12 h-12 rounded-xl bg-[#E6EEE7] text-[#153F35] mx-auto flex items-center justify-center mb-3">
                <Camera className="w-6 h-6" />
              </div>
              <h3 className="text-xs font-bold text-[#202724]">
                Upload or Take Photo of Damage
              </h3>
              <p className="text-[11px] text-[#6D7771] mt-1">
                Drag and drop your JPG or PNG here, or click to browse files
              </p>
            </div>
          )}

          {/* Quick Jaipur Demonstration Fixtures */}
          <div className="pt-1">
            <span className="text-[11px] font-bold text-[#6D7771] block mb-2">
              Or pick a verified Jaipur sample photo for instant testing:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {SAMPLE_IMAGE_FIXTURES.map((fixture) => {
                const isSelected = selectedFixtureId === fixture.id;
                return (
                  <div
                    key={fixture.id}
                    onClick={() => handleSelectSampleFixture(fixture)}
                    className={`p-2 rounded-xl border cursor-pointer transition flex items-center space-x-2.5 ${
                      isSelected
                        ? 'border-[#153F35] bg-[#E6EEE7] shadow-xs'
                        : 'border-[#E1E5DF] hover:border-stone-400 bg-white'
                    }`}
                  >
                    <img
                      src={fixture.url}
                      alt={fixture.name}
                      className="w-10 h-10 rounded-lg object-cover border border-[#E1E5DF]"
                    />
                    <div className="min-w-0 flex-1">
                      <h4 className="text-[11px] font-bold text-[#202724] truncate">
                        {fixture.name.split(' ')[0]}
                      </h4>
                      <span className="text-[10px] text-[#6D7771] block truncate">
                        {fixture.subtype}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* INPUT 3: LOCATION */}
        <div className="p-6 rounded-2xl bg-white border border-[#E1E5DF] shadow-subtle space-y-4">
          <div className="flex items-center space-x-2 border-b border-stone-100 pb-3">
            <span className="w-6 h-6 rounded-full bg-[#153F35] text-white text-xs font-bold flex items-center justify-center">
              3
            </span>
            <div>
              <h2 className="text-sm font-bold font-display text-[#153F35]">
                Confirm Exact Location on Jaipur Map
              </h2>
              <p className="text-[11px] text-[#6D7771]">
                Search your Jaipur ward/colony, use your device GPS, or drag the pin directly on the map.
              </p>
            </div>
          </div>

          <LocationPickerMap
            initialLat={latitude}
            initialLng={longitude}
            locationLabel={locationLabel}
            onLocationChange={(lat, lng, label) => {
              setLatitude(lat);
              setLongitude(lng);
              setLocationLabel(label);
            }}
          />
        </div>

        {/* SUBMIT BUTTON BAR */}
        <div className="rounded-2xl bg-[#153F35] text-white p-6 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-bold text-emerald-300">
              <Sparkles className="w-4 h-4" />
              <span>Automated Intelligence Pipeline Ready</span>
            </div>
            <p className="text-xs text-stone-300 mt-1 max-w-md">
              AI analysis, authority jurisdiction under Rajasthan Acts, and Defect Liability Period (DLP) tender cross-referencing will run on submission.
            </p>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-lg border border-emerald-700 text-xs font-semibold text-stone-200 hover:bg-[#102D27] transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-lg bg-white text-[#153F35] hover:bg-emerald-50 text-xs sm:text-sm font-bold shadow-subtle transition flex items-center gap-2 transform active:scale-95 disabled:opacity-75 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#153F35]" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <span>Submit Civic Report (शिकायत दर्ज करें)</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Processing Modal Overlay */}
      {isSubmitting && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-elevated border border-[#E1E5DF] text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-[#E6EEE7] text-[#153F35] flex items-center justify-center mx-auto shadow-subtle animate-bounce">
              <Sparkles className="w-7 h-7 text-emerald-800" />
            </div>
            <div>
              <h3 className="text-base font-bold font-display text-[#153F35]">
                Processing Civic Intelligence
              </h3>
              <p className="text-xs text-[#6D7771] mt-1.5 leading-relaxed">
                {submittingPhase || 'Evaluating complaint details...'}
              </p>
            </div>
            <div className="w-full bg-stone-100 h-1.5 rounded-full overflow-hidden">
              <div className="bg-[#153F35] h-full w-2/3 animate-pulse rounded-full" />
            </div>
            <span className="text-[10px] text-stone-400 block">
              Applying Rajasthan Municipalities Act 2009 & SHPP Tender Matching
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportWizard;
