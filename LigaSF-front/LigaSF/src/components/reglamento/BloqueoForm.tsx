// Formulario de verificación de bloqueo — diseño premium oscuro
// Flujo en cascada: torneo → equipo → jugador → fecha → verificar

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
} from 'react-native';

import { Theme, sectionLabelStyle, cardStyle } from '@/constants/theme';
import { getTorneos } from '@/api/catalogosApi';
import { getEquipos } from '@/api/equiposApi';
import { getJugadores } from '@/api/jugadoresApi';
import { consultarBloqueoJugador } from '@/api/reglamentoApi';
import type { Torneo, Equipo, Jugador, BloqueoResponse } from '@/api/types';
import { BloqueoCard } from './BloqueoCard';

// ─── Chip selector horizontal genérico ───────────────────────────────────────

interface ChipListProps<T> {
  label: string;
  items: T[];
  seleccionado: number | null;
  getId:     (item: T) => number;
  getNombre: (item: T) => string;
  onSelect:  (id: number) => void;
  disabled?: boolean;
}

function ChipList<T>({
  label, items, seleccionado, getId, getNombre, onSelect, disabled = false,
}: ChipListProps<T>) {
  return (
    <View style={[styles.fieldGroup, disabled && styles.fieldDisabled]}>
      <Text style={styles.fieldLabel}>{label}</Text>
      {items.length === 0 ? (
        <Text style={styles.emptyHint}>
          {disabled ? 'Completá el paso anterior' : '—'}
        </Text>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => String(getId(item))}
          horizontal
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => {
            const id    = getId(item);
            const activo = seleccionado === id;
            return (
              <TouchableOpacity
                style={[styles.chip, activo && styles.chipActivo]}
                onPress={() => !disabled && onSelect(id)}
                activeOpacity={disabled ? 1 : 0.7}
              >
                <Text style={[styles.chipText, activo && styles.chipTextActivo]}>
                  {getNombre(item)}
                </Text>
              </TouchableOpacity>
            );
          }}
          contentContainerStyle={styles.chipsRow}
        />
      )}
    </View>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────

export const BloqueoForm: React.FC = () => {
  const [torneos,  setTorneos]  = useState<Torneo[]>([]);
  const [equipos,  setEquipos]  = useState<Equipo[]>([]);
  const [jugadores,setJugadores]= useState<Jugador[]>([]);

  const [torneoId,  setTorneoId]  = useState<number | null>(null);
  const [equipoId,  setEquipoId]  = useState<number | null>(null);
  const [jugadorId, setJugadorId] = useState<number | null>(null);
  const [fecha,     setFecha]     = useState<string>('');

  const [resultado, setResultado] = useState<BloqueoResponse | null>(null);
  const [cargando,  setCargando]  = useState(false);
  const [error,     setError]     = useState<string | null>(null);

  useEffect(() => {
    getTorneos(false).then(setTorneos).catch(() => setError('No se pudieron cargar los torneos.'));
  }, []);

  useEffect(() => {
    if (!torneoId) return;
    setEquipos([]); setEquipoId(null);
    setJugadores([]); setJugadorId(null);
    setResultado(null);
    getEquipos(torneoId)
      .then(setEquipos)
      .catch(() => setError('No se pudieron cargar los equipos.'));
  }, [torneoId]);

  useEffect(() => {
    if (!equipoId) return;
    setJugadores([]); setJugadorId(null); setResultado(null);
    getJugadores(equipoId)
      .then(setJugadores)
      .catch(() => setError('No se pudieron cargar los jugadores.'));
  }, [equipoId]);

  const handleVerificar = async () => {
    const numFecha = parseInt(fecha, 10);
    if (!jugadorId || !torneoId || !fecha || isNaN(numFecha) || numFecha < 1) {
      setError('Completá todos los campos antes de verificar.');
      return;
    }
    setError(null);
    setCargando(true);
    setResultado(null);
    try {
      const res = await consultarBloqueoJugador(jugadorId, torneoId, numFecha);
      setResultado(res);
    } catch (e: any) {
      setError(e?.message || 'Error al verificar el bloqueo.');
    } finally {
      setCargando(false);
    }
  };

  const jugadorSeleccionado = jugadores.find((j) => j.id === jugadorId);
  const puedeVerificar = !!jugadorId && !!fecha && !cargando;

  return (
    <View style={styles.container}>

      <Text style={styles.description}>
        Verificá si un jugador puede ser alineado. Un jugador suspendido está
        bloqueado aunque el equipo intente inscribirlo.
      </Text>

      {/* Paso 1 */}
      <ChipList
        label="1 · TORNEO"
        items={torneos}
        seleccionado={torneoId}
        getId={(t) => t.id}
        getNombre={(t) => `${t.nombre} ${t.anio}`}
        onSelect={(id) => { setTorneoId(id); setError(null); }}
      />

      {/* Paso 2 */}
      <ChipList
        label="2 · EQUIPO"
        items={equipos}
        seleccionado={equipoId}
        getId={(e) => e.id}
        getNombre={(e) => e.nombre}
        onSelect={(id) => { setEquipoId(id); setError(null); }}
        disabled={!torneoId}
      />

      {/* Paso 3 */}
      <ChipList
        label="3 · JUGADOR"
        items={jugadores}
        seleccionado={jugadorId}
        getId={(j) => j.id}
        getNombre={(j) => `${j.nombre} ${j.apellido}`}
        onSelect={(id) => { setJugadorId(id); setResultado(null); setError(null); }}
        disabled={!equipoId}
      />

      {/* Paso 4: fecha */}
      <View style={[styles.fieldGroup, !jugadorId && styles.fieldDisabled]}>
        <Text style={styles.fieldLabel}>4 · NÚMERO DE FECHA</Text>
        <TextInput
          style={styles.input}
          value={fecha}
          onChangeText={(v) => {
            setFecha(v.replace(/[^0-9]/g, ''));
            setResultado(null);
          }}
          placeholder="Ej: 7"
          placeholderTextColor={Theme.text.secondary}
          keyboardType="number-pad"
          maxLength={3}
          returnKeyType="done"
          editable={!!jugadorId}
        />
      </View>

      {/* Error */}
      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      {/* Botón */}
      <TouchableOpacity
        style={[styles.btn, !puedeVerificar && styles.btnDisabled]}
        onPress={handleVerificar}
        disabled={!puedeVerificar}
        activeOpacity={0.8}
      >
        <Text style={styles.btnText}>
          {cargando ? 'VERIFICANDO...' : 'VERIFICAR BLOQUEO'}
        </Text>
      </TouchableOpacity>

      {/* Resultado */}
      <BloqueoCard
        nombreJugador={
          jugadorSeleccionado
            ? `${jugadorSeleccionado.nombre} ${jugadorSeleccionado.apellido}`
            : ''
        }
        resultado={resultado}
        cargando={cargando}
      />

    </View>
  );
};

