/**
 * Sistema de diseño global — Liga SF
 * ─────────────────────────────────────────────────────────────────────────────
 * Paleta principal: Dark Premium (estilo app deportiva profesional)
 * Paleta legacy: light/dark (usada por otros módulos del equipo — NO ROMPER)
 *
 * Todos los componentes del Módulo 4 (Reglamento) usan exclusivamente
 * los tokens de `Theme` definidos abajo.
 */

import { Platform } from 'react-native';

// ─── Paleta legacy (Módulos 1, 2, 3) — mantener intacta ──────────────────────

export const Colors = {
  light: {
    text: '#000000',
    background: '#ffffff',
    backgroundElement: '#F0F0F3',
    backgroundSelected: '#E0E1E6',
    textSecondary: '#60646C',
  },
  dark: {
    text: '#ffffff',
    background: '#000000',
    backgroundElement: '#212225',
    backgroundSelected: '#2E3135',
    textSecondary: '#B0B4BA',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

// ─── Theme Premium — Módulo 4 Reglamento ─────────────────────────────────────

export const Theme = {
  // Fondos
  bg: {
    base:    '#0A0A0A',   // Fondo de pantalla principal
    card:    '#161616',   // Superficie de tarjetas y secciones
    input:   '#1A1A1A',   // Campos de input
    overlay: '#111111',   // Modales / overlays
  },

  // Bordes
  border: {
    subtle:  '#262626',   // Borde estándar de tarjetas y separadores
    active:  '#7DD3FC',   // Borde de elemento seleccionado / activo
    error:   '#EF4444',   // Borde de error
  },

  // Texto
  text: {
    primary:   '#FFFFFF',   // Títulos, valores principales
    secondary: '#A3A3A3',   // Labels, subtítulos, placeholders
    accent:    '#7DD3FC',   // Dato destacado, tab activa, badge
    error:     '#EF4444',   // Mensajes de error
    success:   '#4ADE80',   // Mensajes de éxito / disponible
    warning:   '#FBBF24',   // Advertencias / dos amarillas
  },

  // Acento (celeste) — único color de marca
  accent: {
    DEFAULT: '#7DD3FC',
    dim:     '#1E3A4A',   // Fondo de badge activo (celeste oscuro)
  },

  // Estados semánticos (para DisponibilidadCard, BloqueoCard, etc.)
  status: {
    success: {
      bg:     '#052E16',
      border: '#166534',
      text:   '#4ADE80',
    },
    danger: {
      bg:     '#2D0A0A',
      border: '#7F1D1D',
      text:   '#EF4444',
    },
    warning: {
      bg:     '#2D1A00',
      border: '#78350F',
      text:   '#FBBF24',
    },
    neutral: {
      bg:     '#161616',
      border: '#262626',
      text:   '#A3A3A3',
    },
  },

  // Tipografía
  font: {
    size: {
      xs:  11,
      sm:  13,
      md:  15,
      lg:  17,
      xl:  20,
      xxl: 24,
    },
    weight: {
      regular: '400' as const,
      medium:  '500' as const,
      semibold:'600' as const,
      bold:    '700' as const,
      black:   '800' as const,
    },
    letterSpacing: {
      tight:  -0.3,
      normal:  0,
      wide:    0.8,   // Para labels en uppercase
      wider:   1.2,
    },
  },

  // Espaciado
  spacing: {
    xs:  4,
    sm:  8,
    md:  12,
    lg:  16,
    xl:  24,
    xxl: 32,
  },

  // Bordes redondeados
  radius: {
    sm:   6,
    md:   10,
    lg:   14,
    pill: 999,
  },
} as const;

// ─── Helpers de estilo frecuentes ─────────────────────────────────────────────

/** Estilo base de tarjeta premium */
export const cardStyle = {
  backgroundColor: Theme.bg.card,
  borderWidth: 1,
  borderColor: Theme.border.subtle,
  borderRadius: Theme.radius.md,
  padding: Theme.spacing.md,
} as const;

/** Label en UPPERCASE para secciones */
export const sectionLabelStyle = {
  fontSize: Theme.font.size.xs,
  fontWeight: Theme.font.weight.bold,
  color: Theme.text.secondary,
  letterSpacing: Theme.font.letterSpacing.wide,
  textTransform: 'uppercase' as const,
} as const;

// ─── Fuentes (sin cambios) ────────────────────────────────────────────────────

export const Fonts = Platform.select({
  ios: {
    sans:    'system-ui',
    serif:   'ui-serif',
    rounded: 'ui-rounded',
    mono:    'ui-monospace',
  },
  default: {
    sans:    'normal',
    serif:   'serif',
    rounded: 'normal',
    mono:    'monospace',
  },
  web: {
    sans:    'var(--font-display)',
    serif:   'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono:    'var(--font-mono)',
  },
});

// ─── Spacing legacy (sin cambios) ─────────────────────────────────────────────

export const Spacing = {
  half:  2,
  one:   4,
  two:   8,
  three: 16,
  four:  24,
  five:  32,
  six:   64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
