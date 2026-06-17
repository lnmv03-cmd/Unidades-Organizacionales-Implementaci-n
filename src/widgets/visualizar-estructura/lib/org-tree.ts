export type { UnitType, OrgNodeStatus, FilterKey, OrgNode } from '@/shared/config/org-types';
export { FILTER_CHIPS } from '@/shared/config/org-types';
import type { OrgNode, FilterKey } from '@/shared/config/org-types';

// IMPORTANT: must be in DFS order so visibleNodes renders correctly nested
export const ORG_TREE: OrgNode[] = [
  // ─── ROOT ───────────────────────────────────────────────────────────────────
  { id: 'root', label: 'Empresa de insumos S.A.S', type: 'root', level: 0, count: 8, parentId: null },

  // Sucursales — direct children of root (level 1 leaves)
  { id: 'suc-1', label: 'Sede principal Bogotá', codigo: 'SU-001', type: 'unidad', level: 1, count: 0, parentId: 'root', unitType: 'Sucursal', status: 'Activa', descripcion: 'Sede principal con acceso a todos los servicios corporativos' },
  { id: 'suc-2', label: 'Sede Medellín',          codigo: 'SU-002', type: 'unidad', level: 1, count: 0, parentId: 'root', unitType: 'Sucursal', status: 'Activa', descripcion: 'Centro de operaciones para la región Antioquia' },
  { id: 'suc-3', label: 'Sede Cali',              codigo: 'SU-003', type: 'unidad', level: 1, count: 0, parentId: 'root', unitType: 'Sucursal', status: 'Activa' },
  { id: 'suc-4', label: 'Sede Barranquilla',      codigo: 'SU-004', type: 'unidad', level: 1, count: 0, parentId: 'root', unitType: 'Sucursal', status: 'Activa' },

  // ─── SEDE BOGOTÁ (L1) ───────────────────────────────────────────────────────
  { id: 'bog', label: 'Sede principal Bogotá', codigo: 'BOG-001', type: 'grupo', level: 1, count: 10, parentId: 'root' },

    // ── Administración (L2) → 2 sub-grupos (L3) ──────────────────────────────
    { id: 'bog-adm', label: 'Administración', codigo: 'ADM-001', type: 'grupo', level: 2, count: 2, parentId: 'bog' },

      // Gestión administrativa (L3) — mezcla CC + PRY
      { id: 'bog-adm-ges', label: 'Gestión administrativa', codigo: 'ADM-GES', type: 'grupo', level: 3, count: 4, parentId: 'bog-adm' },
        { id: 'cc-adm-1',  label: 'Administración financiera', codigo: 'CC-001', type: 'unidad', level: 4, count: 0, parentId: 'bog-adm-ges', unitType: 'Centro de costos', status: 'Activa', descripcion: 'Gestión de recursos financieros y presupuestarios de la organización' },
        { id: 'cc-adm-4',  label: 'Recursos humanos',          codigo: 'CC-002', type: 'unidad', level: 4, count: 0, parentId: 'bog-adm-ges', unitType: 'Centro de costos', status: 'Inactivo' },
        { id: 'pr-adm-12', label: 'Green office',              codigo: 'PR-001', type: 'unidad', level: 4, count: 0, parentId: 'bog-adm-ges', unitType: 'Proyecto',         status: 'Descartada' },
        { id: 'pr-adm-16', label: 'Renovación de oficinas',    codigo: 'PR-002', type: 'unidad', level: 4, count: 0, parentId: 'bog-adm-ges', unitType: 'Proyecto',         status: 'Activa' },

      // Servicios y soporte (L3)
      { id: 'bog-adm-svc', label: 'Servicios y soporte', codigo: 'ADM-SVC', type: 'grupo', level: 3, count: 5, parentId: 'bog-adm' },
        { id: 'cc-adm-14', label: 'Compras y abastecimiento',  codigo: 'CC-003', type: 'unidad', level: 4, count: 0, parentId: 'bog-adm-svc', unitType: 'Centro de costos', status: 'Inactivo' },
        { id: 'cc-adm-24', label: 'Servicios generales',       codigo: 'CC-004', type: 'unidad', level: 4, count: 0, parentId: 'bog-adm-svc', unitType: 'Centro de costos', status: 'Inactivo' },
        { id: 'cc-adm-27', label: 'Gestión documental',        codigo: 'CC-005', type: 'unidad', level: 4, count: 0, parentId: 'bog-adm-svc', unitType: 'Centro de costos', status: 'Pendiente' },
        { id: 'cc-adm-39', label: 'Archivo y correspondencia', codigo: 'CC-006', type: 'unidad', level: 4, count: 0, parentId: 'bog-adm-svc', unitType: 'Centro de costos', status: 'Inactivo' },
        { id: 'cc-adm-44', label: 'Soporte administrativo',    codigo: 'CC-007', type: 'unidad', level: 4, count: 0, parentId: 'bog-adm-svc', unitType: 'Centro de costos', status: 'Inactivo' },

    // ── Tecnología (L2) → 2 sub-grupos + 1 directo ───────────────────────────
    { id: 'bog-tec', label: 'Tecnología', codigo: 'TEC-001', type: 'grupo', level: 2, count: 3, parentId: 'bog' },

      // Desarrollo de productos (L3) — mezcla CC + PRY
      { id: 'bog-tec-dev', label: 'Desarrollo de productos', codigo: 'TEC-DEV', type: 'grupo', level: 3, count: 6, parentId: 'bog-tec' },
        { id: 'cc-tec-2',  label: 'Desarrollo de software',     codigo: 'CC-008', type: 'unidad', level: 4, count: 0, parentId: 'bog-tec-dev', unitType: 'Centro de costos', status: 'Activa', descripcion: 'Diseño y desarrollo de aplicaciones internas y soluciones tecnológicas' },
        { id: 'cc-tec-11', label: 'Seguridad informática',      codigo: 'CC-009', type: 'unidad', level: 4, count: 0, parentId: 'bog-tec-dev', unitType: 'Centro de costos', status: 'Activa', descripcion: 'Protección de activos digitales y gestión de vulnerabilidades' },
        { id: 'cc-tec-43', label: 'Proyectos TI',               codigo: 'CC-010', type: 'unidad', level: 4, count: 0, parentId: 'bog-tec-dev', unitType: 'Centro de costos', status: 'Activa' },
        { id: 'pr-tec-1',  label: 'Transformación digital',     codigo: 'PR-003', type: 'unidad', level: 4, count: 0, parentId: 'bog-tec-dev', unitType: 'Proyecto',         status: 'Activa', descripcion: 'Modernización de procesos mediante tecnologías emergentes' },
        { id: 'pr-tec-3',  label: 'ERP corporativo',            codigo: 'PR-004', type: 'unidad', level: 4, count: 0, parentId: 'bog-tec-dev', unitType: 'Proyecto',         status: 'Activa', descripcion: 'Implementación de sistema integrado de gestión empresarial' },
        { id: 'pr-tec-11', label: 'Data analytics',             codigo: 'PR-005', type: 'unidad', level: 4, count: 0, parentId: 'bog-tec-dev', unitType: 'Proyecto',         status: 'Activa' },

      // Infraestructura y operaciones TI (L3) — mezcla CC + PRY
      { id: 'bog-tec-inf', label: 'Infraestructura y operaciones TI', codigo: 'TEC-INF', type: 'grupo', level: 3, count: 7, parentId: 'bog-tec' },
        { id: 'cc-tec-20', label: 'Soporte técnico',            codigo: 'CC-011', type: 'unidad', level: 4, count: 0, parentId: 'bog-tec-inf', unitType: 'Centro de costos', status: 'Activa' },
        { id: 'cc-tec-21', label: 'Análisis de datos',          codigo: 'CC-012', type: 'unidad', level: 4, count: 0, parentId: 'bog-tec-inf', unitType: 'Centro de costos', status: 'Suspendida' },
        { id: 'cc-tec-26', label: 'Centro de innovación',       codigo: 'CC-013', type: 'unidad', level: 4, count: 0, parentId: 'bog-tec-inf', unitType: 'Centro de costos', status: 'Activa' },
        { id: 'cc-tec-33', label: 'Outsourcing TI',             codigo: 'CC-014', type: 'unidad', level: 4, count: 0, parentId: 'bog-tec-inf', unitType: 'Centro de costos', status: 'Descartada' },
        { id: 'cc-tec-41', label: 'Mesa de ayuda',              codigo: 'CC-015', type: 'unidad', level: 4, count: 0, parentId: 'bog-tec-inf', unitType: 'Centro de costos', status: 'Activa' },
        { id: 'pr-tec-6',  label: 'Migración a la nube',        codigo: 'PR-006', type: 'unidad', level: 4, count: 0, parentId: 'bog-tec-inf', unitType: 'Proyecto',         status: 'Suspendida' },
        { id: 'pr-tec-18', label: 'Migración de datos',         codigo: 'PR-007', type: 'unidad', level: 4, count: 0, parentId: 'bog-tec-inf', unitType: 'Proyecto',         status: 'Activa' },

      // Directo bajo bog-tec (L3)
      { id: 'cc-tec-7', label: 'Investigación y desarrollo', codigo: 'CC-016', type: 'unidad', level: 3, count: 0, parentId: 'bog-tec', unitType: 'Centro de costos', status: 'Suspendida' },

    // ── Marketing (L2) — plano ────────────────────────────────────────────────
    { id: 'bog-mkt', label: 'Marketing', codigo: 'MKT-001', type: 'grupo', level: 2, count: 4, parentId: 'bog' },
      { id: 'cc-mkt-3',  label: 'Marketing digital',           codigo: 'CC-017', type: 'unidad', level: 3, count: 0, parentId: 'bog-mkt', unitType: 'Centro de costos', status: 'Activa', descripcion: 'Estrategias de posicionamiento digital y gestión de canales online' },
      { id: 'cc-mkt-10', label: 'Diseño gráfico',              codigo: 'CC-018', type: 'unidad', level: 3, count: 0, parentId: 'bog-mkt', unitType: 'Centro de costos', status: 'Pendiente' },
      { id: 'cc-mkt-22', label: 'Comunicaciones corporativas', codigo: 'CC-019', type: 'unidad', level: 3, count: 0, parentId: 'bog-mkt', unitType: 'Centro de costos', status: 'Inactivo' },
      { id: 'pr-mkt-7',  label: 'Branding corporativo',        codigo: 'PR-008', type: 'unidad', level: 3, count: 0, parentId: 'bog-mkt', unitType: 'Proyecto',         status: 'Pendiente' },

    // ── Operaciones (L2) → 1 sub-grupo + directos ────────────────────────────
    { id: 'bog-ops', label: 'Operaciones', codigo: 'OPS-001', type: 'grupo', level: 2, count: 9, parentId: 'bog' },

      // Logística y distribución (L3) — mezcla CC + PRY
      { id: 'bog-ops-log', label: 'Logística y distribución', codigo: 'OPS-LOG', type: 'grupo', level: 3, count: 5, parentId: 'bog-ops' },
        { id: 'cc-ops-6',  label: 'Logística y distribución',  codigo: 'CC-020', type: 'unidad', level: 4, count: 0, parentId: 'bog-ops-log', unitType: 'Centro de costos', status: 'Descartada' },
        { id: 'cc-ops-31', label: 'Transporte y movilidad',    codigo: 'CC-021', type: 'unidad', level: 4, count: 0, parentId: 'bog-ops-log', unitType: 'Centro de costos', status: 'Inactivo' },
        { id: 'cc-ops-35', label: 'Compras internacionales',   codigo: 'CC-022', type: 'unidad', level: 4, count: 0, parentId: 'bog-ops-log', unitType: 'Centro de costos', status: 'Activa' },
        { id: 'pr-ops-14', label: 'Seguridad perimetral',      codigo: 'PR-009', type: 'unidad', level: 4, count: 0, parentId: 'bog-ops-log', unitType: 'Proyecto',         status: 'Inactivo' },
        { id: 'pr-ops-19', label: 'Centralización de compras', codigo: 'PR-010', type: 'unidad', level: 4, count: 0, parentId: 'bog-ops-log', unitType: 'Proyecto',         status: 'Suspendida' },

      // Directos bajo bog-ops (L3)
      { id: 'cc-ops-13', label: 'Producción',                  codigo: 'CC-023', type: 'unidad', level: 3, count: 0, parentId: 'bog-ops', unitType: 'Centro de costos', status: 'Suspendida' },
      { id: 'cc-ops-15', label: 'Gestión de calidad',          codigo: 'CC-024', type: 'unidad', level: 3, count: 0, parentId: 'bog-ops', unitType: 'Centro de costos', status: 'Pendiente' },
      { id: 'cc-ops-17', label: 'Gestión ambiental',           codigo: 'CC-025', type: 'unidad', level: 3, count: 0, parentId: 'bog-ops', unitType: 'Centro de costos', status: 'Activa', descripcion: 'Implementación de políticas ambientales y sostenibilidad corporativa' },
      { id: 'cc-ops-28', label: 'Seguridad física',            codigo: 'CC-026', type: 'unidad', level: 3, count: 0, parentId: 'bog-ops', unitType: 'Centro de costos', status: 'Inactivo' },
      { id: 'cc-ops-32', label: 'Control de inventarios',      codigo: 'CC-027', type: 'unidad', level: 3, count: 0, parentId: 'bog-ops', unitType: 'Centro de costos', status: 'Activa' },
      { id: 'pr-ops-5',  label: 'Automatización de procesos',  codigo: 'PR-011', type: 'unidad', level: 3, count: 0, parentId: 'bog-ops', unitType: 'Proyecto',         status: 'Activa', descripcion: 'Robotización y optimización de flujos operativos internos' },
      { id: 'pr-ops-10', label: 'Certificación ISO 9001',      codigo: 'PR-012', type: 'unidad', level: 3, count: 0, parentId: 'bog-ops', unitType: 'Proyecto',         status: 'Activa' },
      { id: 'pr-ops-20', label: 'Programa de reciclaje',       codigo: 'PR-013', type: 'unidad', level: 3, count: 0, parentId: 'bog-ops', unitType: 'Proyecto',         status: 'Pendiente' },

    // ── Finanzas (L2) — plano ─────────────────────────────────────────────────
    { id: 'bog-fin', label: 'Finanzas', codigo: 'FIN-001', type: 'grupo', level: 2, count: 5, parentId: 'bog' },
      { id: 'cc-fin-9',  label: 'Contabilidad',          codigo: 'CC-028', type: 'unidad', level: 3, count: 0, parentId: 'bog-fin', unitType: 'Centro de costos', status: 'Inactivo' },
      { id: 'cc-fin-18', label: 'Auditoría interna',     codigo: 'CC-029', type: 'unidad', level: 3, count: 0, parentId: 'bog-fin', unitType: 'Centro de costos', status: 'Activa', descripcion: 'Evaluación y control de procesos contables y financieros internos' },
      { id: 'cc-fin-23', label: 'Planeación financiera', codigo: 'CC-030', type: 'unidad', level: 3, count: 0, parentId: 'bog-fin', unitType: 'Centro de costos', status: 'Activa' },
      { id: 'cc-fin-29', label: 'Facturación y cobros',  codigo: 'CC-031', type: 'unidad', level: 3, count: 0, parentId: 'bog-fin', unitType: 'Centro de costos', status: 'Activa' },
      { id: 'cc-fin-36', label: 'Gestión de riesgos',   codigo: 'CC-032', type: 'unidad', level: 3, count: 0, parentId: 'bog-fin', unitType: 'Centro de costos', status: 'Inactivo' },

    // ── Dirección (L2) → 1 sub-grupo (L3) ───────────────────────────────────
    { id: 'bog-dir', label: 'Dirección', codigo: 'DIR-001', type: 'grupo', level: 2, count: 3, parentId: 'bog' },

      // Estrategia corporativa (L3) — mezcla CC + PRY
      { id: 'bog-dir-est', label: 'Estrategia corporativa', codigo: 'DIR-EST', type: 'grupo', level: 3, count: 4, parentId: 'bog-dir' },
        { id: 'cc-dir-16', label: 'Planeación estratégica',      codigo: 'CC-033', type: 'unidad', level: 4, count: 0, parentId: 'bog-dir-est', unitType: 'Centro de costos', status: 'Activa' },
        { id: 'cc-dir-25', label: 'Proyectos especiales',        codigo: 'CC-034', type: 'unidad', level: 4, count: 0, parentId: 'bog-dir-est', unitType: 'Centro de costos', status: 'Suspendida' },
        { id: 'cc-dir-37', label: 'Alianzas estratégicas',       codigo: 'CC-035', type: 'unidad', level: 4, count: 0, parentId: 'bog-dir-est', unitType: 'Centro de costos', status: 'Suspendida' },
        { id: 'pr-dir-2',  label: 'Expansión regional',          codigo: 'PR-014', type: 'unidad', level: 4, count: 0, parentId: 'bog-dir-est', unitType: 'Proyecto',         status: 'Activa' },

      // Directos bajo bog-dir (L3)
      { id: 'cc-dir-19', label: 'Relaciones externas',          codigo: 'CC-036', type: 'unidad', level: 3, count: 0, parentId: 'bog-dir', unitType: 'Centro de costos', status: 'Inactivo' },
      { id: 'cc-dir-42', label: 'Reestructuración corporativa', codigo: 'CC-037', type: 'unidad', level: 3, count: 0, parentId: 'bog-dir', unitType: 'Centro de costos', status: 'Descartada' },

    // ── Comercial (L2) — plano ────────────────────────────────────────────────
    { id: 'bog-com', label: 'Comercial', codigo: 'COM-001', type: 'grupo', level: 2, count: 5, parentId: 'bog' },
      { id: 'cc-com-5',  label: 'Atención al cliente',  codigo: 'CC-038', type: 'unidad', level: 3, count: 0, parentId: 'bog-com', unitType: 'Centro de costos', status: 'Activa' },
      { id: 'cc-com-8',  label: 'Ventas',               codigo: 'CC-039', type: 'unidad', level: 3, count: 0, parentId: 'bog-com', unitType: 'Centro de costos', status: 'Activa' },
      { id: 'cc-com-45', label: 'Estrategia comercial', codigo: 'CC-040', type: 'unidad', level: 3, count: 0, parentId: 'bog-com', unitType: 'Centro de costos', status: 'Activa' },
      { id: 'pr-com-9',  label: 'E-commerce',           codigo: 'PR-015', type: 'unidad', level: 3, count: 0, parentId: 'bog-com', unitType: 'Proyecto',         status: 'Activa' },
      { id: 'pr-com-13', label: 'Customer experience',  codigo: 'PR-016', type: 'unidad', level: 3, count: 0, parentId: 'bog-com', unitType: 'Proyecto',         status: 'Pendiente' },

    // ── Recursos (L2) — plano ─────────────────────────────────────────────────
    { id: 'bog-rr', label: 'Recursos', codigo: 'RR-001', type: 'grupo', level: 2, count: 9, parentId: 'bog' },
      { id: 'cc-rr-12', label: 'Educación y capacitación',  codigo: 'CC-041', type: 'unidad', level: 3, count: 0, parentId: 'bog-rr', unitType: 'Centro de costos', status: 'Activa' },
      { id: 'cc-rr-30', label: 'Desarrollo organizacional', codigo: 'CC-042', type: 'unidad', level: 3, count: 0, parentId: 'bog-rr', unitType: 'Centro de costos', status: 'Suspendida' },
      { id: 'cc-rr-34', label: 'Bienestar laboral',         codigo: 'CC-043', type: 'unidad', level: 3, count: 0, parentId: 'bog-rr', unitType: 'Centro de costos', status: 'Pendiente' },
      { id: 'cc-rr-38', label: 'Formación y desarrollo',   codigo: 'CC-044', type: 'unidad', level: 3, count: 0, parentId: 'bog-rr', unitType: 'Centro de costos', status: 'Activa' },
      { id: 'cc-rr-40', label: 'Transformación cultural',  codigo: 'CC-045', type: 'unidad', level: 3, count: 0, parentId: 'bog-rr', unitType: 'Centro de costos', status: 'Pendiente' },
      { id: 'pr-rr-4',  label: 'Programa de bienestar',    codigo: 'PR-017', type: 'unidad', level: 3, count: 0, parentId: 'bog-rr', unitType: 'Proyecto',         status: 'Inactivo' },
      { id: 'pr-rr-8',  label: 'Capacitación liderazgo',   codigo: 'PR-018', type: 'unidad', level: 3, count: 0, parentId: 'bog-rr', unitType: 'Proyecto',         status: 'Activa' },
      { id: 'pr-rr-15', label: 'Portal del empleado',      codigo: 'PR-019', type: 'unidad', level: 3, count: 0, parentId: 'bog-rr', unitType: 'Proyecto',         status: 'Activa', descripcion: 'Plataforma digital de autogestión para colaboradores' },
      { id: 'pr-rr-17', label: 'Programa de idiomas',      codigo: 'PR-020', type: 'unidad', level: 3, count: 0, parentId: 'bog-rr', unitType: 'Proyecto',         status: 'Inactivo' },

    // Departamentos Bogotá (L2 — directos bajo bog)
    { id: 'dep-bog-1',  label: 'Gerencia general',        codigo: 'DP-001', type: 'unidad', level: 2, count: 0, parentId: 'bog', unitType: 'Departamento', status: 'Activa', descripcion: 'Dirección estratégica y gobierno corporativo de la empresa' },
    { id: 'dep-bog-2',  label: 'Finanzas corporativas',   codigo: 'DP-002', type: 'unidad', level: 2, count: 0, parentId: 'bog', unitType: 'Departamento', status: 'Activa' },
    { id: 'dep-bog-3',  label: 'Tecnología e innovación', codigo: 'DP-003', type: 'unidad', level: 2, count: 0, parentId: 'bog', unitType: 'Departamento', status: 'Activa', descripcion: 'Liderazgo de la transformación digital y ecosistema tecnológico' },
    { id: 'dep-bog-4',  label: 'Gestión humana',          codigo: 'DP-004', type: 'unidad', level: 2, count: 0, parentId: 'bog', unitType: 'Departamento', status: 'Activa' },
    { id: 'dep-bog-5',  label: 'Marketing y ventas',      codigo: 'DP-005', type: 'unidad', level: 2, count: 0, parentId: 'bog', unitType: 'Departamento', status: 'Activa' },
    { id: 'dep-bog-6',  label: 'Operaciones',             codigo: 'DP-006', type: 'unidad', level: 2, count: 0, parentId: 'bog', unitType: 'Departamento', status: 'Activa' },
    { id: 'dep-bog-7',  label: 'Jurídica y compliance',   codigo: 'DP-007', type: 'unidad', level: 2, count: 0, parentId: 'bog', unitType: 'Departamento', status: 'Inactivo' },
    { id: 'dep-bog-8',  label: 'Auditoría interna',       codigo: 'DP-008', type: 'unidad', level: 2, count: 0, parentId: 'bog', unitType: 'Departamento', status: 'Activa' },
    { id: 'dep-bog-9',  label: 'Servicio al cliente',     codigo: 'DP-009', type: 'unidad', level: 2, count: 0, parentId: 'bog', unitType: 'Departamento', status: 'Activa' },
    { id: 'dep-bog-11', label: 'Comunicaciones',          codigo: 'DP-010', type: 'unidad', level: 2, count: 0, parentId: 'bog', unitType: 'Departamento', status: 'Activa' },
    { id: 'dep-bog-12', label: 'Compras y contratos',     codigo: 'DP-011', type: 'unidad', level: 2, count: 0, parentId: 'bog', unitType: 'Departamento', status: 'Pendiente' },
    { id: 'dep-bog-13', label: 'Salud y seguridad',       codigo: 'DP-012', type: 'unidad', level: 2, count: 0, parentId: 'bog', unitType: 'Departamento', status: 'Activa' },

    // Inmuebles Bogotá (L2 — directos bajo bog)
    { id: 'inm-bog-1', label: 'Torre corporativa norte', codigo: 'IN-001', type: 'unidad', level: 2, count: 0, parentId: 'bog', unitType: 'Inmueble', status: 'Activa', descripcion: 'Edificio sede principal, 12 pisos, zona norte de Bogotá' },
    { id: 'inm-bog-2', label: 'Bodegas zona industrial', codigo: 'IN-002', type: 'unidad', level: 2, count: 0, parentId: 'bog', unitType: 'Inmueble', status: 'Activa' },
    { id: 'inm-bog-5', label: 'Sede histórica centro',   codigo: 'IN-003', type: 'unidad', level: 2, count: 0, parentId: 'bog', unitType: 'Inmueble', status: 'Inactivo' },
    { id: 'inm-bog-6', label: 'Datacenter principal',    codigo: 'IN-004', type: 'unidad', level: 2, count: 0, parentId: 'bog', unitType: 'Inmueble', status: 'Activa', descripcion: 'Centro de datos de alta disponibilidad Tier III, certificado ANSI' },
    { id: 'inm-bog-7', label: 'Parque automotor',        codigo: 'IN-005', type: 'unidad', level: 2, count: 0, parentId: 'bog', unitType: 'Inmueble', status: 'Suspendida' },
    { id: 'inm-bog-8', label: 'Planta de producción',    codigo: 'IN-006', type: 'unidad', level: 2, count: 0, parentId: 'bog', unitType: 'Inmueble', status: 'Activa' },

  // ─── SEDE MEDELLÍN (L1) ─────────────────────────────────────────────────────
  { id: 'med', label: 'Sede Medellín', codigo: 'MED-001', type: 'grupo', level: 1, count: 2, parentId: 'root' },
    { id: 'med-idi', label: 'I+D', codigo: 'IDI-001', type: 'grupo', level: 2, count: 1, parentId: 'med' },
      { id: 'dep-med-10', label: 'I+D', codigo: 'DP-013', type: 'unidad', level: 3, count: 0, parentId: 'med-idi', unitType: 'Departamento', status: 'Suspendida' },
    { id: 'inm-med-3', label: 'Oficinas El Poblado', codigo: 'IN-007', type: 'unidad', level: 2, count: 0, parentId: 'med', unitType: 'Inmueble', status: 'Activa' },

  // ─── SEDE CALI (L1) ─────────────────────────────────────────────────────────
  { id: 'cal', label: 'Sede Cali', codigo: 'CAL-001', type: 'grupo', level: 1, count: 2, parentId: 'root' },
    { id: 'inm-cal-4',  label: 'Centro logístico Cali', codigo: 'IN-008', type: 'unidad', level: 2, count: 0, parentId: 'cal', unitType: 'Inmueble', status: 'Activa' },
    { id: 'inm-cal-10', label: 'Almacén temporal Cali', codigo: 'IN-009', type: 'unidad', level: 2, count: 0, parentId: 'cal', unitType: 'Inmueble', status: 'Descartada' },

  // ─── SEDE BARRANQUILLA (L1) ─────────────────────────────────────────────────
  { id: 'bar', label: 'Sede Barranquilla', codigo: 'BAR-001', type: 'grupo', level: 1, count: 1, parentId: 'root' },
    { id: 'inm-bar-9', label: 'Oficinas Barranquilla', codigo: 'IN-010', type: 'unidad', level: 2, count: 0, parentId: 'bar', unitType: 'Inmueble', status: 'Pendiente' },
];

export function countByFilter(key: FilterKey): number {
  if (key === 'Todos') return ORG_TREE.filter(n => n.type === 'unidad').length;
  return ORG_TREE.filter(n => n.type === 'unidad' && n.unitType === key).length;
}

export function nodeHasChildren(id: string): boolean {
  return ORG_TREE.some(n => n.parentId === id);
}

export function getAncestorIds(node: OrgNode): Set<string> {
  const ids = new Set<string>();
  let curr = node;
  while (curr.parentId) {
    ids.add(curr.parentId);
    curr = ORG_TREE.find(n => n.id === curr.parentId) ?? curr;
    if (!curr.parentId) break;
  }
  return ids;
}
