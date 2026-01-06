
import { CarouselTheme, AspectRatio, SlideLayout } from './types';

export const THEMES: CarouselTheme[] = [
  { id: 'modern-bright', name: 'Jasny Nowoczesny', bgColor: 'bg-white', textColor: 'text-slate-900', accentColor: 'text-blue-600', secondaryColor: 'bg-slate-50', fontFamily: 'font-space' },
  { id: 'minimal-zen', name: 'Minimalistyczny', bgColor: 'bg-zinc-50', textColor: 'text-zinc-800', accentColor: 'text-zinc-400', secondaryColor: 'bg-white', fontFamily: 'font-inter' },
  { id: 'love-romance', name: 'Miłosny', bgColor: 'bg-rose-50', textColor: 'text-rose-900', accentColor: 'text-rose-500', secondaryColor: 'bg-white', fontFamily: 'font-playfair' },
  { id: 'emotional-deep', name: 'Uczuciowy', bgColor: 'bg-indigo-950', textColor: 'text-indigo-50', accentColor: 'text-indigo-400', secondaryColor: 'bg-indigo-900', fontFamily: 'font-lora' },
  { id: 'angry-aggro', name: 'Zły', bgColor: 'bg-red-950', textColor: 'text-red-50', accentColor: 'text-red-500', secondaryColor: 'bg-black', fontFamily: 'font-bebas' },
  { id: 'exciting-high', name: 'Podniecający', bgColor: 'bg-orange-500', textColor: 'text-white', accentColor: 'text-orange-900', secondaryColor: 'bg-orange-600', fontFamily: 'font-anton' },
  { id: 'submissive-soft', name: 'Uległy', bgColor: 'bg-violet-50', textColor: 'text-violet-400', accentColor: 'text-violet-300', secondaryColor: 'bg-white', fontFamily: 'font-quicksand' },
  { id: 'space-void', name: 'Kosmiczny', bgColor: 'bg-black', textColor: 'text-indigo-100', accentColor: 'text-indigo-400', secondaryColor: 'bg-zinc-900', fontFamily: 'font-space', pattern: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.05) 1px, transparent 0)' },
  { id: 'retro-vintage', name: 'Retro', bgColor: 'bg-[#f4e4bc]', textColor: 'text-[#5d4037]', accentColor: 'text-[#d32f2f]', secondaryColor: 'bg-[#e7d4a6]', fontFamily: 'font-baskerville' },
  { id: 'joyful-vibrant', name: 'Radosny', bgColor: 'bg-yellow-400', textColor: 'text-black', accentColor: 'text-white', secondaryColor: 'bg-yellow-500', fontFamily: 'font-archivo' },
  { id: 'dark-cyber', name: 'Cyberpunk', bgColor: 'bg-gray-900', textColor: 'text-cyan-400', accentColor: 'text-fuchsia-500', secondaryColor: 'bg-black', fontFamily: 'font-righteous' },
  { id: 'pastel-dream', name: 'Pastelowy Sen', bgColor: 'bg-blue-50', textColor: 'text-slate-600', accentColor: 'text-pink-400', secondaryColor: 'bg-white', fontFamily: 'font-comfortaa' },
  { id: 'corporate-gold', name: 'Biznesowy Złoty', bgColor: 'bg-slate-900', textColor: 'text-amber-100', accentColor: 'text-amber-500', secondaryColor: 'bg-slate-800', fontFamily: 'font-montserrat' },
  { id: 'nature-leaf', name: 'Natura', bgColor: 'bg-emerald-50', textColor: 'text-emerald-900', accentColor: 'text-emerald-600', secondaryColor: 'bg-white', fontFamily: 'font-raleway' },
  { id: 'sunset-vibes', name: 'Zachód Słońca', bgColor: 'bg-gradient-to-br from-orange-400 to-rose-500', textColor: 'text-white', accentColor: 'text-yellow-200', secondaryColor: 'bg-rose-600', fontFamily: 'font-pacifico' },
  { id: 'monochrome-stark', name: 'Monochromatyczny', bgColor: 'bg-black', textColor: 'text-white', accentColor: 'text-gray-400', secondaryColor: 'bg-zinc-900', fontFamily: 'font-oswald' },
  { id: 'lavender-soft', name: 'Lawenda', bgColor: 'bg-purple-50', textColor: 'text-purple-900', accentColor: 'text-purple-500', secondaryColor: 'bg-white', fontFamily: 'font-josefin' },
  { id: 'crimson-power', name: 'Potęga Karmazynu', bgColor: 'bg-red-600', textColor: 'text-white', accentColor: 'text-red-900', secondaryColor: 'bg-red-700', fontFamily: 'font-archivo' },
  { id: 'ocean-breeze', name: 'Morski', bgColor: 'bg-cyan-900', textColor: 'text-cyan-50', accentColor: 'text-cyan-300', secondaryColor: 'bg-cyan-950', fontFamily: 'font-kanit' },
  { id: 'midnight-purple', name: 'Północny Fiolet', bgColor: 'bg-indigo-950', textColor: 'text-fuchsia-200', accentColor: 'text-fuchsia-500', secondaryColor: 'bg-black', fontFamily: 'font-space' }
];

