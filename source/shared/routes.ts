import { z } from 'zod';
import { 
  insertUserSchema, 
  insertCategorySchema, 
  insertServiceSchema, 
  insertOrderSchema, 
  insertBankSchema, 
  insertAdSchema, 
  insertSettingsSchema,
  users, categories, services, orders, banks, ads, settings
} from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  unauthorized: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  auth: {
    register: {
      method: 'POST' as const,
      path: '/api/register' as const,
      input: insertUserSchema,
      responses: {
        201: z.custom<typeof users.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    login: {
      method: 'POST' as const,
      path: '/api/login' as const,
      input: z.object({ identifier: z.string(), password: z.string() }),
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        401: errorSchemas.unauthorized,
      },
    },
    logout: {
      method: 'POST' as const,
      path: '/api/logout' as const,
      responses: {
        200: z.void(),
      },
    },
    me: {
      method: 'GET' as const,
      path: '/api/user' as const,
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        401: errorSchemas.unauthorized,
      },
    },
  },
  categories: {
    list: {
      method: 'GET' as const,
      path: '/api/categories' as const,
      responses: {
        200: z.array(z.custom<typeof categories.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/categories' as const,
      input: insertCategorySchema,
      responses: {
        201: z.custom<typeof categories.$inferSelect>(),
        403: errorSchemas.unauthorized,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/categories/:id' as const,
      responses: {
        204: z.void(),
        403: errorSchemas.unauthorized,
      },
    },
  },
  services: {
    list: {
      method: 'GET' as const,
      path: '/api/services' as const,
      responses: {
        200: z.array(z.custom<typeof services.$inferSelect & { category: typeof categories.$inferSelect }>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/services' as const,
      input: insertServiceSchema,
      responses: {
        201: z.custom<typeof services.$inferSelect>(),
        403: errorSchemas.unauthorized,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/services/:id' as const,
      responses: {
        204: z.void(),
        403: errorSchemas.unauthorized,
      },
    },
  },
  orders: {
    create: {
      method: 'POST' as const,
      path: '/api/orders' as const,
      input: insertOrderSchema.pick({ serviceId: true, userInputId: true }),
      responses: {
        201: z.custom<typeof orders.$inferSelect>(),
        401: errorSchemas.unauthorized,
      },
    },
    listMyOrders: {
      method: 'GET' as const,
      path: '/api/orders/me' as const,
      responses: {
        200: z.array(z.custom<typeof orders.$inferSelect & { service: typeof services.$inferSelect }>()),
        401: errorSchemas.unauthorized,
      },
    },
    listAll: {
      method: 'GET' as const,
      path: '/api/admin/orders' as const,
      input: z.object({ status: z.string().optional() }).optional(),
      responses: {
        200: z.array(z.custom<typeof orders.$inferSelect & { service: typeof services.$inferSelect, user: typeof users.$inferSelect }>()),
        403: errorSchemas.unauthorized,
      },
    },
    updateStatus: {
      method: 'PATCH' as const,
      path: '/api/orders/:id/status' as const,
      input: z.object({ status: z.string(), rejectionReason: z.string().optional() }),
      responses: {
        200: z.custom<typeof orders.$inferSelect>(),
        403: errorSchemas.unauthorized,
      },
    },
  },
  banks: {
    list: {
      method: 'GET' as const,
      path: '/api/banks' as const,
      responses: {
        200: z.array(z.custom<typeof banks.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/banks' as const,
      input: insertBankSchema,
      responses: {
        201: z.custom<typeof banks.$inferSelect>(),
        403: errorSchemas.unauthorized,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/banks/:id' as const,
      responses: {
        204: z.void(),
        403: errorSchemas.unauthorized,
      },
    },
  },
  ads: {
    list: {
      method: 'GET' as const,
      path: '/api/ads' as const,
      responses: {
        200: z.array(z.custom<typeof ads.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/ads' as const,
      input: insertAdSchema,
      responses: {
        201: z.custom<typeof ads.$inferSelect>(),
        403: errorSchemas.unauthorized,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/ads/:id' as const,
      responses: {
        204: z.void(),
        403: errorSchemas.unauthorized,
      },
    },
  },
  settings: {
    get: {
      method: 'GET' as const,
      path: '/api/settings' as const,
      responses: {
        200: z.custom<typeof settings.$inferSelect>(),
      },
    },
    update: {
      method: 'POST' as const,
      path: '/api/settings' as const,
      input: insertSettingsSchema,
      responses: {
        200: z.custom<typeof settings.$inferSelect>(),
        403: errorSchemas.unauthorized,
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
