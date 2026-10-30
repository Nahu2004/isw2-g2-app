import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card, Button } from '@/components/common';
import { Jugador } from '@/api/types';

interface JugadorCardProps {
  jugador: Jugador;
  onEditar: (jugador: Jugador) => void;
  onToggleEstado: (jugador: Jugador) => void;
}

export const JugadorCard: React.FC<JugadorCardProps> = ({
  jugador,
  onEditar,
  onToggleEstado,
}) => {
  return (
    <Card style={[styles.card, !jugador.activo && styles.cardInactivo]}>
      <View style={styles.contentRow}>
        {/* Dorsal concéntrico con tabular-nums */}
        <View style={styles.dorsalCircle}>
          <Text style={styles.dorsalText}>#{jugador.numeroCamiseta}</Text>
        </View>

        {/* Información del jugador */}
        <View style={styles.infoContainer}>
          <View style={styles.nombreRow}>
            <Text style={styles.nombre} numberOfLines={1}>
              {jugador.apellido}, {jugador.nombre}
            </Text>
            <View
              style={[
                styles.badge,
                jugador.activo ? styles.badgeActivo : styles.badgeInactivo,
              ]}
            >
              <View style={[styles.badgeDot, { backgroundColor: jugador.activo ? '#10b981' : '#94a3b8' }]} />
              <Text style={[styles.badgeText, { color: jugador.activo ? '#047857' : '#64748b' }]}>
                {jugador.activo ? 'ACTIVO' : 'INACTIVO'}
              </Text>
            </View>
          </View>

          <Text style={styles.dni}>🪪 DNI: {jugador.dni}</Text>
          {jugador.nombreEquipo ? (
            <Text style={styles.equipo}>🛡️ {jugador.nombreEquipo}</Text>
          ) : null}
        </View>
      </View>

      {/* Botones de acción */}
      <View style={styles.actionsRow}>
        <Button
          title="Editar"
          variant="secondary"
          style={styles.smallBtn}
          onPress={() => onEditar(jugador)}
        />
        <Button
          title={jugador.activo ? 'Baja' : 'Reactivar'}
          variant={jugador.activo ? 'danger' : 'success'}
          style={styles.smallBtn}
          onPress={() => onToggleEstado(jugador)}
        />
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 14,
  },
  cardInactivo: {
    opacity: 0.65,
    backgroundColor: '#f8fafc',
    borderColor: '#e2e8f0',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  dorsalCircle: {
    width: 44,
    height: 44,
    borderRadius: 12, // R_inner
    backgroundColor: '#0284c7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#0369a1',
  },
  dorsalText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  infoContainer: {
    flex: 1,
  },
  nombreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
    gap: 8,
  },
  nombre: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0f172a',
    flex: 1,
    letterSpacing: -0.2,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    borderWidth: 1,
  },
  badgeActivo: {
    backgroundColor: '#ecfdf5',
    borderColor: '#a7f3d0',
  },
  badgeInactivo: {
    backgroundColor: '#f1f5f9',
    borderColor: '#e2e8f0',
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  dni: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
  },
  equipo: {
    fontSize: 12,
    color: '#0284c7',
    fontWeight: '600',
    marginTop: 2,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 12,
  },
  smallBtn: {
    paddingVertical: 7,
    paddingHorizontal: 12,
    minHeight: 34,
    borderRadius: 8,
  },
});

export default JugadorCard;