export const FONTS = [
  { name: 'Inter', class: 'font-inter' }, { name: 'Playfair Display', class: 'font-playfair' }, { name: 'Space Grotesk', class: 'font-space' },
  { name: 'Bebas Neue', class: 'font-bebas' }, { name: 'Outfit', class: 'font-outfit' }, { name: 'Montserrat', class: 'font-montserrat' },
  { name: 'Lora', class: 'font-lora' }, { name: 'Roboto', class: 'font-roboto' }, { name: 'Poppins', class: 'font-poppins' },
  { name: 'Raleway', class: 'font-raleway' }, { name: 'Libre Baskerville', class: 'font-baskerville' }, { name: 'Cinzel', class: 'font-cinzel' },
  { name: 'Dancing Script', class: 'font-dancing' }, { name: 'Permanent Marker', class: 'font-permanent' }, { name: 'Fira Sans', class: 'font-fira' },
  { name: 'Oswald', class: 'font-oswald' }, { name: 'Quicksand', class: 'font-quicksand' }, { name: 'Anton', class: 'font-anton' },
  { name: 'Pacifico', class: 'font-pacifico' }, { name: 'Josefin Sans', class: 'font-josefin' }, { name: 'Caveat', class: 'font-caveat' },
  { name: 'Abril Fatface', class: 'font-abril' }, { name: 'Archivo Black', class: 'font-archivo' }, { name: 'Righteous', class: 'font-righteous' },
  { name: 'Staatliches', class: 'font-staatliches' }, { name: 'Kanit', class: 'font-kanit' }, { name: 'Ubuntu', class: 'font-ubuntu' },
  { name: 'Merriweather', class: 'font-merriweather' }, { name: 'EB Garamond', class: 'font-garamond' }, { name: 'Arvo', class: 'font-arvo' },
  { name: 'Comfortaa', class: 'font-comfortaa' }
];

export const FORMATS: { label: string; value: AspectRatio; desc: string }[] = [
  { label: 'Instagram / Threads (Portret)', value: '4:5', desc: '1080 x 1350' },
  { label: 'Insta / FB (Kwadrat)', value: '1:1', desc: '1080 x 1080' },
  { label: 'TikTok / Reels / Shorts', value: '9:16', desc: '1080 x 1920' },
  { label: 'FB / LinkedIn (Poziom)', value: '16:9', desc: '1920 x 1080' }
];

export const LAYOUTS: { label: string; value: SlideLayout }[] = [
  { label: 'Centrum', value: 'centered' }, 
  { label: 'Góra', value: 'top-text' }, 
  { label: 'Dół', value: 'bottom-text' },
  { label: 'Cytat', value: 'quote' }, 
  { label: 'Impact', value: 'impact' }, 
  { label: 'Podział Pionowy', value: 'split-screen' },
  { label: 'Full Bleed', value: 'full-bleed' },
  { label: 'Ikona i Tekst', value: 'icon-heavy' },
  { label: 'Oś Czasu', value: 'timeline' },
  { label: 'Wielki Nagłówek', value: 'big-header' }
];

