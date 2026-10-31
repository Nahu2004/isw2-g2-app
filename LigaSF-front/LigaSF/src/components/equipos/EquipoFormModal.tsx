// Modal de alta y edición de equipo — diseño premium oscuro
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
} from 'react-native';
import { Theme, sectionLabelStyle } from '@/constants/theme';
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
      // Ignorar
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
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>
              {equipoEditar ? 'EDITAR EQUIPO' : 'NUEVO EQUIPO'}
            </Text>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Text style={styles.closeBtn}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
            {/* Input Nombre */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>NOMBRE DEL EQUIPO</Text>
              <TextInput
                style={[styles.input, !!errores.nombre && styles.inputError]}
                placeholder="Ej: Defensores de Belgrano"
                placeholderTextColor={Theme.text.secondary}
                value={nombre}
                onChangeText={setNombre}
                autoCapitalize="words"
              />
              {errores.nombre ? <Text style={styles.errorText}>{errores.nombre}</Text> : null}
            </View>

            {/* Input Barrio */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>BARRIO / SEDE</Text>
              <TextInput
                style={[styles.input, !!errores.barrio && styles.inputError]}
                placeholder="Ej: Candioti Sur"
                placeholderTextColor={Theme.text.secondary}
                value={barrio}
                onChangeText={setBarrio}
                autoCapitalize="words"
              />
              {errores.barrio ? <Text style={styles.errorText}>{errores.barrio}</Text> : null}
            </View>

            {/* Selector de Torneo */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>TORNEO ACTIVO</Text>
              <View style={styles.torneosList}>
                {torneos.map((t) => {
                  const seleccionado = torneoId === t.id;
                  return (
                    <TouchableOpacity
                      key={t.id}
                      style={[
                        styles.torneoItem,
                        seleccionado && styles.torneoItemActivo,
                      ]}
                      onPress={() => setTorneoId(t.id)}
                      activeOpacity={0.7}
                    >
                      <View style={[styles.radioCircle, seleccionado && styles.radioCircleActivo]}>
                        {seleccionado && <View style={styles.radioDot} />}
                      </View>
                      <Text
                        style={[
                          styles.torneoItemText,
                          seleccionado && styles.torneoItemTextActivo,
                        ]}
                      >
                        {t.nombre} ({t.anio})
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
              {errores.torneoId ? <Text style={styles.errorText}>{errores.torneoId}</Text> : null}
            </View>
          </ScrollView>

          {/* Botones de acción */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={onClose}
              disabled={submitting}
            >
              <Text style={styles.cancelBtnText}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.submitBtn, submitting && styles.submitBtnDisabled]}
              onPress={handleGuardar}
              disabled={submitting}
              activeOpacity={0.8}
            >
              <Text style={styles.submitBtnText}>
                {submitting ? 'Guardando...' : equipoEditar ? 'Guardar Cambios' : 'Registrar Equipo'}
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
  inputError: {
    borderColor: Theme.border.error,
  },
  errorText: {
    fontSize: Theme.font.size.xs,
    color: Theme.text.error,
  },
  torneosList: {
    gap: Theme.spacing.xs,
  },
  torneoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.bg.input,
    padding: Theme.spacing.sm,
    borderRadius: Theme.radius.sm,
    borderWidth: 1,
    borderColor: Theme.border.subtle,
    gap: Theme.spacing.sm,
  },
  torneoItemActivo: {
    borderColor: Theme.border.active,
    backgroundColor: Theme.accent.dim,
  },
  radioCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: Theme.border.subtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleActivo: {
    borderColor: Theme.accent.DEFAULT,
  },
  radioDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Theme.accent.DEFAULT,
  },
  torneoItemText: {
    fontSize: Theme.font.size.sm,
    color: Theme.text.secondary,
  },
  torneoItemTextActivo: {
    color: Theme.text.primary,
    fontWeight: Theme.font.weight.bold,
  },
  footer: {
    flexDirection: 'row',
    gap: Theme.spacing.sm,
    marginTop: Theme.spacing.sm,
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
  submitBtnDisabled: {
    opacity: 0.6,
  },
  submitBtnText: {
    color: '#0A0A0A',
    fontWeight: Theme.font.weight.bold,
    fontSize: Theme.font.size.sm,
  },
});
