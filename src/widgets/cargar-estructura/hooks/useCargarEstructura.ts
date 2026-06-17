import { useRef, useState } from 'react';

export type CargarEstructuraEstado = 'vacio' | 'extrayendo' | 'completado';

export function useCargarEstructura() {
  const [estado, setEstado] = useState<CargarEstructuraEstado>('vacio');
  const [snackbarAbierto, setSnackbarAbierto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleCargarArchivo() {
    fileInputRef.current?.click();
  }

  function handleArchivoSeleccionado(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files?.length) return;
    setEstado('extrayendo');
    // Simulamos extracción (en producción sería una llamada API)
    // 6 s matches the animation: 12 rows × 400 ms + 2 resolve ticks × 400 ms = 5600 ms
    setTimeout(() => {
      setEstado('completado');
      setSnackbarAbierto(true);
    }, 6000);
  }

  function handleSnackbarCerrar() {
    setSnackbarAbierto(false);
  }

  return {
    estado,
    snackbarAbierto,
    fileInputRef,
    handleCargarArchivo,
    handleArchivoSeleccionado,
    handleSnackbarCerrar,
  };
}
