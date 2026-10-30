import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, ScrollView, Alert } from 'react-native';
import { InputField, Button } from '@/components/common';
import { Jugador, Equipo } from '@/api/types';
import { getEquipos } from '@/api/equiposApi';

interface JugadorFormModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: {
    equipoId: number;
    nombre: string;
    apellido: string;
    dni: string;
    numeroCamiseta: number;
  }) => Promise<void>;
  jugadorEditar?: Jugador | null;
  equipoIdDefault?: number;
}

export const JugadorFormModal: React.FC<JugadorFormModalProps> = ({
  visible,
  onClose,
  onSubmit,
  jugadorEditar,
  equipoIdDefault,
}) => {
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [dni, setDni] = useState('');
  const [numeroCamiseta, setNumeroCamiseta] = useState('');
  const [equipoId, setEquipoId] = useState<number | null>(null);
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [errores, setErrores] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (visible) {
      cargarEquipos();
      if (jugadorEditar) {
        setNombre(jugadorEditar.nombre);
        setApellido(jugadorEditar.apellido);
        setDni(jugadorEditar.dni);
        setNumeroCamiseta(jugadorEditar.numeroCamiseta.toString());
        setEquipoId(jugadorEditar.equipoId);
      } else {
        setNombre('');
        setApellido('');
        setDni('');
        setNumeroCamiseta('');
        setEquipoId(equipoIdDefault || null);
      }
      setErrores({});
    }
  }, [visible, jugadorEditar, equipoIdDefault]);

  const cargarEquipos = async () => {
    try {
      const data = await getEquipos(undefined, true);
      setEquipos(data);
      if (!jugadorEditar && !equipoIdDefault && data.length > 0) {
        setEquipoId(data[0].id);
      }
    } catch {
      // Ignorar si falla
    }
  };

  const validar = () => {
    const err: { [key: string]: string } = {};
    if (!nombre.trim()) err.nombre = 'El nombre es obligatorio';
    if (!apellido.trim()) err.apellido = 'El apellido es obligatorio';
    if (!dni.trim()) err.dni = 'El DNI es obligatorio';
    
    const num = parseInt(numeroCamiseta, 10);
    if (isNaN(num) || num < 1 || num > 99) {
      err.numeroCamiseta = 'El dorsal debe ser entre 1 y 99';
    }

    if (!equipoId) {
      err.equipoId = 'Debe seleccionar un equipo';
    }

    setErrores(err);
    return Object.keys(err).length === 0;
  };

  const handleGuardar = async () => {
    if (!validar() || !equipoId) return;
    try {
      setSubmitting(true);
      await onSubmit({
        equipoId,
        nombre: nombre.trim(),
        apellido: apellido.trim(),
        dni: dni.trim(),
        numeroCamiseta: parseInt(numeroCamiseta, 10),
      });
      onClose();
    } catch (e: any) {
      Alert.alert('Error', e.message || 'No se pudo guardar el jugador');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>
            {jugadorEditar ? 'Editar Jugador' : 'Nuevo Jugador'}
          </Text>

          <ScrollView showsVerticalScrollIndicator={false}>
            <InputField
              label="Nombre"
              placeholder="Ej: Lionel"
              value={nombre}
              onChangeText={setNombre}
              error={errores.nombre}
            />

            <InputField
              label="Apellido"
              placeholder="Ej: Messi"
              value={apellido}
              onChangeText={setApellido}
              error={errores.apellido}
            />

            <InputField
              label="DNI"
              placeholder="Ej: 38456123"
              keyboardType="numeric"
              value={dni}
              onChangeText={setDni}
              error={errores.dni}
            />

            <InputField
              label="Número de Camiseta (1 - 99)"
              placeholder="Ej: 10"
              keyboardType="number-pad"
              maxLength={2}
              value={numeroCamiseta}
              onChangeText={setNumeroCamiseta}
              error={errores.numeroCamiseta}
            />

            <View style={styles.equipoSection}>
              <Text style={styles.sectionLabel}>Equipo del jugador:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizScroll}>
                {equipos.map((eq) => {
                  const sel = equipoId === eq.id;
                  return (
                    <Button
                      key={eq.id}
                      title={eq.nombre}
                      variant={sel ? 'primary' : 'outline'}
                      style={styles.pillEquipo}
                      onPress={() => setEquipoId(eq.id)}
                    />
                  );
                })}
              </ScrollView>
              {errores.equipoId ? (
                <Text style={styles.errorText}>{errores.equipoId}</Text>
              ) : null}
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
                title={jugadorEditar ? 'Actualizar' : 'Guardar'}
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
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    maxHeight: '85%',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 16,
    textAlign: 'center',
  },
  equipoSection: {
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 8,
  },
  horizScroll: {
    flexDirection: 'row',
  },
  pillEquipo: {
    marginRight: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  errorText: {
    color: '#dc2626',
    fontSize: 12,
    marginTop: 4,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  actionBtn: {
    flex: 1,
  },
});