// ─── Estilos ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    gap: Theme.spacing.lg,
  },
  description: {
    fontSize:   Theme.font.size.sm,
    color:      Theme.text.secondary,
    lineHeight: 20,
  },

  fieldGroup: {
    gap: Theme.spacing.sm,
  },
  fieldDisabled: {
    opacity: 0.35,
  },
  fieldLabel: {
    ...sectionLabelStyle,
  },
  emptyHint: {
    fontSize:  Theme.font.size.sm,
    color:     Theme.text.secondary,
    fontStyle: 'italic',
  },

  chipsRow: {
    flexDirection: 'row',
    gap:           Theme.spacing.sm,
    paddingBottom: 2,
  },
  chip: {
    paddingHorizontal: Theme.spacing.md,
    paddingVertical:   Theme.spacing.xs + 2,
    borderRadius:      Theme.radius.pill,
    backgroundColor:   Theme.bg.card,
    borderWidth:       1,
    borderColor:       Theme.border.subtle,
  },
  chipActivo: {
    backgroundColor: Theme.accent.dim,
    borderColor:     Theme.accent.DEFAULT,
  },
  chipText: {
    fontSize:   Theme.font.size.sm,
    fontWeight: Theme.font.weight.medium,
    color:      Theme.text.secondary,
  },
  chipTextActivo: {
    color:      Theme.text.accent,
    fontWeight: Theme.font.weight.bold,
  },

  input: {
    ...cardStyle,
    fontSize:   Theme.font.size.md,
    fontWeight: Theme.font.weight.bold,
    color:      Theme.text.primary,
    height:     48,
  },

  errorText: {
    fontSize: Theme.font.size.sm,
    color:    Theme.text.error,
  },

  btn: {
    backgroundColor: Theme.accent.DEFAULT,
    borderRadius:    Theme.radius.md,
    paddingVertical: Theme.spacing.md,
    alignItems:      'center',
  },
  btnDisabled: {
    opacity: 0.4,
  },
  btnText: {
    fontSize:      Theme.font.size.sm,
    fontWeight:    Theme.font.weight.black,
    color:         '#0A0A0A',
    letterSpacing: Theme.font.letterSpacing.wide,
  },
});
