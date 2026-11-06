// Pantalla de Gestión de Usuarios — solo ADMIN
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Alert,
  Switch,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import {
  getUsuarios,
  crearUsuario,
  actualizarUsuario,
  desactivarUsuario,
  reactivarUsuario,
  UsuarioResponse,
} from '@/api/usuariosApi';
import { LoadingView, ErrorView, EmptyView } from '@/components/common';
import { UsuarioFormModal } from '@/components/usuarios/UsuarioFormModal';
import { Theme, sectionLabelStyle } from '@/constants/theme';

export default function UsuariosScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const [usuarios, setUsuarios] = useState<UsuarioResponse[]>([]);
  const [soloActivos, setSoloActivos] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [usuarioEditar, setUsuarioEditar] = useState<UsuarioResponse | null>(null);

  // Verificar que es admin
  if (user?.rol !== 'ADMIN') {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.deniedContainer}>
          <Text style={styles.deniedIcon}>🔒</Text>
          <Text style={styles.deniedTitle}>Acceso Denegado</Text>
          <Text style={styles.deniedDesc}>Esta sección es exclusiva para administradores.</Text>
          <TouchableOpacity style={styles.backBtn2} onPress={() => router.back()}>
            <Text style={styles.backBtn2Text}>Volver</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const cargarDatos = useCallback(async () => {
    try {
      setCargando(true);
      setError(null);
      const lista = await getUsuarios();
      setUsuarios(lista);
    } catch (e: any) {
      setError(e.message || 'Error al conectar con el servidor.');
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  const usuariosFiltrados = soloActivos ? usuarios.filter(u => u.activo) : usuarios;

  const handleCrearOEditar = async (data: any) => {
    if (usuarioEditar) {
      await actualizarUsuario(usuarioEditar.id, data);
      Alert.alert('Éxito', 'Usuario actualizado correctamente');
    } else {
      await crearUsuario(data);
      Alert.alert('Éxito', 'Usuario creado correctamente');
    }
    cargarDatos();
  };

  const handleToggleEstado = (u: UsuarioResponse) => {
    if (u.username === user?.username) return; // RN-08
    const accion = u.activo ? 'desactivar' : 'reactivar';
    Alert.alert(
      `Confirmar ${accion}`,
      `¿Seguro que deseas ${accion} al usuario "${u.username}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          style: u.activo ? 'destructive' : 'default',
          onPress: async () => {
            try {
              if (u.activo) await desactivarUsuario(u.id);
              else await reactivarUsuario(u.id);
              cargarDatos();
            } catch (e: any) {
              Alert.alert('Error', e.message || `No se pudo ${accion} el usuario`);
            }
          },
        },
      ]
    );
  };

  const abrirModalCrear = () => { setUsuarioEditar(null); setModalVisible(true); };
  const abrirModalEditar = (u: UsuarioResponse) => { setUsuarioEditar(u); setModalVisible(true); };

  const renderItem = ({ item }: { item: UsuarioResponse }) => {
    const esMismoAdmin = item.username === user?.username;
    return (
      <View style={[styles.card, !item.activo && styles.cardInactivo]}>
        <View style={styles.cardHeader}>
          <View style={styles.cardInfo}>
            <Text style={styles.cardUsername}>@{item.username}</Text>
            <Text style={styles.cardNombre}>{item.nombreCompleto}</Text>
          </View>
          <View style={styles.badgesRow}>
            <View style={[styles.rolBadge, item.rol === 'ADMIN' && styles.rolBadgeAdmin]}>
              <Text style={[styles.rolBadgeText, item.rol === 'ADMIN' && styles.rolBadgeTextAdmin]}>
                {item.rol}
              </Text>
            </View>
            <View style={[styles.estadoBadge, item.activo ? styles.estadoActivo : styles.estadoInactivo]}>
              <Text style={[styles.estadoBadgeText, item.activo ? styles.estadoActivoText : styles.estadoInactivoText]}>
                {item.activo ? 'ACTIVO' : 'INACTIVO'}
              </Text>
            </View>
          </View>
        </View>

        {item.fechaAlta && (
          <Text style={styles.fechaAlta}>
            Alta: {new Date(item.fechaAlta).toLocaleDateString('es-AR')}
          </Text>
        )}

        <View style={styles.cardActions}>
          <TouchableOpacity
            style={styles.editBtn}
            onPress={() => abrirModalEditar(item)}
            activeOpacity={0.7}
          >
            <Text style={styles.editBtnText}>Editar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.toggleBtn,
              item.activo ? styles.deactivateBtn : styles.activateBtn,
              esMismoAdmin && styles.btnDisabled,
            ]}
            onPress={() => handleToggleEstado(item)}
            disabled={esMismoAdmin}
            activeOpacity={0.7}
          >
            <Text style={[styles.toggleBtnText, esMismoAdmin && styles.btnDisabledText]}>
              {item.activo ? 'Desactivar' : 'Reactivar'}
            </Text>
          </TouchableOpacity>
        </View>

        {esMismoAdmin && (
          <Text style={styles.selfProtectionNote}>⚠ No podés desactivarte a vos mismo</Text>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={Theme.bg.base} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtnRow}
          onPress={() => router.back()}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.backArrow}>‹</Text>
          <Text style={styles.backText}>Volver</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Usuarios</Text>
      </View>

      {/* Filtros y acción */}
      <View style={styles.filterSection}>
        <View style={styles.filterHeader}>
          <Text style={styles.filterTitle}>FILTROS</Text>
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Solo activos</Text>
            <Switch
              value={soloActivos}
              onValueChange={setSoloActivos}
              trackColor={{ false: Theme.border.subtle, true: Theme.accent.dim }}
              thumbColor={soloActivos ? Theme.accent.DEFAULT : Theme.text.secondary}
            />
          </View>
        </View>
        <TouchableOpacity style={styles.nuevoBtn} onPress={abrirModalCrear} activeOpacity={0.8}>
          <Text style={styles.nuevoBtnText}>+ NUEVO USUARIO</Text>
        </TouchableOpacity>
      </View>

      {/* Lista */}
      <View style={styles.listContainer}>
        {cargando ? (
          <LoadingView mensaje="Cargando usuarios..." />
        ) : error ? (
          <ErrorView mensaje={error} onRetry={cargarDatos} />
        ) : usuariosFiltrados.length === 0 ? (
          <EmptyView mensaje="No hay usuarios registrados." />
        ) : (
          <FlatList
            data={usuariosFiltrados}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            renderItem={renderItem}
          />
        )}
      </View>

      <UsuarioFormModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSubmit={handleCrearOEditar}
        usuarioEditar={usuarioEditar}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Theme.bg.base },
  deniedContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Theme.spacing.xl, gap: Theme.spacing.md },
  deniedIcon: { fontSize: 48 },
  deniedTitle: { fontSize: Theme.font.size.xxl, fontWeight: Theme.font.weight.bold, color: Theme.text.primary },
  deniedDesc: { fontSize: Theme.font.size.sm, color: Theme.text.secondary, textAlign: 'center' },
  backBtn2: { marginTop: Theme.spacing.md, paddingHorizontal: Theme.spacing.xl, paddingVertical: Theme.spacing.sm, backgroundColor: Theme.accent.DEFAULT, borderRadius: Theme.radius.sm },
  backBtn2Text: { color: '#0A0A0A', fontWeight: Theme.font.weight.bold },
  header: {
    paddingHorizontal: Theme.spacing.lg,
    paddingTop: Theme.spacing.sm,
    paddingBottom: Theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Theme.border.subtle,
  },
  backBtnRow: { flexDirection: 'row', alignItems: 'center', marginBottom: Theme.spacing.xs, alignSelf: 'flex-start' },
  backArrow: { color: Theme.accent.DEFAULT, fontSize: 22, lineHeight: 22, marginRight: 4, fontWeight: '300' },
  backText: { color: Theme.accent.DEFAULT, fontSize: Theme.font.size.sm, fontWeight: Theme.font.weight.semibold },
  headerTitle: { fontSize: Theme.font.size.xxl, fontWeight: Theme.font.weight.bold, color: Theme.text.primary, letterSpacing: Theme.font.letterSpacing.tight },
  filterSection: {
    backgroundColor: Theme.bg.card,
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: Theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Theme.border.subtle,
    gap: Theme.spacing.sm,
  },
  filterHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  filterTitle: { ...sectionLabelStyle, color: Theme.text.secondary },
  switchRow: { flexDirection: 'row', alignItems: 'center', gap: Theme.spacing.xs },
  switchLabel: { fontSize: Theme.font.size.xs, color: Theme.text.secondary },
  nuevoBtn: { backgroundColor: Theme.accent.DEFAULT, paddingVertical: 10, borderRadius: Theme.radius.sm, alignItems: 'center', justifyContent: 'center', marginTop: Theme.spacing.xs },
  nuevoBtnText: { color: '#0A0A0A', fontWeight: Theme.font.weight.black, fontSize: Theme.font.size.xs, letterSpacing: Theme.font.letterSpacing.wide },
  listContainer: { flex: 1, backgroundColor: Theme.bg.base },
  list: { padding: Theme.spacing.md, gap: Theme.spacing.md },
  card: {
    backgroundColor: Theme.bg.card,
    borderRadius: Theme.radius.md,
    borderWidth: 1,
    borderColor: Theme.border.subtle,
    padding: Theme.spacing.md,
    gap: Theme.spacing.sm,
  },
  cardInactivo: { opacity: 0.65 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: Theme.spacing.sm },
  cardInfo: { flex: 1, gap: 2 },
  cardUsername: { fontSize: Theme.font.size.md, fontWeight: Theme.font.weight.bold, color: Theme.accent.DEFAULT },
  cardNombre: { fontSize: Theme.font.size.sm, color: Theme.text.primary },
  badgesRow: { flexDirection: 'row', gap: Theme.spacing.xs, flexWrap: 'wrap', justifyContent: 'flex-end' },
  rolBadge: {
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: Theme.radius.pill,
    backgroundColor: Theme.bg.input, borderWidth: 1, borderColor: Theme.border.subtle,
  },
  rolBadgeAdmin: { backgroundColor: Theme.accent.dim, borderColor: Theme.border.active },
  rolBadgeText: { fontSize: Theme.font.size.xs, color: Theme.text.secondary, fontWeight: Theme.font.weight.bold },
  rolBadgeTextAdmin: { color: Theme.accent.DEFAULT },
  estadoBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: Theme.radius.pill, borderWidth: 1 },
  estadoActivo: { backgroundColor: Theme.status.success.bg, borderColor: Theme.status.success.border },
  estadoInactivo: { backgroundColor: Theme.status.danger.bg, borderColor: Theme.status.danger.border },
  estadoBadgeText: { fontSize: Theme.font.size.xs, fontWeight: Theme.font.weight.bold },
  estadoActivoText: { color: Theme.status.success.text },
  estadoInactivoText: { color: Theme.status.danger.text },
  fechaAlta: { fontSize: Theme.font.size.xs, color: Theme.text.secondary },
  cardActions: { flexDirection: 'row', gap: Theme.spacing.sm, marginTop: Theme.spacing.xs },
  editBtn: {
    flex: 1, paddingVertical: 8, borderRadius: Theme.radius.sm,
    backgroundColor: Theme.bg.input, borderWidth: 1, borderColor: Theme.border.subtle,
    alignItems: 'center',
  },
  editBtnText: { color: Theme.text.primary, fontSize: Theme.font.size.sm, fontWeight: Theme.font.weight.semibold },
  toggleBtn: { flex: 1, paddingVertical: 8, borderRadius: Theme.radius.sm, alignItems: 'center', borderWidth: 1 },
  deactivateBtn: { backgroundColor: Theme.status.danger.bg, borderColor: Theme.status.danger.border },
  activateBtn: { backgroundColor: Theme.status.success.bg, borderColor: Theme.status.success.border },
  btnDisabled: { opacity: 0.4 },
  toggleBtnText: { fontSize: Theme.font.size.sm, fontWeight: Theme.font.weight.semibold, color: Theme.text.primary },
  btnDisabledText: { color: Theme.text.secondary },
  selfProtectionNote: { fontSize: Theme.font.size.xs, color: Theme.text.warning, fontStyle: 'italic' },
});
