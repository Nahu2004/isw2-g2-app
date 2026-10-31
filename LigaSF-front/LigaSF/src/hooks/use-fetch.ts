import { useCallback, useEffect, useState } from 'react';

import { API_URL } from '@/constants/api';

type Resultado<T> = { ruta: string; data: T };

/**
 * GET a la API. Con `ruta` en null no hace nada (útil si falta un dato previo).
 * Mientras no hay datos y no hay error, la pantalla está cargando.
 */
export function useFetch<T>(ruta: string | null) {
  const [resultado, setResultado] = useState<Resultado<T> | null>(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    if (ruta === null) {
      return;
    }
    let cancelado = false;

    async function cargar(rutaActual: string) {
      setCargando(true);
      setError(null);
      try {
        const respuesta = await fetch(`${API_URL}${rutaActual}`);
        if (!respuesta.ok) {
          throw new Error(await mensajeDeError(respuesta));
        }
        const data = (await respuesta.json()) as T;
        if (!cancelado) {
          setResultado({ ruta: rutaActual, data });
        }
      } catch (e) {
        if (!cancelado) {
          setError(e instanceof TypeError || !(e instanceof Error) ? MENSAJE_SIN_CONEXION : e.message);
        }
      } finally {
        if (!cancelado) {
          setCargando(false);
        }
      }
    }

    cargar(ruta);
    return () => {
      cancelado = true;
    };
  }, [ruta, version]);

  const recargar = useCallback(() => setVersion((v) => v + 1), []);
  const data = resultado !== null && resultado.ruta === ruta ? resultado.data : null;

  return { data, cargando, error, recargar };
}

const MENSAJE_SIN_CONEXION = 'No se pudo conectar con el servidor';

async function mensajeDeError(respuesta: Response): Promise<string> {
  try {
    const cuerpo = await respuesta.json();
    if (typeof cuerpo?.message === 'string') {
      return cuerpo.message;
    }
  } catch {
    // la respuesta no trae JSON: se usa el código HTTP
  }
  return `Error ${respuesta.status}`;
}
