'use client';

import React, { useState } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import Image from 'next/image';
import { 
  Search, 
  MapPin, 
  Share2, 
  Calendar, 
  Loader2, 
  Image as ImageIcon,
  ExternalLink,
  MessageSquare,
  Hourglass
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Configuration
const STATES = [
  { id: 'AC', name: 'Acre' }, { id: 'AL', name: 'Alagoas' }, { id: 'AP', name: 'Amapá' },
  { id: 'AM', name: 'Amazonas' }, { id: 'BA', name: 'Bahia' }, { id: 'CE', name: 'Ceará' },
  { id: 'DF', name: 'Distrito Federal' }, { id: 'ES', name: 'Espírito Santo' }, { id: 'GO', name: 'Goiás' },
  { id: 'MA', name: 'Maranhão' }, { id: 'MT', name: 'Mato Grosso' }, { id: 'MS', name: 'Mato Grosso do Sul' },
  { id: 'MG', name: 'Minas Gerais' }, { id: 'PA', name: 'Pará' }, { id: 'PB', name: 'Paraíba' },
  { id: 'PR', name: 'Paraná' }, { id: 'PE', name: 'Pernambuco' }, { id: 'PI', name: 'Piauí' },
  { id: 'RJ', name: 'Rio de Janeiro' }, { id: 'RN', name: 'Rio Grande do Norte' }, { id: 'RS', name: 'Rio Grande do Sul' },
  { id: 'RO', name: 'Rondônia' }, { id: 'RR', name: 'Roraima' }, { id: 'SC', name: 'Santa Catarina' },
  { id: 'SP', name: 'São Paulo' }, { id: 'SE', name: 'Sergipe' }, { id: 'TO', name: 'Tocantins' }
];

interface NewsItem {
  id: string;
  title: string;
  summary: string;
  date: string;
  source: string;
  url: string;
  socialCaption: string;
  imagePrompt: string;
  imageUrl?: string;
}

export default function Home() {
  const [selectedState, setSelectedState] = useState('');
  const [city, setCity] = useState('');
  const [news, setNews] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeNews, setActiveNews] = useState<NewsItem | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY! });

  const fetchNews = async () => {
    if (!selectedState || !city) return;
    setIsLoading(true);
    setHasSearched(true);
    setNews([]);

    try {
      const stateName = STATES.find(s => s.id === selectedState)?.name;
      const prompt = `Atue como um analista de notícias e redes sociais. Busque as notícias e tendências mais recentes, polêmicas ou relevantes da cidade de ${city}, no estado de ${stateName}, Brasil. 
      Sua busca deve abranger:
      1. Portais de notícias locais e regionais.
      2. Tendências e discussões em alta nas redes sociais (X/Twitter, Instagram, Facebook).
      3. Acontecimentos de última hora.

      Traga informações verídicas e imagens descritivas.
      Retorne os dados em formato JSON seguindo este esquema:
      - title: Título da notícia ou "Trend"
      - summary: Resumo informativo (máximo 200 caracteres)
      - date: Data aproximada no formato ISO 8601
      - source: Nome da fonte ou rede social
      - url: Link original ou link de busca
      - socialCaption: Um texto pronto para postar (WhatsApp/Instagram/Facebook) incluindo emojis e hashtags.
      - imagePrompt: Descrição MUITO DETALHADA da imagem real da notícia para simularmos a captura visual (ex: "Foto aérea do transito na avenida X", "Fachada da prefeitura de Y com manifestantes").

      Importante: Priorize o que é MAIS RECENTE ocorrendo HOJE ou nos últimos dias em ${city}.`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          tools: [{ googleSearch: {} }],
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                summary: { type: Type.STRING },
                date: { type: Type.STRING },
                source: { type: Type.STRING },
                url: { type: Type.STRING },
                socialCaption: { type: Type.STRING },
                imagePrompt: { type: Type.STRING }
              },
              required: ["title", "summary", "date", "source", "url", "socialCaption", "imagePrompt"]
            }
          }
        }
      });

      const results = JSON.parse(response.text || '[]') as NewsItem[];
      
      const enrichedResults = results.map((item, index) => ({
        ...item,
        id: `news-${Date.now()}-${index}`,
        imageUrl: `https://picsum.photos/seed/${encodeURIComponent(item.title)}/800/600`
      }));

      setNews(enrichedResults);
    } catch (error) {
      console.error("Error fetching news:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen text-slate-200">
      {/* Dynamic Background */}
      <div className="fixed inset-0 pointer-events-none opacity-20 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/30 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/20 blur-[120px] rounded-full" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-30 bg-black/60 backdrop-blur-xl border-b border-white/10 px-6 py-6 transition-all">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
             <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-xl blur opacity-40 group-hover:opacity-75 transition duration-1000"></div>
                <div className="relative w-10 h-10 bg-black rounded-xl flex items-center justify-center text-white ring-1 ring-white/20">
                  <span className="font-display font-black text-transparent bg-clip-text bg-gradient-to-br from-white to-blue-400">NL</span>
                </div>
             </div>
             <div>
                <h1 className="text-xl font-display font-bold text-white tracking-tight leading-none mb-1">
                  Radar Local
                </h1>
                <p className="text-[10px] uppercase tracking-[0.2em] font-black text-blue-400/80">Brasil • Realtime</p>
             </div>
          </div>
          <motion.div 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-2.5 bg-white/5 border border-white/10 rounded-xl cursor-not-allowed opacity-50"
          >
            <MapPin size={18} className="text-white" />
          </motion.div>
        </div>

        <div className="relative flex gap-2">
          <select 
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            className="appearance-none flex-shrink-0 w-20 px-3 py-3 bg-white/5 border border-white/10 rounded-2xl text-xs font-bold focus:ring-2 focus:ring-blue-500/50 transition-all outline-none text-white text-center"
          >
            <option value="" className="bg-neutral-900">UF</option>
            {STATES.map(s => (
              <option key={s.id} value={s.id} className="bg-neutral-900">{s.id}</option>
            ))}
          </select>
          <div className="relative flex-grow">
            <input 
              type="text"
              placeholder="Sua cidade hoje..."
              value={city}
              onChange={(e) => setCity(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchNews()}
              className="w-full px-5 py-3 bg-white/5 border border-white/10 rounded-2xl text-sm focus:ring-2 focus:ring-blue-500/50 transition-all outline-none text-white placeholder:text-white/20 font-medium"
            />
            <Search size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 pointer-events-none" />
          </div>
          <button 
            onClick={fetchNews}
            disabled={isLoading || !selectedState || !city}
            className="flex-shrink-0 px-5 py-3 bg-blue-600 text-white rounded-2xl font-bold text-sm hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_30px_rgba(37,99,235,0.5)] active:scale-95"
          >
            {isLoading ? <Loader2 size={18} className="animate-spin" /> : "IR"}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-grow px-6 py-8 relative z-10">
        {!hasSearched && !isLoading && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20 text-center space-y-6"
          >
            <div className="relative">
               <div className="absolute -inset-4 bg-blue-500/20 blur-[40px] rounded-full"></div>
               <Search size={48} className="text-white/10 relative" />
            </div>
            <div className="max-w-[200px]">
              <p className="text-white font-display font-medium text-lg mb-2">Pronto para começar?</p>
              <p className="text-xs text-white/40 leading-relaxed font-medium">Buscamos em tempo real as novidades de qualquer cidade brasileira.</p>
            </div>
          </motion.div>
        )}

        {isLoading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-20 text-center space-y-8"
          >
            <div className="relative">
               <motion.div 
                 animate={{ rotate: 360 }}
                 transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                 className="relative z-10"
               >
                 <Hourglass size={48} className="text-blue-500" />
               </motion.div>
               <div className="absolute -inset-8 bg-blue-500/20 blur-[50px] rounded-full animate-pulse" />
            </div>
            <div className="space-y-2">
              <p className="text-white font-display font-bold text-lg animate-pulse tracking-wide">
                Aguarde...
              </p>
              <p className="text-xs text-white/40 font-medium uppercase tracking-[0.2em]">
                Estamos pesquisando as notícias
              </p>
            </div>

            {/* Skeleton Preview */}
            <div className="w-full space-y-8 pt-10 px-2 opacity-20 grayscale pointer-events-none">
              <div className="h-48 bg-white/5 rounded-[32px] border border-white/10" />
              <div className="h-4 bg-white/5 rounded-full w-3/4" />
            </div>
          </motion.div>
        )}

        <div className="space-y-8 pb-32">
          <AnimatePresence mode="popLayout">
            {news.map((item, index) => (
              <motion.article 
                key={item.id}
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="group relative bg-[#121212]/50 backdrop-blur-sm border border-white/[0.08] rounded-[32px] overflow-hidden hover:border-white/20 transition-all shadow-2xl"
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <div className="w-full h-full relative">
                    <Image 
                      src={item.imageUrl || ''} 
                      alt={item.title}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-1000 grayscale-[0.2] group-hover:grayscale-0"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-transparent to-transparent opacity-60"></div>
                  
                  <div className="absolute top-4 left-4 flex gap-2">
                    <div className="px-3 py-1.5 bg-black/60 backdrop-blur-md border border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest text-blue-400">
                      {item.source}
                    </div>
                  </div>
                </div>

                <div className="p-7 relative -mt-12 bg-gradient-to-t from-[#121212] via-[#121212] to-transparent pt-12">
                  <div className="flex items-center gap-2 text-white/40 text-[10px] uppercase font-black tracking-widest mb-3">
                    <Calendar size={12} className="text-blue-500" />
                    {format(parseISO(item.date), "dd MMM • HH:mm", { locale: ptBR })}
                  </div>
                  
                  <h2 className="text-2xl font-display font-bold text-white leading-[1.1] mb-3 group-hover:text-blue-400 transition-colors">
                    {item.title}
                  </h2>
                  
                  <p className="text-white/60 text-sm leading-relaxed mb-6 font-medium line-clamp-2">
                    {item.summary}
                  </p>

                  <div className="flex items-center gap-2">
                    <motion.button 
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setActiveNews(item)}
                      className="flex-grow flex items-center justify-center gap-2.5 px-6 py-4 bg-white text-black rounded-2xl text-sm font-bold hover:bg-slate-200 transition-all shadow-lg active:scale-95"
                    >
                      <Share2 size={18} />
                      POSTAR
                    </motion.button>
                    <motion.a 
                      whileTap={{ scale: 0.9 }}
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-4 bg-white/5 border border-white/10 text-white/60 rounded-2xl hover:text-white hover:border-white/30 transition-all"
                    >
                      <ExternalLink size={20} />
                    </motion.a>
                  </div>
                </div>
              </motion.article>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Social Modal Overlay */}
      <AnimatePresence>
        {activeNews && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#0a0a0a]/80 backdrop-blur-xl flex items-end sm:items-center justify-center p-6"
            onClick={() => setActiveNews(null)}
          >
            <motion.div 
              initial={{ y: "100%", scale: 0.9 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ y: "100%", scale: 0.9 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-[#1a1a1a] w-full max-w-sm rounded-[40px] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.5)] border border-white/5"
              onClick={e => e.stopPropagation()}
            >
              <div className="h-1.5 w-12 bg-white/10 rounded-full mx-auto my-4 sm:hidden" />
              
              <div className="p-8">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 bg-blue-600/20 rounded-2xl flex items-center justify-center text-blue-500 border border-blue-500/20">
                    <MessageSquare size={24} />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-xl text-white tracking-tight">Conteúdo Pronto</h3>
                    <p className="text-[10px] uppercase font-black tracking-widest text-white/30">Redes Sociais • Bio/Caption</p>
                  </div>
                </div>

                <div className="bg-black/40 rounded-3xl p-6 border border-white/5 relative mb-8 group">
                  <div className="absolute -top-3 left-6 px-3 py-1 bg-blue-600 rounded-full text-[10px] font-black text-white uppercase tracking-widest">Legenda</div>
                  <p className="text-sm text-white/80 whitespace-pre-wrap leading-relaxed font-medium">
                    {activeNews.socialCaption}
                  </p>
                  <motion.button 
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      navigator.clipboard.writeText(activeNews.socialCaption);
                      alert('Copiado!');
                    }}
                    className="mt-6 w-full py-3 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                  >
                    COPIAR
                  </motion.button>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2 px-1">
                    <ImageIcon size={14} className="text-blue-400" />
                    <p className="text-[10px] font-black text-white/30 uppercase tracking-widest italic">Background Inspiração</p>
                  </div>
                  <div className="bg-blue-600/5 p-5 rounded-3xl border border-blue-500/10 transition-all hover:bg-blue-600/10 cursor-default">
                    <p className="text-xs text-blue-400/80 font-medium italic leading-relaxed">
                      &quot;{activeNews.imagePrompt}&quot;
                    </p>
                  </div>
                </div>

                <motion.button 
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveNews(null)}
                  className="w-full mt-10 py-5 bg-white/5 text-white/40 hover:text-white font-black rounded-2xl text-xs uppercase tracking-widest transition-all border border-transparent hover:border-white/10"
                >
                  Continuar Lendo
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Bottom Nav */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40">
        <nav className="bg-black/60 backdrop-blur-2xl border border-white/10 rounded-full px-8 py-3.5 flex items-center gap-12 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
          <button className="relative flex flex-col items-center gap-1 text-blue-400 group">
             <div className="absolute -inset-2 bg-blue-500/20 blur-[10px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
             <Search size={22} className="relative transition-transform group-hover:scale-110" />
             <div className="w-1 h-1 bg-blue-400 rounded-full mt-1"></div>
          </button>
          <button className="flex flex-col items-center gap-1 text-white/20 opacity-40 cursor-not-allowed group">
             <ImageIcon size={22} className="transition-transform group-hover:scale-110" />
          </button>
          <button className="flex flex-col items-center gap-1 text-white/20 opacity-40 cursor-not-allowed group">
             <Calendar size={22} className="transition-transform group-hover:scale-110" />
          </button>
        </nav>
      </div>
    </div>
  );
}
