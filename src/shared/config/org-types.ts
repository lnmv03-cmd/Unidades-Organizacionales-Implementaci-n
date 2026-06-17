export type UnitType = 'Centro de costos' | 'Proyecto' | 'Sucursal' | 'Inmueble' | 'Departamento';
export type OrgNodeStatus = 'Activa' | 'Inactivo' | 'Suspendida' | 'Descartada' | 'Pendiente';
export type FilterKey = 'Todos' | UnitType;

export type OrgNode = {
  id: string;
  label: string;
  codigo?: string;
  descripcion?: string;
  type: 'root' | 'grupo' | 'unidad';
  unitType?: UnitType;
  status?: OrgNodeStatus;
  parentId: string | null;
  level: number;
  count: number;
};

export const FILTER_CHIPS: { key: FilterKey; label: string }[] = [
  { key: 'Todos',            label: 'Todos' },
  { key: 'Centro de costos', label: 'Centro de costos' },
  { key: 'Proyecto',         label: 'Proyectos' },
  { key: 'Sucursal',         label: 'Sucursales' },
  { key: 'Inmueble',         label: 'Inmuebles' },
  { key: 'Departamento',     label: 'Departamentos' },
];

export const UNIT_TYPE_TABS: { name: string; unitType: UnitType }[] = [
  { name: 'Centros de costos', unitType: 'Centro de costos' },
  { name: 'Proyectos',         unitType: 'Proyecto' },
  { name: 'Sucursales',        unitType: 'Sucursal' },
  { name: 'Inmuebles',         unitType: 'Inmueble' },
  { name: 'Departamentos',     unitType: 'Departamento' },
];
