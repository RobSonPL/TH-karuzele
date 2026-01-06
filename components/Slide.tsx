
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
    // Używamy wyższej rozdzielczości bazowej (1080p), aby eksport był ostry i układ stabilny
    switch (aspectRatio) {
      case '1:1': return { width: 1080, height: 1080 };
      case '9:16': return { width: 1080, height: 1920 };
      case '16:9': return { width: 1920, height: 1080 };
      default: return { width: 1080, height: 1350 }; // 4:5
    }
  };

  const dim = getDimensions();

  const getEffectClass = () => {
    switch (textEffect) {
      case 'neon': return 'effect-neon';
      case 'metallic': return 'effect-metallic';
      case 'shadow': return 'drop-shadow-2xl';
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
    if (!bgSettings?.patternId || bgSettings.patternId === 'none') return '';
    const pattern = PATTERNS.find(p => p.id === bgSettings.patternId);
    return pattern?.css || '';
  };

  const getOverlayColor = () => {
    if (!bgSettings || bgSettings.overlayColor === 'none') return 'transparent';
    const opacity = (bgSettings.overlayOpacity || 0) / 100;
    switch (bgSettings.overlayColor) {
      case 'white': return `rgba(255, 255, 255, ${opacity})`;
      case 'black': return `rgba(0, 0, 0, ${opacity})`;
      case 'grey': return `rgba(128, 128, 128, ${opacity})`;
      default: return 'transparent';
    }
  };

  const renderContent = () => {
    if (isLast) {
      return (
        <div className="relative z-10 flex flex-col items-center justify-center p-24 w-full h-full text-center">
           <div className="mb-12">
             {profile.logoUrl && <img src={profile.logoUrl} alt="Logo" className="h-20 object-contain mx-auto mb-8" />}
             {profile.photoUrl && <img src={profile.photoUrl} alt="Avatar" className="w-40 h-40 rounded-full border-8 border-current border-opacity-20 shadow-2xl object-cover mx-auto" />}
           </div>
           <h2 className={`text-6xl font-black mb-8 leading-tight ${getEffectClass()}`} style={{ color: titleColor || 'inherit' }}>Dziękuję!</h2>
           <p className="text-3xl opacity-80 mb-12 italic font-medium">Zaobserwuj po więcej wartościowych treści.</p>
           
           {referenceLinks && referenceLinks.filter(l => l.trim()).length > 0 && (
             <div className="w-full max-w-4xl p-12 bg-current bg-opacity-5 rounded-[3rem] border-2 border-current border-opacity-10 backdrop-blur-md">
               <span className="text-lg font-black uppercase tracking-[0.4em] opacity-50 block mb-6">Materiały i Linki</span>
               <div className="flex flex-col gap-5 items-center">
                 {referenceLinks.filter(l => l.trim()).slice(0, 3).map((link, i) => (
                   <a 
                    key={i} 
                    href={link.startsWith('http') ? link : `https://${link}`} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-2xl flex items-center gap-3 text-blue-500 font-bold hover:underline cursor-pointer pointer-events-auto transition-colors hover:text-blue-700"
                   >
                     <ExternalLink size={28}/> {link.replace('https://', '').replace('http://', '')}
                   </a>
                 ))}
               </div>
             </div>
           )}
        </div>
      );
    }

    // Bezpieczne strefy: góra 200px (logo), dół 250px (stopka)
    let containerClass = "relative z-10 flex flex-col px-24 pt-[220px] pb-[280px] w-full h-full ";
    let titleClass = `font-black mb-12 leading-[1.1] ${getEffectClass()} `;
    let contentClass = "leading-[1.5] opacity-90 font-medium ";

    if (layout === 'impact') {
      containerClass += "justify-center items-center text-center";
      titleClass += isFirst ? "text-8xl uppercase font-bebas italic tracking-tighter" : "text-7xl uppercase font-bebas tracking-tighter";
      contentClass += isFirst ? "text-5xl" : "text-4xl";
    } else if (layout === 'quote') {
      containerClass += "justify-center text-left italic border-l-[20px] border-current border-opacity-20 ml-20";
      titleClass += "text-6xl";
      contentClass += "text-4xl";
    } else if (layout === 'top-text') {
      containerClass += "justify-start text-center";
      titleClass += "text-6xl";
      contentClass += "text-4xl";
    } else if (layout === 'bottom-text') {
      containerClass += "justify-end text-center";
      titleClass += "text-6xl";
      contentClass += "text-4xl";
    } else {
      containerClass += "justify-center text-center";
      titleClass += isFirst ? "text-7xl" : "text-6xl";
      contentClass += isFirst ? "text-4xl" : "text-4xl";
    }

    return (
      <div className={containerClass}>
        {layout === 'quote' && <div className="text-[300px] absolute -top-10 -left-20 opacity-10 font-serif leading-none select-none">“</div>}
        <h2 className={`${titleClass} break-words w-full overflow-hidden`} style={{ color: titleColor || 'inherit' }}>
          {data.title}
        </h2>
        <div className={`${contentClass} break-words w-full overflow-hidden`}>
          {data.content.split('\n').map((line, i) => <p key={i} className="mb-8 last:mb-0">{line}</p>)}
        </div>
      </div>
    );
  };

  return (
    <div 
      id={id}
      className={`relative flex flex-col overflow-hidden transition-all duration-300 ${theme.bgColor} ${theme.textColor} ${theme.fontFamily}`}
      style={{ 
        width: `${dim.width}px`, 
        height: `${dim.height}px`,
        backgroundImage: theme.pattern || 'none',
      }}
    >
      {/* Background Image Layer */}
      {backgroundImage && (
        <div className="absolute inset-0 z-0 bg-cover bg-center" style={{ backgroundImage: `url(${backgroundImage})`, opacity: 0.5 }} />
      )}

      {/* Pattern Overlay */}
      <div 
        className="absolute inset-0 z-[1] pointer-events-none" 
        style={{ backgroundImage: getPatternCss(), backgroundSize: '80px 80px' }} 
      />

      {/* Color Overlay */}
      <div 
        className="absolute inset-0 z-[2] pointer-events-none" 
        style={{ backgroundColor: getOverlayColor() }} 
      />

      {/* Fading Corner Effect */}
      {bgSettings?.fadingCorner && (
        <div 
          className="absolute inset-0 z-[3] pointer-events-none"
          style={{ 
            background: 'linear-gradient(135deg, rgba(0,0,0,0.2) 0%, transparent 40%)',
            mixBlendMode: 'multiply'
          }}
        />
      )}

      {/* Branding Header - Stała pozycja w bezpiecznej strefie */}
      <div className="absolute top-20 left-20 right-20 flex justify-between items-center z-30">
        {profile.logoUrl && (
          <img src={profile.logoUrl} alt="Logo" className="h-16 w-auto object-contain drop-shadow-lg" />
        )}
      </div>

      {/* Profile Photo Floating - Nad stopką */}
      {profile.photoUrl && !isLast && (
        <div className="absolute bottom-52 right-20 z-20">
          <img src={profile.photoUrl} alt="Avatar" className="w-28 h-28 rounded-full border-[6px] border-white shadow-2xl object-cover" />
        </div>
      )}

      {/* Main Content */}
      {renderContent()}

      {/* Branding Footer - Stała pozycja w bezpiecznej strefie */}
      <div className="absolute bottom-20 left-20 right-20 flex justify-between items-end z-30">
        <div className="flex flex-col gap-4">
          <span className="text-4xl font-black uppercase tracking-[0.4em] opacity-80 leading-none">{profile.handle || '@creator'}</span>
          <div className="h-3 w-40 bg-current opacity-20 rounded-full"></div>
        </div>

        <div className="flex items-center gap-10">
          {!isLast && (
            <div className="flex items-center gap-6 opacity-40 font-black text-3xl uppercase tracking-[0.4em] leading-none">
              <span>Przesuń</span>
              <div className="p-5 rounded-full border-[6px] border-current">
                <ChevronRight size={48} strokeWidth={4}/>
              </div>
            </div>
          )}
          
          <div className="px-10 py-4 rounded-full bg-current bg-opacity-10 text-4xl font-black leading-none">
            {index + 1} / {total}
          </div>
        </div>
      </div>
      
      {/* Progress Line */}
      <div 
        className="absolute bottom-0 left-0 h-5 transition-all duration-700 z-40" 
        style={{ width: `${((index + 1) / total) * 100}%`, backgroundColor: 'currentColor' }} 
      />
    </div>
  );
};

export default Slide;
