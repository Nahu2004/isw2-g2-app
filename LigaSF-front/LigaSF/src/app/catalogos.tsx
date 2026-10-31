// Pantalla de Catálogos (Torneos, Canchas, Árbitros)
// Diseño Premium Oscuro alineado a LigaSF (Theme)

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Modal,
  Alert,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  TextInput,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  getTorneos,
  crearTorneo,
  getCanchas,
  crearCancha,
  getArbitros,
  crearArbitro,
} from '@/api/catalogosApi';
import { Torneo, Cancha, Arbitro } from '@/api/types';
import { LoadingView, ErrorView, EmptyView } from '@/components/common';
import { Theme, sectionLabelStyle } from '@/constants/theme';

type SeccionActiva = 'torneos' | 'canchas' | 'arbitros';

interface TabItem {
  id: SeccionActiva;
  label: string;
  icon: string;
}

const TABS: TabItem[] = [
  { id: 'torneos', label: 'TORNEOS', icon: '🏆' },
  { id: 'canchas', label: 'CANCHAS', icon: '🏟️' },
  { id: 'arbitros', label: 'ÁRBITROS', icon: '🧑‍⚖️' },
];

export default function CatalogosScreen() {
  const router = useRouter();
  const [seccion, setSeccion] = useState<SeccionActiva>('torneos');

  // Datos
  const [torneos, setTorneos] = useState<Torneo[]>([]);
  const [canchas, setCanchas] = useState<Cancha[]>([]);
  const [arbitros, setArbitros] = useState<Arbitro[]>([]);

  // Feedback
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modales
  const [modalTorneo, setModalTorneo] = useState(false);
  const [modalCancha, setModalCancha] = useState(false);
  const [modalArbitro, setModalArbitro] = useState(false);

  // Inputs Form Torneo
  const [nombreTorneo, setNombreTorneo] = useState('');
  const [anioTorneo, setAnioTorneo] = useState(new Date().getFullYear().toString());

  // Inputs Form Cancha
  const [nombreCancha, setNombreCancha] = useState('');
  const [dirCancha, setDirCancha] = useState('');

  // Inputs Form Arbitro
  const [nombreArbitro, setNombreArbitro] = useState('');
  const [apellidoArbitro, setApellidoArbitro] = useState('');
  const [dniArbitro, setDniArbitro] = useState('');

  const [submitting, setSubmitting] = useState(false);

  const cargarDatos = useCallback(async () => {
    try {
      setCargando(true);
      setError(null);
      const [listaTorneos, listaCanchas, listaArbitros] = await Promise.all([
        getTorneos(false),
        getCanchas(false),
        getArbitros(false),
      ]);
      setTorneos(listaTorneos);
      setCanchas(listaCanchas);
      setArbitros(listaArbitros);
    } catch (e: any) {
      setError(e.message || 'Error al obtener catálogos.');
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  const notificar = (titulo: string, mensaje: string) => {
    if (Platform.OS === 'web') {
      window.alert(`${titulo}: ${mensaje}`);
    } else {
      Alert.alert(titulo, mensaje);
    }
  };

  // Handler Guardar Torneo
  const handleCrearTorneo = async () => {
    if (!nombreTorneo.trim() || !anioTorneo.trim()) {
      notificar('Validación', 'El nombre y el año del torneo son obligatorios');
      return;
    }
    try {
      setSubmitting(true);
      await crearTorneo({
        nombre: nombreTorneo.trim(),
        anio: parseInt(anioTorneo, 10),
      });
      notificar('Éxito', 'Torneo registrado correctamente');
      setModalTorneo(false);
      setNombreTorneo('');
      cargarDatos();
    } catch (e: any) {
      notificar('Error', e.message || 'No se pudo crear el torneo');
    } finally {
      setSubmitting(false);
    }
  };

  // Handler Guardar Cancha
  const handleCrearCancha = async () => {
    if (!nombreCancha.trim() || !dirCancha.trim()) {
      notificar('Validación', 'El nombre de la cancha y su dirección son obligatorios');
      return;
    }
    try {
      setSubmitting(true);
      await crearCancha({
        nombre: nombreCancha.trim(),
        direccion: dirCancha.trim(),
      });
      notificar('Éxito', 'Cancha registrada correctamente');
      setModalCancha(false);
      setNombreCancha('');
      setDirCancha('');
      cargarDatos();
    } catch (e: any) {
      notificar('Error', e.message || 'No se pudo crear la cancha');
    } finally {
      setSubmitting(false);
    }
  };

  // Handler Guardar Árbitro
  const handleCrearArbitro = async () => {
    if (!nombreArbitro.trim() || !apellidoArbitro.trim() || !dniArbitro.trim()) {
      notificar('Validación', 'Todos los campos del árbitro son obligatorios');
      return;
    }
    try {
      setSubmitting(true);
      await crearArbitro({
        nombre: nombreArbitro.trim(),
        apellido: apellidoArbitro.trim(),
        dni: dniArbitro.trim(),
      });
      notificar('Éxito', 'Árbitro registrado en el colegio');
      setModalArbitro(false);
      setNombreArbitro('');
      setApellidoArbitro('');
      setDniArbitro('');
      cargarDatos();
    } catch (e: any) {
      notificar('Error', e.message || 'No se pudo crear el árbitro');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={Theme.bg.base} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.backArrow}>‹</Text>
          <Text style={styles.backText}>Volver</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Catálogos Oficiales</Text>
      </View>

      {/* Selector de pestañas */}
      <View style={styles.tabsBar}>
        {TABS.map((tab) => {
          const activo = seccion === tab.id;
          const cantidad =
            tab.id === 'torneos'
              ? torneos.length
              : tab.id === 'canchas'
              ? canchas.length
              : arbitros.length;

          return (
            <TouchableOpacity
              key={tab.id}
              style={[styles.tabItem, activo && styles.tabItemActivo]}
              onPress={() => setSeccion(tab.id)}
              activeOpacity={0.7}
            >
              <Text style={[styles.tabLabel, activo && styles.tabLabelActivo]}>
                {tab.icon} {tab.label} ({cantidad})
              </Text>
              {activo && <View style={styles.tabIndicator} />}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Botón de acción */}
      <View style={styles.actionSection}>
        {seccion === 'torneos' && (
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => setModalTorneo(true)}
            activeOpacity={0.8}
          >
            <Text style={styles.actionBtnText}>+ NUEVO TORNEO</Text>
          </TouchableOpacity>
        )}
        {seccion === 'canchas' && (
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => setModalCancha(true)}
            activeOpacity={0.8}
          >
            <Text style={styles.actionBtnText}>+ REGISTRAR CANCHA</Text>
          </TouchableOpacity>
        )}
        {seccion === 'arbitros' && (
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => setModalArbitro(true)}
            activeOpacity={0.8}
          >
            <Text style={styles.actionBtnText}>+ REGISTRAR ÁRBITRO</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Listas con Estados */}
      <View style={styles.listContainer}>
        {cargando ? (
          <LoadingView mensaje="Cargando catálogos oficiales..." />
        ) : error ? (
          <ErrorView mensaje={error} onRetry={cargarDatos} />
        ) : (
          <View style={styles.content}>
            {/* SECCIÓN TORNEOS */}
            {seccion === 'torneos' &&
              (torneos.length === 0 ? (
                <EmptyView mensaje="No hay torneos registrados aún." />
              ) : (
                <FlatList
                  data={torneos}
                  keyExtractor={(item) => item.id.toString()}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={styles.listPadding}
                  renderItem={({ item }) => (
                    <View style={styles.card}>
                      <View
                        style={[
                          styles.franja,
                          {
                            backgroundColor: item.activo
                              ? Theme.status.success.text
                              : Theme.status.neutral.text,
                          },
                        ]}
                      />
                      <View style={styles.cardBody}>
                        <View style={styles.cardHeader}>
                          <Text style={styles.cardTitle}>🏆 {item.nombre}</Text>
                          <View
                            style={[
                              styles.badge,
                              item.activo ? styles.badgeSuccess : styles.badgeNeutral,
                            ]}
                          >
                            <Text
                              style={[
                                styles.badgeText,
                                item.activo ? styles.badgeTextSuccess : styles.badgeTextNeutral,
                              ]}
                            >
                              {item.activo ? 'ACTIVO' : 'CERRADO'}
                            </Text>
                          </View>
                        </View>
                        <Text style={styles.cardMeta}>
                          Temporada / Edición: <Text style={styles.cardHighlight}>{item.anio}</Text>
                        </Text>
                      </View>
                    </View>
                  )}
                />
              ))}

            {/* SECCIÓN CANCHAS */}
            {seccion === 'canchas' &&
              (canchas.length === 0 ? (
                <EmptyView mensaje="No hay canchas registradas." />
              ) : (
                <FlatList
                  data={canchas}
                  keyExtractor={(item) => item.id.toString()}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={styles.listPadding}
                  renderItem={({ item }) => (
                    <View style={styles.card}>
                      <View
                        style={[
                          styles.franja,
                          {
                            backgroundColor: item.activo
                              ? Theme.status.success.text
                              : Theme.status.neutral.text,
                          },
                        ]}
                      />
                      <View style={styles.cardBody}>
                        <View style={styles.cardHeader}>
                          <Text style={styles.cardTitle}>🏟️ {item.nombre}</Text>
                          <View
                            style={[
                              styles.badge,
                              item.activo ? styles.badgeSuccess : styles.badgeNeutral,
                            ]}
                          >
                            <Text
                              style={[
                                styles.badgeText,
                                item.activo ? styles.badgeTextSuccess : styles.badgeTextNeutral,
                              ]}
                            >
                              {item.activo ? 'HABILITADA' : 'INACTIVA'}
                            </Text>
                          </View>
                        </View>
                        <Text style={styles.cardMeta}>📍 Dirección: {item.direccion}</Text>
                      </View>
                    </View>
                  )}
                />
              ))}

            {/* SECCIÓN ÁRBITROS */}
            {seccion === 'arbitros' &&
              (arbitros.length === 0 ? (
                <EmptyView mensaje="No hay árbitros colegiados." />
              ) : (
                <FlatList
                  data={arbitros}
                  keyExtractor={(item) => item.id.toString()}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={styles.listPadding}
                  renderItem={({ item }) => (
                    <View style={styles.card}>
                      <View
                        style={[
                          styles.franja,
                          {
                            backgroundColor: item.activo
                              ? Theme.status.success.text
                              : Theme.status.neutral.text,
                          },
                        ]}
                      />
                      <View style={styles.cardBody}>
                        <View style={styles.cardHeader}>
                          <Text style={styles.cardTitle}>
                            🧑‍⚖️ {item.apellido}, {item.nombre}
                          </Text>
                          <View
                            style={[
                              styles.badge,
                              item.activo ? styles.badgeSuccess : styles.badgeNeutral,
                            ]}
                          >
                            <Text
                              style={[
                                styles.badgeText,
                                item.activo ? styles.badgeTextSuccess : styles.badgeTextNeutral,
                              ]}
                            >
                              {item.activo ? 'DISPONIBLE' : 'INACTIVO'}
                            </Text>
                          </View>
                        </View>
                        <Text style={styles.cardMeta}>
                          🪪 DNI: <Text style={styles.cardHighlight}>{item.dni}</Text>
                        </Text>
                      </View>
                    </View>
                  )}
                />
              ))}
          </View>
        )}
      </View>

      {/* MODAL CREAR TORNEO */}
      <Modal visible={modalTorneo} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>NUEVO TORNEO</Text>
              <TouchableOpacity onPress={() => setModalTorneo(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>NOMBRE DEL TORNEO</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ej: Apertura 2026"
                  placeholderTextColor={Theme.text.secondary}
                  value={nombreTorneo}
                  onChangeText={setNombreTorneo}
                />
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>AÑO / TEMPORADA</Text>
                <TextInput
                  style={[styles.input, styles.tabularInput]}
                  placeholder="2026"
                  placeholderTextColor={Theme.text.secondary}
                  keyboardType="numeric"
                  maxLength={4}
                  value={anioTorneo}
                  onChangeText={setAnioTorneo}
                />
              </View>
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setModalTorneo(false)}
                disabled={submitting}
              >
                <Text style={styles.cancelBtnText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.submitBtn, submitting && styles.btnDisabled]}
                onPress={handleCrearTorneo}
                disabled={submitting}
              >
                <Text style={styles.submitBtnText}>
                  {submitting ? 'Guardando...' : 'Crear Torneo'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* MODAL CREAR CANCHA */}
      <Modal visible={modalCancha} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>REGISTRAR CANCHA</Text>
              <TouchableOpacity onPress={() => setModalCancha(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>NOMBRE DEL PREDIO O CANCHA</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ej: Cancha Municipal Norte"
                  placeholderTextColor={Theme.text.secondary}
                  value={nombreCancha}
                  onChangeText={setNombreCancha}
                />
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>DIRECCIÓN</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ej: Av. Blas Parera 7400"
                  placeholderTextColor={Theme.text.secondary}
                  value={dirCancha}
                  onChangeText={setDirCancha}
                />
              </View>
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setModalCancha(false)}
                disabled={submitting}
              >
                <Text style={styles.cancelBtnText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.submitBtn, submitting && styles.btnDisabled]}
                onPress={handleCrearCancha}
                disabled={submitting}
              >
                <Text style={styles.submitBtnText}>
                  {submitting ? 'Guardando...' : 'Registrar Cancha'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* MODAL CREAR ÁRBITRO */}
      <Modal visible={modalArbitro} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>REGISTRAR ÁRBITRO</Text>
              <TouchableOpacity onPress={() => setModalArbitro(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <View style={styles.row}>
                <View style={[styles.fieldGroup, { flex: 1 }]}>
                  <Text style={styles.fieldLabel}>NOMBRE</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Ej: Marcelo"
                    placeholderTextColor={Theme.text.secondary}
                    value={nombreArbitro}
                    onChangeText={setNombreArbitro}
                  />
                </View>
                <View style={[styles.fieldGroup, { flex: 1 }]}>
                  <Text style={styles.fieldLabel}>APELLIDO</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Ej: Quiroga"
                    placeholderTextColor={Theme.text.secondary}
                    value={apellidoArbitro}
                    onChangeText={setApellidoArbitro}
                  />
                </View>
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>DNI</Text>
                <TextInput
                  style={[styles.input, styles.tabularInput]}
                  placeholder="Ej: 28111222"
                  placeholderTextColor={Theme.text.secondary}
                  keyboardType="numeric"
                  value={dniArbitro}
                  onChangeText={setDniArbitro}
                />
              </View>
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setModalArbitro(false)}
                disabled={submitting}
              >
                <Text style={styles.cancelBtnText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.submitBtn, submitting && styles.btnDisabled]}
                onPress={handleCrearArbitro}
                disabled={submitting}
              >
                <Text style={styles.submitBtnText}>
                  {submitting ? 'Guardando...' : 'Registrar Árbitro'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Theme.bg.base,
  },
  header: {
    paddingHorizontal: Theme.spacing.lg,
    paddingTop: Theme.spacing.sm,
    paddingBottom: Theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Theme.border.subtle,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Theme.spacing.xs,
    alignSelf: 'flex-start',
  },
  backArrow: {
    color: Theme.accent.DEFAULT,
    fontSize: 22,
    lineHeight: 22,
    marginRight: 4,
    fontWeight: '300',
  },
  backText: {
    color: Theme.accent.DEFAULT,
    fontSize: Theme.font.size.sm,
    fontWeight: Theme.font.weight.semibold,
  },
  headerTitle: {
    fontSize: Theme.font.size.xxl,
    fontWeight: Theme.font.weight.bold,
    color: Theme.text.primary,
    letterSpacing: Theme.font.letterSpacing.tight,
  },
  tabsBar: {
    flexDirection: 'row',
    backgroundColor: Theme.bg.card,
    borderBottomWidth: 1,
    borderBottomColor: Theme.border.subtle,
  },
  tabItem: {
    flex: 1,
    paddingVertical: Theme.spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  tabItemActivo: {
    backgroundColor: Theme.bg.card,
  },
  tabLabel: {
    ...sectionLabelStyle,
    color: Theme.text.secondary,
    fontSize: Theme.font.size.xs,
  },
  tabLabelActivo: {
    color: Theme.accent.DEFAULT,
    fontWeight: Theme.font.weight.bold,
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: Theme.accent.DEFAULT,
  },
  actionSection: {
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: Theme.spacing.sm,
    backgroundColor: Theme.bg.card,
    borderBottomWidth: 1,
    borderBottomColor: Theme.border.subtle,
  },
  actionBtn: {
    backgroundColor: Theme.accent.DEFAULT,
    paddingVertical: 10,
    borderRadius: Theme.radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnText: {
    color: '#0A0A0A',
    fontWeight: Theme.font.weight.black,
    fontSize: Theme.font.size.xs,
    letterSpacing: Theme.font.letterSpacing.wide,
  },
  listContainer: {
    flex: 1,
    backgroundColor: Theme.bg.base,
  },
  content: {
    flex: 1,
  },
  listPadding: {
    padding: Theme.spacing.md,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: Theme.bg.card,
    borderRadius: Theme.radius.md,
    borderWidth: 1,
    borderColor: Theme.border.subtle,
    marginBottom: Theme.spacing.sm,
    overflow: 'hidden',
  },
  franja: {
    width: 3,
  },
  cardBody: {
    flex: 1,
    padding: Theme.spacing.md,
    gap: Theme.spacing.xs,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: Theme.font.size.md,
    fontWeight: Theme.font.weight.bold,
    color: Theme.text.primary,
  },
  badge: {
    paddingHorizontal: Theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: Theme.radius.sm,
    borderWidth: 1,
  },
  badgeSuccess: {
    backgroundColor: Theme.status.success.bg,
    borderColor: Theme.status.success.border,
  },
  badgeNeutral: {
    backgroundColor: Theme.status.neutral.bg,
    borderColor: Theme.status.neutral.border,
  },
  badgeText: {
    fontSize: Theme.font.size.xs,
    fontWeight: Theme.font.weight.bold,
    letterSpacing: Theme.font.letterSpacing.wide,
  },
  badgeTextSuccess: {
    color: Theme.status.success.text,
  },
  badgeTextNeutral: {
    color: Theme.status.neutral.text,
  },
  cardMeta: {
    fontSize: Theme.font.size.xs,
    color: Theme.text.secondary,
  },
  cardHighlight: {
    color: Theme.text.accent,
    fontWeight: Theme.font.weight.semibold,
    fontVariant: ['tabular-nums'],
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: Theme.bg.card,
    borderTopLeftRadius: Theme.radius.lg,
    borderTopRightRadius: Theme.radius.lg,
    borderWidth: 1,
    borderColor: Theme.border.subtle,
    padding: Theme.spacing.lg,
    gap: Theme.spacing.md,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: Theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Theme.border.subtle,
  },
  modalTitle: {
    ...sectionLabelStyle,
    color: Theme.text.primary,
    fontSize: Theme.font.size.md,
  },
  modalClose: {
    color: Theme.text.secondary,
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalBody: {
    gap: Theme.spacing.sm,
  },
  fieldGroup: {
    gap: Theme.spacing.xs,
  },
  fieldLabel: {
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
  },
  row: {
    flexDirection: 'row',
    gap: Theme.spacing.sm,
  },
  modalFooter: {
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
