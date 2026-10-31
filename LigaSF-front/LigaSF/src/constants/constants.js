// Enums y constantes del negocio para la Liga Amateur Santafesina

export const RolUsuario = Object.freeze({
  ADMIN: 'ADMIN',
  DELEGADO: 'DELEGADO',
  ARBITRO: 'ARBITRO',
  PLANILLERO: 'PLANILLERO',
  ESPECTADOR: 'ESPECTADOR',
});

export const EstadoPartido = Object.freeze({
  PROGRAMADO: 'PROGRAMADO',
  EN_JUEGO: 'EN_JUEGO',
  FINALIZADO: 'FINALIZADO',
  SUSPENDIDO: 'SUSPENDIDO',
});

export const TipoEvento = Object.freeze({
  GOL: 'GOL',
  AMARILLA: 'AMARILLA',
  ROJA: 'ROJA',
});

export default {
  RolUsuario,
  EstadoPartido,
  TipoEvento,
};
