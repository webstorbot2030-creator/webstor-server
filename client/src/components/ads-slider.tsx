import { useAds } from "@/hooks/use-store";
import { Zap, Star, Crown, Gift, Bell, Flame } from "lucide-react";
import { motion } from "framer-motion";
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

  return (
    <div className="space-y-4 mb-6">
      {imageAds.length > 0 && (
        <div className="relative rounded-2xl overflow-hidden border border-white/5 shadow-lg">
          <div className="relative h-40 sm:h-48 md:h-56">
            {imageAds.map((ad: any, idx: number) => {
              const Wrapper = ad.linkUrl ? 'a' : 'div';
              const wrapperProps = ad.linkUrl ? { href: ad.linkUrl, target: "_blank", rel: "noopener noreferrer" } : {};
              return (
                <Wrapper
                  key={ad.id}
                  {...wrapperProps}
                  className={`absolute inset-0 transition-opacity duration-700 ${idx === currentImageIndex ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                >
                  <img src={ad.imageUrl} alt={ad.text} className="w-full h-full object-cover" />
                  {ad.text && ad.text !== 'إعلان' && (
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                      <p className="text-white font-bold text-sm sm:text-base">{ad.text}</p>
                    </div>
                  )}
                </Wrapper>
              );
            })}
          </div>
          {imageAds.length > 1 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
              {imageAds.map((_: any, idx: number) => (
                <button
                  key={idx}
                  onClick={() => setCurrentImageIndex(idx)}
                  className={`w-2 h-2 rounded-full transition-all ${idx === currentImageIndex ? 'bg-white w-6' : 'bg-white/40'}`}
                />
              ))}
            </div>
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
