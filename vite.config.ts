import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 4000,
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // React core
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          // Data fetching & state
          'vendor-query': ['@tanstack/react-query'],
          // UI components library
          'vendor-radix': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-tabs',
            '@radix-ui/react-toast',
            '@radix-ui/react-tooltip',
            '@radix-ui/react-select',
            '@radix-ui/react-popover',
            '@radix-ui/react-accordion',
            '@radix-ui/react-avatar',
            '@radix-ui/react-checkbox',
            '@radix-ui/react-label',
            '@radix-ui/react-scroll-area',
            '@radix-ui/react-separator',
            '@radix-ui/react-slot',
            '@radix-ui/react-switch',
            '@radix-ui/react-alert-dialog',
            '@radix-ui/react-aspect-ratio',
            '@radix-ui/react-collapsible',
            '@radix-ui/react-context-menu',
            '@radix-ui/react-hover-card',
            '@radix-ui/react-menubar',
            '@radix-ui/react-navigation-menu',
            '@radix-ui/react-progress',
            '@radix-ui/react-radio-group',
            '@radix-ui/react-slider',
            '@radix-ui/react-toggle',
            '@radix-ui/react-toggle-group',
          ],
          // Date utilities
          'vendor-date': ['date-fns'],
          // Supabase
          'vendor-supabase': ['@supabase/supabase-js'],
          // Form handling
          'vendor-form': ['react-hook-form', '@hookform/resolvers', 'zod'],
          // Icons
          'vendor-icons': ['lucide-react'],
          // Charts (very large library)
          'vendor-charts': ['recharts'],
          // Animation
          'vendor-motion': ['framer-motion'],
          // Carousel
          'vendor-carousel': ['embla-carousel-react'],
          // i18n
          'vendor-i18n': ['react-i18next', 'i18next', 'i18next-browser-languagedetector'],
          // Date picker
          'vendor-datepicker': ['react-day-picker'],
          // Utilities
          'vendor-utils': ['clsx', 'tailwind-merge', 'class-variance-authority'],
          // Sonner toast
          'vendor-sonner': ['sonner'],
          // Input OTP
          'vendor-otp': ['input-otp'],
          // CMDK command
          'vendor-cmdk': ['cmdk'],
          // Vaul drawer
          'vendor-vaul': ['vaul'],
          // React resizable
          'vendor-resizable': ['react-resizable-panels'],
          // Mapbox (large mapping library)
          'vendor-mapbox': ['mapbox-gl'],
        },
      },
    },
  },
}));
