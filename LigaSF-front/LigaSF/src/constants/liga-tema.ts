import type { EstadoPartido } from '@/api/liga-tipos';

export const colores = {
  fondo: '#000000',
  superficie: '#0F0F0F',
  borde: '#242424',
  texto: '#FFFFFF',
  textoSuave: '#8A8A8A',
  primario: '#7DD3FC',
  primarioClaro: '#0C2430',
  error: '#F87171',
  amarilla: '#FACC15',
  roja: '#EF4444',
} as const;

export const colorEstado: Record<EstadoPartido, string> = {
  PROGRAMADO: colores.textoSuave,
  EN_JUEGO: colores.primario,
  FINALIZADO: colores.textoSuave,
  SUSPENDIDO: colores.error,
};

/** Estilo repetido en títulos y etiquetas: mayúsculas chicas con letras separadas. */
export const etiqueta = {
  fontSize: 11,
  fontWeight: '800',
  letterSpacing: 1.5,
  textTransform: 'uppercase',
} as const;
