import type { EstadoPartido, Partido } from '@/api/liga-tipos';

export const etiquetaEstado: Record<EstadoPartido, string> = {
  PROGRAMADO: 'Programado',
  EN_JUEGO: 'En juego',
  FINALIZADO: 'Finalizado',
  SUSPENDIDO: 'Suspendido',
};

/** Texto corto para la celda de estado de cada partido. */
export const etiquetaCorta: Record<EstadoPartido, string> = {
  PROGRAMADO: '',
  EN_JUEGO: 'En vivo',
  FINALIZADO: 'Fin',
  SUSPENDIDO: 'Susp.',
};

export function fechasDisponibles(partidos: Partido[]): number[] {
  return [...new Set(partidos.map((p) => p.numeroFecha))].sort((a, b) => a - b);
}

/** Fecha en curso: la primera con partidos por jugar; si no queda ninguna, la última. */
export function fechaEnCurso(partidos: Partido[]): number {
  const fechas = fechasDisponibles(partidos);
  const pendiente = fechas.find((fecha) =>
    partidos.some(
      (p) => p.numeroFecha === fecha && (p.estado === 'PROGRAMADO' || p.estado === 'EN_JUEGO'),
    ),
  );
  return pendiente ?? fechas[fechas.length - 1] ?? 1;
}

export function formatearFechaHora(iso: string): string {
  return new Date(iso).toLocaleString('es-AR', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatearHora(iso: string): string {
  return new Date(iso).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
}
