import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { InsertCategory, InsertService, InsertAd, InsertBank, InsertSetting } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

// Categories
export function useCategories() {
  return useQuery({
    queryKey: [api.categories.list.path],
    queryFn: async () => {
      const res = await fetch(api.categories.list.path);
      if (!res.ok) throw new Error("Failed to fetch categories");
      return await res.json();
    },
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (data: InsertCategory) => {
      const res = await fetch(api.categories.create.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create category");
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.categories.list.path] });
      toast({ title: "تم إضافة القسم بنجاح" });
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.categories.delete.path, { id });
      const res = await fetch(url, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete category");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.categories.list.path] });
      toast({ title: "تم حذف القسم" });
    },
  });
}

// Services
export function useServices() {
  return useQuery({
    queryKey: [api.services.list.path],
    queryFn: async () => {
      const res = await fetch(api.services.list.path);
      if (!res.ok) throw new Error("Failed to fetch services");
      return await res.json();
    },
  });
}

export function useCreateService() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (data: InsertService) => {
      const res = await fetch(api.services.create.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create service");
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.services.list.path] });
      toast({ title: "تم إضافة الخدمة بنجاح" });
    },
  });
}

export function useDeleteService() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.services.delete.path, { id });
      const res = await fetch(url, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete service");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.services.list.path] });
      toast({ title: "تم حذف الخدمة" });
    },
  });
}

// Ads
export function useAds() {
  return useQuery({
    queryKey: [api.ads.list.path],
    queryFn: async () => {
      const res = await fetch(api.ads.list.path);
      if (!res.ok) throw new Error("Failed to fetch ads");
      return await res.json();
    },
  });
}

export function useCreateAd() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (data: InsertAd) => {
      const res = await fetch(api.ads.create.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create ad");
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.ads.list.path] });
      toast({ title: "تم إضافة الإعلان" });
    },
  });
}

export function useDeleteAd() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.ads.delete.path, { id });
      const res = await fetch(url, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete ad");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.ads.list.path] });
      toast({ title: "تم حذف الإعلان" });
    },
  });
}

// Banks
export function useBanks() {
  return useQuery({
    queryKey: [api.banks.list.path],
    queryFn: async () => {
      const res = await fetch(api.banks.list.path);
      if (!res.ok) throw new Error("Failed to fetch banks");
      return await res.json();
    },
  });
}

export function useCreateBank() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (data: InsertBank) => {
      const res = await fetch(api.banks.create.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create bank account");
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.banks.list.path] });
      toast({ title: "تم إضافة الحساب البنكي" });
    },
  });
}

export function useDeleteBank() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.banks.delete.path, { id });
      const res = await fetch(url, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete bank");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.banks.list.path] });
      toast({ title: "تم حذف الحساب البنكي" });
    },
  });
}

// Service Groups
export function useServiceGroups() {
  return useQuery({
    queryKey: ["/api/service-groups"],
    queryFn: async () => {
      const res = await fetch("/api/service-groups");
      if (!res.ok) throw new Error("Failed to fetch service groups");
      return await res.json();
    },
  });
}

export function useCreateServiceGroup() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch("/api/service-groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create service group");
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/service-groups"] });
      toast({ title: "تم إضافة الخدمة الرئيسية بنجاح" });
    },
  });
}

export function useDeleteServiceGroup() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/service-groups/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete service group");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/service-groups"] });
      toast({ title: "تم حذف الخدمة الرئيسية" });
    },
  });
}

// Settings
export function useSettings() {
  return useQuery({
    queryKey: [api.settings.get.path],
    queryFn: async () => {
      const res = await fetch(api.settings.get.path);
      if (!res.ok) throw new Error("Failed to fetch settings");
      return await res.json();
    },
  });
}

export function useUpdateSettings() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (data: InsertSetting) => {
      const res = await fetch(api.settings.update.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update settings");
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.settings.get.path] });
      toast({ title: "تم حفظ الإعدادات" });
    },
  });
}
