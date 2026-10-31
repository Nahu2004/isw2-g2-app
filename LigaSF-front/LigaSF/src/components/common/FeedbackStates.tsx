import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet, TouchableOpacity } from 'react-native';

interface LoadingViewProps {
  mensaje?: string;
}

export const LoadingView: React.FC<LoadingViewProps> = ({ mensaje = 'Cargando datos...' }) => (
  <View style={styles.centerContainer}>
    <ActivityIndicator size="large" color="#0284c7" />
    <Text style={styles.loadingText}>{mensaje}</Text>
  </View>
);

interface ErrorViewProps {
  mensaje?: string;
  onRetry?: () => void;
}

export const ErrorView: React.FC<ErrorViewProps> = ({
  mensaje = 'Ocurrió un error al cargar los datos.',
  onRetry,
}) => (
  <View style={styles.centerContainer}>
    <Text style={styles.errorIcon}>⚠️</Text>
    <Text style={styles.errorText}>{mensaje}</Text>
    {onRetry && (
      <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
        <Text style={styles.retryButtonText}>Reintentar</Text>
      </TouchableOpacity>
    )}
  </View>
);

interface EmptyViewProps {
  mensaje?: string;
}

export const EmptyView: React.FC<EmptyViewProps> = ({ mensaje = 'No hay registros para mostrar.' }) => (
  <View style={styles.centerContainer}>
    <Text style={styles.emptyIcon}>📭</Text>
    <Text style={styles.emptyText}>{mensaje}</Text>
  </View>
);

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#475569',
    fontWeight: '500',
  },
  errorIcon: {
    fontSize: 36,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 15,
    color: '#dc2626',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#0284c7',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 14,
  },
  emptyIcon: {
    fontSize: 36,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 15,
    color: '#64748b',
    textAlign: 'center',
  },
});
