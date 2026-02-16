import { useAds } from "@/hooks/use-store";
import { Zap, Star, Crown, Gift, Bell, Flame, ChevronRight, ChevronLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

const iconMap: Record<string, React.ComponentType<any>> = {
  zap: Zap,
  star: Star,
  crown: Crown,
  gift: Gift,
  bell: Bell,
  flame: Flame,
};

export function AdsSlider() {
  const { data: ads } = useAds();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const textAds = ads?.filter((ad: any) => ad.adType !== 'image') || [];
  const imageAds = ads?.filter((ad: any) => ad.adType === 'image' && ad.imageUrl) || [];

  useEffect(() => {
    if (imageAds.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentImageIndex(prev => (prev + 1) % imageAds.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [imageAds.length]);

  if (!ads || ads.length === 0) return null;

  const displayTextAds = textAds.length > 0 ? [...textAds, ...textAds, ...textAds] : [];

  const goNext = () => setCurrentImageIndex(prev => (prev + 1) % imageAds.length);
  const goPrev = () => setCurrentImageIndex(prev => (prev - 1 + imageAds.length) % imageAds.length);

  return (
    <div className="space-y-4 mb-6">
      {imageAds.length > 0 && (
        <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-primary/5 group">
          <div className="relative h-48 sm:h-56 md:h-72 lg:h-80">
            {imageAds.map((ad: any, idx: number) => {
              const Wrapper = ad.linkUrl ? 'a' : 'div';
              const wrapperProps = ad.linkUrl ? { href: ad.linkUrl, target: "_blank", rel: "noopener noreferrer" } : {};
              return (
                <Wrapper
                  key={ad.id}
                  {...wrapperProps}
                  className={`absolute inset-0 transition-all duration-1000 ease-in-out ${idx === currentImageIndex ? 'opacity-100 scale-100' : 'opacity-0 scale-105 pointer-events-none'}`}
                >
                  <img src={ad.imageUrl} alt={ad.text} className="w-full h-full object-cover" data-testid={`img-ad-${ad.id}`} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  {ad.text && ad.text !== 'إعلان' && (
                    <div className="absolute bottom-0 left-0 right-0 p-5 md:p-6">
                      <p className="text-white font-bold text-base sm:text-lg md:text-xl drop-shadow-lg">{ad.text}</p>
                    </div>
                  )}
                </Wrapper>
              );
            })}
          </div>
          {imageAds.length > 1 && (
            <>
              <button onClick={goPrev} className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/60" data-testid="button-ad-prev">
                <ChevronRight className="w-5 h-5" />
              </button>
              <button onClick={goNext} className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/60" data-testid="button-ad-next">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
                {imageAds.map((_: any, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImageIndex(idx)}
                    className={`h-2 rounded-full transition-all duration-300 ${idx === currentImageIndex ? 'bg-white w-8 shadow-lg' : 'bg-white/40 w-2 hover:bg-white/60'}`}
                    data-testid={`button-ad-dot-${idx}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {displayTextAds.length > 0 && (
        <div className="glass rounded-2xl p-4 overflow-hidden relative">
          <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-background to-transparent z-10" />
          <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-background to-transparent z-10" />
          <div className="flex overflow-hidden">
            <motion.div 
              className="flex gap-4 min-w-full"
              animate={{ x: [0, -1000] }}
              transition={{ repeat: Infinity, ease: "linear", duration: 30 }}
            >
              {displayTextAds.map((ad: any, idx: number) => {
                const Icon = iconMap[ad.icon] || Zap;
                return (
                  <div key={`${ad.id}-${idx}`} className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-xl whitespace-nowrap border border-white/5">
                    <Icon className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium">{ad.text}</span>
                  </div>
                );
              })}
            </motion.div>
          </div>
        </div>
      )}
    </div>
  );
}
