
import React, { useState, useEffect } from 'react';
import { 
  Sparkles, Download, Settings2, Palette, ChevronRight, ChevronLeft, User, Briefcase,
  Type as TypeIcon, RefreshCw, Plus, Trash2, Share2, Save, Copy, Twitter, Linkedin, X,
  Upload, FileText, Monitor, Layout, Link as LinkIcon, Image as ImageIcon, CheckCircle2,
  Wand2, Layers, AlignLeft, Type, Check, Eye, FileDown, ListChecks, Hash
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import { SlideData, CarouselTheme, GenerationSettings, Tone, AspectRatio, GroundingSource, BrandingProfile, SlideLayout, TextEffect, BackgroundSettings } from './types';
import { THEMES, TONES, FORMATS, LAYOUTS, BACKGROUNDS, FONTS, PATTERNS } from './constants';
import Slide from './components/Slide';
import { generateCarouselContent, generateKeySequences } from './services/gemini';
import { GoogleGenAI, Type as GenType } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const App: React.FC = () => {
  // Permanent branding assets from user attachments
  const defaultPhoto = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1000&auto=format&fit=crop"; 
  const defaultLogo = "https://img.logoipsum.com/296.svg"; // Mock for Synapse Creative

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
    { title: "Synapse Studio v7.4", content: "Twoje profesjonalne studio karuzeli AI. Wpisz temat powyżej i zobacz, jak technologia tworzy treść za Ciebie." },
    { title: "Szybki Podgląd", content: "Zanim wygenerujesz pełną karuzelę, sprawdź plan slajdów w nowym panelu bocznym pod polem tematu." },
    { title: "Formaty Premium", content: "Twórz treści dedykowane dla Threads, Facebooka, LinkedIna oraz Instagrama w najwyższej jakości." }
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

  const handleGenerateSequences = async () => {
    if (!topic) return alert("Wpisz najpierw temat!");
    setSeqLoading(true);
    try {
      const res = await generateKeySequences(topic);
      setKeyMessages(res);
    } catch (e) {
      alert("Błąd generatora ciągów.");
    } finally {
      setSeqLoading(false);
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
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] mt-1">Creative Suite v7.4</p>
            </div>
          </div>

          <div className="flex p-1 bg-slate-100 rounded-xl">
            <button onClick={() => setActiveProfileType('personal')} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${activeProfileType === 'personal' ? 'bg-white shadow text-blue-600' : 'text-slate-400'}`}>Osobisty</button>
            <button onClick={() => setActiveProfileType('company')} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${activeProfileType === 'company' ? 'bg-white shadow text-blue-600' : 'text-slate-400'}`}>Firmowy</button>
          </div>
        </div>

        <div className="p-8 space-y-8 pb-32">
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
                {previewLoading ? <RefreshCw size={10} className="animate-spin"/> : <Eye size={10}/>} Podejrzyj strukturę
              </button>
            </div>
            <textarea 
              placeholder="Wpisz temat, np. 'Strategia AI dla małych firm'" 
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-400 outline-none transition-all resize-none shadow-sm"
              rows={2}
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            />

            {/* Structure Preview Card */}
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

          {/* Slide Count Range */}
          <section className="space-y-4">
            <div className="flex justify-between items-center">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Hash size={14}/> Liczba Slajdów (4-10)
              </label>
              <span className="text-sm font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-full">{slideCount}</span>
            </div>
            <input 
              type="range" 
              min="4" 
              max="10" 
              step="1" 
              value={slideCount} 
              onChange={(e) => setSlideCount(parseInt(e.target.value))}
              className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600 shadow-inner"
            />
          </section>

          {/* AI Sequences */}
          <section className="space-y-4">
            <div className="flex justify-between items-center">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Sekwencja Hook/CTA</label>
              <button onClick={handleGenerateSequences} disabled={seqLoading} className="text-[10px] font-black text-blue-600 flex items-center gap-1 hover:underline disabled:opacity-30">
                {seqLoading ? <RefreshCw size={12} className="animate-spin"/> : <Wand2 size={12}/>} AI GENERUJ
              </button>
            </div>
            <div className="space-y-2">
              <input type="text" placeholder="Potężny Hook..." className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-blue-300 focus:bg-white transition-all shadow-sm" value={keyMessages[0]} onChange={(e) => {const nm = [...keyMessages]; nm[0] = e.target.value; setKeyMessages(nm);}} />
              <input type="text" placeholder="Główna wartość..." className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-blue-300 focus:bg-white transition-all shadow-sm" value={keyMessages[1]} onChange={(e) => {const nm = [...keyMessages]; nm[1] = e.target.value; setKeyMessages(nm);}} />
              <input type="text" placeholder="Call To Action..." className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-blue-300 focus:bg-white transition-all shadow-sm" value={keyMessages[2]} onChange={(e) => {const nm = [...keyMessages]; nm[2] = e.target.value; setKeyMessages(nm);}} />
            </div>
          </section>

          {/* Ustawienia Tła */}
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

              <div className="space-y-2">
                <div className="flex justify-between items-center text-[10px] font-black text-slate-900 uppercase tracking-widest px-1">
                  <span>Przezroczystość Nakładki</span>
                  <span className="text-blue-600 font-black">{bgSettings.overlayOpacity}%</span>
                </div>
                <input 
                  type="range" 
                  min="0" max="100" 
                  value={bgSettings.overlayOpacity}
                  onChange={(e) => setBgSettings({...bgSettings, overlayOpacity: parseInt(e.target.value)})}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600 shadow-inner"
                />
              </div>
            </div>
          </section>

          {/* Links Section */}
          <section className="space-y-4">
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <LinkIcon size={14}/> Referencje cln.sh (Zostaną dodane na ostatni slajd)
            </label>
            <div className="space-y-2">
              {clnLinks.map((link, i) => (
                <div key={i} className="flex gap-2">
                  <input type="text" placeholder="https://cln.sh/..." className="flex-grow p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-blue-300 transition-all shadow-sm font-medium" value={link} onChange={(e) => {const nl = [...clnLinks]; nl[i] = e.target.value; setClnLinks(nl);}} />
                  {clnLinks.length > 1 && (
                    <button onClick={() => setClnLinks(clnLinks.filter((_, idx) => idx !== i))} className="p-3 text-rose-400 hover:bg-rose-50 rounded-xl transition-all shadow-sm"><Trash2 size={16}/></button>
                  )}
                </div>
              ))}
              <button onClick={() => setClnLinks([...clnLinks, ''])} className="w-full py-2.5 border border-dashed border-slate-300 rounded-2xl text-[10px] font-black text-slate-500 hover:bg-slate-50 hover:border-blue-400 hover:text-blue-500 transition-all">+ DODAJ KOLEJNY LINK</button>
            </div>
          </section>

          {/* Style & Layout Selectors */}
          <div className="grid grid-cols-2 gap-4">
            <section className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Layout size={12}/> Układ</label>
              <select className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-black outline-none focus:border-blue-400 transition-all shadow-sm" value={slideLayout} onChange={(e) => setSlideLayout(e.target.value as SlideLayout)}>
                {LAYOUTS.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
              </select>
            </section>
            <section className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Type size={12}/> Czcionka</label>
              <select className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-black outline-none focus:border-blue-400 transition-all shadow-sm" value={currentTheme.fontFamily} onChange={(e) => setCurrentTheme({...currentTheme, fontFamily: e.target.value})}>
                {FONTS.map(f => <option key={f.class} value={f.class}>{f.name}</option>)}
              </select>
            </section>
          </div>

          <section className="space-y-4">
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <User size={14}/> Branding (Zachowaj wielkość znaków)
            </label>
            <div className="space-y-3">
              <input 
                type="text" 
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-400 transition-all shadow-sm" 
                value={currentProfile.handle} 
                onChange={(e) => activeProfileType === 'personal' ? setPersonalProfile({...personalProfile, handle: e.target.value}) : setCompanyProfile({...companyProfile, handle: e.target.value})} 
                placeholder="@Uzytkownik"
              />
              <div className="grid grid-cols-2 gap-4">
                <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-200 rounded-[2rem] cursor-pointer hover:bg-slate-50 hover:border-blue-400 transition-all bg-white shadow-sm group">
                  <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, (url) => activeProfileType === 'personal' ? setPersonalProfile({...personalProfile, photoUrl: url}) : setCompanyProfile({...companyProfile, photoUrl: url}))} />
                  {currentProfile.photoUrl ? <img src={currentProfile.photoUrl} className="h-10 w-10 rounded-full object-cover shadow-lg border-2 border-white group-hover:scale-110 transition-transform" /> : <User size={20} className="text-slate-400"/>}
                  <span className="text-[9px] mt-2 font-black text-slate-400 uppercase tracking-widest">Avatar</span>
                </label>
                <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-200 rounded-[2rem] cursor-pointer hover:bg-slate-50 hover:border-blue-400 transition-all bg-white shadow-sm group">
                  <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, (url) => activeProfileType === 'personal' ? setPersonalProfile({...personalProfile, logoUrl: url}) : setCompanyProfile({...companyProfile, logoUrl: url}))} />
                  {currentProfile.logoUrl ? <img src={currentProfile.logoUrl} className="h-10 object-contain shadow-sm group-hover:scale-110 transition-transform" /> : <ImageIcon size={20} className="text-slate-400"/>}
                  <span className="text-[9px] mt-2 font-black text-slate-400 uppercase tracking-widest">Logo</span>
                </label>
              </div>
            </div>
          </section>

          <div className="pt-10 space-y-4">
            <button 
              onClick={handleGenerate} 
              disabled={loading || !topic} 
              className="w-full p-5 bg-blue-600 hover:bg-blue-700 text-white rounded-[2rem] font-black text-sm shadow-2xl shadow-blue-500/40 flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-50 disabled:grayscale"
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
                  <button onClick={() => downloadAllImages('png')} className="flex items-center gap-3 w-full p-4 text-xs font-black text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-all rounded-2xl"><ImageIcon size={18}/> Pobierz jako PNG (Najwyższa jakość)</button>
                  <button onClick={() => downloadAllImages('jpeg')} className="flex items-center gap-3 w-full p-4 text-xs font-black text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-all rounded-2xl"><Share2 size={18}/> Pobierz jako JPG (Lżejszy plik)</button>
                  <button onClick={downloadAsPDF} className="flex items-center gap-3 w-full p-4 text-xs font-black text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-all rounded-2xl"><FileText size={18}/> Eksportuj do PDF (Profesjonalny)</button>
                </div>
              )}
            </div>
          </div>
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
                <button onClick={() => setActiveSlide(Math.max(0, activeSlide - 1))} className={`p-5 rounded-full bg-white shadow-2xl border border-slate-100 transition-all ${activeSlide === 0 ? 'opacity-0 scale-50' : 'opacity-100 hover:bg-blue-50 hover:text-blue-600 active:scale-90 hover:scale-105'}`} title="Poprzedni"><ChevronLeft size={32}/></button>
              </div>
              <div className="absolute top-1/2 -right-16 lg:-right-20 -translate-y-1/2">
                <button onClick={() => setActiveSlide(Math.min(slides.length - 1, activeSlide + 1))} className={`p-5 rounded-full bg-white shadow-2xl border border-slate-100 transition-all ${activeSlide === slides.length - 1 ? 'opacity-0 scale-50' : 'opacity-100 hover:bg-blue-50 hover:text-blue-600 active:scale-90 hover:scale-105'}`} title="Następny"><ChevronRight size={32}/></button>
              </div>
            </div>

            {/* Quick Editor */}
            <div className="w-full max-w-md space-y-6">
              <div className="bg-white p-10 rounded-[3rem] shadow-2xl shadow-slate-200 border border-white space-y-8">
                <div className="flex justify-between items-center border-b border-slate-50 pb-6">
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-[0.3em] text-blue-600">Studio Editor</h3>
                    <p className="text-[10px] font-bold text-slate-300 uppercase mt-1">Slajd {activeSlide + 1} z {slides.length}</p>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => {
                       const ns = [...slides];
                       ns.splice(activeSlide + 1, 0, {title: 'Nowy Slajd', content: 'Wpisz opis tutaj...'});
                       setSlides(ns);
                       setActiveSlide(activeSlide + 1);
                      }} 
                      className="p-3 bg-slate-50 rounded-2xl text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all shadow-sm" 
                      title="Dodaj po tym"
                    >
                      <Plus size={18}/>
                    </button>
                    <button 
                      onClick={() => {
                        if (slides.length > 1) {
                          const newSlides = slides.filter((_, i) => i !== activeSlide);
                          setSlides(newSlides);
                          setActiveSlide(Math.max(0, activeSlide - 1));
                        }
                      }} 
                      className="p-3 bg-rose-50 rounded-2xl text-rose-400 hover:text-rose-600 transition-all shadow-sm" 
                      title="Usuń ten slajd"
                    >
                      <Trash2 size={18}/>
                    </button>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-1 flex items-center gap-1.5"><TypeIcon size={12}/> Tytuł Slajdu</label>
                    <input 
                      type="text" 
                      value={slides[activeSlide]?.title || ''} 
                      onChange={(e) => {const ns = [...slides]; ns[activeSlide].title = e.target.value; setSlides(ns);}}
                      className="w-full p-5 bg-slate-50 border border-slate-200 rounded-3xl font-bold outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-400 transition-all shadow-inner text-lg" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-1 flex items-center gap-1.5"><FileText size={12}/> Treść Slajdu</label>
                    <textarea 
                      rows={6} 
                      value={slides[activeSlide]?.content || ''} 
                      onChange={(e) => {const ns = [...slides]; ns[activeSlide].content = e.target.value; setSlides(ns);}}
                      className="w-full p-6 bg-slate-50 border border-slate-200 rounded-[2.5rem] outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-400 resize-none leading-relaxed text-sm transition-all shadow-inner font-bold text-slate-600" 
                    />
                  </div>
                </div>
              </div>

              {/* Format Selectors */}
              <div className="grid grid-cols-2 gap-4">
                {FORMATS.map(f => (
                  <button 
                    key={f.value} 
                    onClick={() => setAspectRatio(f.value)} 
                    className={`p-6 rounded-[2.5rem] border-2 transition-all text-left flex flex-col h-full justify-center ${aspectRatio === f.value ? 'border-blue-500 bg-white shadow-xl shadow-blue-500/5 ring-4 ring-blue-500/5' : 'border-transparent bg-white/50 opacity-60 grayscale hover:opacity-100 hover:grayscale-0'}`}
                  >
                    <div className="text-[10px] font-black text-slate-900 uppercase tracking-tighter leading-tight">{f.label}</div>
                    <div className="text-[8px] font-bold text-slate-400 mt-2 uppercase tracking-widest">{f.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="w-full pt-32 border-t border-slate-200">
            <div className="flex flex-col items-center mb-16">
              <h3 className="text-sm font-black text-slate-400 uppercase tracking-[1em] mb-4 text-center">Pełna Ekspozycja</h3>
              <div className="h-1.5 w-24 bg-blue-600 rounded-full shadow-lg"></div>
            </div>
            
            <div className="flex flex-wrap justify-center gap-16 lg:gap-24 items-start px-8">
              {slides.map((s, i) => (
                <div 
                  key={i} 
                  className={`relative transition-all duration-700 cursor-pointer ${activeSlide === i ? 'scale-110 active-slide-glow ring-8 ring-blue-500/10 rounded-[3rem]' : 'opacity-40 hover:opacity-100 grayscale-[40%] hover:grayscale-0 hover:scale-105'}`} 
                  onClick={() => setActiveSlide(i)}
                >
                  <div id={`slide-grid-container-${i}`} className="scale-[0.35] lg:scale-[0.45] origin-top -mb-[55%] lg:-mb-[60%]">
                    <Slide 
                      id={`slide-grid-${i}`}
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
                  <div className={`absolute -bottom-8 left-1/2 -translate-x-1/2 text-[10px] font-black uppercase transition-colors ${activeSlide === i ? 'text-blue-600' : 'text-slate-300'}`}>Slajd {i+1}</div>
                </div>
              ))}
              <button 
                onClick={() => {
                  const ns = [...slides, {title: 'Nowy Slajd', content: 'Dodaj opis...'}];
                  setSlides(ns);
                  setActiveSlide(ns.length - 1);
                }} 
                className="w-[180px] h-[225px] border-4 border-dashed border-slate-200 rounded-[3rem] flex flex-col items-center justify-center text-slate-300 hover:border-blue-400 hover:text-blue-400 hover:bg-blue-50/30 transition-all shadow-sm mt-8 group"
              >
                <Plus size={40} className="mb-2 group-hover:scale-125 transition-transform duration-300"/>
                <span className="text-[10px] font-black uppercase tracking-widest">Dodaj Slajd</span>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
