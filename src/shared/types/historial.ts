export type TipoEventoHistorial = 'eliminacion' | 'asignacion' | 'actualizacion' | 'activacion';

export interface DetalleEvento {
  label: string;
  valor: string;
}

export interface EventoHistorial {
  id: string;
  fecha: string;
  hora: string;
  tipo: TipoEventoHistorial;
  titulo: string;
  detalles?: DetalleEvento[];
  motivo?: string;
}
