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
        {/* Dorsal tipo camiseta */}
        <View style={styles.dorsalCircle}>
          <Text style={styles.dorsalText}>#{jugador.numeroCamiseta}</Text>
        </View>

        {/* Información del jugador */}
        <View style={styles.infoContainer}>
          <View style={styles.nombreRow}>
            <Text style={styles.nombre}>
              {jugador.apellido}, {jugador.nombre}
            </Text>
            <View
              style={[
                styles.badge,
                jugador.activo ? styles.badgeActivo : styles.badgeInactivo,
              ]}
            >
              <Text style={styles.badgeText}>
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
          title={jugador.activo ? 'Desactivar' : 'Reactivar'}
          variant={jugador.activo ? 'danger' : 'primary'}
          style={styles.smallBtn}
          onPress={() => onToggleEstado(jugador)}
        />
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 14,
    borderLeftWidth: 4,
    borderLeftColor: '#10b981',
  },
  cardInactivo: {
    opacity: 0.65,
    borderLeftColor: '#94a3b8',
    backgroundColor: '#f8fafc',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  dorsalCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#e0f2fe',
    borderWidth: 2,
    borderColor: '#0284c7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  dorsalText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0369a1',
  },
  infoContainer: {
    flex: 1,
  },
  nombreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  nombre: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0f172a',
    flex: 1,
    marginRight: 8,
  },
  badge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeActivo: {
    backgroundColor: '#dcfce7',
  },
  badgeInactivo: {
    backgroundColor: '#fee2e2',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#166534',
  },
  dni: {
    fontSize: 13,
    color: '#64748b',
    marginBottom: 2,
  },
  equipo: {
    fontSize: 13,
    color: '#0284c7',
    fontWeight: '500',
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    borderTopWidth: 1,
    borderColor: '#f1f5f9',
    paddingTop: 8,
  },
  smallBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
});
