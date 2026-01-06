
import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, Download, Settings2, Palette, ChevronRight, ChevronLeft, User, Briefcase,
  Type as TypeIcon, RefreshCw, Plus, Trash2, Share2, Save, Copy, Twitter, Linkedin, X,
  Upload, FileText, Monitor, Layout, Link as LinkIcon, Image as ImageIcon, CheckCircle2,
  Wand2, Layers, AlignLeft, Type, Check, Eye, FileDown, ListChecks, Hash, Clock, FolderOpen,
  MessageSquare
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import { SlideData, CarouselTheme, GenerationSettings, Tone, AspectRatio, GroundingSource, BrandingProfile, SlideLayout, TextEffect, BackgroundSettings, Project } from './types';
import { THEMES, TONES, FORMATS, LAYOUTS, BACKGROUNDS, FONTS, PATTERNS } from './constants';
import Slide from './components/Slide';
import { generateCarouselContent, generateKeySequences } from './services/gemini';
import { GoogleGenAI, Type as GenType } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const App: React.FC = () => {
  const defaultPhoto = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1000&auto=format&fit=crop"; 
  const defaultLogo = "https://img.logoipsum.com/296.svg"; 

  const [activeProfileType, setActiveProfileType] = useState<'personal' | 'company'>('personal');
  const [personalProfile, setPersonalProfile] = useState<BrandingProfile>({ 
    handle: '@SynapseCreative', 
    type: 'personal',
    photoUrl: defaultPhoto,
    logoUrl: defaultLogo
  });
  const [companyProfile, setCompanyProfile] = useState<BrandingProfile>({ 
    handle: '@Synapse_Creative', 
    type: 'company',
    logoUrl: defaultLogo
  });

  const [slides, setSlides] = useState<SlideData[]>([
    { title: "Synapse Studio v7.5", content: "Twoje profesjonalne studio karuzeli AI. Teraz z poprawionym silnikiem eksportu, który eliminuje błędy nakładającego się tekstu." },
    { title: "Precyzyjny Eksport", content: "Każdy slajd jest teraz renderowany w natywnej rozdzielczości 1080p przed przechwyceniem, co gwarantuje idealny układ elementów." },
    { title: "Interaktywne Linki", content: "Linki na ostatniej stronie są teraz w pełni klikalne w podglądzie, ułatwiając nawigację do Twoich zasobów." }
  ]);
  
  const [loading, setLoading] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [seqLoading, setSeqLoading] = useState(false);
  const [structurePreview, setStructurePreview] = useState<string[]>([]);
  
  const [currentTheme, setCurrentTheme] = useState<CarouselTheme>(THEMES[0]);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('4:5');
  const [slideLayout, setSlideLayout] = useState<SlideLayout>('centered');
  const [textEffect, setTextEffect] = useState<TextEffect>('none');
  const [overlayImageUrl, setOverlayImageUrl] = useState<string>('');
  const [titleColor, setTitleColor] = useState<string>('');
  
  const [bgSettings, setBgSettings] = useState<BackgroundSettings>({
    patternId: 'none',
    overlayColor: 'none',
    overlayOpacity: 8,
    fadingCorner: true
  });
  
  const [topic, setTopic] = useState('');
  const [clnLinks, setClnLinks] = useState<string[]>(['']);
  const [keyMessages, setKeyMessages] = useState<string[]>(['', '', '']);
  const [slideCount, setSlideCount] = useState(6);
  const [tone, setTone] = useState<Tone>('Edukacyjny');

  const [activeSlide, setActiveSlide] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [savedProjects, setSavedProjects] = useState<Project[]>([]);

  // Portal do eksportu
  const captureSlideRef = useRef<HTMLDivElement>(null);
  const [captureIndex, setCaptureIndex] = useState(0);

  useEffect(() => {
    setIsAnimating(true);
    const timer = setTimeout(() => setIsAnimating(false), 500);
    return () => clearTimeout(timer);
  }, [activeSlide]);

  useEffect(() => {
    const data = localStorage.getItem('synapse_projects');
    if (data) {
      try {
        setSavedProjects(JSON.parse(data));
      } catch (e) {
        console.error("Failed to parse projects", e);
      }
    }
  }, []);

  const saveProject = () => {
    const newProject: Project = {
      id: crypto.randomUUID(),
      name: topic || "Projekt " + new Date().toLocaleDateString(),
      timestamp: Date.now(),
      slides,
      theme: currentTheme,
      aspectRatio,
      slideLayout,
      textEffect,
      overlayImageUrl,
      titleColor,
      bgSettings,
      clnLinks,
      keyMessages,
      activeProfileType,
      personalProfile,
      companyProfile
    };

    const updated = [newProject, ...savedProjects];
    setSavedProjects(updated);
    localStorage.setItem('synapse_projects', JSON.stringify(updated));
    alert("Projekt został zapisany!");
  };

  const loadProject = (project: Project) => {
    setSlides(project.slides);
    setCurrentTheme(project.theme);
    setAspectRatio(project.aspectRatio);
    setSlideLayout(project.slideLayout);
    setTextEffect(project.textEffect);
    setOverlayImageUrl(project.overlayImageUrl);
    setTitleColor(project.titleColor);
    setBgSettings(project.bgSettings);
    setClnLinks(project.clnLinks);
    setKeyMessages(project.keyMessages || ['', '', '']);
    setActiveProfileType(project.activeProfileType);
    setPersonalProfile(project.personalProfile);
    setCompanyProfile(project.companyProfile);
    setTopic(project.name !== "Projekt " + new Date(project.timestamp).toLocaleDateString() ? project.name : '');
    setActiveSlide(0);
    setShowHistory(false);
  };

  const deleteProject = (id: string) => {
    const updated = savedProjects.filter(p => p.id !== id);
    setSavedProjects(updated);
    localStorage.setItem('synapse_projects', JSON.stringify(updated));
  };

  const generateQuickStructure = async () => {
    if (!topic) return alert("Wpisz temat!");
    setPreviewLoading(true);
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Dla tematu: "${topic}", wypisz krótko plan ${slideCount} slajdów do karuzeli w języku polskim. Tylko tytuły slajdów w formie listy JSON.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: GenType.ARRAY,
            items: { type: GenType.STRING }
          }
        }
      });
      setStructurePreview(JSON.parse(response.text || "[]"));
    } catch (e) {
      console.error(e);
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleGenerateSequences = async () => {
    if (!topic) return alert("Wpisz temat, aby wygenerować sekwencję!");
    setSeqLoading(true);
    try {
      const res = await generateKeySequences(topic);
      setKeyMessages(res);
    } catch (e) {
      alert("Błąd generatora sekwencji.");
    } finally {
      setSeqLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, setter: (url: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setter(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const settings: GenerationSettings = {
        topic, tone, slideCount,
        referenceImageUrls: clnLinks.filter(l => l.trim()),
        keyMessages,
        profileType: activeProfileType,
        layout: slideLayout,
        textEffect,
        titleColor: titleColor || undefined
      };
      const { slides: result } = await generateCarouselContent(settings);
      setSlides(result);
      setActiveSlide(0);
      setStructurePreview([]);
    } catch (error) {
      alert("Błąd generowania.");
    } finally {
      setLoading(false);
    }
  };

  const captureSingleSlide = async (index: number) => {
    if (!captureSlideRef.current) return null;
    const el = captureSlideRef.current.querySelector('#capture-inner-slide') as HTMLElement;
    if (!el) return null;
    
    // Czekamy na pełne wyrenderowanie komponentu w portalu
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // @ts-ignore
    return await window.html2canvas(el, { 
      scale: 1, 
      useCORS: true,
      backgroundColor: null,
      logging: false,
      allowTaint: true,
      imageTimeout: 5000
    });
  };

  const downloadAllImages = async (format: 'png' | 'jpeg') => {
    setShowExportMenu(false);
    alert(`Rozpoczynanie pobierania jako ${format.toUpperCase()}. Proszę czekać...`);
    for (let i = 0; i < slides.length; i++) {
      setCaptureIndex(i);
      const canvas = await captureSingleSlide(i);
      if (!canvas) continue;
      
      const link = document.createElement('a');
      link.download = `Synapse_Slide_${i + 1}.${format === 'png' ? 'png' : 'jpg'}`;
      link.href = canvas.toDataURL(`image/${format}`, format === 'jpeg' ? 0.95 : undefined);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  };

  const downloadAsPDF = async () => {
    setShowExportMenu(false);
    alert("Generowanie profesjonalnego PDF. Proszę czekać...");
    
    // Obliczamy proporcje dla PDF na podstawie aspect ratio
    let pdfWidth = 1080;
    let pdfHeight = 1350;
    if (aspectRatio === '1:1') { pdfWidth = 1080; pdfHeight = 1080; }
    else if (aspectRatio === '9:16') { pdfWidth = 1080; pdfHeight = 1920; }
    else if (aspectRatio === '16:9') { pdfWidth = 1920; pdfHeight = 1080; }

    const pdf = new jsPDF({
      orientation: pdfWidth > pdfHeight ? 'landscape' : 'portrait',
      unit: 'px',
      format: [pdfWidth, pdfHeight]
    });

    for (let i = 0; i < slides.length; i++) {
      setCaptureIndex(i);
      const canvas = await captureSingleSlide(i);
      if (!canvas) continue;
      if (i > 0) pdf.addPage([pdfWidth, pdfHeight]);
      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
    }
    pdf.save('Synapse_Carousel.pdf');
  };

  const currentProfile = activeProfileType === 'personal' ? personalProfile : companyProfile;

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#f1f5f9] text-slate-900 overflow-hidden font-sans">
      
      {/* Hidden Portal for High-Resolution Capture */}
      <div ref={captureSlideRef} className="fixed top-0 left-[-9999px] z-[-1] pointer-events-none opacity-0">
        <Slide 
          id="capture-inner-slide"
          data={slides[captureIndex] || slides[0]} 
          theme={currentTheme}
          index={captureIndex}
          total={slides.length}
          profile={currentProfile}
          aspectRatio={aspectRatio}
          layout={slideLayout}
          backgroundImage={overlayImageUrl}
          textEffect={textEffect}
          referenceLinks={clnLinks}
          titleColor={titleColor}
          bgSettings={bgSettings}
        />
      </div>

      {/* Sidebar */}
      <aside className="w-full lg:w-[420px] bg-white border-r border-slate-200 flex flex-col overflow-y-auto max-h-screen shadow-2xl z-30">
        <div className="p-8 border-b border-slate-100 bg-gradient-to-br from-white to-slate-50 sticky top-0 z-40">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-blue-600 rounded-2xl shadow-xl shadow-blue-500/30 text-white animate-pulse">
              <Sparkles size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tighter text-slate-900 leading-none">Synapse<span className="text-blue-600">Studio</span></h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] mt-1">Creative Suite v7.5</p>
            </div>
          </div>

          <div className="flex p-1 bg-slate-100 rounded-xl mb-4">
            <button onClick={() => setActiveProfileType('personal')} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${activeProfileType === 'personal' ? 'bg-white shadow text-blue-600' : 'text-slate-400'}`}>Osobisty</button>
            <button onClick={() => setActiveProfileType('company')} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${activeProfileType === 'company' ? 'bg-white shadow text-blue-600' : 'text-slate-400'}`}>Firmowy</button>
          </div>

          <div className="flex gap-2">
            <button 
              onClick={saveProject}
              className="flex-1 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-black transition-all shadow-md"
            >
              <Save size={14}/> Zapisz
            </button>
            <button 
              onClick={() => setShowHistory(!showHistory)}
              className="flex-1 py-3 bg-white border border-slate-200 text-slate-900 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-50 transition-all shadow-sm"
            >
              <Clock size={14}/> {showHistory ? 'Powrót' : 'Historia'}
            </button>
          </div>
        </div>

        <div className="p-8 space-y-8 pb-32">
          {showHistory ? (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
              <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <FolderOpen size={14}/> Zapisane Projekty
              </h3>
              {savedProjects.length === 0 ? (
                <div className="text-center py-12 text-slate-400 italic text-sm">Brak zapisanych projektów</div>
              ) : (
                <div className="space-y-3">
                  {savedProjects.map(p => (
                    <div key={p.id} className="group relative">
                      <button 
                        onClick={() => loadProject(p)}
                        className="w-full p-5 bg-slate-50 border border-slate-200 rounded-2xl text-left hover:border-blue-500 hover:bg-blue-50/50 transition-all shadow-sm"
                      >
                        <div className="font-black text-xs text-slate-900 truncate pr-8">{p.name}</div>
                        <div className="text-[9px] font-bold text-slate-400 mt-1">{new Date(p.timestamp).toLocaleString()}</div>
                      </button>
                      <button 
                        onClick={() => deleteProject(p.id)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-rose-400 opacity-0 group-hover:opacity-100 hover:bg-rose-100 rounded-lg transition-all"
                      >
                        <Trash2 size={16}/>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <>
              {/* Main Topic Section */}
              <section className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <AlignLeft size={14}/> Temat Główny
                  </label>
                  <button 
                    onClick={generateQuickStructure} 
                    disabled={previewLoading || !topic}
                    className="text-[10px] font-black text-blue-500 hover:text-blue-700 disabled:opacity-30 flex items-center gap-1"
                  >
                    {previewLoading ? <RefreshCw size={10} className="animate-spin"/> : <Eye size={10}/>} Podejrzyj strukturę
                  </button>
                </div>
                
                <div className="flex flex-col gap-3">
                  <textarea 
                    placeholder="Wpisz temat, np. 'Strategia AI dla małych firm'" 
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-400 outline-none transition-all resize-none shadow-sm font-medium"
                    rows={2}
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                  />
                  
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                      <MessageSquare size={12}/> Ton wypowiedzi
                    </label>
                    <select 
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-blue-400 transition-all shadow-sm"
                      value={tone}
                      onChange={(e) => setTone(e.target.value as Tone)}
                    >
                      {TONES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                </div>

                {(structurePreview.length > 0 || previewLoading) && (
                  <div className="p-5 bg-blue-50/50 border border-blue-100 rounded-[2rem] animate-in fade-in slide-in-from-top-2 duration-300">
                    <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-3 flex items-center gap-2">
                      <ListChecks size={14}/> Planowana Struktura
                    </h4>
                    <div className="space-y-2">
                      {previewLoading ? (
                        <div className="space-y-2 py-2">
                          <div className="h-3 bg-blue-100 rounded-full w-full animate-pulse"></div>
                          <div className="h-3 bg-blue-100 rounded-full w-3/4 animate-pulse"></div>
                        </div>
                      ) : (
                        structurePreview.map((title, i) => (
                          <div key={i} className="text-[11px] font-bold text-slate-600 flex gap-2">
                            <span className="text-blue-300">{i+1}.</span> {title}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </section>

              <section className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Hash size={14}/> Liczba Slajdów (4-10)
                  </label>
                  <span className="text-sm font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-full">{slideCount}</span>
                </div>
                <input 
                  type="range" min="4" max="10" step="1" 
                  value={slideCount} 
                  onChange={(e) => setSlideCount(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600 shadow-inner"
                />
              </section>

              {/* AI Sequences Section */}
              <section className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Wand2 size={14} className="text-blue-600"/> Sekwencja Hook/CTA
                  </label>
                  <button 
                    onClick={handleGenerateSequences} 
                    disabled={seqLoading || !topic} 
                    className="text-[10px] font-black text-blue-600 flex items-center gap-1 hover:underline disabled:opacity-30 transition-all"
                  >
                    {seqLoading ? <RefreshCw size={12} className="animate-spin"/> : <Sparkles size={12}/>} AI GENERUJ
                  </button>
                </div>
                <div className="space-y-2">
                  <input 
                    type="text" placeholder="Hook (Zaczepka)..." 
                    className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-blue-300 focus:bg-white transition-all shadow-sm font-medium" 
                    value={keyMessages[0]} 
                    onChange={(e) => {const nm = [...keyMessages]; nm[0] = e.target.value; setKeyMessages(nm);}} 
                  />
                  <input 
                    type="text" placeholder="Główna wartość / Przesłanie..." 
                    className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-blue-300 focus:bg-white transition-all shadow-sm font-medium" 
                    value={keyMessages[1]} 
                    onChange={(e) => {const nm = [...keyMessages]; nm[1] = e.target.value; setKeyMessages(nm);}} 
                  />
                  <input 
                    type="text" placeholder="CTA (Wezwanie do działania)..." 
                    className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-blue-300 focus:bg-white transition-all shadow-sm font-medium" 
                    value={keyMessages[2]} 
                    onChange={(e) => {const nm = [...keyMessages]; nm[2] = e.target.value; setKeyMessages(nm);}} 
                  />
                </div>
              </section>

              <section className="space-y-6 p-6 bg-slate-50/50 border border-slate-100 rounded-[2.5rem] shadow-sm">
                <h3 className="text-lg font-black tracking-tight text-slate-900 flex items-center gap-2">
                  <Settings2 size={18} className="text-blue-600" /> Ustawienia Tła
                </h3>
                <div className="space-y-6">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-1 flex items-center gap-2">Obrazy Tła</label>
                    <div className="grid grid-cols-5 gap-1.5 max-h-[140px] overflow-y-auto p-1 scrollbar-thin rounded-xl">
                      {BACKGROUNDS.map(bg => (
                        <button 
                          key={bg.id} 
                          onClick={() => setOverlayImageUrl(bg.url)} 
                          className={`aspect-square rounded-lg border-2 transition-all overflow-hidden ${overlayImageUrl === bg.url ? 'border-blue-500 scale-105 z-10 shadow-lg' : 'border-slate-100 opacity-60 hover:opacity-100'}`}
                        >
                          <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: bg.url ? `url(${bg.url})` : 'none', backgroundColor: bg.url ? 'transparent' : '#eee' }} />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Nakładki & Wzory</label>
                    <div className="flex items-center justify-between p-1">
                      <div className="flex gap-2">
                        {['white', 'black', 'grey', 'none'].map((color) => (
                          <button 
                            key={color}
                            onClick={() => setBgSettings({...bgSettings, overlayColor: color as any})} 
                            className={`w-7 h-7 rounded-full border-2 transition-all flex items-center justify-center ${bgSettings.overlayColor === color ? 'border-blue-500 scale-125 shadow-md z-10' : 'border-slate-200 hover:border-slate-300'}`} 
                            style={{ backgroundColor: color === 'none' ? 'transparent' : color === 'grey' ? '#808080' : color === 'white' ? '#fff' : '#000' }}
                          >
                            {color === 'none' && <X size={12} className="text-slate-400"/>}
                          </button>
                        ))}
                      </div>
                      <button 
                        onClick={() => setBgSettings({...bgSettings, fadingCorner: !bgSettings.fadingCorner})}
                        className="flex items-center gap-2 text-[10px] font-bold text-slate-600 hover:text-blue-600 transition-colors bg-white px-3 py-1.5 rounded-full border border-slate-100 shadow-sm"
                      >
                        <span>Fading Corner</span>
                        <div className={`w-4 h-4 rounded-md border flex items-center justify-center transition-all ${bgSettings.fadingCorner ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300'}`}>
                          {bgSettings.fadingCorner && <Check size={10} />}
                        </div>
                      </button>
                    </div>
                    <div className="grid grid-cols-5 gap-1.5 p-1">
                      {PATTERNS.slice(0, 15).map((p) => (
                        <button 
                          key={p.id}
                          onClick={() => setBgSettings({...bgSettings, patternId: p.id})}
                          className={`aspect-square rounded-xl border flex items-center justify-center overflow-hidden transition-all relative ${bgSettings.patternId === p.id ? 'border-blue-500 shadow-sm ring-2 ring-blue-500/10' : 'border-slate-200 bg-white hover:border-slate-300'}`}
                        >
                          {p.id === 'none' ? <span className="text-[8px] font-bold text-slate-400">BRAK</span> : <div className="w-full h-full" style={{ backgroundImage: p.css, backgroundSize: '15px 15px' }} />}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </section>

              <section className="space-y-4">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <LinkIcon size={14}/> Linki (Ostatni slajd)
                </label>
                <div className="space-y-2">
                  {clnLinks.map((link, i) => (
                    <div key={i} className="flex gap-2">
                      <input type="text" placeholder="https://..." className="flex-grow p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-blue-300 transition-all shadow-sm font-medium" value={link} onChange={(e) => {const nl = [...clnLinks]; nl[i] = e.target.value; setClnLinks(nl);}} />
                      {clnLinks.length > 1 && (
                        <button onClick={() => setClnLinks(clnLinks.filter((_, idx) => idx !== i))} className="p-3 text-rose-400 hover:bg-rose-50 rounded-xl transition-all shadow-sm"><Trash2 size={16}/></button>
                      )}
                    </div>
                  ))}
                  <button onClick={() => setClnLinks([...clnLinks, ''])} className="w-full py-2.5 border border-dashed border-slate-300 rounded-2xl text-[10px] font-black text-slate-500 hover:bg-slate-50 hover:border-blue-400 hover:text-blue-500 transition-all">+ DODAJ LINK</button>
                </div>
              </section>

              <section className="space-y-4">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <User size={14}/> Branding
                </label>
                <div className="space-y-3">
                  <input 
                    type="text" 
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold outline-none focus:ring-4 focus:ring-blue-500/10 transition-all shadow-sm" 
                    value={currentProfile.handle} 
                    onChange={(e) => activeProfileType === 'personal' ? setPersonalProfile({...personalProfile, handle: e.target.value}) : setCompanyProfile({...companyProfile, handle: e.target.value})} 
                    placeholder="@Uzytkownik"
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-200 rounded-[2rem] cursor-pointer hover:bg-slate-50 hover:border-blue-400 transition-all bg-white shadow-sm group">
                      <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, (url) => activeProfileType === 'personal' ? setPersonalProfile({...personalProfile, photoUrl: url}) : setCompanyProfile({...companyProfile, photoUrl: url}))} />
                      {currentProfile.photoUrl ? <img src={currentProfile.photoUrl} className="h-10 w-10 rounded-full object-cover" /> : <User size={20} className="text-slate-400"/>}
                      <span className="text-[9px] mt-2 font-black text-slate-400 uppercase tracking-widest">Avatar</span>
                    </label>
                    <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-200 rounded-[2rem] cursor-pointer hover:bg-slate-50 hover:border-blue-400 transition-all bg-white shadow-sm group">
                      <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, (url) => activeProfileType === 'personal' ? setPersonalProfile({...personalProfile, logoUrl: url}) : setCompanyProfile({...companyProfile, logoUrl: url}))} />
                      {currentProfile.logoUrl ? <img src={currentProfile.logoUrl} className="h-10 object-contain" /> : <ImageIcon size={20} className="text-slate-400"/>}
                      <span className="text-[9px] mt-2 font-black text-slate-400 uppercase tracking-widest">Logo</span>
                    </label>
                  </div>
                </div>
              </section>

              <div className="pt-10 space-y-4">
                <button 
                  onClick={handleGenerate} 
                  disabled={loading || !topic} 
                  className="w-full p-5 bg-blue-600 hover:bg-blue-700 text-white rounded-[2rem] font-black text-sm shadow-2xl shadow-blue-500/40 flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-50"
                >
                  {loading ? <RefreshCw className="animate-spin" size={20}/> : <Sparkles size={20}/>}
                  GENERUJ TREŚĆ AI
                </button>
                <div className="relative">
                  <button 
                    onClick={() => setShowExportMenu(!showExportMenu)}
                    className="w-full p-4 bg-white border border-slate-200 rounded-[2rem] font-bold text-xs hover:bg-slate-50 transition-all flex items-center justify-center gap-2 shadow-sm text-slate-600"
                  >
                    <FileDown size={18}/> EKSPORTUJ KARUZELĘ
                  </button>
                  {showExportMenu && (
                    <div className="absolute bottom-full left-0 right-0 mb-4 bg-white border border-slate-200 rounded-3xl shadow-2xl p-2 z-50 flex flex-col gap-1 overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-200">
                      <button onClick={() => downloadAllImages('png')} className="flex items-center gap-3 w-full p-4 text-xs font-black text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-all rounded-2xl"><ImageIcon size={18}/> Pobierz jako PNG</button>
                      <button onClick={() => downloadAllImages('jpeg')} className="flex items-center gap-3 w-full p-4 text-xs font-black text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-all rounded-2xl"><Share2 size={18}/> Pobierz jako JPG</button>
                      <button onClick={downloadAsPDF} className="flex items-center gap-3 w-full p-4 text-xs font-black text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-all rounded-2xl"><FileText size={18}/> Eksportuj do PDF</button>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </aside>

      {/* Main Preview Area */}
      <main className="flex-grow bg-[#f8fafc] overflow-y-auto p-4 lg:p-8 flex flex-col items-center scroll-smooth relative">
        <div className="w-full max-w-7xl flex flex-col items-center gap-12 pb-32">
          
          {/* Main Slide Container with better scaling */}
          <div className="flex flex-col xl:flex-row items-center justify-center gap-12 w-full mt-8">
            <div className="relative flex items-center justify-center bg-slate-200 rounded-[4rem] p-10 shadow-inner overflow-hidden min-h-[500px] w-full max-w-[900px]">
              <div className={`transition-all duration-700 transform origin-center ${isAnimating ? 'scale-[0.45] opacity-80' : 'scale-[0.4] md:scale-[0.45] lg:scale-[0.38] xl:scale-[0.42] 2xl:scale-[0.5]'}`}>
                <Slide 
                  id="active-preview-slide"
                  data={slides[activeSlide]} 
                  theme={currentTheme}
                  index={activeSlide}
                  total={slides.length}
                  profile={currentProfile}
                  aspectRatio={aspectRatio}
                  layout={slideLayout}
                  backgroundImage={overlayImageUrl}
                  textEffect={textEffect}
                  referenceLinks={clnLinks}
                  titleColor={titleColor}
                  bgSettings={bgSettings}
                />
              </div>
              
              {/* Navigation buttons relative to the container */}
              <div className="absolute top-1/2 left-4 -translate-y-1/2 z-50">
                <button onClick={() => setActiveSlide(Math.max(0, activeSlide - 1))} className="p-4 rounded-full bg-white shadow-xl border border-slate-100 transition-all hover:bg-blue-50 hover:text-blue-600 active:scale-90"><ChevronLeft size={32}/></button>
              </div>
              <div className="absolute top-1/2 right-4 -translate-y-1/2 z-50">
                <button onClick={() => setActiveSlide(Math.min(slides.length - 1, activeSlide + 1))} className="p-4 rounded-full bg-white shadow-xl border border-slate-100 transition-all hover:bg-blue-50 hover:text-blue-600 active:scale-90"><ChevronRight size={32}/></button>
              </div>
            </div>

            {/* Slide Editor Panel */}
            <div className="w-full max-w-md space-y-6">
              <div className="bg-white p-8 rounded-[3rem] shadow-xl border border-white space-y-6">
                <div className="flex justify-between items-center border-b border-slate-50 pb-4">
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-blue-600">Edytor Slajdu</h3>
                    <p className="text-[9px] font-bold text-slate-300 uppercase mt-1">Slajd {activeSlide + 1} z {slides.length}</p>
                  </div>
                  <div className="flex gap-1.5">
                    <button onClick={() => {const ns = [...slides]; ns.splice(activeSlide + 1, 0, {title: 'Nowy Slajd', content: 'Opis...'}); setSlides(ns); setActiveSlide(activeSlide + 1);}} className="p-2.5 bg-slate-50 rounded-xl text-slate-400 hover:text-blue-600 transition-all shadow-sm"><Plus size={16}/></button>
                    <button onClick={() => {if (slides.length > 1) {const newSlides = slides.filter((_, i) => i !== activeSlide); setSlides(newSlides); setActiveSlide(Math.max(0, activeSlide - 1));}}} className="p-2.5 bg-rose-50 rounded-xl text-rose-400 hover:text-rose-600 transition-all shadow-sm"><Trash2 size={16}/></button>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-slate-400 uppercase ml-1 flex items-center gap-1.5"><TypeIcon size={12}/> Tytuł</label>
                    <input type="text" value={slides[activeSlide]?.title || ''} onChange={(e) => {const ns = [...slides]; ns[activeSlide].title = e.target.value; setSlides(ns);}} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-blue-500/10 transition-all text-base" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-slate-400 uppercase ml-1 flex items-center gap-1.5"><FileText size={12}/> Treść</label>
                    <textarea rows={5} value={slides[activeSlide]?.content || ''} onChange={(e) => {const ns = [...slides]; ns[activeSlide].content = e.target.value; setSlides(ns);}} className="w-full p-5 bg-slate-50 border border-slate-200 rounded-[1.5rem] outline-none focus:ring-2 focus:ring-blue-500/10 resize-none leading-relaxed text-xs font-bold text-slate-600 shadow-inner" />
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                {FORMATS.map(f => (
                  <button key={f.value} onClick={() => setAspectRatio(f.value)} className={`p-4 rounded-[2rem] border-2 transition-all text-left flex flex-col h-full justify-center ${aspectRatio === f.value ? 'border-blue-500 bg-white shadow-lg' : 'border-transparent bg-white/50 opacity-60 grayscale hover:opacity-100 hover:grayscale-0'}`}>
                    <div className="text-[9px] font-black text-slate-900 uppercase leading-tight">{f.label}</div>
                    <div className="text-[7px] font-bold text-slate-400 mt-1 uppercase tracking-widest">{f.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Grid Preview - Smallest thumbnails that fit the screen width */}
          <div className="w-full pt-16 border-t border-slate-200 overflow-hidden">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-12 text-center">Szybki Przegląd Całości</h4>
            <div className="flex flex-wrap justify-center gap-12 lg:gap-16 items-start px-8">
              {slides.map((s, i) => (
                <div key={i} className={`relative transition-all duration-700 cursor-pointer ${activeSlide === i ? 'scale-110 ring-4 ring-blue-500/20 rounded-[2rem]' : 'opacity-40 hover:opacity-100 grayscale-[40%] hover:scale-105'}`} onClick={() => setActiveSlide(i)}>
                  <div className="scale-[0.12] lg:scale-[0.15] origin-top -mb-[105px] lg:-mb-[120px]">
                    <Slide 
                      id={`grid-preview-${i}`}
                      data={s} 
                      theme={currentTheme}
                      index={i}
                      total={slides.length}
                      profile={currentProfile}
                      aspectRatio={aspectRatio}
                      layout={slideLayout}
                      backgroundImage={overlayImageUrl}
                      textEffect={textEffect}
                      referenceLinks={clnLinks}
                      titleColor={titleColor}
                      bgSettings={bgSettings}
                    />
                  </div>
                  <div className={`absolute -bottom-6 left-1/2 -translate-x-1/2 text-[9px] font-black uppercase transition-colors ${activeSlide === i ? 'text-blue-600' : 'text-slate-300'}`}>Slajd {i+1}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
