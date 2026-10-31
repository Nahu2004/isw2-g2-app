// Modal de alta y edición de Jugador — diseño premium oscuro
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
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>
              {jugadorEditar ? 'EDITAR JUGADOR' : 'REGISTRAR JUGADOR'}
            </Text>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Text style={styles.closeBtn}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
            {/* Nombre y Apellido en 2 columnas */}
            <View style={styles.row}>
              <View style={[styles.fieldGroup, { flex: 1 }]}>
                <Text style={styles.label}>NOMBRE</Text>
                <TextInput
                  style={[styles.input, !!errores.nombre && styles.inputError]}
                  placeholder="Ej: Lionel"
                  placeholderTextColor={Theme.text.secondary}
                  value={nombre}
                  onChangeText={setNombre}
                  autoCapitalize="words"
                />
                {errores.nombre ? <Text style={styles.errorText}>{errores.nombre}</Text> : null}
              </View>

              <View style={[styles.fieldGroup, { flex: 1 }]}>
                <Text style={styles.label}>APELLIDO</Text>
                <TextInput
                  style={[styles.input, !!errores.apellido && styles.inputError]}
                  placeholder="Ej: Messi"
                  placeholderTextColor={Theme.text.secondary}
                  value={apellido}
                  onChangeText={setApellido}
                  autoCapitalize="words"
                />
                {errores.apellido ? <Text style={styles.errorText}>{errores.apellido}</Text> : null}
              </View>
            </View>

            {/* DNI y Camiseta */}
            <View style={styles.row}>
              <View style={[styles.fieldGroup, { flex: 1.5 }]}>
                <Text style={styles.label}>DNI</Text>
                <TextInput
                  style={[styles.input, !!errores.dni && styles.inputError]}
                  placeholder="Ej: 38123456"
                  placeholderTextColor={Theme.text.secondary}
                  value={dni}
                  onChangeText={setDni}
                  keyboardType="numeric"
                />
                {errores.dni ? <Text style={styles.errorText}>{errores.dni}</Text> : null}
              </View>

              <View style={[styles.fieldGroup, { flex: 1 }]}>
                <Text style={styles.label}>DORSAL (1-99)</Text>
                <TextInput
                  style={[styles.input, !!errores.numeroCamiseta && styles.inputError, styles.tabularInput]}
                  placeholder="Ej: 10"
                  placeholderTextColor={Theme.text.secondary}
                  value={numeroCamiseta}
                  onChangeText={setNumeroCamiseta}
                  keyboardType="number-pad"
                  maxLength={2}
                />
                {errores.numeroCamiseta ? (
                  <Text style={styles.errorText}>{errores.numeroCamiseta}</Text>
                ) : null}
              </View>
            </View>

            {/* Selector de Equipo */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>EQUIPO DEL PLANTEL</Text>
              <View style={styles.equiposList}>
                {equipos.map((eq) => {
                  const seleccionado = equipoId === eq.id;
                  return (
                    <TouchableOpacity
                      key={eq.id}
                      style={[
                        styles.equipoItem,
                        seleccionado && styles.equipoItemActivo,
                      ]}
                      onPress={() => setEquipoId(eq.id)}
                      activeOpacity={0.7}
                    >
                      <View style={[styles.radioCircle, seleccionado && styles.radioCircleActivo]}>
                        {seleccionado && <View style={styles.radioDot} />}
                      </View>
                      <Text
                        style={[
                          styles.equipoItemText,
                          seleccionado && styles.equipoItemTextActivo,
                        ]}
                      >
                        {eq.nombre}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
              {errores.equipoId ? <Text style={styles.errorText}>{errores.equipoId}</Text> : null}
            </View>
          </ScrollView>

          {/* Footer */}
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
                {submitting ? 'Guardando...' : jugadorEditar ? 'Guardar Cambios' : 'Fichar Jugador'}
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
  row: {
    flexDirection: 'row',
    gap: Theme.spacing.sm,
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
  tabularInput: {
    fontVariant: ['tabular-nums'],
    textAlign: 'center',
    fontWeight: '700',
  },
  inputError: {
    borderColor: Theme.border.error,
  },
  errorText: {
    fontSize: Theme.font.size.xs,
    color: Theme.text.error,
  },
  equiposList: {
    gap: Theme.spacing.xs,
  },
  equipoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.bg.input,
    padding: Theme.spacing.sm,
    borderRadius: Theme.radius.sm,
    borderWidth: 1,
    borderColor: Theme.border.subtle,
    gap: Theme.spacing.sm,
  },
  equipoItemActivo: {
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
  equipoItemText: {
    fontSize: Theme.font.size.sm,
    color: Theme.text.secondary,
  },
  equipoItemTextActivo: {
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
