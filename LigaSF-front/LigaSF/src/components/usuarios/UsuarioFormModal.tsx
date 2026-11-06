// Modal de alta y edición de usuario — diseño premium oscuro
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
import { UsuarioResponse } from '@/api/usuariosApi';

interface UsuarioFormModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: { nombreCompleto: string; rol: 'ADMIN' | 'DELEGADO'; username?: string; password?: string }) => Promise<void>;
  usuarioEditar?: UsuarioResponse | null;
}

export const UsuarioFormModal: React.FC<UsuarioFormModalProps> = ({
  visible,
  onClose,
  onSubmit,
  usuarioEditar,
}) => {
  const [username, setUsername] = useState('');
  const [nombreCompleto, setNombreCompleto] = useState('');
  const [password, setPassword] = useState('');
  const [rol, setRol] = useState<'ADMIN' | 'DELEGADO'>('DELEGADO');
  const [submitting, setSubmitting] = useState(false);
  const [errores, setErrores] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (visible) {
      if (usuarioEditar) {
        setNombreCompleto(usuarioEditar.nombreCompleto);
        setRol(usuarioEditar.rol);
        setUsername(usuarioEditar.username);
        setPassword('');
      } else {
        setUsername('');
        setNombreCompleto('');
        setPassword('');
        setRol('DELEGADO');
      }
      setErrores({});
    }
  }, [visible, usuarioEditar]);

  const validar = () => {
    const err: { [key: string]: string } = {};
    if (!usuarioEditar && !username.trim()) err.username = 'El username es obligatorio';
    if (!nombreCompleto.trim()) err.nombreCompleto = 'El nombre completo es obligatorio';
    if (!usuarioEditar && password.length < 8) err.password = 'La contraseña debe tener al menos 8 caracteres';
    if (usuarioEditar && password && password.length < 8) err.password = 'La contraseña debe tener al menos 8 caracteres';
    setErrores(err);
    return Object.keys(err).length === 0;
  };

  const handleGuardar = async () => {
    if (!validar()) return;
    try {
      setSubmitting(true);
      const payload: any = { nombreCompleto: nombreCompleto.trim(), rol };
      if (!usuarioEditar) {
        payload.username = username.trim().toLowerCase();
        payload.password = password;
      } else if (password) {
        payload.password = password;
      }
      await onSubmit(payload);
      onClose();
    } catch (e: any) {
      Alert.alert('Error', e.message || 'No se pudo guardar el usuario');
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
              {usuarioEditar ? 'EDITAR USUARIO' : 'NUEVO USUARIO'}
            </Text>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Text style={styles.closeBtn}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
            {/* Username — solo en creación */}
            {!usuarioEditar && (
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>USERNAME</Text>
                <TextInput
                  style={[styles.input, !!errores.username && styles.inputError]}
                  placeholder="Ej: delegado_norte"
                  placeholderTextColor={Theme.text.secondary}
                  value={username}
                  onChangeText={setUsername}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                {errores.username ? <Text style={styles.errorText}>{errores.username}</Text> : null}
                <Text style={styles.hint}>El username no puede modificarse una vez creado.</Text>
              </View>
            )}

            {/* Nombre Completo */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>NOMBRE COMPLETO</Text>
              <TextInput
                style={[styles.input, !!errores.nombreCompleto && styles.inputError]}
                placeholder="Ej: Juan González"
                placeholderTextColor={Theme.text.secondary}
                value={nombreCompleto}
                onChangeText={setNombreCompleto}
                autoCapitalize="words"
              />
              {errores.nombreCompleto ? <Text style={styles.errorText}>{errores.nombreCompleto}</Text> : null}
            </View>

            {/* Contraseña */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>{usuarioEditar ? 'NUEVA CONTRASEÑA (opcional)' : 'CONTRASEÑA'}</Text>
              <TextInput
                style={[styles.input, !!errores.password && styles.inputError]}
                placeholder={usuarioEditar ? 'Dejar vacío para no cambiar' : 'Mínimo 8 caracteres'}
                placeholderTextColor={Theme.text.secondary}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
              />
              {errores.password ? <Text style={styles.errorText}>{errores.password}</Text> : null}
            </View>

            {/* Selector de Rol */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>ROL</Text>
              <View style={styles.rolRow}>
                {(['DELEGADO', 'ADMIN'] as const).map((r) => {
                  const seleccionado = rol === r;
                  return (
                    <TouchableOpacity
                      key={r}
                      style={[styles.rolItem, seleccionado && styles.rolItemActivo]}
                      onPress={() => setRol(r)}
                      activeOpacity={0.7}
                    >
                      <View style={[styles.radioCircle, seleccionado && styles.radioCircleActivo]}>
                        {seleccionado && <View style={styles.radioDot} />}
                      </View>
                      <Text style={[styles.rolItemText, seleccionado && styles.rolItemTextActivo]}>{r}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </ScrollView>

          {/* Botones */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose} disabled={submitting}>
              <Text style={styles.cancelBtnText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.submitBtn, submitting && styles.submitBtnDisabled]}
              onPress={handleGuardar}
              disabled={submitting}
              activeOpacity={0.8}
            >
              <Text style={styles.submitBtnText}>
                {submitting ? 'Guardando...' : usuarioEditar ? 'Guardar Cambios' : 'Crear Usuario'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'flex-end' },
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
  title: { ...sectionLabelStyle, color: Theme.text.primary, fontSize: Theme.font.size.md },
  closeBtn: { color: Theme.text.secondary, fontSize: 20, fontWeight: 'bold' },
  scroll: { paddingBottom: Theme.spacing.md, gap: Theme.spacing.md },
  fieldGroup: { gap: Theme.spacing.xs },
  label: { ...sectionLabelStyle, color: Theme.text.secondary },
  hint: { fontSize: Theme.font.size.xs, color: Theme.text.secondary, fontStyle: 'italic' },
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
  inputError: { borderColor: Theme.border.error },
  errorText: { fontSize: Theme.font.size.xs, color: Theme.text.error },
  rolRow: { flexDirection: 'row', gap: Theme.spacing.sm },
  rolItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.bg.input,
    padding: Theme.spacing.sm,
    borderRadius: Theme.radius.sm,
    borderWidth: 1,
    borderColor: Theme.border.subtle,
    gap: Theme.spacing.sm,
  },
  rolItemActivo: { borderColor: Theme.border.active, backgroundColor: Theme.accent.dim },
  radioCircle: {
    width: 18, height: 18, borderRadius: 9,
    borderWidth: 2, borderColor: Theme.border.subtle,
    alignItems: 'center', justifyContent: 'center',
  },
  radioCircleActivo: { borderColor: Theme.accent.DEFAULT },
  radioDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Theme.accent.DEFAULT },
  rolItemText: { fontSize: Theme.font.size.sm, color: Theme.text.secondary },
  rolItemTextActivo: { color: Theme.text.primary, fontWeight: Theme.font.weight.bold },
  footer: {
    flexDirection: 'row', gap: Theme.spacing.sm,
    marginTop: Theme.spacing.sm, paddingTop: Theme.spacing.sm,
    borderTopWidth: 1, borderTopColor: Theme.border.subtle,
  },
  cancelBtn: {
    flex: 1, paddingVertical: 12, borderRadius: Theme.radius.sm,
    backgroundColor: Theme.bg.input, borderWidth: 1, borderColor: Theme.border.subtle,
    alignItems: 'center', justifyContent: 'center',
  },
  cancelBtnText: { color: Theme.text.secondary, fontWeight: Theme.font.weight.semibold, fontSize: Theme.font.size.sm },
  submitBtn: {
    flex: 2, paddingVertical: 12, borderRadius: Theme.radius.sm,
    backgroundColor: Theme.accent.DEFAULT, alignItems: 'center', justifyContent: 'center',
  },
  submitBtnDisabled: { opacity: 0.6 },
  submitBtnText: { color: '#0A0A0A', fontWeight: Theme.font.weight.bold, fontSize: Theme.font.size.sm },
});
