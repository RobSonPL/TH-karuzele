
import React, { useState, useEffect } from 'react';
import { 
  Sparkles, Download, Settings2, Palette, ChevronRight, ChevronLeft, User, Briefcase,
  Type as TypeIcon, RefreshCw, Plus, Trash2, Share2, Save, Copy, Twitter, Linkedin, X,
  Upload, FileText, Monitor, Layout, Link as LinkIcon, Image as ImageIcon, CheckCircle2,
  Wand2, Layers, AlignLeft, Type, Check, Eye, FileDown, ListChecks, Hash, Clock
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import { SlideData, CarouselTheme, GenerationSettings, Tone, AspectRatio, GroundingSource, BrandingProfile, SlideLayout, TextEffect, BackgroundSettings, Project } from './types';
import { THEMES, TONES, FORMATS, LAYOUTS, BACKGROUNDS, FONTS, PATTERNS } from './constants';
import Slide from './components/Slide';
import { generateCarouselContent, generateKeySequences } from './services/gemini';
import { GoogleGenAI, Type as GenType } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const App: React.FC = () => {
  // Permanent branding assets from user attachments
  const defaultPhoto = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1000&auto=format&fit=crop"; 
  const defaultLogo = "https://img.logoipsum.com/296.svg"; // Mock for Synapse Creative

  const [projects, setProjects] = useState<Project[]>([]);
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
    { title: "Synapse Studio v7.5", content: "Twoje profesjonalne studio karuzeli AI. Teraz z obsługą zapisywania projektów i zaawansowanymi efektami H1." },
    { title: "Więcej Kontroli", content: "Wybieraj spośród 10+ efektów specjalnych dla tytułów i dopasuj kolory jednym kliknięciem." },
    { title: "Zapisuj i Wracaj", content: "Twoje projekty są bezpieczne. Możesz do nich wrócić w dowolnym momencie dzięki nowej sekcji Historia." }
  ]);
  
  const [loading, setLoading] = useState(false);
  const [seqLoading, setSeqLoading] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
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

  useEffect(() => {
    const savedProjects = localStorage.getItem('synapse_projects');
    if (savedProjects) {
      setProjects(JSON.parse(savedProjects));
    }
  }, []);

  const saveProject = () => {
    const newProject: Project = {
      id: Date.now().toString(),
      name: topic || "Bez nazwy",
      timestamp: Date.now(),
      slides,
      aspectRatio,
      themeId: currentTheme.id,
      layout: slideLayout,
      textEffect,
      titleColor,
      profile: activeProfileType === 'personal' ? personalProfile : companyProfile,
      bgSettings
    };
    const updated = [newProject, ...projects].slice(0, 20);
    setProjects(updated);
    localStorage.setItem('synapse_projects', JSON.stringify(updated));
    alert("Projekt zapisany!");
  };

  const loadProject = (p: Project) => {
    setSlides(p.slides);
    setAspectRatio(p.aspectRatio);
    setSlideLayout(p.layout);
    setTextEffect(p.textEffect);
    setTitleColor(p.titleColor);
    setBgSettings(p.bgSettings);
    const theme = THEMES.find(t => t.id === p.themeId);
    if (theme) setCurrentTheme(theme);
    setActiveSlide(0);
    setShowHistory(false);
  };

  useEffect(() => {
    setIsAnimating(true);
    const timer = setTimeout(() => setIsAnimating(false), 500);
    return () => clearTimeout(timer);
  }, [activeSlide]);

  const generateQuickStructure = async () => {
    if (!topic) return alert("Wpisz temat, aby zobaczyć podgląd!");
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

  const captureSlide = async (index: number) => {
    const elementId = `slide-grid-container-${index}`;
    const element = document.getElementById(elementId);
    if (!element) return null;
    const slideElement = element.querySelector(`#slide-grid-${index}`) as HTMLElement;
    if (!slideElement) return null;

    // @ts-ignore
    return await window.html2canvas(slideElement, { 
      scale: 3, 
      useCORS: true,
      backgroundColor: null,
      logging: false,
      allowTaint: true
    });
  };

  const downloadAllImages = async (format: 'png' | 'jpeg') => {
    alert(`Rozpoczynanie pobierania jako ${format.toUpperCase()}. Proszę czekać...`);
    for (let i = 0; i < slides.length; i++) {
      const canvas = await captureSlide(i);
      if (!canvas) continue;
      
      const link = document.createElement('a');
      link.download = `slajd-${i + 1}.${format === 'png' ? 'png' : 'jpg'}`;
      link.href = canvas.toDataURL(`image/${format}`, format === 'jpeg' ? 0.92 : undefined);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    setShowExportMenu(false);
  };

  const downloadAsPDF = async () => {
    alert("Generowanie pliku PDF. Proszę czekać...");
    const pdf = new jsPDF({
      orientation: aspectRatio === '16:9' ? 'landscape' : 'portrait',
      unit: 'px',
      format: aspectRatio === '1:1' ? [1080, 1080] : (aspectRatio === '4:5' ? [1080, 1350] : (aspectRatio === '9:16' ? [1080, 1920] : [1920, 1080]))
    });

    for (let i = 0; i < slides.length; i++) {
      const canvas = await captureSlide(i);
      if (!canvas) continue;

      if (i > 0) pdf.addPage();
      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      pdf.addImage(imgData, 'JPEG', 0, 0, pdf.internal.pageSize.getWidth(), pdf.internal.pageSize.getHeight());
    }

    pdf.save('karuzela_synapse.pdf');
    setShowExportMenu(false);
  };

  const currentProfile = activeProfileType === 'personal' ? personalProfile : companyProfile;

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#f1f5f9] text-slate-900 overflow-hidden font-sans">
      
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
            <button onClick={saveProject} className="flex-1 py-2 bg-blue-50 text-blue-600 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-blue-100 transition-all shadow-sm">
              <Save size={14}/> Zapisz Projekt
            </button>
            <button onClick={() => setShowHistory(!showHistory)} className="flex-1 py-2 bg-slate-50 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-100 transition-all shadow-sm">
              <Clock size={14}/> Historia
            </button>
          </div>
        </div>

        <div className="p-8 space-y-8 pb-32">
          {showHistory ? (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
              <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Clock size={14}/> Historia Projektów</h3>
              {projects.length === 0 ? (
                <p className="text-xs text-slate-400 italic p-8 text-center bg-slate-50 rounded-[2rem]">Brak zapisanych projektów.</p>
              ) : (
                <div className="space-y-3">
                  {projects.map(p => (
                    <button key={p.id} onClick={() => loadProject(p)} className="w-full p-4 bg-white border border-slate-100 rounded-2xl text-left hover:border-blue-400 hover:bg-blue-50/50 transition-all shadow-sm group">
                      <div className="text-xs font-black text-slate-900 group-hover:text-blue-600">{p.name}</div>
                      <div className="text-[9px] text-slate-400 mt-1 uppercase font-bold">{new Date(p.timestamp).toLocaleString()} • {p.slides.length} slajdów</div>
                    </button>
                  ))}
                  <button onClick={() => {setProjects([]); localStorage.removeItem('synapse_projects');}} className="w-full py-3 text-[10px] font-black text-rose-400 hover:text-rose-600 uppercase tracking-widest">Wyczyść Historię</button>
                </div>
              )}
              <button onClick={() => setShowHistory(false)} className="w-full py-3 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest">Powrót do Edycji</button>
            </div>
          ) : (
            <>
              {/* Main Topic */}
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
                    {previewLoading ? <RefreshCw size={10} className="animate-spin"/> : <Eye size={10}/>} Podgląd
                  </button>
                </div>
                <textarea 
                  placeholder="Wpisz temat..." 
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-400 outline-none transition-all resize-none shadow-sm"
                  rows={2}
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                />
              </section>

              {/* Slide Count Range */}
              <section className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Hash size={14}/> Slajdy (4-10)
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

              {/* Title Effects & Color */}
              <section className="space-y-6 p-6 bg-slate-50/50 border border-slate-100 rounded-[2.5rem] shadow-sm">
                <h3 className="text-sm font-black text-slate-900 flex items-center gap-2 uppercase tracking-widest">
                  <Palette size={18} className="text-blue-600" /> Styl Tytułów H1
                </h3>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase flex items-center gap-2">Efekt Specjalny</label>
                    <select 
                      className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs font-black outline-none focus:border-blue-400 shadow-sm" 
                      value={textEffect} 
                      onChange={(e) => setTextEffect(e.target.value as TextEffect)}
                    >
                      <option value="none">Brak</option>
                      <option value="neon">Neon</option>
                      <option value="metallic">Metal</option>
                      <option value="shadow">Cień</option>
                      <option value="glow">Poświata</option>
                      <option value="outline">Kontur</option>
                      <option value="3d">3D</option>
                      <option value="glitch">Glitch</option>
                      <option value="fire">Ogień</option>
                      <option value="water">Woda</option>
                      <option value="pixel">Pixel</option>
                      <option value="glass">Szkło</option>
                      <option value="floating">Floating</option>
                      <option value="gradient">Gradient</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase flex items-center gap-2">Kolor Niestandardowy</label>
                    <div className="flex gap-3">
                      <input 
                        type="color" 
                        value={titleColor || '#000000'} 
                        onChange={(e) => setTitleColor(e.target.value)}
                        className="w-10 h-10 rounded-xl border-2 border-white shadow-md cursor-pointer bg-transparent overflow-hidden"
                      />
                      <input 
                        type="text" 
                        value={titleColor} 
                        onChange={(e) => setTitleColor(e.target.value)}
                        placeholder="#HEX"
                        className="flex-grow p-2 bg-white border border-slate-200 rounded-xl text-xs font-mono outline-none shadow-sm" 
                      />
                    </div>
                  </div>
                </div>
              </section>

              <section className="space-y-4">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <User size={14}/> Branding (Case Sensitive)
                </label>
                <input 
                  type="text" 
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-400 transition-all shadow-sm" 
                  value={currentProfile.handle} 
                  onChange={(e) => activeProfileType === 'personal' ? setPersonalProfile({...personalProfile, handle: e.target.value}) : setCompanyProfile({...companyProfile, handle: e.target.value})} 
                  placeholder="@Uzytkownik"
                />
              </section>

              <div className="pt-10 space-y-4">
                <button 
                  onClick={handleGenerate} 
                  disabled={loading || !topic} 
                  className="w-full p-5 bg-blue-600 hover:bg-blue-700 text-white rounded-[2rem] font-black text-sm shadow-2xl shadow-blue-500/40 flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-50"
                >
                  {loading ? <RefreshCw className="animate-spin" size={20}/> : <Sparkles size={20}/>}
                  GENERUJ STUDIO AI
                </button>
              </div>
            </>
          )}
        </div>
      </aside>

      {/* Preview Area */}
      <main className="flex-grow bg-[#f8fafc] overflow-y-auto p-8 lg:p-16 flex flex-col items-center scroll-smooth">
        <div className="max-w-6xl w-full flex flex-col items-center gap-16 pb-40">
          <div className="flex flex-col xl:flex-row items-center xl:items-start gap-16 w-full justify-center">
            <div className="relative group">
              <div className={`transition-all duration-700 transform ${isAnimating ? 'scale-105 active-slide-glow ring-8 ring-blue-500/10 rounded-[3rem]' : 'scale-100'}`}>
                <Slide 
                  id={`slide-capture-${activeSlide}`}
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
              
              <div className="absolute top-1/2 -left-16 lg:-left-20 -translate-y-1/2">
                <button onClick={() => setActiveSlide(Math.max(0, activeSlide - 1))} className={`p-5 rounded-full bg-white shadow-2xl border border-slate-100 transition-all ${activeSlide === 0 ? 'opacity-0 scale-50' : 'opacity-100 hover:bg-blue-50 hover:text-blue-600 hover:scale-105'}`} title="Poprzedni"><ChevronLeft size={32}/></button>
              </div>
              <div className="absolute top-1/2 -right-16 lg:-right-20 -translate-y-1/2">
                <button onClick={() => setActiveSlide(Math.min(slides.length - 1, activeSlide + 1))} className={`p-5 rounded-full bg-white shadow-2xl border border-slate-100 transition-all ${activeSlide === slides.length - 1 ? 'opacity-0 scale-50' : 'opacity-100 hover:bg-blue-50 hover:text-blue-600 hover:scale-105'}`} title="Następny"><ChevronRight size={32}/></button>
              </div>
            </div>

            <div className="w-full max-w-md space-y-6">
              <div className="bg-white p-10 rounded-[3rem] shadow-2xl border border-white space-y-8">
                <div className="flex justify-between items-center border-b border-slate-50 pb-6">
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-[0.3em] text-blue-600">Live Editor</h3>
                    <p className="text-[10px] font-bold text-slate-300 uppercase mt-1">Slajd {activeSlide + 1}</p>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase flex items-center gap-1.5"><TypeIcon size={12}/> Nagłówek H1</label>
                    <input 
                      type="text" 
                      value={slides[activeSlide]?.title || ''} 
                      onChange={(e) => {const ns = [...slides]; ns[activeSlide].title = e.target.value; setSlides(ns);}}
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-black outline-none focus:ring-4 focus:ring-blue-500/10 transition-all shadow-inner text-lg" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase flex items-center gap-1.5"><FileText size={12}/> Opis Slajdu</label>
                    <textarea 
                      rows={6} 
                      value={slides[activeSlide]?.content || ''} 
                      onChange={(e) => {const ns = [...slides]; ns[activeSlide].content = e.target.value; setSlides(ns);}}
                      className="w-full p-6 bg-slate-50 border border-slate-200 rounded-[2.5rem] outline-none focus:ring-4 focus:ring-blue-500/10 resize-none leading-relaxed text-sm transition-all shadow-inner font-bold text-slate-600" 
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