export const BACKGROUNDS = [
  { id: 'none', name: 'Brak', url: '' },
  { id: 'abstract-mesh', name: 'Mesh Gradient', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80' },
  { id: 'dark-noise', name: 'Ciemny Szum', url: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=800&q=80' },
  { id: 'retro-paper', name: 'Stary Papier', url: 'https://images.unsplash.com/photo-1586075010633-2445198ba293?auto=format&fit=crop&w=800&q=80' },
  { id: 'space-stars', name: 'Gwiazdy', url: 'https://images.unsplash.com/photo-1475274047050-1d0c0975c63e?auto=format&fit=crop&w=800&q=80' },
  { id: 'geo-pattern', name: 'Geometria', url: 'https://images.unsplash.com/photo-1557682250-33bd709cbe85?auto=format&fit=crop&w=800&q=80' },
  { id: 'low-poly', name: 'Low Poly', url: 'https://images.unsplash.com/photo-1517404215738-15263e9f9178?auto=format&fit=crop&w=800&q=80' },
  { id: 'ink-bleed', name: 'Tusz', url: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=800&q=80' },
  { id: 'watercolor', name: 'Akwarela', url: 'https://images.unsplash.com/photo-1525909002-1b05e0c869d8?auto=format&fit=crop&w=800&q=80' },
  { id: 'carbon', name: 'Karbon', url: 'https://images.unsplash.com/photo-1504333638930-c8787321eee0?auto=format&fit=crop&w=800&q=80' },
  { id: 'city', name: 'Miasto', url: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=800&q=80' },
  { id: 'mist', name: 'Mgła', url: 'https://images.unsplash.com/photo-1485081669829-bacb8c7bb1f3?auto=format&fit=crop&w=800&q=80' },
  { id: 'mountains', name: 'Góry', url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80' },
  { id: 'circuit', name: 'Obwody', url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80' },
  { id: 'old-map', name: 'Stara Mapa', url: 'https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&w=800&q=80' },
  { id: 'luxury-fabric', name: 'Tkanina', url: 'https://images.unsplash.com/photo-1518005020251-0eb5c1842213?auto=format&fit=crop&w=800&q=80' },
  { id: 'bokeh-lights', name: 'Bokeh', url: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80' },
  { id: 'minimal-architecture', name: 'Architektura', url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80' },
  { id: 'neon-grid', name: 'Neon Grid', url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80' },
  { id: 'soft-clouds', name: 'Chmury', url: 'https://images.unsplash.com/photo-1513002749550-c59d786b8e6c?auto=format&fit=crop&w=800&q=80' },
  { id: 'vintage-vibe', name: 'Vintage', url: 'https://images.unsplash.com/photo-1519834785169-98be25ec3f84?auto=format&fit=crop&w=800&q=80' },
  { id: 'abstract-fluid', name: 'Fluid', url: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=800&q=80' },
  { id: 'cyber-dark', name: 'Cyber Dark', url: 'https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?auto=format&fit=crop&w=800&q=80' },
  { id: 'forest-ethereal', name: 'Las', url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=800&q=80' },
  { id: 'marble-white', name: 'Marmur', url: 'https://images.unsplash.com/photo-1533154683836-84ea7a0bc310?auto=format&fit=crop&w=800&q=80' }
];

export const PATTERNS = [
  { id: 'none', label: 'Brak', css: '' },
  { id: 'puzzle', label: 'Puzzle', css: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'40\' height=\'40\' viewBox=\'0 0 40 40\'%3E%3Cpath d=\'M20 0c5.523 0 10 4.477 10 10v2h2c5.523 0 10 4.477 10 10s-4.477 10-10 10h-2v2c0 5.523-4.477 10-10 10s-10-4.477-10-10v-2h-2c-5.523 0-10-4.477-10-10s4.477-10 10-10h2v-2c0-5.523 4.477-10 10-10z\' fill=\'currentColor\' fill-opacity=\'0.1\'/%3E%3C/svg%3E")' },
  { id: 'waves', label: 'Fale', css: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'80\' height=\'40\' viewBox=\'0 0 80 40\'%3E%3Cpath d=\'M0 20c10-20 30-20 40 0s30 20 40 0v20H0V20z\' fill=\'currentColor\' fill-opacity=\'0.1\'/%3E%3C/svg%3E")' },
  { id: 'dots', label: 'Kropki', css: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'20\' height=\'20\' viewBox=\'0 0 20 20\'%3E%3Ccircle cx=\'2\' cy=\'2\' r=\'1\' fill=\'currentColor\' fill-opacity=\'0.1\'/%3E%3C/svg%3E")' },
  { id: 'cross', label: 'Krzyżyki', css: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'20\' height=\'20\' viewBox=\'0 0 20 20\'%3E%3Cpath d=\'M0 0l20 20M20 0L0 20\' stroke=\'currentColor\' stroke-opacity=\'0.1\' stroke-width=\'1\'/%3E%3C/svg%3E")' },
  { id: 'grid', label: 'Siatka', css: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'40\' height=\'40\' viewBox=\'0 0 40 40\'%3E%3Cpath d=\'M40 40H0V0h40v40zM1 39h38V1H1v38z\' fill=\'currentColor\' fill-opacity=\'0.1\'/%3E%3C/svg%3E")' },
  { id: 'squares', label: 'Kwadraty', css: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'30\' height=\'30\' viewBox=\'0 0 30 30\'%3E%3Crect width=\'15\' height=\'15\' fill=\'currentColor\' fill-opacity=\'0.1\'/%3E%3C/svg%3E")' },
  { id: 'triangles', label: 'Trójkąty', css: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'40\' height=\'40\' viewBox=\'0 0 40 40\'%3E%3Cpath d=\'M0 40L20 0l20 40H0z\' fill=\'currentColor\' fill-opacity=\'0.1\'/%3E%3C/svg%3E")' },
  { id: 'circles', label: 'Okręgi', css: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'40\' height=\'40\' viewBox=\'0 0 40 40\'%3E%3Ccircle cx=\'20\' cy=\'20\' r=\'18\' stroke=\'currentColor\' stroke-opacity=\'0.1\' fill=\'none\'/%3E%3C/svg%3E")' },
  { id: 'zigzag', label: 'Zygzak', css: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'40\' height=\'20\' viewBox=\'0 0 40 20\'%3E%3Cpath d=\'M0 10l10 10 20-20 10 10\' fill=\'none\' stroke=\'currentColor\' stroke-opacity=\'0.1\' stroke-width=\'2\'/%3E%3C/svg%3E")' },
  { id: 'circuit', label: 'Circuit', css: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'100\' height=\'100\' viewBox=\'0 0 100 100\'%3E%3Cpath d=\'M0 50h20v20h20v-40h20v40h20v-20h20\' fill=\'none\' stroke=\'currentColor\' stroke-opacity=\'0.1\'/%3E%3C/svg%3E")' },
  { id: 'diagonal', label: 'Skosy', css: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'10\' height=\'10\' viewBox=\'0 0 10 10\'%3E%3Cpath d=\'M0 10L10 0M-1 1L1 -1M9 11L11 9\' stroke=\'currentColor\' stroke-opacity=\'0.1\' stroke-width=\'1\'/%3E%3C/svg%3E")' },
  { id: 'chevrons', label: 'Szewrony', css: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'40\' height=\'20\' viewBox=\'0 0 40 20\'%3E%3Cpath d=\'M0 0l20 20L40 0\' fill=\'none\' stroke=\'currentColor\' stroke-opacity=\'0.1\' stroke-width=\'2\'/%3E%3C/svg%3E")' },
  { id: 'bubbles', label: 'Bąbelki', css: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'40\' height=\'40\' viewBox=\'0 0 40 40\'%3E%3Ccircle cx=\'10\' cy=\'10\' r=\'4\' fill=\'currentColor\' fill-opacity=\'0.1\'/%3E%3Ccircle cx=\'30\' cy=\'30\' r=\'6\' fill=\'currentColor\' fill-opacity=\'0.1\'/%3E%3C/svg%3E")' },
  { id: 'hexagons', label: 'Hexy', css: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'40\' height=\'40\' viewBox=\'0 0 40 40\'%3E%3Cpath d=\'M20 0l10 5v10l-10 5-10-5V5z\' fill=\'currentColor\' fill-opacity=\'0.1\'/%3E%3C/svg%3E")' }
];

export const TONES = ['Edukacyjny', 'Ekscytujący', 'Profesjonalny', 'Opowieść', 'Bezpośredni'];
