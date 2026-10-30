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
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#64748b',
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
    backgroundColor: '#0284c7',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0284c7',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  minuteText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800',
  },
  verticalLine: {
    flex: 1,
    width: 2,
    backgroundColor: '#cbd5e1',
    marginTop: 4,
  },
  contentCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
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
    backgroundColor: '#f1f5f9',
  },
  badgeGol: {
    backgroundColor: '#ecfdf5',
    borderColor: '#a7f3d0',
    borderWidth: 1,
  },
  badgeAmarilla: {
    backgroundColor: '#fefce8',
    borderColor: '#fef08a',
    borderWidth: 1,
  },
  badgeRoja: {
    backgroundColor: '#fef2f2',
    borderColor: '#fecaca',
    borderWidth: 1,
  },
  iconText: {
    fontSize: 12,
  },
  tipoText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  textGol: {
    color: '#047857',
  },
  textAmarilla: {
    color: '#a16207',
  },
  textRoja: {
    color: '#b91c1c',
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
    color: '#64748b',
    maxWidth: 160,
  },
  jugadorNombre: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 4,
  },
  deleteButton: {
    alignSelf: 'flex-end',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    backgroundColor: '#fef2f2',
    marginTop: 4,
  },
  deleteButtonDisabled: {
    opacity: 0.5,
  },
  deleteButtonText: {
    color: '#dc2626',
    fontSize: 11,
    fontWeight: '600',
  },
});

export default EventosTimeline;
