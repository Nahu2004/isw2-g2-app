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
} from 'react-native';
import {
  getTorneos,
  crearTorneo,
  getCanchas,
  crearCancha,
  getArbitros,
  crearArbitro,
} from '@/api/catalogosApi';
import { Torneo, Cancha, Arbitro } from '@/api/types';
import { Card, Button, InputField, LoadingView, ErrorView, EmptyView } from '@/components/common';

type SeccionActiva = 'torneos' | 'canchas' | 'arbitros';

export default function CatalogosScreen() {
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

  // Handler Guardar Torneo
  const handleCrearTorneo = async () => {
    if (!nombreTorneo.trim() || !anioTorneo.trim()) {
      Alert.alert('Validación', 'El nombre y el año del torneo son obligatorios');
      return;
    }
    try {
      setSubmitting(true);
      await crearTorneo({
        nombre: nombreTorneo.trim(),
        anio: parseInt(anioTorneo, 10),
      });
      Alert.alert('Éxito', 'Torneo registrado correctamente');
      setModalTorneo(false);
      setNombreTorneo('');
      cargarDatos();
    } catch (e: any) {
      Alert.alert('Error', e.message || 'No se pudo crear el torneo');
    } finally {
      setSubmitting(false);
    }
  };

  // Handler Guardar Cancha
  const handleCrearCancha = async () => {
    if (!nombreCancha.trim() || !dirCancha.trim()) {
      Alert.alert('Validación', 'El nombre de la cancha y su dirección son obligatorios');
      return;
    }
    try {
      setSubmitting(true);
      await crearCancha({
        nombre: nombreCancha.trim(),
        direccion: dirCancha.trim(),
      });
      Alert.alert('Éxito', 'Cancha registrada correctamente');
      setModalCancha(false);
      setNombreCancha('');
      setDirCancha('');
      cargarDatos();
    } catch (e: any) {
      Alert.alert('Error', e.message || 'No se pudo crear la cancha');
    } finally {
      setSubmitting(false);
    }
  };

  // Handler Guardar Árbitro
  const handleCrearArbitro = async () => {
    if (!nombreArbitro.trim() || !apellidoArbitro.trim() || !dniArbitro.trim()) {
      Alert.alert('Validación', 'Todos los campos del árbitro son obligatorios');
      return;
    }
    try {
      setSubmitting(true);
      await crearArbitro({
        nombre: nombreArbitro.trim(),
        apellido: apellidoArbitro.trim(),
        dni: dniArbitro.trim(),
      });
      Alert.alert('Éxito', 'Árbitro registrado en el colegio');
      setModalArbitro(false);
      setNombreArbitro('');
      setApellidoArbitro('');
      setDniArbitro('');
      cargarDatos();
    } catch (e: any) {
      Alert.alert('Error', e.message || 'No se pudo crear el árbitro');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Selector de Pestañas / Segmentos */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tabButton, seccion === 'torneos' && styles.tabButtonActive]}
          onPress={() => setSeccion('torneos')}
        >
          <Text style={[styles.tabText, seccion === 'torneos' && styles.tabTextActive]}>
            🏆 Torneos ({torneos.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, seccion === 'canchas' && styles.tabButtonActive]}
          onPress={() => setSeccion('canchas')}
        >
          <Text style={[styles.tabText, seccion === 'canchas' && styles.tabTextActive]}>
            🏟️ Canchas ({canchas.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, seccion === 'arbitros' && styles.tabButtonActive]}
          onPress={() => setSeccion('arbitros')}
        >
          <Text style={[styles.tabText, seccion === 'arbitros' && styles.tabTextActive]}>
            🧑‍⚖️ Árbitros ({arbitros.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Botón de Acción según Sección */}
      <View style={styles.actionHeader}>
        {seccion === 'torneos' && (
          <Button
            title="+ Nuevo Torneo"
            onPress={() => setModalTorneo(true)}
            style={styles.btnAdd}
          />
        )}
        {seccion === 'canchas' && (
          <Button
            title="+ Registrar Cancha"
            onPress={() => setModalCancha(true)}
            style={styles.btnAdd}
          />
        )}
        {seccion === 'arbitros' && (
          <Button
            title="+ Registrar Árbitro"
            onPress={() => setModalArbitro(true)}
            style={styles.btnAdd}
          />
        )}
      </View>

      {/* 3 Estados de Cátedra */}
      {cargando ? (
        <LoadingView mensaje="Cargando catálogos oficiales..." />
      ) : error ? (
        <ErrorView mensaje={error} onRetry={cargarDatos} />
      ) : (
        <View style={styles.content}>
          {/* SECCIÓN TORNEOS */}
          {seccion === 'torneos' && (
            torneos.length === 0 ? (
              <EmptyView mensaje="No hay torneos creados aún." />
            ) : (
              <FlatList
                data={torneos}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                  <Card style={styles.card}>
                    <View style={styles.cardHeader}>
                      <Text style={styles.cardTitle}>🏆 {item.nombre}</Text>
                      <View style={[styles.badge, item.activo ? styles.badgeGreen : styles.badgeRed]}>
                        <Text style={styles.badgeText}>{item.activo ? 'ACTIVO' : 'CERRADO'}</Text>
                      </View>
                    </View>
                    <Text style={styles.cardDetail}>Temporada / Año: {item.anio}</Text>
                  </Card>
                )}
              />
            )
          )}

          {/* SECCIÓN CANCHAS */}
          {seccion === 'canchas' && (
            canchas.length === 0 ? (
              <EmptyView mensaje="No hay canchas registradas." />
            ) : (
              <FlatList
                data={canchas}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                  <Card style={styles.card}>
                    <View style={styles.cardHeader}>
                      <Text style={styles.cardTitle}>🏟️ {item.nombre}</Text>
                      <View style={[styles.badge, item.activo ? styles.badgeGreen : styles.badgeRed]}>
                        <Text style={styles.badgeText}>{item.activo ? 'HABILITADA' : 'INACTIVA'}</Text>
                      </View>
                    </View>
                    <Text style={styles.cardDetail}>📍 Dirección: {item.direccion}</Text>
                  </Card>
                )}
              />
            )
          )}

          {/* SECCIÓN ÁRBITROS */}
          {seccion === 'arbitros' && (
            arbitros.length === 0 ? (
              <EmptyView mensaje="No hay árbitros colegiados." />
            ) : (
              <FlatList
                data={arbitros}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                  <Card style={styles.card}>
                    <View style={styles.cardHeader}>
                      <Text style={styles.cardTitle}>
                        🧑‍⚖️ {item.apellido}, {item.nombre}
                      </Text>
                      <View style={[styles.badge, item.activo ? styles.badgeGreen : styles.badgeRed]}>
                        <Text style={styles.badgeText}>{item.activo ? 'DISPONIBLE' : 'INACTIVO'}</Text>
                      </View>
                    </View>
                    <Text style={styles.cardDetail}>🪪 DNI: {item.dni}</Text>
                  </Card>
                )}
              />
            )
          )}
        </View>
      )}

      {/* MODAL CREAR TORNEO */}
      <Modal visible={modalTorneo} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBody}>
            <Text style={styles.modalHeading}>🏆 Crear Nuevo Torneo</Text>
            <InputField
              label="Nombre del Torneo"
              placeholder="Ej: Torneo Clausura 2026"
              value={nombreTorneo}
              onChangeText={setNombreTorneo}
            />
            <InputField
              label="Año / Edición"
              placeholder="Ej: 2026"
              keyboardType="numeric"
              maxLength={4}
              value={anioTorneo}
              onChangeText={setAnioTorneo}
            />
            <View style={styles.modalActions}>
              <Button
                title="Cancelar"
                variant="secondary"
                onPress={() => setModalTorneo(false)}
                style={styles.btnAction}
                disabled={submitting}
              />
              <Button
                title="Crear"
                onPress={handleCrearTorneo}
                style={styles.btnAction}
                loading={submitting}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* MODAL CREAR CANCHA */}
      <Modal visible={modalCancha} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBody}>
            <Text style={styles.modalHeading}>🏟️ Registrar Cancha</Text>
            <InputField
              label="Nombre del Predio / Cancha"
              placeholder="Ej: Cancha 1 - Predio UNL"
              value={nombreCancha}
              onChangeText={setNombreCancha}
            />
            <InputField
              label="Dirección"
              placeholder="Ej: Costanera Este s/n"
              value={dirCancha}
              onChangeText={setDirCancha}
            />
            <View style={styles.modalActions}>
              <Button
                title="Cancelar"
                variant="secondary"
                onPress={() => setModalCancha(false)}
                style={styles.btnAction}
                disabled={submitting}
              />
              <Button
                title="Registrar"
                onPress={handleCrearCancha}
                style={styles.btnAction}
                loading={submitting}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* MODAL CREAR ÁRBITRO */}
      <Modal visible={modalArbitro} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBody}>
            <Text style={styles.modalHeading}>🧑‍⚖️ Registrar Árbitro</Text>
            <InputField
              label="Nombre"
              placeholder="Ej: Federico"
              value={nombreArbitro}
              onChangeText={setNombreArbitro}
            />
            <InputField
              label="Apellido"
              placeholder="Ej: Beligoy"
              value={apellidoArbitro}
              onChangeText={setApellidoArbitro}
            />
            <InputField
              label="DNI"
              placeholder="Ej: 27123456"
              keyboardType="numeric"
              value={dniArbitro}
              onChangeText={setDniArbitro}
            />
            <View style={styles.modalActions}>
              <Button
                title="Cancelar"
                variant="secondary"
                onPress={() => setModalArbitro(false)}
                style={styles.btnAction}
                disabled={submitting}
              />
              <Button
                title="Registrar"
                onPress={handleCrearArbitro}
                style={styles.btnAction}
                loading={submitting}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    padding: 6,
    borderBottomWidth: 1,
    borderColor: '#e2e8f0',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabButtonActive: {
    backgroundColor: '#0284c7',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748b',
  },
  tabTextActive: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  actionHeader: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  btnAdd: {
    backgroundColor: '#f59e0b',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  card: {
    padding: 14,
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0f172a',
    flex: 1,
  },
  cardDetail: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 2,
  },
  badge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeGreen: {
    backgroundColor: '#dcfce7',
  },
  badgeRed: {
    backgroundColor: '#fee2e2',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#166534',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalBody: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
  },
  modalHeading: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  btnAction: {
    flex: 1,
  },
});
