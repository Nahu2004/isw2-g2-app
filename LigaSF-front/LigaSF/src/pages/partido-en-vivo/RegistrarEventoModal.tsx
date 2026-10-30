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
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    maxWidth: 520,
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
  },
  closeIcon: {
    fontSize: 18,
    color: '#64748b',
    fontWeight: 'bold',
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fee2e2',
    borderColor: '#fca5a5',
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
    color: '#b91c1c',
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
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
    borderColor: '#e2e8f0',
    backgroundColor: '#f8fafc',
    gap: 6,
  },
  tipoOptionSelectedGol: {
    borderColor: '#10b981',
    backgroundColor: '#ecfdf5',
  },
  tipoOptionSelectedAmarilla: {
    borderColor: '#eab308',
    backgroundColor: '#fefce8',
  },
  tipoOptionSelectedRoja: {
    borderColor: '#ef4444',
    backgroundColor: '#fef2f2',
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
    color: '#64748b',
  },
  tipoTextSelected: {
    color: '#047857',
  },
  tipoTextSelectedAmarilla: {
    color: '#a16207',
  },
  tipoTextSelectedRoja: {
    color: '#b91c1c',
  },
  equipoTabs: {
    flexDirection: 'row',
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
    padding: 3,
    marginBottom: 12,
  },
  equipoTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
  },
  equipoTabActive: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  equipoTabText: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '500',
  },
  equipoTabTextActive: {
    color: '#0284c7',
    fontWeight: '700',
  },
  jugadoresList: {
    maxHeight: 150,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    marginBottom: 16,
  },
  emptyJugadores: {
    padding: 16,
    textAlign: 'center',
    color: '#94a3b8',
    fontSize: 13,
  },
  jugadorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  jugadorItemSelected: {
    backgroundColor: '#e0f2fe',
  },
  dorsalCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  dorsalText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#334155',
  },
  jugadorInfo: {
    flex: 1,
  },
  jugadorNombre: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1e293b',
  },
  jugadorNombreSelected: {
    color: '#0284c7',
    fontWeight: '700',
  },
  jugadorDni: {
    fontSize: 11,
    color: '#64748b',
  },
  checkIcon: {
    color: '#0284c7',
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
