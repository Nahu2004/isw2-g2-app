import { NativeTabs } from 'expo-router/unstable-native-tabs';

import { colores } from '../constants/liga-tema';

export default function AppTabs() {
  return (
    <NativeTabs
      backgroundColor={colores.fondo}
      indicatorColor={colores.primarioClaro}
      tintColor={colores.primario}
      iconColor={{ default: colores.textoSuave, selected: colores.primario }}
      labelStyle={{ default: { color: colores.textoSuave }, selected: { color: colores.primario } }}>
      <NativeTabs.Trigger name="tabla">
        <NativeTabs.Trigger.Label>Tabla</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="trophy.fill" md="emoji_events" />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="partidos">
        <NativeTabs.Trigger.Label>Partidos</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="sportscourt.fill" md="sports_soccer" />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="suspendidos">
        <NativeTabs.Trigger.Label>Suspendidos</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="exclamationmark.triangle.fill" md="warning" />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}