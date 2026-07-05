const normalizeEnvValue = (value?: string) => {
  if (!value) return value;
  return value.trim().replace(/^['"]|['"]$/g, '');
};

export const config = {
  // API Configuration
  api: {
    baseUrl: normalizeEnvValue(process.env.NEXT_PUBLIC_API_URL) || 'http://localhost:3000',
    timeout: 30000,
    retryAttempts: 3,
  },

  // App Information
  app: {
    company: 'Civic Setu',
    title: 'Civic Setu — Digital Civic Grievance Platform',
    sidebarTitle: 'Civic',
    sidebarSubTitle: 'Setu',
    description: 'Digital bridge between citizens and governance — report, track, and resolve civic issues.',
    sidebarDescription: 'Civic Grievance Platform',
    logo: '/portal-logo/logo.png',
  },

  version: {
    portal: '1.0.0',
    whatsNew: [
      'AI-powered road damage detection from images',
      'Real-time complaint status tracking',
      'Admin dashboard with analytics',
      'Multi-role support: citizen, worker, admin',
      'Map-based complaint visualization',
    ],
  },

  // Theme Colors — Deep Blue (OXmaint-style)
  theme: {
    colorRatio: {
      dominant: '#ffffff',
      primary: '#15227a',   // Deep blue
      accent: '#f58b00',    // Orange accent
    },
    background: '#f9fafb',
    surface: '#ffffff',
    text: {
      primary: '#111827',
      secondary: '#4b5563',
      muted: '#6b7280',
    },
    colors: {
      primary: {
        50: '#f0f2ff',
        100: '#e6e9ff',
        200: '#d1d7ff',
        300: '#b3bbff',
        400: '#8f96ff',
        500: '#6b73ff',
        600: '#4a52f5',
        700: '#3640d8',
        800: '#2d35af',
        900: '#15227a',
        950: '#0f1a5c',
      },
      secondary: {
        50: '#fff7ed',
        100: '#ffedd5',
        200: '#fed7aa',
        300: '#fdba74',
        400: '#fb923c',
        500: '#f58b00',
        600: '#ea580c',
        700: '#c2410c',
        800: '#9a3412',
        900: '#7c2d12',
        950: '#431407',
      },
    },
  },

  // UI Configuration
  ui: {
    layout: {
      sidebarWidth: 256,
      headerHeight: 64,
    },
    animations: {
      duration: {
        fast: 150,
        normal: 300,
        slow: 500,
      },
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
    },
    breakpoints: {
      xs: '475px',
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
    },
  },

  // Feature flags
  features: {
    notifications: true,
    analytics: true,
    mapView: true,
    aiDetection: true,
    fieldWorkerApp: false,  // Phase 3
    slaEngine: false,        // Phase 3
    multiLanguage: true,
    exportReports: true,
    qrCodes: true,
  },

  // Civic Setu domain constants
  domain: {
    departments: [
      { id: 'pwd', name: 'Public Works Department' },
      { id: 'electricity', name: 'Electricity Board' },
      { id: 'water', name: 'Water Authority' },
      { id: 'sanitation', name: 'Sanitation Department' },
      { id: 'traffic', name: 'Traffic Police' },
      { id: 'parks', name: 'Parks & Recreation' },
    ] as const,

    categories: [
      { id: 'road', name: 'Road Damage' },
      { id: 'lighting', name: 'Street Lighting' },
      { id: 'water', name: 'Water Supply' },
      { id: 'sanitation', name: 'Sanitation / Garbage' },
      { id: 'traffic', name: 'Traffic Violation' },
      { id: 'other', name: 'Other' },
    ] as const,

    statuses: [
      { id: 'pending', name: 'Pending', color: 'bg-yellow-100 text-yellow-700' },
      { id: 'in-progress', name: 'In Progress', color: 'bg-blue-100 text-blue-700' },
      { id: 'resolved', name: 'Resolved', color: 'bg-green-100 text-green-700' },
      { id: 'verified', name: 'Verified', color: 'bg-emerald-100 text-emerald-700' },
      { id: 'closed', name: 'Closed', color: 'bg-gray-100 text-gray-700' },
      { id: 'rejected', name: 'Rejected', color: 'bg-red-100 text-red-700' },
    ] as const,

    priorities: [
      { id: 'low', name: 'Low', color: 'bg-gray-100 text-gray-700' },
      { id: 'medium', name: 'Medium', color: 'bg-blue-100 text-blue-700' },
      { id: 'high', name: 'High', color: 'bg-orange-100 text-orange-700' },
      { id: 'critical', name: 'Critical', color: 'bg-red-100 text-red-700' },
    ] as const,

    // SLA deadlines per category (in hours)
    slaHours: {
      road: 72,
      lighting: 48,
      water: 24,
      sanitation: 24,
      traffic: 48,
      other: 72,
    } as Record<string, number>,
  },

  // External services
  services: {
    google: {
      mapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    },
    nominatim: {
      baseUrl: 'https://nominatim.openstreetmap.org',
      userAgent: 'CivicSetu/1.0',
      timeout: 10000,
    },
  },
} as const;

// Type definitions
export type Config = typeof config;
export type Department = typeof config.domain.departments[number];
export type Category = typeof config.domain.categories[number];
export type StatusConfig = typeof config.domain.statuses[number];
export type PriorityConfig = typeof config.domain.priorities[number];

// Helper functions
export const getApiUrl = (endpoint: string): string => {
  return `${config.api.baseUrl}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
};

export const isFeatureEnabled = (feature: keyof typeof config.features): boolean => {
  return config.features[feature];
};

export const getDepartmentName = (id: string): string => {
  return config.domain.departments.find(d => d.id === id)?.name || id;
};

export const getCategoryName = (id: string): string => {
  return config.domain.categories.find(c => c.id === id)?.name || id;
};

export const getStatusConfig = (id: string): StatusConfig | undefined => {
  return config.domain.statuses.find(s => s.id === id);
};

export const getPriorityConfig = (id: string): PriorityConfig | undefined => {
  return config.domain.priorities.find(p => p.id === id);
};

export const getSlaHours = (category: string): number => {
  return config.domain.slaHours[category] || 72;
};

export const isDev = process.env.NODE_ENV === 'development';
export const isProd = process.env.NODE_ENV === 'production';

export default config;
