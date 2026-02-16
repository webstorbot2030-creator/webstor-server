import { useAds } from "@/hooks/use-store";
import { Zap, Star, Crown, Gift, Bell, Flame } from "lucide-react";
import { motion } from "framer-motion";

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

  if (!ads || ads.length === 0) return null;

  // Duplicate items for seamless loop
  const displayAds = [...ads, ...ads, ...ads];

  return (
    <div className="glass rounded-2xl p-4 mb-6 overflow-hidden relative">
      <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-background to-transparent z-10" />
      <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-background to-transparent z-10" />
      
      <div className="flex overflow-hidden">
        <motion.div 
          className="flex gap-4 min-w-full"
          animate={{ x: [0, -1000] }}
          transition={{ 
            repeat: Infinity, 
            ease: "linear", 
            duration: 30, // Adjust speed based on content length ideally
          }}
        >
          {displayAds.map((ad, idx) => {
            const Icon = iconMap[ad.icon] || Zap;
            return (
              <div 
                key={`${ad.id}-${idx}`} 
                className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-xl whitespace-nowrap border border-white/5"
              >
                <Icon className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">{ad.text}</span>
              </div>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
}
