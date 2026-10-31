import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { EventoPartido } from '@/api/types';

interface EventosTimelineProps {
  eventos: EventoPartido[];
  partidoEnJuego: boolean;
  onEliminarEvento: (evento: EventoPartido) => void;
  deletingId?: number | null;
}

export const EventosTimeline: React.FC<EventosTimelineProps> = ({
  eventos,
  partidoEnJuego,
  onEliminarEvento,
  deletingId,
}) => {
  // Ordenar eventos por minuto ascendente
  const eventosOrdenados = [...eventos].sort((a, b) => a.minuto - b.minuto);

  if (eventosOrdenados.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>⏱️</Text>
        <Text style={styles.emptyTitle}>Sin incidencias registradas</Text>
        <Text style={styles.emptySubtitle}>
          {partidoEnJuego
            ? 'Usa el botón "Registrar Incidencia" para cargar goles y tarjetas en tiempo real.'
            : 'Las incidencias del partido aparecerán en esta línea de tiempo.'}
        </Text>
      </View>
    );
  }

  const renderBadge = (tipo: string) => {
    switch (tipo) {
      case 'GOL':
        return (
          <View style={[styles.tipoBadge, styles.badgeGol]}>
            <Text style={styles.iconText}>⚽</Text>
            <Text style={[styles.tipoText, styles.textGol]}>GOL</Text>
          </View>
        );
      case 'AMARILLA':
        return (
          <View style={[styles.tipoBadge, styles.badgeAmarilla]}>
            <View style={styles.amarillaBox} />
            <Text style={[styles.tipoText, styles.textAmarilla]}>AMARILLA</Text>
          </View>
        );
      case 'ROJA':
        return (
          <View style={[styles.tipoBadge, styles.badgeRoja]}>
            <View style={styles.rojaBox} />
            <Text style={[styles.tipoText, styles.textRoja]}>ROJA</Text>
          </View>
        );
      default:
        return (
          <View style={styles.tipoBadge}>
            <Text style={styles.tipoText}>{tipo}</Text>
          </View>
        );
    }
  };

  return (
    <View style={styles.timelineContainer}>
      {eventosOrdenados.map((ev, index) => {
        const isLast = index === eventosOrdenados.length - 1;
        const isDeleting = deletingId === ev.id;

        return (
          <View key={ev.id} style={styles.itemRow}>
            {/* Columna de Minuto y Línea */}
            <View style={styles.minuteColumn}>
              <View style={styles.minuteCircle}>
                <Text style={styles.minuteText}>{ev.minuto}'</Text>
              </View>
              {!isLast && <View style={styles.verticalLine} />}
            </View>

            {/* Contenido del Evento */}
            <View style={styles.contentCard}>
              <View style={styles.cardHeader}>
                {renderBadge(ev.tipo)}
                {ev.equipoNombre && (
                  <Text style={styles.equipoNombre} numberOfLines={1}>
                    {ev.equipoNombre}
                  </Text>
                )}
              </View>

              <Text style={styles.jugadorNombre}>
                {ev.jugadorNombreCompleto || `Jugador #${ev.jugadorId}`}
              </Text>

              {/* Botón de eliminación / corrección permitido solo si está EN_JUEGO */}
              {partidoEnJuego && (
                <TouchableOpacity
                  style={[styles.deleteButton, isDeleting && styles.deleteButtonDisabled]}
                  onPress={() => onEliminarEvento(ev)}
                  disabled={isDeleting}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Text style={styles.deleteButtonText}>
                    {isDeleting ? 'Eliminando...' : '🗑️ Corregir'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#161616',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#262626',
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#A3A3A3',
    textAlign: 'center',
    maxWidth: 360,
  },
  timelineContainer: {
    paddingVertical: 8,
  },
  itemRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  minuteColumn: {
    alignItems: 'center',
    width: 48,
    marginRight: 10,
  },
  minuteCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#7DD3FC',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#7DD3FC',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  minuteText: {
    color: '#000000',
    fontSize: 12,
    fontWeight: '800',
  },
  verticalLine: {
    flex: 1,
    width: 2,
    backgroundColor: '#262626',
    marginTop: 4,
  },
  contentCard: {
    flex: 1,
    backgroundColor: '#161616',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#262626',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  tipoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    gap: 4,
    backgroundColor: '#262626',
  },
  badgeGol: {
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    borderColor: 'rgba(16, 185, 129, 0.4)',
    borderWidth: 1,
  },
  badgeAmarilla: {
    backgroundColor: 'rgba(234, 179, 8, 0.12)',
    borderColor: 'rgba(234, 179, 8, 0.4)',
    borderWidth: 1,
  },
  badgeRoja: {
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderColor: 'rgba(239, 68, 68, 0.4)',
    borderWidth: 1,
  },
  iconText: {
    fontSize: 12,
  },
  tipoText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
    color: '#A3A3A3',
  },
  textGol: {
    color: '#10b981',
  },
  textAmarilla: {
    color: '#eab308',
  },
  textRoja: {
    color: '#ef4444',
  },
  amarillaBox: {
    width: 9,
    height: 12,
    backgroundColor: '#eab308',
    borderRadius: 2,
  },
  rojaBox: {
    width: 9,
    height: 12,
    backgroundColor: '#ef4444',
    borderRadius: 2,
  },
  equipoNombre: {
    fontSize: 12,
    fontWeight: '600',
    color: '#A3A3A3',
    maxWidth: 160,
  },
  jugadorNombre: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  deleteButton: {
    alignSelf: 'flex-end',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 6,
    backgroundColor: 'rgba(220, 38, 38, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(220, 38, 38, 0.3)',
    marginTop: 4,
  },
  deleteButtonDisabled: {
    opacity: 0.5,
  },
  deleteButtonText: {
    color: '#f87171',
    fontSize: 11,
    fontWeight: '600',
  },
});

export default EventosTimeline;
