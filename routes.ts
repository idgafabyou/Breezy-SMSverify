import { z } from 'zod';
import { insertUserSchema, users, numbers, transactions, messages } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
  unauthorized: z.object({
    message: z.string(),
  })
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
      input: insertUserSchema,
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
  wallet: {
    balance: {
      method: 'GET' as const,
      path: '/api/wallet/balance' as const,
      responses: {
        200: z.object({ balance: z.string() }),
      },
    },
    transactions: {
      method: 'GET' as const,
      path: '/api/wallet/transactions' as const,
      responses: {
        200: z.array(z.custom<typeof transactions.$inferSelect>()),
      },
    },
    deposit: { // Mock deposit for now
      method: 'POST' as const,
      path: '/api/wallet/deposit' as const,
      input: z.object({ amount: z.string() }),
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
      },
    },
  },
  numbers: {
    list: {
      method: 'GET' as const,
      path: '/api/numbers' as const,
      responses: {
        200: z.array(z.custom<typeof numbers.$inferSelect>()),
      },
    },
    available: { // List available services/countries from provider
      method: 'GET' as const,
      path: '/api/numbers/available' as const,
      responses: {
        200: z.array(z.object({
          service: z.string(),
          country: z.string(),
          cost: z.number(),
          count: z.number().optional()
        })),
      },
    },
    buy: {
      method: 'POST' as const,
      path: '/api/numbers/buy' as const,
      input: z.object({
        service: z.string(),
        country: z.string(),
      }),
      responses: {
        201: z.custom<typeof numbers.$inferSelect>(),
        400: errorSchemas.validation, // Insufficient funds or unavailable
      },
    },
    cancel: {
      method: 'POST' as const,
      path: '/api/numbers/:id/cancel' as const,
      responses: {
        200: z.void(),
      },
    },
  },
  messages: {
    list: {
      method: 'GET' as const,
      path: '/api/numbers/:id/messages' as const,
      responses: {
        200: z.array(z.custom<typeof messages.$inferSelect>()),
      },
    },
  }
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
