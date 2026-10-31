import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  TouchableWithoutFeedback,
} from 'react-native';
import { Jugador, TipoEvento } from '@/api/types';
import { Button, InputField } from '@/components/common';

interface RegistrarEventoModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: { jugadorId: number; tipo: TipoEvento; minuto: number }) => Promise<void>;
  jugadoresLocal: Jugador[];
  jugadoresVisitante: Jugador[];
  nombreEquipoLocal: string;
  nombreEquipoVisitante: string;
}

export const RegistrarEventoModal: React.FC<RegistrarEventoModalProps> = ({
  visible,
  onClose,
  onSubmit,
  jugadoresLocal,
  jugadoresVisitante,
  nombreEquipoLocal,
  nombreEquipoVisitante,
}) => {
  const [equipoSeleccionado, setEquipoSeleccionado] = useState<'local' | 'visitante'>('local');
  const [jugadorId, setJugadorId] = useState<number | null>(null);
  const [tipo, setTipo] = useState<TipoEvento>('GOL');
  const [minuto, setMinuto] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [errorLocal, setErrorLocal] = useState<string | null>(null);

  const jugadoresActuales = equipoSeleccionado === 'local' ? jugadoresLocal : jugadoresVisitante;

  const handleSubmit = async () => {
    setErrorLocal(null);

    if (!jugadorId) {
      setErrorLocal('Debes seleccionar un jugador de la lista');
      return;
    }

    const minNum = parseInt(minuto, 10);
    if (isNaN(minNum) || minNum < 1 || minNum > 120) {
      setErrorLocal('El minuto debe ser un número entero entre 1 y 120');
      return;
    }

    try {
      setLoading(true);
      await onSubmit({
        jugadorId,
        tipo,
        minuto: minNum,
      });
      // Reset
      setMinuto('');
      setJugadorId(null);
      setErrorLocal(null);
      onClose();
    } catch (err: any) {
      // Capturar mensaje devuelto por la API backend (RN-04 / RN-03 sancion)
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.mensaje ||
        err?.message ||
        'Error al registrar la incidencia';
      setErrorLocal(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setErrorLocal(null);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <TouchableWithoutFeedback onPress={handleClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.modalContent}>
              <View style={styles.header}>
                <Text style={styles.title}>Registrar Incidencia</Text>
                <TouchableOpacity onPress={handleClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                  <Text style={styles.closeIcon}>✕</Text>
                </TouchableOpacity>
              </View>

              {errorLocal && (
                <View style={styles.errorBox}>
                  <Text style={styles.errorIcon}>⚠️</Text>
                  <Text style={styles.errorText}>{errorLocal}</Text>
                </View>
              )}

              {/* Selector de Tipo de Incidencia */}
              <Text style={styles.sectionLabel}>Tipo de Incidencia</Text>
              <View style={styles.tipoRow}>
                <TouchableOpacity
                  style={[
                    styles.tipoOption,
                    tipo === 'GOL' && styles.tipoOptionSelectedGol,
                  ]}
                  onPress={() => setTipo('GOL')}
                >
                  <Text style={styles.tipoIcon}>⚽</Text>
                  <Text style={[styles.tipoText, tipo === 'GOL' && styles.tipoTextSelected]}>
                    Gol
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.tipoOption,
                    tipo === 'AMARILLA' && styles.tipoOptionSelectedAmarilla,
                  ]}
                  onPress={() => setTipo('AMARILLA')}
                >
                  <View style={styles.tarjetaAmarillaIcon} />
                  <Text
                    style={[
                      styles.tipoText,
                      tipo === 'AMARILLA' && styles.tipoTextSelectedAmarilla,
                    ]}
                  >
                    Amarilla
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.tipoOption,
                    tipo === 'ROJA' && styles.tipoOptionSelectedRoja,
                  ]}
                  onPress={() => setTipo('ROJA')}
                >
                  <View style={styles.tarjetaRojaIcon} />
                  <Text
                    style={[
                      styles.tipoText,
                      tipo === 'ROJA' && styles.tipoTextSelectedRoja,
                    ]}
                  >
                    Roja
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Selector de Equipo */}
              <Text style={styles.sectionLabel}>Equipo</Text>
              <View style={styles.equipoTabs}>
                <TouchableOpacity
                  style={[
                    styles.equipoTab,
                    equipoSeleccionado === 'local' && styles.equipoTabActive,
                  ]}
                  onPress={() => {
                    setEquipoSeleccionado('local');
                    setJugadorId(null);
                  }}
                >
                  <Text
                    numberOfLines={1}
                    style={[
                      styles.equipoTabText,
                      equipoSeleccionado === 'local' && styles.equipoTabTextActive,
                    ]}
                  >
                    🏠 {nombreEquipoLocal}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.equipoTab,
                    equipoSeleccionado === 'visitante' && styles.equipoTabActive,
                  ]}
                  onPress={() => {
                    setEquipoSeleccionado('visitante');
                    setJugadorId(null);
                  }}
                >
                  <Text
                    numberOfLines={1}
                    style={[
                      styles.equipoTabText,
                      equipoSeleccionado === 'visitante' && styles.equipoTabTextActive,
                    ]}
                  >
                    ✈️ {nombreEquipoVisitante}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Selector de Jugador */}
              <Text style={styles.sectionLabel}>
                Seleccionar Jugador ({jugadoresActuales.length} disponibles)
              </Text>
              <ScrollView style={styles.jugadoresList} nestedScrollEnabled>
                {jugadoresActuales.length === 0 ? (
                  <Text style={styles.emptyJugadores}>
                    No hay jugadores activos registrados para este equipo.
                  </Text>
                ) : (
                  jugadoresActuales.map((jugador) => {
                    const isSelected = jugadorId === jugador.id;
                    return (
                      <TouchableOpacity
                        key={jugador.id}
                        style={[
                          styles.jugadorItem,
                          isSelected && styles.jugadorItemSelected,
                        ]}
                        onPress={() => setJugadorId(jugador.id)}
                      >
                        <View style={styles.dorsalCircle}>
                          <Text style={styles.dorsalText}>
                            #{jugador.numeroCamiseta ?? '-'}
                          </Text>
                        </View>
                        <View style={styles.jugadorInfo}>
                          <Text
                            style={[
                              styles.jugadorNombre,
                              isSelected && styles.jugadorNombreSelected,
                            ]}
                          >
                            {jugador.apellido}, {jugador.nombre}
                          </Text>
                          <Text style={styles.jugadorDni}>DNI: {jugador.dni}</Text>
                        </View>
                        {isSelected && <Text style={styles.checkIcon}>✓</Text>}
                      </TouchableOpacity>
                    );
                  })
                )}
              </ScrollView>

              {/* Minuto del evento */}
              <InputField
                label="Minuto del Partido (1 - 120)"
                placeholder="Ej: 34"
                keyboardType="numeric"
                value={minuto}
                onChangeText={setMinuto}
                maxLength={3}
              />

              {/* Acciones */}
              <View style={styles.actionsRow}>
                <Button
                  title="Cancelar"
                  variant="secondary"
                  onPress={handleClose}
                  style={styles.actionBtn}
                  disabled={loading}
                />
                <Button
                  title="Registrar"
                  onPress={handleSubmit}
                  loading={loading}
                  style={styles.actionBtn}
                />
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContent: {
    backgroundColor: '#161616',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    maxWidth: 520,
    maxHeight: '90%',
    borderWidth: 1,
    borderColor: '#262626',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 24,
    elevation: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#262626',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  closeIcon: {
    fontSize: 18,
    color: '#A3A3A3',
    fontWeight: 'bold',
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(220, 38, 38, 0.12)',
    borderColor: 'rgba(220, 38, 38, 0.35)',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 14,
  },
  errorIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  errorText: {
    color: '#f87171',
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#A3A3A3',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  tipoRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  tipoOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#262626',
    backgroundColor: '#1A1A1A',
    gap: 6,
  },
  tipoOptionSelectedGol: {
    borderColor: 'rgba(16, 185, 129, 0.6)',
    backgroundColor: 'rgba(16, 185, 129, 0.10)',
  },
  tipoOptionSelectedAmarilla: {
    borderColor: 'rgba(234, 179, 8, 0.6)',
    backgroundColor: 'rgba(234, 179, 8, 0.10)',
  },
  tipoOptionSelectedRoja: {
    borderColor: 'rgba(239, 68, 68, 0.6)',
    backgroundColor: 'rgba(239, 68, 68, 0.10)',
  },
  tipoIcon: {
    fontSize: 16,
  },
  tarjetaAmarillaIcon: {
    width: 12,
    height: 16,
    backgroundColor: '#eab308',
    borderRadius: 2,
    borderWidth: 1,
    borderColor: '#ca8a04',
  },
  tarjetaRojaIcon: {
    width: 12,
    height: 16,
    backgroundColor: '#ef4444',
    borderRadius: 2,
    borderWidth: 1,
    borderColor: '#b91c1c',
  },
  tipoText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#A3A3A3',
  },
  tipoTextSelected: {
    color: '#10b981',
    fontWeight: '700',
  },
  tipoTextSelectedAmarilla: {
    color: '#eab308',
    fontWeight: '700',
  },
  tipoTextSelectedRoja: {
    color: '#ef4444',
    fontWeight: '700',
  },
  equipoTabs: {
    flexDirection: 'row',
    borderRadius: 8,
    backgroundColor: '#0A0A0A',
    padding: 3,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#262626',
  },
  equipoTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
  },
  equipoTabActive: {
    backgroundColor: '#262626',
  },
  equipoTabText: {
    fontSize: 13,
    color: '#A3A3A3',
    fontWeight: '500',
  },
  equipoTabTextActive: {
    color: '#7DD3FC',
    fontWeight: '700',
  },
  jugadoresList: {
    maxHeight: 150,
    borderWidth: 1,
    borderColor: '#262626',
    borderRadius: 8,
    marginBottom: 16,
    backgroundColor: '#0A0A0A',
  },
  emptyJugadores: {
    padding: 16,
    textAlign: 'center',
    color: '#A3A3A3',
    fontSize: 13,
  },
  jugadorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#262626',
  },
  jugadorItemSelected: {
    backgroundColor: 'rgba(125, 211, 252, 0.08)',
  },
  dorsalCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#262626',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  dorsalText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  jugadorInfo: {
    flex: 1,
  },
  jugadorNombre: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  jugadorNombreSelected: {
    color: '#7DD3FC',
    fontWeight: '700',
  },
  jugadorDni: {
    fontSize: 11,
    color: '#A3A3A3',
  },
  checkIcon: {
    color: '#7DD3FC',
    fontWeight: 'bold',
    fontSize: 16,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  actionBtn: {
    flex: 1,
  },
});

export default RegistrarEventoModal;
