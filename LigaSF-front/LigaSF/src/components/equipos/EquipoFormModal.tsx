import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  Alert,
} from 'react-native';
import { InputField, Button } from '@/components/common';
import { Torneo, Equipo } from '@/api/types';
import { getTorneos } from '@/api/catalogosApi';

interface EquipoFormModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: { torneoId: number; nombre: string; barrio: string }) => Promise<void>;
  equipoEditar?: Equipo | null;
}

export const EquipoFormModal: React.FC<EquipoFormModalProps> = ({
  visible,
  onClose,
  onSubmit,
  equipoEditar,
}) => {
  const [nombre, setNombre] = useState('');
  const [barrio, setBarrio] = useState('');
  const [torneoId, setTorneoId] = useState<number | null>(null);
  const [torneos, setTorneos] = useState<Torneo[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [errores, setErrores] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (visible) {
      cargarTorneos();
      if (equipoEditar) {
        setNombre(equipoEditar.nombre);
        setBarrio(equipoEditar.barrio);
        setTorneoId(equipoEditar.torneoId);
      } else {
        setNombre('');
        setBarrio('');
      }
      setErrores({});
    }
  }, [visible, equipoEditar]);

  const cargarTorneos = async () => {
    try {
      const data = await getTorneos(true);
      setTorneos(data);
      if (!equipoEditar && data.length > 0) {
        setTorneoId(data[0].id);
      }
    } catch {
      // Ignorar o mantener torneos vacíos
    }
  };

  const validar = () => {
    const err: { [key: string]: string } = {};
    if (!nombre.trim()) err.nombre = 'El nombre del equipo es obligatorio';
    if (!barrio.trim()) err.barrio = 'El barrio es obligatorio';
    if (!torneoId) err.torneoId = 'Debe seleccionar un torneo';
    setErrores(err);
    return Object.keys(err).length === 0;
  };

  const handleGuardar = async () => {
    if (!validar() || !torneoId) return;
    try {
      setSubmitting(true);
      await onSubmit({
        torneoId,
        nombre: nombre.trim(),
        barrio: barrio.trim(),
      });
      onClose();
    } catch (e: any) {
      Alert.alert('Error', e.message || 'No se pudo guardar el equipo');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>
            {equipoEditar ? 'Editar Equipo' : 'Nuevo Equipo'}
          </Text>

          <ScrollView showsVerticalScrollIndicator={false}>
            <InputField
              label="Nombre del Equipo"
              placeholder="Ej: Defensores de Belgrano"
              value={nombre}
              onChangeText={setNombre}
              error={errores.nombre}
            />

            <InputField
              label="Barrio / Localidad"
              placeholder="Ej: Barrio Candioti"
              value={barrio}
              onChangeText={setBarrio}
              error={errores.barrio}
            />

            <View style={styles.torneoSection}>
              <Text style={styles.sectionLabel}>Torneo asignado:</Text>
              {torneos.map((t) => {
                const seleccionado = torneoId === t.id;
                return (
                  <Button
                    key={t.id}
                    title={`${t.nombre} (${t.anio})`}
                    variant={seleccionado ? 'primary' : 'outline'}
                    style={styles.torneoItemButton}
                    onPress={() => setTorneoId(t.id)}
                  />
                );
              })}
              {errores.torneoId ? (
                <Text style={styles.errorText}>{errores.torneoId}</Text>
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
                title={equipoEditar ? 'Actualizar' : 'Crear'}
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
  torneoSection: {
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 8,
  },
  torneoItemButton: {
    marginBottom: 6,
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
