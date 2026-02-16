import { Navbar } from "@/components/navbar";
import { AdsSlider } from "@/components/ads-slider";
import { useCategories, useServices } from "@/hooks/use-store";
import { useState, useMemo } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { Search, Gamepad2, CreditCard, Smartphone, Package } from "lucide-react";
import { Input } from "@/components/ui/input";
import { OrderModal } from "@/components/order-modal";
import { Service, ServiceGroup } from "@shared/schema";
import { motion, AnimatePresence } from "framer-motion";

export default function HomePage() {
  const { data: categories, isLoading: catLoading } = useCategories();
  const { data: services, isLoading: servLoading } = useServices();
  
  const [activeCategory, setActiveCategory] = useState<number | 'all'>('all');
  const [search, setSearch] = useState("");
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [orderModalOpen, setOrderModalOpen] = useState(false);

  // Filter services and group them by service group
  const groupedServices = useMemo(() => {
    if (!services) return [];
    
    const filtered = (services as (Service & { group?: ServiceGroup })[]).filter(s => {
      const categoryId = s.group?.categoryId;
      const matchesCategory = activeCategory === 'all' || categoryId === activeCategory;
      const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase()) || 
                           s.group?.name.toLowerCase().includes(search.toLowerCase());
      return matchesCategory && matchesSearch;
    });

    const groups: Record<number, { group: ServiceGroup, services: Service[] }> = {};
    
    filtered.forEach(s => {
      if (s.group) {
        if (!groups[s.group.id]) {
          groups[s.group.id] = { group: s.group, services: [] };
        }
        groups[s.group.id].services.push(s);
      }
    });

    return Object.values(groups);
  }, [services, activeCategory, search]);

  const handleServiceClick = (service: Service) => {
    setSelectedService(service);
    setOrderModalOpen(true);
  };

  return (
    <div className="min-h-screen pb-20 rtl" dir="rtl">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <Navbar />
        <AdsSlider />

        {/* Search */}
        <div className="glass rounded-2xl p-4 mb-6">
          <div className="relative">
            <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input 
              placeholder="ابحث عن لعبة أو خدمة..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-transparent border-gray-700 rounded-xl py-6 pr-12 pl-4 focus:border-primary focus:ring-primary/20 text-lg"
            />
          </div>
        </div>

        {/* Categories Tabs */}
        <div className="glass rounded-2xl p-4 mb-8 overflow-x-auto">
          <div className="flex gap-3 min-w-max">
            <button
              onClick={() => setActiveCategory('all')}
              className={`px-6 py-3 rounded-xl transition-all duration-300 font-bold text-sm sm:text-base ${
                activeCategory === 'all' 
                  ? 'bg-gradient-to-r from-primary to-orange-400 text-white shadow-lg shadow-primary/25' 
                  : 'bg-white/5 hover:bg-white/10 text-gray-300'
              }`}
            >
              الكل
            </button>
            {categories?.map((cat: any) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-6 py-3 rounded-xl transition-all duration-300 font-bold text-sm sm:text-base flex items-center gap-2 ${
                  activeCategory === cat.id 
                    ? 'bg-gradient-to-r from-primary to-orange-400 text-white shadow-lg shadow-primary/25' 
                    : 'bg-white/5 hover:bg-white/10 text-gray-300'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Groups & Services */}
        {servLoading || catLoading ? (
          <div className="space-y-8">
            {[1, 2].map(i => (
              <div key={i} className="space-y-4">
                <div className="h-8 w-48 bg-white/5 rounded-lg animate-pulse" />
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {[1, 2, 3, 4, 5].map(j => (
                    <div key={j} className="h-48 bg-white/5 rounded-2xl animate-pulse" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-12">
            {groupedServices.map(({ group, services }) => (
              <section key={group.id} className="space-y-6">
                <div className="flex items-center gap-3 border-r-4 border-primary pr-4">
                  <h2 className="text-2xl font-bold text-white">{group.name}</h2>
                  {group.note && (
                    <span className="text-sm text-gray-400 font-normal mr-2">({group.note})</span>
                  )}
                </div>

                <motion.div 
                  layout
                  className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
                >
                  <AnimatePresence>
                    {services.map((service) => (
                      <GlassCard 
                        key={service.id}
                        onClick={() => handleServiceClick(service)}
                        className="flex flex-col items-center text-center gap-3 p-5 h-full justify-between group cursor-pointer"
                      >
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center text-3xl mb-1 shadow-inner group-hover:scale-110 transition-transform duration-300">
                           {group.image?.startsWith('http') ? (
                             <img src={group.image} alt={group.name} className="w-full h-full object-cover rounded-2xl" />
                           ) : (
                             <span>{group.image || '💎'}</span>
                           )}
                        </div>
                        
                        <div className="space-y-1 w-full">
                          <h3 className="font-bold text-white text-sm sm:text-base leading-tight line-clamp-2 min-h-[2.5rem] flex items-center justify-center">
                            {service.name}
                          </h3>
                          <p className="text-teal-400 font-bold text-lg">
                            {service.price.toLocaleString()} ر.ي
                          </p>
                        </div>
                        
                        <button className="w-full bg-white/5 hover:bg-primary hover:text-white text-primary border border-primary/30 rounded-lg py-2 text-sm font-bold transition-all duration-300 mt-2">
                          طلب الآن
                        </button>
                      </GlassCard>
                    ))}
                  </AnimatePresence>
                </motion.div>
              </section>
            ))}
          </div>
        )}

        {groupedServices.length === 0 && !servLoading && (
          <div className="text-center py-20 text-gray-500">
            <Package className="w-16 h-16 mx-auto mb-4 opacity-20" />
            <p className="text-xl">لا توجد خدمات مطابقة للبحث</p>
          </div>
        )}

        <footer className="glass rounded-2xl p-8 mt-20 text-center">
          <div className="flex flex-col items-center gap-4">
            <ShoppingBagIcon className="w-16 h-16 text-primary/50" />
            <h2 className="text-xl font-bold text-primary">ويب ستور</h2>
            <p className="text-gray-400 text-sm">جميع الحقوق محفوظة &copy; 2025 ويب ستور</p>
          </div>
        </footer>
      </div>

      <OrderModal 
        service={selectedService} 
        open={orderModalOpen} 
        onOpenChange={setOrderModalOpen} 
      />
    </div>
  );
}

function ShoppingBagIcon({className}: {className?: string}) {
  return (
    <div className={`rounded-xl bg-gradient-to-br from-primary/20 to-orange-600/20 flex items-center justify-center ${className}`}>
      <Package className="w-1/2 h-1/2 text-primary" />
    </div>
  );
}
