import type { EventoHistorial } from '@/shared/types/historial';

export const MOCK_EVENTOS: EventoHistorial[] = [
  {
    id: 'ev-1',
    fecha: '18 Jun 2026',
    hora: '10:32 AM',
    tipo: 'activacion',
    titulo: 'Unidad activada',
    detalles: [
      { label: 'Activado por', valor: 'Laura Martínez' },
      { label: 'Estado anterior', valor: 'Pendiente' },
    ],
  },
  {
    id: 'ev-2',
    fecha: '15 Jun 2026',
    hora: '03:14 PM',
    tipo: 'actualizacion',
    titulo: 'Información actualizada',
    detalles: [
      { label: 'Nombre anterior', valor: 'Centro Bogotá' },
      { label: 'Nombre nuevo', valor: 'Centro de costos Bogotá Norte' },
      { label: 'Modificado por', valor: 'Carlos Rincón' },
    ],
  },
  {
    id: 'ev-3',
    fecha: '10 Jun 2026',
    hora: '09:05 AM',
    tipo: 'asignacion',
    titulo: 'Asignada a grupo Bogotá',
    detalles: [
      { label: 'Grupo destino', valor: 'Bogotá' },
      { label: 'Asignado por', valor: 'Admin' },
    ],
  },
  {
    id: 'ev-4',
    fecha: '02 Jun 2026',
    hora: '11:50 AM',
    tipo: 'actualizacion',
    titulo: 'Estado actualizado a Suspendida',
    motivo: 'Cierre temporal por mantenimiento de instalaciones.',
    detalles: [
      { label: 'Estado anterior', valor: 'Activa' },
      { label: 'Suspendido por', valor: 'Laura Martínez' },
    ],
  },
  {
    id: 'ev-5',
    fecha: '20 May 2026',
    hora: '08:00 AM',
    tipo: 'activacion',
    titulo: 'Unidad creada',
    detalles: [
      { label: 'Creado por', valor: 'Admin' },
      { label: 'Estado inicial', valor: 'Pendiente' },
    ],
  },
];
