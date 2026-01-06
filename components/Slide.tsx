
import React from 'react';
import { ChevronRight, ExternalLink } from 'lucide-react';
import { SlideData, CarouselTheme, AspectRatio, SlideLayout, BrandingProfile, TextEffect, BackgroundSettings } from '../types';
import { PATTERNS } from '../constants';

interface SlideProps {
  data: SlideData;
  theme: CarouselTheme;
  index: number;
  total: number;
  profile: BrandingProfile;
  id: string;
  aspectRatio: AspectRatio;
  layout: SlideLayout;
  backgroundImage?: string;
  textEffect: TextEffect;
  referenceLinks?: string[];
  titleColor?: string;
  bgSettings?: BackgroundSettings;
}

const Slide: React.FC<SlideProps> = ({ 
  data, theme, index, total, profile, id, aspectRatio, layout, 
  backgroundImage, textEffect, referenceLinks, titleColor, bgSettings 
}) => {
  const isFirst = index === 0;
  const isLast = index === total - 1;

  const getDimensions = () => {
    switch (aspectRatio) {
      case '1:1': return { width: 500, height: 500 };
      case '9:16': return { width: 450, height: 800 };
      case '16:9': return { width: 800, height: 450 };
      default: return { width: 500, height: 625 };
    }
  };

  const dim = getDimensions();

  const getEffectClass = () => {
    switch (textEffect) {
      case 'neon': return 'effect-neon';
      case 'metallic': return 'effect-metallic';
      case 'shadow': return 'drop-shadow-lg';
      case 'glow': return 'effect-glow';
      case 'outline': return 'effect-outline';
      case '3d': return 'effect-3d';
      case 'glitch': return 'effect-glitch';
      case 'fire': return 'effect-fire';
      case 'water': return 'effect-water';
      case 'pixel': return 'effect-pixel';
      case 'glass': return 'effect-glass';
      case 'floating': return 'effect-floating';
      case 'gradient': return 'effect-gradient';
      default: return '';
    }
  };

  const getPatternCss = () => {
    if (!bgSettings?.patternId) return '';
    const pattern = PATTERNS.find(p => p.id === bgSettings.patternId);
    return pattern?.css || '';
  };

  const getOverlayColor = () => {
    switch (bgSettings?.overlayColor) {
      case 'white': return 'rgba(255, 255, 255, ' + (bgSettings?.overlayOpacity || 0) / 100 + ')';
      case 'black': return 'rgba(0, 0, 0, ' + (bgSettings?.overlayOpacity || 0) / 100 + ')';
      case 'grey': return 'rgba(128, 128, 128, ' + (bgSettings?.overlayOpacity || 0) / 100 + ')';
      default: return 'transparent';
    }
  };

  const renderContent = () => {
    if (isLast) {
      return (
        <div className="relative z-10 flex flex-col items-center justify-center p-12 w-full h-full text-center">
           <div className="mb-8 scale-110">
             {profile.logoUrl && <img src={profile.logoUrl} alt="Logo" className="h-12 object-contain mx-auto mb-4" />}
             {profile.photoUrl && <img src={profile.photoUrl} alt="Avatar" className="w-20 h-20 rounded-full border-4 border-current border-opacity-20 shadow-xl object-cover mx-auto" />}
           </div>
           <h2 className={`text-4xl font-black mb-4 ${getEffectClass()}`} style={{ color: titleColor || 'inherit' }}>Dziękuję za przeczytanie!</h2>
           <p className="text-xl opacity-80 mb-8 italic">Jeśli Ci się podobało, zaobserwuj po więcej.</p>
           
           {referenceLinks && referenceLinks.filter(l => l.trim()).length > 0 && (
             <div className="w-full mt-4 p-4 bg-current bg-opacity-10 rounded-2xl border border-current border-opacity-20 backdrop-blur-sm shadow-sm">
               <span className="text-[10px] font-black uppercase tracking-widest opacity-70 block mb-2">Referencje cln.sh</span>
               <div className="flex flex-col gap-1 items-center">
                 {referenceLinks.filter(l => l.trim()).slice(0, 3).map((link, i) => (
                   <a key={i} href={link} target="_blank" rel="noreferrer" className="text-xs flex items-center gap-1 hover:underline text-blue-500 font-bold">
                     <ExternalLink size={10}/> {link.replace('https://', '')}
                   </a>
                 ))}
               </div>
             </div>
           )}
        </div>
      );
    }

    let containerClass = "relative z-10 flex flex-col p-12 w-full h-full ";
    let titleClass = `font-bold mb-6 leading-tight ${getEffectClass()} `;

    if (layout === 'impact') {
      containerClass += "justify-center items-center text-center";
      titleClass += isFirst ? "text-7xl uppercase font-bebas italic tracking-tighter" : "text-4xl uppercase font-bebas tracking-tighter";
    } else if (layout === 'quote') {
      containerClass += "justify-center text-left italic border-l-8 border-current border-opacity-20 ml-8";
      titleClass += "text-3xl";
    } else if (layout === 'top-text') {
      containerClass += "justify-start text-center pt-24";
      titleClass += "text-4xl";
    } else if (layout === 'bottom-text') {
      containerClass += "justify-end text-center pb-24";
      titleClass += "text-4xl";
    } else {
      containerClass += "justify-center text-center";
      titleClass += isFirst ? "text-5xl" : "text-3xl";
    }

    return (
      <div className={containerClass}>
        {layout === 'quote' && <div className="text-8xl absolute -top-10 -left-6 opacity-10">“</div>}
        <h2 className={`${titleClass}`} style={{ color: titleColor || 'inherit' }}>
          {data.title}
        </h2>
        <div className={`leading-relaxed opacity-90 ${isFirst ? 'text-2xl font-medium' : 'text-xl'}`}>
          {data.content.split('\n').map((line, i) => <p key={i} className="mb-2">{line}</p>)}
        </div>
      </div>
    );
  };

  return (
    <div 
      id={id}
      className={`relative flex flex-col overflow-hidden shadow-2xl transition-all duration-300 ${theme.bgColor} ${theme.textColor} ${theme.fontFamily}`}
      style={{ 
        width: `${dim.width}px`, 
        height: `${dim.height}px`,
        backgroundImage: theme.pattern || 'none',
      }}
    >
      {/* Base Background Image */}
      {backgroundImage && (
        <div className="absolute inset-0 z-0 bg-cover bg-center" style={{ backgroundImage: `url(${backgroundImage})`, opacity: 0.5 }} />
      )}

      {/* Pattern Overlay */}
      <div 
        className="absolute inset-0 z-[1] pointer-events-none" 
        style={{ backgroundImage: getPatternCss(), backgroundSize: '40px 40px' }} 
      />

      {/* Color Overlay */}
      <div 
        className="absolute inset-0 z-[2] pointer-events-none transition-all duration-300" 
        style={{ backgroundColor: getOverlayColor() }} 
      />

      {/* Fading Corner Effect */}
      {bgSettings?.fadingCorner && (
        <div 
          className="absolute inset-0 z-[3] pointer-events-none"
          style={{ 
            background: 'linear-gradient(135deg, rgba(0,0,0,0.15) 0%, transparent 40%)',
            mixBlendMode: 'multiply'
          }}
        />
      )}

      {/* Photo on bottom-right for all slides */}
      {profile.photoUrl && (
        <div className="absolute bottom-20 right-8 z-20">
          <img src={profile.photoUrl} alt="Avatar" className="w-14 h-14 rounded-full border-2 border-white shadow-xl object-cover" />
        </div>
      )}

      {/* Logo in top left on ALL slides */}
      {profile.logoUrl && (
        <div className="absolute top-8 left-8 z-20">
          <img src={profile.logoUrl} alt="Logo" className="h-8 w-auto object-contain opacity-80" />
        </div>
      )}

      {renderContent()}

      {/* Next Arrow at bottom center/right */}
      {!isLast && (
        <div className="absolute bottom-12 right-12 z-20 flex items-center gap-2 opacity-50 font-bold text-xs uppercase tracking-widest">
          <span>Dalej</span>
          <div className="p-2 rounded-full border border-current">
            <ChevronRight size={14}/>
          </div>
        </div>
      )}

      <div className="mt-auto p-8 flex justify-between items-center border-t border-current border-opacity-10 text-[12px] font-black opacity-60 z-10 tracking-[0.2em]">
        <span className="uppercase">{profile.handle || '@ai_creator'}</span>
        <span className="px-3 py-1 rounded-full bg-current bg-opacity-10">
          {index + 1} / {total}
        </span>
      </div>
      
      <div 
        className="absolute bottom-0 left-0 h-1.5 transition-all duration-700" 
        style={{ width: `${((index + 1) / total) * 100}%`, backgroundColor: 'currentColor' }} 
      />
    </div>
  );
};

export default Slide;
