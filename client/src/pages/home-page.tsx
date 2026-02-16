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

  const [selectedGroup, setSelectedGroup] = useState<ServiceGroup | null>(null);

  const handleGroupClick = (group: ServiceGroup) => {
    setSelectedGroup(group);
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

        {/* Groups */}
        {servLoading || catLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-40 bg-white/5 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {groupedServices.map(({ group }) => (
              <GlassCard 
                key={group.id}
                onClick={() => handleGroupClick(group)}
                className="flex items-center justify-between p-6 cursor-pointer group hover:border-primary/50 transition-all duration-300"
              >
                <div className="flex flex-col items-start gap-1">
                  <h3 className="font-bold text-white text-xl group-hover:text-primary transition-colors">
                    {group.name}
                  </h3>
                  <p className="text-gray-400 text-sm">
                    {categories?.find(c => c.id === group.categoryId)?.name || 'قسم الخدمات'}
                  </p>
                </div>

                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center text-4xl shadow-inner group-hover:scale-110 transition-transform duration-300">
                  {group.image?.startsWith('http') ? (
                    <img src={group.image} alt={group.name} className="w-full h-full object-cover rounded-2xl" />
                  ) : (
                    <span>{group.image || '💎'}</span>
                  )}
                </div>
              </GlassCard>
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
        serviceGroup={selectedGroup} 
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
