import axiosClient from '@/api/axiosClient';

export interface UsuarioResponse {
  id: number;
  username: string;
  nombreCompleto: string;
  rol: 'ADMIN' | 'DELEGADO';
  activo: boolean;
  fechaAlta: string;
}

export interface CrearUsuarioData {
  username: string;
  password: string;
  nombreCompleto: string;
  rol: 'ADMIN' | 'DELEGADO';
}

export interface ActualizarUsuarioData {
  nombreCompleto?: string;
  rol?: 'ADMIN' | 'DELEGADO';
  password?: string;
}

export async function getUsuarios(): Promise<UsuarioResponse[]> {
  const { data } = await axiosClient.get<UsuarioResponse[]>('/usuarios');
  return data;
}

export async function crearUsuario(payload: CrearUsuarioData): Promise<UsuarioResponse> {
  const { data } = await axiosClient.post<UsuarioResponse>('/usuarios', payload);
  return data;
}

export async function actualizarUsuario(id: number, payload: ActualizarUsuarioData): Promise<UsuarioResponse> {
  const { data } = await axiosClient.put<UsuarioResponse>(`/usuarios/${id}`, payload);
  return data;
}

export async function desactivarUsuario(id: number): Promise<UsuarioResponse> {
  const { data } = await axiosClient.delete<UsuarioResponse>(`/usuarios/${id}`);
  return data;
}

export async function reactivarUsuario(id: number): Promise<UsuarioResponse> {
  const { data } = await axiosClient.patch<UsuarioResponse>(`/usuarios/${id}/reactivar`);
  return data;
}
