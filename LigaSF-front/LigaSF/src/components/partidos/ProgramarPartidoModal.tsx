import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { InputField, Button } from '@/components/common';
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
  // Datos para selectores
  const [torneos, setTorneos] = useState<Torneo[]>([]);
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [canchas, setCanchas] = useState<Cancha[]>([]);
  const [arbitros, setArbitros] = useState<Arbitro[]>([]);

  // Campos del formulario
  const [torneoId, setTorneoId] = useState<number | null>(null);
  const [numeroFecha, setNumeroFecha] = useState('1');
  const [equipoLocalId, setEquipoLocalId] = useState<number | null>(null);
  const [equipoVisitanteId, setEquipoVisitanteId] = useState<number | null>(null);
  const [canchaId, setCanchaId] = useState<number | null>(null);
  const [arbitroId, setArbitroId] = useState<number | null>(null);
  
  // Fecha y hora (formato ISO YYYY-MM-DDTHH:mm:00)
  const [fechaStr, setFechaStr] = useState('2026-11-01');
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

      const targetTorneoId = torneoIdDefault || (listaTorneos.length > 0 ? listaTorneos[0].id : null);
      if (targetTorneoId) setTorneoId(targetTorneoId);
      if (listaCanchas.length > 0) setCanchaId(listaCanchas[0].id);
      if (listaArbitros.length > 0) setArbitroId(listaArbitros[0].id);
    } catch {
      // Ignorar si falla la precarga
    }
  };

  const cargarEquiposDelTorneo = async (tId: number) => {
    try {
      const listaEquipos = await getEquipos(tId, true);
      setEquipos(listaEquipos);
      if (listaEquipos.length >= 2) {
        setEquipoLocalId(listaEquipos[0].id);
        setEquipoVisitanteId(listaEquipos[1].id);
      } else {
        setEquipoLocalId(null);
        setEquipoVisitanteId(null);
      }
    } catch {
      setEquipos([]);
    }
  };

  const validar = () => {
    const err: { [key: string]: string } = {};
    if (!torneoId) err.torneoId = 'Seleccione un torneo';
    
    const numF = parseInt(numeroFecha, 10);
    if (isNaN(numF) || numF < 1) err.numeroFecha = 'La fecha debe ser ≥ 1';

    if (!equipoLocalId) err.equipoLocalId = 'Seleccione equipo local';
    if (!equipoVisitanteId) err.equipoVisitanteId = 'Seleccione equipo visitante';
    if (equipoLocalId && equipoVisitanteId && equipoLocalId === equipoVisitanteId) {
      err.equipos = 'El equipo local y visitante no pueden ser el mismo';
    }

    if (!canchaId) err.canchaId = 'Seleccione una cancha';
    if (!arbitroId) err.arbitroId = 'Seleccione un árbitro';

    if (!fechaStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
      err.fecha = 'Formato de fecha inválido (debe ser AAAA-MM-DD)';
    }
    if (!horaStr.match(/^\d{2}:\d{2}$/)) {
      err.hora = 'Formato de hora inválido (debe ser HH:mm)';
    }

    setErrores(err);
    return Object.keys(err).length === 0;
  };

  const handleGuardar = async () => {
    if (!validar() || !torneoId || !equipoLocalId || !equipoVisitanteId || !canchaId || !arbitroId) return;

    const fechaHoraInicio = `${fechaStr}T${horaStr}:00`;

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
      Alert.alert('Conflicto / Error de Programación', e.message || 'No se pudo programar el partido.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>⚽ Programar Nuevo Partido</Text>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* TORNEO */}
            <Text style={styles.label}>1. Torneo:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizPills}>
              {torneos.map((t) => (
                <TouchableOpacity
                  key={t.id}
                  style={[styles.pill, torneoId === t.id && styles.pillActive]}
                  onPress={() => setTorneoId(t.id)}
                >
                  <Text style={[styles.pillText, torneoId === t.id && styles.pillTextActive]}>
                    {t.nombre}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* NÚMERO DE FECHA */}
            <InputField
              label="2. Número de Fecha:"
              placeholder="Ej: 1"
              keyboardType="number-pad"
              value={numeroFecha}
              onChangeText={setNumeroFecha}
              error={errores.numeroFecha}
            />

            {/* ENFRENTAMIENTO */}
            <Text style={styles.label}>3. Equipos del Encuentro:</Text>
            {errores.equipos ? <Text style={styles.errorText}>{errores.equipos}</Text> : null}

            <Text style={styles.subLabel}>🏠 Equipo Local:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizPills}>
              {equipos.map((eq) => (
                <TouchableOpacity
                  key={`loc-${eq.id}`}
                  style={[styles.pill, equipoLocalId === eq.id && styles.pillActive]}
                  onPress={() => setEquipoLocalId(eq.id)}
                >
                  <Text style={[styles.pillText, equipoLocalId === eq.id && styles.pillTextActive]}>
                    {eq.nombre}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.subLabel}>🚌 Equipo Visitante:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizPills}>
              {equipos.map((eq) => (
                <TouchableOpacity
                  key={`vis-${eq.id}`}
                  style={[styles.pill, equipoVisitanteId === eq.id && styles.pillActiveVisitante]}
                  onPress={() => setEquipoVisitanteId(eq.id)}
                >
                  <Text style={[styles.pillText, equipoVisitanteId === eq.id && styles.pillTextActive]}>
                    {eq.nombre}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* CANCHA */}
            <Text style={styles.label}>4. Cancha / Predio:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizPills}>
              {canchas.map((c) => (
                <TouchableOpacity
                  key={c.id}
                  style={[styles.pill, canchaId === c.id && styles.pillActive]}
                  onPress={() => setCanchaId(c.id)}
                >
                  <Text style={[styles.pillText, canchaId === c.id && styles.pillTextActive]}>
                    🏟️ {c.nombre}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* ÁRBITRO */}
            <Text style={styles.label}>5. Árbitro Designado:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizPills}>
              {arbitros.map((a) => (
                <TouchableOpacity
                  key={a.id}
                  style={[styles.pill, arbitroId === a.id && styles.pillActive]}
                  onPress={() => setArbitroId(a.id)}
                >
                  <Text style={[styles.pillText, arbitroId === a.id && styles.pillTextActive]}>
                    🧑‍⚖️ {a.apellido}, {a.nombre}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* FECHA Y HORA */}
            <Text style={styles.label}>6. Día y Horario:</Text>
            <View style={styles.row}>
              <View style={styles.flex1}>
                <InputField
                  label="Fecha (AAAA-MM-DD)"
                  placeholder="2026-11-01"
                  value={fechaStr}
                  onChangeText={setFechaStr}
                  error={errores.fecha}
                />
              </View>
              <View style={styles.flex1}>
                <InputField
                  label="Hora (HH:mm)"
                  placeholder="15:00"
                  value={horaStr}
                  onChangeText={setHoraStr}
                  error={errores.hora}
                />
              </View>
            </View>

            <View style={styles.actions}>
              <Button
                title="Cancelar"
                variant="secondary"
                onPress={onClose}
                style={styles.actionBtn}
                disabled={submitting}
              />
              <Button
                title="Programar Partido"
                onPress={handleGuardar}
                style={styles.actionBtn}
                loading={submitting}
              />
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    padding: 16,
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 18,
    maxHeight: '90%',
  },
  title: {
    fontSize: 19,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 12,
    textAlign: 'center',
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1e293b',
    marginTop: 8,
    marginBottom: 6,
  },
  subLabel: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '600',
    marginTop: 4,
    marginBottom: 4,
  },
  horizPills: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 16,
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginRight: 6,
  },
  pillActive: {
    backgroundColor: '#0284c7',
    borderColor: '#0284c7',
  },
  pillActiveVisitante: {
    backgroundColor: '#8b5cf6',
    borderColor: '#8b5cf6',
  },
  pillText: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '600',
  },
  pillTextActive: {
    color: '#ffffff',
  },
  errorText: {
    color: '#dc2626',
    fontSize: 12,
    marginBottom: 4,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  flex1: {
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
    marginBottom: 8,
  },
  actionBtn: {
    flex: 1,
  },
});
