import React from 'react';
import { ProtectedRoute } from '@/components/protected';
import { PartidoEnVivoPage } from '@/pages/partido-en-vivo';

export default function PartidoEnVivoScreen() {
  return (
    <ProtectedRoute allowedRoles={['ADMIN', 'DELEGADO']}>
      <PartidoEnVivoPage />
    </ProtectedRoute>
  );
}
