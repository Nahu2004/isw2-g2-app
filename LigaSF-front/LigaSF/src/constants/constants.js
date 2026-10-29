// Enums y constantes de dominio

export const RolUsuario = Object.freeze({
  ADMIN: 'ADMIN',
  ARBITRO: 'ARBITRO',
  PLANILLERO: 'PLANILLERO',
  ESPECTADOR: 'ESPECTADOR',
});

export const EstadoPartido = Object.freeze({
  PROGRAMADO: 'PROGRAMADO',
  EN_CURSO: 'EN_CURSO',
  FINALIZADO: 'FINALIZADO',
  SUSPENDIDO: 'SUSPENDIDO',
});

export const TipoEvento = Object.freeze({
  GOL: 'GOL',
  TARJETA_AMARILLA: 'TARJETA_AMARILLA',
  TARJETA_ROJA: 'TARJETA_ROJA',
  CAMBIO: 'CAMBIO',
});
