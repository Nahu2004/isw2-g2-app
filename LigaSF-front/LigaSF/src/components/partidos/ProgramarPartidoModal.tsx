// Modal de Programar Partido — diseño premium oscuro alineado a LigaSF
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { Theme, sectionLabelStyle } from '@/constants/theme';
import { Torneo, Equipo, Cancha, Arbitro } from '@/api/types';
import { getTorneos, getCanchas, getArbitros } from '@/api/catalogosApi';
import { getEquipos } from '@/api/equiposApi';

interface ProgramarPartidoModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: {
    torneoId: number;
    numeroFecha: number;
    equipoLocalId: number;
    equipoVisitanteId: number;
    canchaId: number;
    arbitroId: number;
    fechaHoraInicio: string;
  }) => Promise<void>;
  torneoIdDefault?: number;
}

export const ProgramarPartidoModal: React.FC<ProgramarPartidoModalProps> = ({
  visible,
  onClose,
  onSubmit,
  torneoIdDefault,
}) => {
  const [torneos, setTorneos] = useState<Torneo[]>([]);
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [canchas, setCanchas] = useState<Cancha[]>([]);
  const [arbitros, setArbitros] = useState<Arbitro[]>([]);

  const [torneoId, setTorneoId] = useState<number | null>(null);
  const [numeroFecha, setNumeroFecha] = useState('1');
  const [equipoLocalId, setEquipoLocalId] = useState<number | null>(null);
  const [equipoVisitanteId, setEquipoVisitanteId] = useState<number | null>(null);
  const [canchaId, setCanchaId] = useState<number | null>(null);
  const [arbitroId, setArbitroId] = useState<number | null>(null);

  const hoyStr = new Date().toISOString().split('T')[0];
  const [fechaStr, setFechaStr] = useState(hoyStr);
  const [horaStr, setHoraStr] = useState('15:00');

  const [submitting, setSubmitting] = useState(false);
  const [errores, setErrores] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (visible) {
      cargarCatalogos();
      setErrores({});
    }
  }, [visible]);

  useEffect(() => {
    if (torneoId) {
      cargarEquiposDelTorneo(torneoId);
    } else {
      setEquipos([]);
      setEquipoLocalId(null);
      setEquipoVisitanteId(null);
    }
  }, [torneoId]);

  const cargarCatalogos = async () => {
    try {
      const [listaTorneos, listaCanchas, listaArbitros] = await Promise.all([
        getTorneos(true),
        getCanchas(true),
        getArbitros(true),
      ]);
      setTorneos(listaTorneos);
      setCanchas(listaCanchas);
      setArbitros(listaArbitros);

      const targetTorneoId =
        torneoIdDefault || (listaTorneos.length > 0 ? listaTorneos[0].id : null);
      if (targetTorneoId) setTorneoId(targetTorneoId);
      if (listaCanchas.length > 0) setCanchaId(listaCanchas[0].id);
      if (listaArbitros.length > 0) setArbitroId(listaArbitros[0].id);
    } catch {
      // Ignorar
    }
  };

  const cargarEquiposDelTorneo = async (tId: number) => {
    try {
      const listaEquipos = await getEquipos(tId, true);
      setEquipos(listaEquipos);
      if (listaEquipos.length >= 2) {
        setEquipoLocalId(listaEquipos[0].id);
        setEquipoVisitanteId(listaEquipos[1].id);
      } else if (listaEquipos.length === 1) {
        setEquipoLocalId(listaEquipos[0].id);
        setEquipoVisitanteId(null);
      } else {
        setEquipoLocalId(null);
        setEquipoVisitanteId(null);
      }
    } catch {
      setEquipos([]);
    }
  };

  const notificar = (titulo: string, mensaje: string) => {
    if (Platform.OS === 'web') {
      window.alert(`${titulo}: ${mensaje}`);
    } else {
      Alert.alert(titulo, mensaje);
    }
  };

  const validar = () => {
    const err: { [key: string]: string } = {};
    if (!torneoId) err.torneoId = 'Debe seleccionar un torneo';

    const numF = parseInt(numeroFecha, 10);
    if (isNaN(numF) || numF < 1) err.numeroFecha = 'El número de fecha debe ser al menos 1';

    if (!equipoLocalId) err.equipoLocalId = 'Seleccione el equipo local';
    if (!equipoVisitanteId) err.equipoVisitanteId = 'Seleccione el equipo visitante';
    if (equipoLocalId && equipoVisitanteId && equipoLocalId === equipoVisitanteId) {
      err.equipos = 'El equipo local y el visitante no pueden ser el mismo';
    }

    if (!canchaId) err.canchaId = 'Seleccione una cancha';
    if (!arbitroId) err.arbitroId = 'Seleccione un árbitro';

    if (!fechaStr || !fechaStr.trim().match(/^\d{4}-\d{2}-\d{2}$/)) {
      err.fecha = 'Formato de fecha inválido (AAAA-MM-DD)';
    }
    if (!horaStr || !horaStr.trim().match(/^\d{2}:\d{2}$/)) {
      err.hora = 'Formato de hora inválido (HH:mm)';
    }

    setErrores(err);
    return Object.keys(err).length === 0;
  };

  const handleGuardar = async () => {
    if (!validar()) {
      const primerError = Object.values(errores)[0] || 'Por favor complete todos los campos requeridos.';
      notificar('Datos Incompletos', primerError);
      return;
    }

    if (!torneoId || !equipoLocalId || !equipoVisitanteId || !canchaId || !arbitroId) {
      notificar(
        'Faltan datos',
        equipos.length < 2
          ? 'El torneo seleccionado necesita al menos 2 equipos registrados.'
          : 'Por favor complete todas las selecciones.'
      );
      return;
    }

    const fechaHoraInicio = `${fechaStr.trim()}T${horaStr.trim()}:00`;

    try {
      setSubmitting(true);
      await onSubmit({
        torneoId,
        numeroFecha: parseInt(numeroFecha, 10),
        equipoLocalId,
        equipoVisitanteId,
        canchaId,
        arbitroId,
        fechaHoraInicio,
      });
      onClose();
    } catch (e: any) {
      notificar('Conflicto / Error', e.message || 'No se pudo programar el partido');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>PROGRAMAR PARTIDO</Text>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Text style={styles.closeBtn}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
            {/* 1. TORNEO */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>1. TORNEO</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizPills}>
                {torneos.map((t) => {
                  const sel = torneoId === t.id;
                  return (
                    <TouchableOpacity
                      key={t.id}
                      style={[styles.pill, sel && styles.pillActive]}
                      onPress={() => setTorneoId(t.id)}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.pillText, sel && styles.pillTextActive]}>
                        {t.nombre}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
              {errores.torneoId ? <Text style={styles.errorText}>{errores.torneoId}</Text> : null}
            </View>

            {/* 2. NÚMERO DE FECHA */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>2. NÚMERO DE FECHA</Text>
              <TextInput
                style={[styles.input, styles.tabularInput, !!errores.numeroFecha && styles.inputError]}
                placeholder="1"
                placeholderTextColor={Theme.text.secondary}
                keyboardType="number-pad"
                value={numeroFecha}
                onChangeText={setNumeroFecha}
              />
              {errores.numeroFecha ? <Text style={styles.errorText}>{errores.numeroFecha}</Text> : null}
            </View>

            {/* 3. EQUIPOS */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>3. ENFRENTAMIENTO</Text>
              {errores.equipos ? <Text style={styles.errorText}>{errores.equipos}</Text> : null}

              {equipos.length < 2 && (
                <View style={styles.warningBox}>
                  <Text style={styles.warningText}>
                    ⚠️ Este torneo tiene {equipos.length} equipo(s). Se requieren al menos 2 equipos.
                  </Text>
                </View>
              )}

              <Text style={styles.subLabel}>🏠 EQUIPO LOCAL</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizPills}>
                {equipos.map((eq) => {
                  const sel = equipoLocalId === eq.id;
                  return (
                    <TouchableOpacity
                      key={`loc-${eq.id}`}
                      style={[styles.pill, sel && styles.pillActive]}
                      onPress={() => setEquipoLocalId(eq.id)}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.pillText, sel && styles.pillTextActive]}>
                        {eq.nombre}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              <Text style={styles.subLabel}>🚌 EQUIPO VISITANTE</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizPills}>
                {equipos.map((eq) => {
                  const sel = equipoVisitanteId === eq.id;
                  return (
                    <TouchableOpacity
                      key={`vis-${eq.id}`}
                      style={[styles.pill, sel && styles.pillActiveAccent]}
                      onPress={() => setEquipoVisitanteId(eq.id)}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.pillText, sel && styles.pillTextActiveAccent]}>
                        {eq.nombre}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* 4. CANCHA */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>4. CANCHA / PREDIO</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizPills}>
                {canchas.map((c) => {
                  const sel = canchaId === c.id;
                  return (
                    <TouchableOpacity
                      key={c.id}
                      style={[styles.pill, sel && styles.pillActive]}
                      onPress={() => setCanchaId(c.id)}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.pillText, sel && styles.pillTextActive]}>
                        🏟️ {c.nombre}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
              {errores.canchaId ? <Text style={styles.errorText}>{errores.canchaId}</Text> : null}
            </View>

            {/* 5. ÁRBITRO */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>5. ÁRBITRO DESIGNADO</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizPills}>
                {arbitros.map((a) => {
                  const sel = arbitroId === a.id;
                  return (
                    <TouchableOpacity
                      key={a.id}
                      style={[styles.pill, sel && styles.pillActive]}
                      onPress={() => setArbitroId(a.id)}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.pillText, sel && styles.pillTextActive]}>
                        🧑‍⚖️ {a.apellido}, {a.nombre}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
              {errores.arbitroId ? <Text style={styles.errorText}>{errores.arbitroId}</Text> : null}
            </View>

            {/* 6. DÍA Y HORA */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>6. DÍA Y HORARIO</Text>
              <View style={styles.row}>
                <View style={{ flex: 1.5 }}>
                  <Text style={styles.subLabel}>FECHA (AAAA-MM-DD)</Text>
                  <TextInput
                    style={[styles.input, styles.tabularInput, !!errores.fecha && styles.inputError]}
                    placeholder="2026-10-31"
                    placeholderTextColor={Theme.text.secondary}
                    value={fechaStr}
                    onChangeText={setFechaStr}
                  />
                  {errores.fecha ? <Text style={styles.errorText}>{errores.fecha}</Text> : null}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.subLabel}>HORA (HH:mm)</Text>
                  <TextInput
                    style={[styles.input, styles.tabularInput, !!errores.hora && styles.inputError]}
                    placeholder="15:00"
                    placeholderTextColor={Theme.text.secondary}
                    value={horaStr}
                    onChangeText={setHoraStr}
                  />
                  {errores.hora ? <Text style={styles.errorText}>{errores.hora}</Text> : null}
                </View>
              </View>
            </View>
          </ScrollView>

          {/* Footer de Acciones */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={onClose}
              disabled={submitting}
            >
              <Text style={styles.cancelBtnText}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.submitBtn, submitting && styles.btnDisabled]}
              onPress={handleGuardar}
              disabled={submitting}
              activeOpacity={0.8}
            >
              <Text style={styles.submitBtnText}>
                {submitting ? 'Programando...' : 'Programar Partido'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Theme.bg.card,
    borderTopLeftRadius: Theme.radius.lg,
    borderTopRightRadius: Theme.radius.lg,
    borderWidth: 1,
    borderColor: Theme.border.subtle,
    maxHeight: '90%',
    padding: Theme.spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.md,
    paddingBottom: Theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Theme.border.subtle,
  },
  title: {
    ...sectionLabelStyle,
    color: Theme.text.primary,
    fontSize: Theme.font.size.md,
  },
  closeBtn: {
    color: Theme.text.secondary,
    fontSize: 20,
    fontWeight: 'bold',
  },
  scroll: {
    paddingBottom: Theme.spacing.md,
    gap: Theme.spacing.md,
  },
  fieldGroup: {
    gap: Theme.spacing.xs,
  },
  label: {
    ...sectionLabelStyle,
    color: Theme.text.secondary,
  },
  subLabel: {
    fontSize: Theme.font.size.xs,
    color: Theme.text.secondary,
    marginTop: 4,
    marginBottom: 2,
    fontWeight: '600',
  },
  horizPills: {
    flexDirection: 'row',
    marginVertical: 4,
  },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: Theme.radius.sm,
    backgroundColor: Theme.bg.input,
    borderWidth: 1,
    borderColor: Theme.border.subtle,
    marginRight: 6,
  },
  pillActive: {
    backgroundColor: Theme.accent.dim,
    borderColor: Theme.border.active,
  },
  pillActiveAccent: {
    backgroundColor: '#2E1065',
    borderColor: '#A855F7',
  },
  pillText: {
    fontSize: Theme.font.size.xs,
    color: Theme.text.secondary,
    fontWeight: Theme.font.weight.semibold,
  },
  pillTextActive: {
    color: Theme.accent.DEFAULT,
  },
  pillTextActiveAccent: {
    color: '#D8B4FE',
  },
  input: {
    backgroundColor: Theme.bg.input,
    borderWidth: 1,
    borderColor: Theme.border.subtle,
    borderRadius: Theme.radius.sm,
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm,
    fontSize: Theme.font.size.md,
    color: Theme.text.primary,
  },
  tabularInput: {
    fontVariant: ['tabular-nums'],
  },
  inputError: {
    borderColor: Theme.border.error,
  },
  errorText: {
    fontSize: Theme.font.size.xs,
    color: Theme.text.error,
  },
  warningBox: {
    backgroundColor: Theme.status.warning.bg,
    borderWidth: 1,
    borderColor: Theme.status.warning.border,
    padding: Theme.spacing.sm,
    borderRadius: Theme.radius.sm,
    marginVertical: 4,
  },
  warningText: {
    color: Theme.status.warning.text,
    fontSize: Theme.font.size.xs,
  },
  row: {
    flexDirection: 'row',
    gap: Theme.spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    gap: Theme.spacing.sm,
    paddingTop: Theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Theme.border.subtle,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: Theme.radius.sm,
    backgroundColor: Theme.bg.input,
    borderWidth: 1,
    borderColor: Theme.border.subtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    color: Theme.text.secondary,
    fontWeight: Theme.font.weight.semibold,
    fontSize: Theme.font.size.sm,
  },
  submitBtn: {
    flex: 2,
    paddingVertical: 12,
    borderRadius: Theme.radius.sm,
    backgroundColor: Theme.accent.DEFAULT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnDisabled: {
    opacity: 0.6,
  },
  submitBtnText: {
    color: '#0A0A0A',
    fontWeight: Theme.font.weight.bold,
    fontSize: Theme.font.size.sm,
  },
});
