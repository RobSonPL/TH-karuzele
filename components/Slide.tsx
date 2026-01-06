
import React from 'react';
import { ChevronRight, ExternalLink, Star } from 'lucide-react';
import { SlideData, CarouselTheme, AspectRatio, SlideLayout, BrandingProfile, TextEffect, BackgroundSettings } from '../types';
import { PATTERNS } from '../constants';

interface SlideProps {
  data: SlideData;
  theme: CarouselTheme;
  fontOverride?: string;
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
  titleSize?: number; // Dynamiczny rozmiar tytułu
  bodySize?: number;  // Dynamiczny rozmiar treści
}

const Slide: React.FC<SlideProps> = ({ 
  data, theme, fontOverride, index, total, profile, id, aspectRatio, layout, 
  backgroundImage, textEffect, referenceLinks, titleColor, bgSettings,
  titleSize = 70, bodySize = 35
}) => {
  const isFirst = index === 0;
  const isLast = index === total - 1;

  const getDimensions = () => {
    switch (aspectRatio) {
      case '1:1': return { width: 1080, height: 1080 };
      case '9:16': return { width: 1080, height: 1920 };
      case '16:9': return { width: 1920, height: 1080 };
      default: return { width: 1080, height: 1350 }; 
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
           <h2 className={`font-black mb-8 leading-tight ${getEffectClass()}`} style={{ color: titleColor || 'inherit', fontSize: `${titleSize * 0.9}px` }}>Dziękuję!</h2>
           <p className="opacity-80 mb-12 italic font-medium" style={{ fontSize: `${bodySize * 0.9}px` }}>Zaobserwuj po więcej wartościowych treści.</p>
           
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
                    className="flex items-center gap-3 text-blue-500 font-bold hover:underline cursor-pointer pointer-events-auto transition-colors hover:text-blue-700"
                    style={{ fontSize: `${bodySize * 0.7}px` }}
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

    let containerClass = "relative z-10 flex flex-col px-24 pt-[220px] pb-[280px] w-full h-full ";
    let titleClass = `font-black mb-12 leading-[1.1] ${getEffectClass()} `;
    let contentClass = "leading-[1.5] opacity-90 font-medium ";

    const titleStyle: React.CSSProperties = { 
      color: titleColor || 'inherit', 
      fontSize: `${isFirst ? titleSize * 1.2 : titleSize}px` 
    };
    
    const bodyStyle: React.CSSProperties = { 
      fontSize: `${isFirst ? bodySize * 1.2 : bodySize}px` 
    };

    if (layout === 'impact') {
      containerClass += "justify-center items-center text-center";
      titleClass += isFirst ? "uppercase font-bebas italic tracking-tighter" : "uppercase font-bebas tracking-tighter";
    } else if (layout === 'quote') {
      containerClass += "justify-center text-left italic border-l-[20px] border-current border-opacity-20 ml-20";
    } else if (layout === 'top-text') {
      containerClass += "justify-start text-center";
    } else if (layout === 'bottom-text') {
      containerClass += "justify-end text-center";
    } else if (layout === 'split-screen') {
      containerClass += "justify-center text-left grid grid-cols-2 gap-12 items-center";
      contentClass += "border-l-4 border-current border-opacity-30 pl-12";
      return (
        <div className={containerClass}>
          <h2 className={`${titleClass} break-words overflow-hidden`} style={titleStyle}>
            {data.title}
          </h2>
          <div className={`${contentClass} break-words overflow-hidden`} style={bodyStyle}>
            {data.content.split('\n').map((line, i) => <p key={i} className="mb-6 last:mb-0">{line}</p>)}
          </div>
        </div>
      );
    } else if (layout === 'full-bleed') {
      containerClass += "justify-center items-center text-center bg-current bg-opacity-5 backdrop-blur-sm m-12 rounded-[4rem] border border-current border-opacity-10";
    } else if (layout === 'icon-heavy') {
      containerClass += "justify-center items-center text-center";
      titleClass += "mt-8";
      return (
        <div className={containerClass}>
          <div className="relative group">
            <div className="absolute inset-0 bg-current opacity-10 rounded-[3rem] blur-2xl group-hover:opacity-20 transition-opacity"></div>
            <div className="relative p-12 rounded-[4rem] bg-current bg-opacity-5 border border-current border-opacity-10 backdrop-blur-md mb-8">
              {data.iconUrl ? (
                <img src={data.iconUrl} alt="AI Icon" className="w-[180px] h-[180px] object-contain drop-shadow-xl" />
              ) : (
                <Star size={120} strokeWidth={1} />
              )}
            </div>
          </div>
          <h2 className={`${titleClass} break-words overflow-hidden`} style={titleStyle}>
            {data.title}
          </h2>
          <div className={`${contentClass} break-words overflow-hidden`} style={bodyStyle}>
            {data.content.split('\n').map((line, i) => <p key={i} className="mb-6 last:mb-0">{line}</p>)}
          </div>
        </div>
      );
    } else if (layout === 'timeline') {
      containerClass += "justify-center text-left";
      titleClass += "mb-16";
      contentClass += "relative pl-24 border-l-8 border-current border-opacity-20";
      return (
        <div className={containerClass}>
          <h2 className={`${titleClass} break-words overflow-hidden`} style={titleStyle}>
            {data.title}
          </h2>
          <div className={`${contentClass} break-words overflow-hidden`} style={bodyStyle}>
            <div className="absolute top-0 left-[-24px] w-10 h-10 rounded-full bg-current"></div>
            {data.content.split('\n').map((line, i) => <p key={i} className="mb-8 last:mb-0">{line}</p>)}
            <div className="absolute bottom-0 left-[-24px] w-10 h-10 rounded-full bg-current"></div>
          </div>
        </div>
      );
    } else if (layout === 'big-header') {
      containerClass += "justify-center text-center";
      const bigHeaderStyle: React.CSSProperties = { ...titleStyle, fontSize: `${titleSize * 2.5}px`, opacity: 0.1, position: 'absolute', top: '200px', left: 0, right: 0, whiteSpace: 'nowrap', lineHeight: 0.8, pointerEvents: 'none' };
      return (
        <div className={containerClass}>
          <h2 className={`${titleClass} overflow-hidden`} style={bigHeaderStyle}>
            {data.title}
          </h2>
          <div className="font-black uppercase tracking-widest mb-12 opacity-40" style={{ fontSize: `${titleSize * 0.6}px` }}>{data.title}</div>
          <div className={`${contentClass} break-words overflow-hidden`} style={bodyStyle}>
            {data.content.split('\n').map((line, i) => <p key={i} className="mb-6 last:mb-0">{line}</p>)}
          </div>
        </div>
      );
    } else {
      containerClass += "justify-center text-center";
    }

    return (
      <div className={containerClass}>
        {layout === 'quote' && <div className="text-[300px] absolute -top-10 -left-20 opacity-10 font-serif leading-none select-none">“</div>}
        <h2 className={`${titleClass} break-words w-full overflow-hidden`} style={titleStyle}>
          {data.title}
        </h2>
        <div className={`${contentClass} break-words w-full overflow-hidden`} style={bodyStyle}>
          {data.content.split('\n').map((line, i) => <p key={i} className="mb-8 last:mb-0">{line}</p>)}
        </div>
      </div>
    );
  };

  return (
    <div 
      id={id}
      className={`relative flex flex-col overflow-hidden transition-all duration-300 ${theme.bgColor} ${theme.textColor} ${fontOverride || theme.fontFamily}`}
      style={{ 
        width: `${dim.width}px`, 
        height: `${dim.height}px`,
        backgroundImage: theme.pattern || 'none',
      }}
    >
      {backgroundImage && (
        <div className="absolute inset-0 z-0 bg-cover bg-center" style={{ backgroundImage: `url(${backgroundImage})`, opacity: 0.5 }} />
      )}
      <div className="absolute inset-0 z-[1] pointer-events-none" style={{ backgroundImage: getPatternCss(), backgroundSize: '80px 80px' }} />
      <div className="absolute inset-0 z-[2] pointer-events-none" style={{ backgroundColor: getOverlayColor() }} />
      {bgSettings?.fadingCorner && (
        <div className="absolute inset-0 z-[3] pointer-events-none" style={{ background: 'linear-gradient(135deg, rgba(0,0,0,0.2) 0%, transparent 40%)', mixBlendMode: 'multiply' }} />
      )}

      <div className="absolute top-20 left-20 right-20 flex justify-between items-center z-30">
        {profile.logoUrl && <img src={profile.logoUrl} alt="Logo" className="h-16 w-auto object-contain drop-shadow-lg" />}
      </div>

      {profile.photoUrl && !isLast && (
        <div className="absolute bottom-52 right-20 z-20">
          <img src={profile.photoUrl} alt="Avatar" className="w-28 h-28 rounded-full border-[6px] border-white shadow-2xl object-cover" />
        </div>
      )}

      {renderContent()}

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
      
      <div className="absolute bottom-0 left-0 h-5 transition-all duration-700 z-40" style={{ width: `${((index + 1) / total) * 100}%`, backgroundColor: 'currentColor' }} />
    </div>
  );
};

export default Slide;
