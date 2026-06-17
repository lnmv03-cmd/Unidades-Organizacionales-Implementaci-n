import { useEffect, useRef, useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Dialog from '@mui/material/Dialog';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import InputBase from '@mui/material/InputBase';
import ListItemIcon from '@mui/material/ListItemIcon';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Popover from '@mui/material/Popover';
import Skeleton from '@mui/material/Skeleton';
import Slide from '@mui/material/Slide';
import type { SlideProps } from '@mui/material/Slide';
import Snackbar from '@mui/material/Snackbar';
import SnackbarContent from '@mui/material/SnackbarContent';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import type { Dayjs } from 'dayjs';
import {
  IconAlertTriangle,
  IconArrowsSplit,
  IconBuildingCommunity,
  IconCheck,
  IconChevronDown,
  IconChevronRight,
  IconCircleCheckFilled,
  IconCircleX,
  IconClipboardText,
  IconDeviceDesktopAnalytics,
  IconChecklist,
  IconDotsVertical,
  IconGitMerge,
  IconHistory,
  IconInfoCircle,
  IconLock,
  IconMap2,
  IconPencil,
  IconPlayerPause,
  IconPlayerPlay,
  IconPlus,
  IconSearch,
  IconSitemap,
  IconStatusChange,
  IconTrash,
  IconUsers,
  IconX,
} from '@tabler/icons-react';
import { CosmosLoader, EmptyStateIllustration } from '@/shared/ui';
import { CrearGrupoDrawer } from '@/features/crear-grupo';
import { CrearUnidadDrawer } from '@/features/crear-unidad';
import { EditarUnidadDrawer } from '@/features/editar-unidad';
import { ConfirmarAccionDialog } from '@/features/confirmar-accion-unidad';
import type { AccionDialogState, AccionType } from '@/features/confirmar-accion-unidad';
import { RevisarBorradorDrawer, DescartarBorradorDialog } from '@/features/revisar-borrador';
import type { RevisarBorradorState, DescartarBorradorState } from '@/features/revisar-borrador';
import { useEstructuraStore } from '@/shared/model/estructura.store';
import { UNIT_TYPE_TABS } from '@/shared/config/org-types';
import type { OrgNode, OrgNodeStatus } from '@/shared/config/org-types';
import type { CargarEstructuraEstado } from '../hooks/useCargarEstructura';

function SlideUp(props: SlideProps) {
  return <Slide {...props} direction="up" />;
}

function getMensajeAccion(accion: AccionType, unitType: OrgNode['unitType']): string {
  const isFem = unitType === 'Sucursal';
  const verbs: Record<AccionType, string> = {
    suspender: isFem ? 'suspendida' : 'suspendido',
    inactivar: isFem ? 'inactivada' : 'inactivado',
    reactivar: isFem ? 'reactivada' : 'reactivado',
    reabrir:   isFem ? 'reactivada' : 'reactivado',
  };
  return unitType ? `${unitType} ${verbs[accion]}` : 'Acción completada';
}

type EstadoItem = 'Activa' | 'Inactivo' | 'Descartada' | 'Suspendida' | 'Pendiente';
type FilterKey = 'Todas' | EstadoItem;

interface ItemData {
  id: string;
  codigo: string;
  nombre: string;
  descripcion: string;
  ubicacion: string;
  creacion: string;
  estado: EstadoItem;
}

const STATUS_CFG: Record<EstadoItem, { color: string; borderColor: string; info?: boolean }> = {
  Activa:     { color: '#1b5e20', borderColor: '#1b5e20' },
  Inactivo:   { color: 'rgba(16,24,64,0.54)', borderColor: '#EAEBEC', info: true },
  Descartada: { color: '#c63434', borderColor: '#c63434' },
  Suspendida: { color: '#f96800', borderColor: '#f96800', info: true },
  Pendiente:  { color: '#228db8', borderColor: '#228db8' },
};

type TablerIcon = typeof IconPencil;
type MenuAction = { label: string; Icon: TablerIcon; danger?: boolean };

const MENU_ACTIONS: Partial<Record<EstadoItem, MenuAction[]>> = {
  Activa: [
    { label: 'Suspender', Icon: IconPlayerPause },
    { label: 'Fusionar',  Icon: IconGitMerge },
    { label: 'Dividir',   Icon: IconArrowsSplit },
    { label: 'Inactivar', Icon: IconCircleX, danger: true },
  ],
  Suspendida: [
    { label: 'Reactivar', Icon: IconPlayerPlay },
    { label: 'Fusionar',  Icon: IconGitMerge },
    { label: 'Dividir',   Icon: IconArrowsSplit },
    { label: 'Inactivar', Icon: IconCircleX, danger: true },
  ],
  Inactivo: [
    { label: 'Reabrir', Icon: IconLock },
  ],
  Pendiente: [
    { label: 'Revisar',   Icon: IconChecklist },
    { label: 'Descartar', Icon: IconTrash, danger: true },
  ],
};



const FILTER_CFG: { key: FilterKey; label: string; badgeBg: string; badgeText: string }[] = [
  { key: 'Todas',       label: 'Todas',       badgeBg: '#2f43d0', badgeText: 'white' },
  { key: 'Activa',      label: 'Activas',     badgeBg: '#72b525', badgeText: 'white' },
  { key: 'Suspendida',  label: 'Suspendidas', badgeBg: '#f96800', badgeText: 'white' },
  { key: 'Inactivo',    label: 'Inactivas',   badgeBg: '#eaebec', badgeText: '#101840' },
  { key: 'Pendiente',   label: 'Pendientes',  badgeBg: '#228db8', badgeText: 'white' },
  { key: 'Descartada',  label: 'Descartadas', badgeBg: '#c63434', badgeText: 'white' },
];

const COL = { checkbox: 40, codigo: 140, ubicacion: 160, creacion: 100, estado: 120, actions: 82 };

const SKELETON_SX = {
  bgcolor: 'rgba(16,24,64,0.04)',
  height: 26,
  borderRadius: 1,
  flexShrink: 0,
  '&::after': { background: 'linear-gradient(90deg, transparent, rgba(16,24,64,0.05), transparent)' },
} as const;

// Rows animated during extraction; after completion all tab data is shown
const EXTRACT_ROWS = 12;




function nodeToItem(node: OrgNode, tree: OrgNode[]): ItemData {
  const parent = tree.find(n => n.id === node.parentId);
  return {
    id: node.id,
    codigo: node.codigo ?? '',
    nombre: node.label,
    descripcion: node.descripcion ?? '',
    ubicacion: parent?.label ?? '',
    creacion: '',
    estado: (node.status as EstadoItem) ?? 'Activa',
  };
}

function StatusChip({ value }: { value: EstadoItem }) {
  const cfg = STATUS_CFG[value];
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const openPopover = (el: HTMLElement) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setAnchor(el);
  };
  const scheduleClose = () => {
    closeTimer.current = setTimeout(() => setAnchor(null), 120);
  };
  const cancelClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
  };

  return (
    <>
      <Box
        component="span"
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          height: 20,
          px: '8px',
          gap: '3px',
          border: `1px solid ${cfg.borderColor}`,
          borderRadius: '4px',
          fontSize: '0.6875rem',
          lineHeight: 1,
          color: cfg.color,
          whiteSpace: 'nowrap',
          flexShrink: 0,
        }}
      >
        {value}
        {cfg.info && (
          <Box
            component="span"
            onMouseEnter={e => openPopover(e.currentTarget as HTMLElement)}
            onMouseLeave={scheduleClose}
            sx={{ display: 'inline-flex', alignItems: 'center', cursor: 'default', color: cfg.color }}
          >
            <IconInfoCircle size={11} />
          </Box>
        )}
      </Box>

      {cfg.info && (
        <Popover
          open={Boolean(anchor)}
          anchorEl={anchor}
          onClose={() => setAnchor(null)}
          disableRestoreFocus
          anchorOrigin={{ vertical: 'center', horizontal: 'right' }}
          transformOrigin={{ vertical: 'center', horizontal: 'left' }}
          PaperProps={{
            onMouseEnter: cancelClose,
            onMouseLeave: scheduleClose,
            sx: {
              p: 1.5, display: 'flex', flexDirection: 'column', gap: 0.5,
              borderRadius: 2, maxWidth: 290,
              boxShadow: '0px 3px 14px 2px rgba(93,109,126,0.09), 0px 8px 10px 1px rgba(93,109,126,0.14), 0px 5px 5px -3px rgba(93,109,126,0.18)',
            },
          }}
        >
          {value === 'Suspendida' ? (
            <>
              <Typography variant="body2">
                <Box component="span" sx={{ fontWeight: 600 }}>Motivo:</Box>
                {' '}Centro de costos reemplazado en la empresa
              </Typography>
              <Typography variant="body2">
                <Box component="span" sx={{ fontWeight: 600 }}>Fecha de reactivación:</Box>
                {' '}00/00/0000
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Suspendida desde: 00/00/0000
              </Typography>
            </>
          ) : (
            <>
              <Typography variant="body2">
                Motivo: Centro de costos reemplazado en la empresa
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Inactiva desde: 00/00/0000
              </Typography>
            </>
          )}
        </Popover>
      )}
    </>
  );
}

interface Props {
  estado: CargarEstructuraEstado;
  pendienteTrigger?: number;
}

export function CargarEstructuraExtrayendo({ estado, pendienteTrigger = 0 }: Props) {
  const isCompleted = estado === 'completado';
  const { tree, updateNode, updateNodeStatus, moveNode } = useEstructuraStore();

  const tabsData = UNIT_TYPE_TABS.map(tab => ({
    name: tab.name,
    data: tree
      .filter(n => n.type === 'unidad' && n.unitType === tab.unitType)
      .map(n => nodeToItem(n, tree)),
  }));
  const [activeTab, setActiveTab] = useState(0);
  const [activeFilter, setActiveFilter] = useState<FilterKey>('Todas');
  const [searchQuery, setSearchQuery] = useState('');
  const [visibleRows, setVisibleRows] = useState(0);
  const [resolvedRows, setResolvedRows] = useState(0);
  const [hoveredRowId, setHoveredRowId] = useState<string | null>(null);
  const [rowMenuId, setRowMenuId] = useState<string | null>(null);
  const [rowMenuAnchor, setRowMenuAnchor] = useState<HTMLElement | null>(null);
  const [locationAnchor, setLocationAnchor] = useState<HTMLElement | null>(null);
  const [snapshotted, setSnapshotted] = useState(false);
  const [crearMenu, setCrearMenu] = useState<HTMLElement | null>(null);
  const [crearGrupoOpen, setCrearGrupoOpen] = useState(false);
  const [crearUnidadType, setCrearUnidadType] = useState<OrgNode['unitType'] | null>(null);
  const [snackbarMsg, setSnackbarMsg] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [inlineEditId, setInlineEditId] = useState<string | null>(null);
  const [editDrawerNode, setEditDrawerNode] = useState<{ id: string; nombre: string; codigo: string; unitType: OrgNode['unitType']; parentId: string | null } | null>(null);
  const [accionDialog, setAccionDialog] = useState<AccionDialogState | null>(null);
  const [locExpandedIds, setLocExpandedIds] = useState<Set<string>>(new Set());
  const [locSelectedId, setLocSelectedId] = useState<string | null>(null);
  const [locHoveredId, setLocHoveredId] = useState<string | null>(null);
  const [locationItemId, setLocationItemId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [massSuspendOpen, setMassSuspendOpen] = useState(false);
  const [massSuspendMotivo, setMassSuspendMotivo] = useState('');
  const [massSuspendFecha, setMassSuspendFecha] = useState<Dayjs | null>(null);
  const [revisarState, setRevisarState] = useState<RevisarBorradorState | null>(null);
  const [descartarDirectoState, setDescartarDirectoState] = useState<DescartarBorradorState | null>(null);

  const locGroupNodes = tree.filter(n => n.type === 'root' || n.type === 'grupo');
  const locVisibleNodes = locGroupNodes.filter(node => {
    if (!node.parentId) return true;
    let curr: OrgNode | undefined = node;
    while (curr?.parentId) {
      if (!locExpandedIds.has(curr.parentId)) return false;
      curr = locGroupNodes.find(n => n.id === curr!.parentId);
    }
    return true;
  });
  const openLocation = (e: React.MouseEvent, itemId: string) => {
    setLocExpandedIds(new Set(locGroupNodes.map(n => n.id)));
    const item = tree.find(n => n.id === itemId);
    setLocSelectedId(item?.parentId ?? null);
    setLocationItemId(itemId);
    setLocationAnchor(e.currentTarget as HTMLElement);
  };
  const [editCodigo, setEditCodigo] = useState('');
  const [editNombre, setEditNombre] = useState('');

  // Adjust during render: when banner "Revisar" is clicked, switch to Pendiente filter
  const [prevTrigger, setPrevTrigger] = useState(pendienteTrigger);
  if (pendienteTrigger !== prevTrigger) {
    setPrevTrigger(pendienteTrigger);
    setActiveFilter('Pendiente');
    setSearchQuery('');
  }

  // Adjust during render: jump to final state when extraction completes
  if (isCompleted && !snapshotted) {
    setSnapshotted(true);
    setVisibleRows(EXTRACT_ROWS);
    setResolvedRows(EXTRACT_ROWS);
  }

  // Progressive reveal: rows appear as skeleton first, then resolve to real data (2-tick lag)
  // 400 ms interval → 12 rows × 400 ms = 4800 ms visible, all resolved at tick 14 = 5600 ms
  useEffect(() => {
    let tick = 0;
    const id = setInterval(() => {
      tick++;
      setVisibleRows(Math.min(tick, EXTRACT_ROWS));
      setResolvedRows(Math.min(Math.max(tick - 2, 0), EXTRACT_ROWS));
      if (tick >= EXTRACT_ROWS + 2) clearInterval(id);
    }, 400);
    return () => clearInterval(id);
  }, []);

  const allTabData = tabsData[activeTab]?.data ?? [];
  const extractData = allTabData.slice(0, EXTRACT_ROWS);

  // After completion show all data; during extraction animate EXTRACT_ROWS subset
  const resolvedData = isCompleted ? allTabData : extractData.slice(0, resolvedRows);

  // Filter counts based on resolved data
  const counts: Record<FilterKey, number> = {
    Todas:      resolvedData.length,
    Activa:     resolvedData.filter(d => d.estado === 'Activa').length,
    Suspendida: resolvedData.filter(d => d.estado === 'Suspendida').length,
    Inactivo:   resolvedData.filter(d => d.estado === 'Inactivo').length,
    Pendiente:  resolvedData.filter(d => d.estado === 'Pendiente').length,
    Descartada: resolvedData.filter(d => d.estado === 'Descartada').length,
  };

  // Apply status filter then search filter
  const q = searchQuery.trim().toLowerCase();
  const filteredResolved = resolvedData
    .filter(d => activeFilter === 'Todas' || d.estado === activeFilter)
    .filter(d => !q || (
      d.nombre.toLowerCase().includes(q) ||
      d.codigo.toLowerCase().includes(q) ||
      d.descripcion.toLowerCase().includes(q) ||
      d.ubicacion.toLowerCase().includes(q)
    ));

  // Skeleton rows: visible but not yet resolved (only shown with no active filter)
  const skeletonCount = !isCompleted ? visibleRows - resolvedRows : 0;

  // Dynamic tab label: all tabs count proportionally during extraction
  const getTabLabel = (tab: typeof tabsData[0]) => {
    if (isCompleted) return `${tab.name} (${tab.data.length})`;
    const count = Math.round((resolvedRows / EXTRACT_ROWS) * tab.data.length);
    return `${tab.name} (${count})`;
  };

  const allSelected = filteredResolved.length > 0 && filteredResolved.every(d => selectedIds.has(d.id));
  const someSelected = !allSelected && filteredResolved.some(d => selectedIds.has(d.id));

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredResolved.map(d => d.id)));
    }
  };

  const handleTabChange = (_: React.SyntheticEvent, v: number) => {
    setActiveTab(v);
    setActiveFilter('Todas');
    setSearchQuery('');
    setInlineEditId(null);
    setSelectedIds(new Set());
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative', overflow: 'hidden' }}>

      {/* Tab header + Crear button */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pr: 2, pt: '2px', borderBottom: '0.5px solid', borderColor: 'grey.200', flexShrink: 0 }}>
        <Tabs
          value={activeTab}
          onChange={isCompleted ? handleTabChange : undefined}
          sx={{ minHeight: 40 }}
        >
          {tabsData.map((tab, i) => (
            <Tab
              key={tab.name}
              label={getTabLabel(tab)}
              value={i}
              disabled={!isCompleted}
              sx={{ textTransform: 'none', fontSize: '0.8125rem', fontWeight: 500, minHeight: 40, py: '9px', px: 2, letterSpacing: '0.4px' }}
            />
          ))}
        </Tabs>

        {isCompleted ? (
          <>
            <Box
              onClick={e => setCrearMenu(e.currentTarget as HTMLElement)}
              sx={{
                display: 'flex', alignItems: 'center', gap: 0.5,
                bgcolor: 'primary.main', borderRadius: 1, px: '10px',
                height: 26, color: 'primary.contrastText', cursor: 'pointer', flexShrink: 0,
                '&:hover': { bgcolor: 'primary.dark' },
              }}
            >
              <IconPlus size={14} />
              <Typography sx={{ fontSize: '0.75rem', fontWeight: 500, letterSpacing: '0.4px', lineHeight: '18px', color: 'inherit' }}>
                Crear
              </Typography>
              <IconChevronDown size={14} />
            </Box>
            <Menu
              anchorEl={crearMenu}
              open={Boolean(crearMenu)}
              onClose={() => setCrearMenu(null)}
              elevation={8}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              MenuListProps={{ dense: true, sx: { py: 1 } }}
              slotProps={{ paper: { sx: { borderRadius: 1, minWidth: 173 } } }}
            >
              <MenuItem dense onClick={() => { setCrearMenu(null); setCrearGrupoOpen(true); }}>
                <ListItemIcon sx={{ minWidth: 28, color: 'action.active' }}><IconSitemap size={16} /></ListItemIcon>
                <Typography variant="body2" sx={{ letterSpacing: '0.17px' }}>Grupo</Typography>
              </MenuItem>
              <Divider />
              <MenuItem dense onClick={() => { setCrearMenu(null); setCrearUnidadType('Centro de costos'); }}>
                <ListItemIcon sx={{ minWidth: 28, color: 'action.active' }}><IconUsers size={16} /></ListItemIcon>
                <Typography variant="body2" sx={{ letterSpacing: '0.17px' }}>Centro de costos</Typography>
              </MenuItem>
              <MenuItem dense onClick={() => { setCrearMenu(null); setCrearUnidadType('Proyecto'); }}>
                <ListItemIcon sx={{ minWidth: 28, color: 'action.active' }}><IconClipboardText size={16} /></ListItemIcon>
                <Typography variant="body2" sx={{ letterSpacing: '0.17px' }}>Proyecto</Typography>
              </MenuItem>
              <MenuItem dense onClick={() => { setCrearMenu(null); setCrearUnidadType('Sucursal'); }}>
                <ListItemIcon sx={{ minWidth: 28, color: 'action.active' }}><IconMap2 size={16} /></ListItemIcon>
                <Typography variant="body2" sx={{ letterSpacing: '0.17px' }}>Sucursal</Typography>
              </MenuItem>
              <MenuItem dense onClick={() => { setCrearMenu(null); setCrearUnidadType('Inmueble'); }}>
                <ListItemIcon sx={{ minWidth: 28, color: 'action.active' }}><IconBuildingCommunity size={16} /></ListItemIcon>
                <Typography variant="body2" sx={{ letterSpacing: '0.17px' }}>Inmueble</Typography>
              </MenuItem>
              <MenuItem dense onClick={() => { setCrearMenu(null); setCrearUnidadType('Departamento'); }}>
                <ListItemIcon sx={{ minWidth: 28, color: 'action.active' }}><IconDeviceDesktopAnalytics size={16} /></ListItemIcon>
                <Typography variant="body2" sx={{ letterSpacing: '0.17px' }}>Departamento</Typography>
              </MenuItem>
            </Menu>
          </>
        ) : (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, bgcolor: 'action.disabledBackground', borderRadius: 1, px: '10px', height: 26, color: 'action.disabled', flexShrink: 0 }}>
            <IconPlus size={14} />
            <Typography sx={{ fontSize: '0.75rem', fontWeight: 500, color: 'action.disabled', letterSpacing: '0.4px', lineHeight: '18px' }}>
              Crear
            </Typography>
            <IconChevronDown size={14} />
          </Box>
        )}
      </Box>

      {/* Content */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: 2, gap: 1.5, overflow: 'hidden' }}>

        {/* Filter chips (left) + Search (right-aligned) */}
        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', flexShrink: 0 }}>

          {/* Chips */}
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexShrink: 0 }}>
            {FILTER_CFG.map(f => {
              const isActive = activeFilter === f.key;
              const isPrimary = f.key === 'Todas';
              const count = counts[f.key];

              return (
                <Box
                  key={f.key}
                  onClick={() => setActiveFilter(f.key)}
                  sx={{
                    display: 'inline-flex', alignItems: 'center',
                    height: 20, borderRadius: '4px', overflow: 'hidden',
                    cursor: 'pointer', userSelect: 'none',
                    bgcolor: isPrimary ? '#e1e6ff' : 'transparent',
                    border: isPrimary ? 'none' : `1px solid ${isActive ? f.badgeBg : '#eaebec'}`,
                    transition: 'border-color 0.15s',
                  }}
                >
                  <Typography
                    sx={{
                      pl: '6px', pr: '4px',
                      fontSize: '0.6875rem', lineHeight: '14px',
                      color: isPrimary ? '#2f43d0' : (isActive ? f.badgeBg : '#101840'),
                      whiteSpace: 'nowrap',
                      fontWeight: isActive && !isPrimary ? 500 : 400,
                    }}
                  >
                    {f.label}
                  </Typography>
                  <Box
                    sx={{
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                      mr: '4px', px: '5px', py: '2.5px',
                      borderRadius: '100px', bgcolor: f.badgeBg, minWidth: 14,
                    }}
                  >
                    <Typography sx={{ fontSize: '0.6875rem', lineHeight: '11px', color: f.badgeText, fontWeight: 500 }}>
                      {count}
                    </Typography>
                  </Box>
                </Box>
              );
            })}
          </Box>

          {/* Search — right-aligned, interactive */}
          <Box
            sx={{
              ml: 'auto',
              width: 340,
              flexShrink: 0,
              height: 32,
              border: '1px solid',
              borderColor: searchQuery ? 'primary.main' : 'rgba(16,24,64,0.2)',
              borderRadius: 1,
              display: 'flex',
              alignItems: 'center',
              px: 1.5,
              gap: 1,
              transition: 'border-color 0.15s',
            }}
          >
            <InputBase
              placeholder="Buscar..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              sx={{ flex: 1, fontSize: '0.8125rem', '& input': { p: 0, color: 'text.primary' } }}
            />
            {searchQuery ? (
              <Box
                onClick={() => setSearchQuery('')}
                sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer', color: 'text.secondary', flexShrink: 0 }}
              >
                <IconX size={14} />
              </Box>
            ) : (
              <IconSearch size={16} style={{ color: 'rgba(16,24,64,0.54)', flexShrink: 0 }} />
            )}
          </Box>
        </Box>

        {/* Table */}
        <Box sx={{ display: 'flex', flexDirection: 'column', overflow: 'auto', flex: 1, position: 'relative' }}>

          {/* Header */}
          <Box sx={{ display: 'flex', alignItems: 'center', bgcolor: 'grey.100', borderRadius: 0.5, height: 24, flexShrink: 0, width: '100%' }}>
            <Box sx={{ width: COL.checkbox, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Checkbox
                size="small"
                checked={allSelected}
                indeterminate={someSelected}
                onChange={toggleSelectAll}
                sx={{ p: '3px', '& .MuiSvgIcon-root': { fontSize: 16 } }}
              />
            </Box>
            <Box sx={{ width: COL.codigo, px: '10px', flexShrink: 0 }}>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8125rem', letterSpacing: '0.17px' }}>Código</Typography>
            </Box>
            <Box sx={{ flex: 1, px: '10px', minWidth: 0 }}>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8125rem', letterSpacing: '0.17px' }}>Nombre</Typography>
            </Box>
            <Box sx={{ width: COL.ubicacion, px: '10px', flexShrink: 0 }}>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8125rem', letterSpacing: '0.17px' }}>Ubicación</Typography>
            </Box>
            <Box sx={{ width: COL.creacion, px: '10px', flexShrink: 0 }}>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8125rem', letterSpacing: '0.17px' }}>Creación</Typography>
            </Box>
            <Box sx={{ width: COL.estado, px: '10px', flexShrink: 0, display: 'flex', justifyContent: 'center' }}>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8125rem', letterSpacing: '0.17px' }}>Estado</Typography>
            </Box>
            <Box sx={{ width: COL.actions, flexShrink: 0 }} />
          </Box>

          {/* Resolved (real data) rows */}
          {filteredResolved.map(item => {
            const isEditing = inlineEditId === item.id;
            const isSelected = selectedIds.has(item.id);
            const isRowActive = !isEditing && (isSelected || hoveredRowId === item.id || rowMenuId === item.id || locationItemId === item.id);
            const showEdit = item.estado === 'Activa' || item.estado === 'Suspendida';
            const hasMenu = item.estado !== 'Descartada';
            const menuActions = MENU_ACTIONS[item.estado];

            if (isEditing) {
              return (
                <Box
                  key={item.id}
                  sx={{ display: 'flex', alignItems: 'center', height: 40, width: '100%', flexShrink: 0, bgcolor: 'rgba(47,67,208,0.04)' }}
                >
                  <Box sx={{ width: COL.checkbox, flexShrink: 0 }} />
                  <Box sx={{ width: COL.codigo, px: '4px', flexShrink: 0 }}>
                    <InputBase
                      value={editCodigo}
                      onChange={e => setEditCodigo(e.target.value)}
                      sx={{
                        fontSize: '0.8125rem', width: '100%', height: 28,
                        border: '1px solid', borderColor: 'primary.main', borderRadius: '4px',
                        px: '8px', bgcolor: 'background.paper',
                        '& input': { p: 0 },
                      }}
                    />
                  </Box>
                  <Box sx={{ flex: 1, px: '4px', minWidth: 0 }}>
                    <InputBase
                      value={editNombre}
                      onChange={e => setEditNombre(e.target.value)}
                      autoFocus
                      sx={{
                        fontSize: '0.8125rem', width: '100%', height: 28,
                        border: '1px solid', borderColor: 'primary.main', borderRadius: '4px',
                        px: '8px', bgcolor: 'background.paper',
                        '& input': { p: 0 },
                      }}
                    />
                  </Box>
                  <Box sx={{ width: COL.ubicacion, flexShrink: 0 }} />
                  <Box sx={{ width: COL.creacion, flexShrink: 0 }} />
                  <Box sx={{ width: COL.estado, flexShrink: 0 }} />
                  <Box sx={{ width: COL.actions, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', pr: 0.5 }}>
                    <IconButton
                      size="small"
                      sx={{ p: '4px', color: 'success.main' }}
                      onClick={() => {
                        if (editNombre.trim()) {
                          updateNode(item.id, editNombre.trim(), editCodigo.trim());
                        }
                        setInlineEditId(null);
                      }}
                    >
                      <IconCheck size={14} />
                    </IconButton>
                    <IconButton
                      size="small"
                      sx={{ p: '4px', color: 'text.secondary' }}
                      onClick={() => setInlineEditId(null)}
                    >
                      <IconX size={14} />
                    </IconButton>
                  </Box>
                </Box>
              );
            }

            return (
              <Box
                key={item.id}
                onMouseEnter={() => setHoveredRowId(item.id)}
                onMouseLeave={() => setHoveredRowId(null)}
                sx={{
                  display: 'flex', alignItems: 'center', height: 40, width: '100%', flexShrink: 0,
                  bgcolor: isRowActive ? 'rgba(47,67,208,0.04)' : 'transparent',
                  transition: 'background-color 0.12s',
                }}
              >
                {/* Checkbox cell */}
                <Box sx={{ width: COL.checkbox, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {isRowActive && (
                    <Checkbox
                      size="small"
                      checked={isSelected}
                      onChange={() => toggleSelect(item.id)}
                      onClick={e => e.stopPropagation()}
                      sx={{ p: '3px', '& .MuiSvgIcon-root': { fontSize: 16 } }}
                    />
                  )}
                </Box>

                <Box sx={{ width: COL.codigo, px: 1, flexShrink: 0, overflow: 'hidden' }}>
                  <Typography variant="body2" sx={{ fontSize: '0.8125rem', letterSpacing: '0.17px', whiteSpace: 'nowrap' }}>
                    {item.codigo}
                  </Typography>
                </Box>
                <Box sx={{ flex: 1, px: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', minWidth: 0 }}>
                  <Typography variant="subtitle2" sx={{ fontSize: '0.8125rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', lineHeight: item.descripcion ? 1.3 : undefined }}>
                    {item.nombre}
                  </Typography>
                  {item.descripcion && (
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.6875rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', lineHeight: 1.3 }}>
                      {item.descripcion}
                    </Typography>
                  )}
                </Box>
                <Box sx={{ width: COL.ubicacion, px: 1, flexShrink: 0, overflow: 'hidden', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Typography variant="body2" sx={{ fontSize: '0.8125rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flex: 1 }}>
                    {item.ubicacion}
                  </Typography>
                  {isRowActive && item.estado !== 'Descartada' && (
                    <Tooltip title="Cambiar ubicación" placement="top" arrow>
                      <IconButton
                        size="small"
                        sx={{ p: '3px', color: 'primary.main', flexShrink: 0 }}
                        onClick={e => { e.stopPropagation(); openLocation(e, item.id); }}
                      >
                        <IconStatusChange size={13} />
                      </IconButton>
                    </Tooltip>
                  )}
                </Box>
                <Box sx={{ width: COL.creacion, px: 1, flexShrink: 0 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8125rem', whiteSpace: 'nowrap' }}>
                    {item.creacion}
                  </Typography>
                </Box>
                <Box sx={{ width: COL.estado, px: 1, display: 'flex', justifyContent: 'center', flexShrink: 0 }}>
                  <StatusChip value={item.estado} />
                </Box>

                {/* Actions cell */}
                <Box sx={{ width: COL.actions, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', pr: 0.5, gap: 0 }}>
                  {isRowActive && (
                    <>
                      {showEdit && (
                        <Tooltip title="Editar" placement="top" arrow>
                          <IconButton
                            size="small"
                            sx={{ p: '4px', color: 'primary.main' }}
                            onClick={e => {
                              e.stopPropagation();
                              const node = tree.find(n => n.id === item.id);
                              setEditDrawerNode({ id: item.id, nombre: item.nombre, codigo: item.codigo, unitType: node?.unitType, parentId: node?.parentId ?? null });
                            }}
                          >
                            <IconPencil size={14} />
                          </IconButton>
                        </Tooltip>
                      )}
                      <Tooltip title="Historial" placement="top" arrow>
                        <IconButton size="small" sx={{ p: '4px', color: 'primary.main' }}>
                          <IconHistory size={14} />
                        </IconButton>
                      </Tooltip>
                      {hasMenu && menuActions && (
                        <Tooltip title="Más opciones" placement="top" arrow>
                          <IconButton
                            size="small"
                            sx={{ p: '4px', color: 'primary.main' }}
                            onClick={e => {
                              e.stopPropagation();
                              setRowMenuId(item.id);
                              setRowMenuAnchor(e.currentTarget);
                            }}
                          >
                            <IconDotsVertical size={14} />
                          </IconButton>
                        </Tooltip>
                      )}
                    </>
                  )}
                </Box>
              </Box>
            );
          })}

          {/* Row context menu — items depend on the hovered row's estado */}
          {(() => {
            const rowItem = filteredResolved.find(d => d.id === rowMenuId);
            const actions = rowItem ? (MENU_ACTIONS[rowItem.estado] ?? []) : [];
            const ACCION_MAP: Partial<Record<string, AccionType>> = {
              Suspender: 'suspender', Inactivar: 'inactivar',
              Reactivar: 'reactivar', Reabrir:   'reabrir',
            };
            const closeMenu = () => { setRowMenuId(null); setRowMenuAnchor(null); };
            const openDialog = (accionType: AccionType) => {
              if (!rowItem) return;
              const node = tree.find(n => n.id === rowItem.id);
              setAccionDialog({
                accion: accionType,
                itemId: rowItem.id,
                itemCodigo: rowItem.codigo,
                itemNombre: rowItem.nombre,
                itemUbicacion: rowItem.ubicacion,
                unitType: node?.unitType,
              });
            };
            const buildRevisarState = (): RevisarBorradorState | null => {
              if (!rowItem) return null;
              const node = tree.find(n => n.id === rowItem.id);
              return { itemId: rowItem.id, itemNombre: rowItem.nombre, itemCodigo: rowItem.codigo, itemParentId: node?.parentId ?? null, unitType: node?.unitType };
            };
            return (
              <Menu
                anchorEl={rowMenuAnchor}
                open={Boolean(rowMenuAnchor)}
                onClose={closeMenu}
                elevation={8}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                MenuListProps={{ dense: true, sx: { py: 0.5 } }}
                slotProps={{ paper: { sx: { borderRadius: 1, minWidth: 150 } } }}
              >
                {actions.map((action, idx) => {
                  const accionType = ACCION_MAP[action.label];
                  return [
                    idx > 0 && actions[idx - 1].danger === undefined && action.danger && (
                      <Divider key={`div-${action.label}`} />
                    ),
                    <MenuItem
                      key={action.label}
                      dense
                      onClick={() => {
                        closeMenu();
                        if (action.label === 'Revisar') { setRevisarState(buildRevisarState()); return; }
                        if (action.label === 'Descartar') {
                          if (rowItem) setDescartarDirectoState({ itemId: rowItem.id, itemNombre: rowItem.nombre, itemCodigo: rowItem.codigo, unitType: tree.find(n => n.id === rowItem.id)?.unitType });
                          return;
                        }
                        if (accionType) openDialog(accionType);
                      }}
                      sx={action.danger ? { color: 'error.main' } : undefined}
                    >
                      <ListItemIcon sx={{ minWidth: 28, color: action.danger ? 'error.main' : 'action.active' }}>
                        <action.Icon size={16} />
                      </ListItemIcon>
                      <Typography variant="body2" sx={{ letterSpacing: '0.17px' }}>{action.label}</Typography>
                    </MenuItem>,
                  ];
                })}
              </Menu>
            );
          })()}

          {/* Empty state — no results after search/filter */}
          {filteredResolved.length === 0 && skeletonCount === 0 && isCompleted && (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3, flex: 1, py: 4, bgcolor: 'grey.50', borderRadius: 1 }}>
              <EmptyStateIllustration />
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                <Typography sx={{ fontWeight: 600, fontSize: '1rem', lineHeight: '16px', letterSpacing: '0.15px', color: 'text.primary' }}>
                  Sin resultados
                </Typography>
                <Typography sx={{ fontSize: '0.875rem', lineHeight: '16px', letterSpacing: '0.15px', color: 'text.secondary', textAlign: 'center' }}>
                  No encontramos coincidencias para tu búsqueda.
                </Typography>
              </Box>
            </Box>
          )}

          {/* Skeleton rows — pending items (visible but not yet resolved), only when no filter/search active */}
          {activeFilter === 'Todas' && !q && Array.from({ length: skeletonCount }).map((_, i) => {
            const opacity = Math.max(1 - (filteredResolved.length + i) * 0.08, 0.2);
            return (
              <Box key={`skel-${i}`} sx={{ display: 'flex', alignItems: 'center', height: 40, width: '100%', opacity, flexShrink: 0 }}>
                <Box sx={{ display: 'flex', flex: 1, gap: 2, alignItems: 'center', minWidth: 0 }}>
                  <Skeleton variant="rectangular" animation="wave" sx={{ ...SKELETON_SX, width: 107 }} />
                  <Skeleton variant="rectangular" animation="wave" sx={{ ...SKELETON_SX, width: 293 }} />
                  <Skeleton variant="rectangular" animation="wave" sx={{ ...SKELETON_SX, width: 146 }} />
                  <Skeleton variant="rectangular" animation="wave" sx={{ ...SKELETON_SX, width: 97 }} />
                  <Skeleton variant="rectangular" animation="wave" sx={{ ...SKELETON_SX, width: 75 }} />
                  <Skeleton variant="rectangular" animation="wave" sx={{ ...SKELETON_SX, flex: 1, minWidth: 0, width: undefined }} />
                </Box>
              </Box>
            );
          })}

          {/* Cambiar Ubicación panel */}
          <Popover
            open={Boolean(locationAnchor)}
            anchorEl={locationAnchor}
            onClose={() => { setLocationAnchor(null); setLocationItemId(null); }}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
            transformOrigin={{ vertical: 'top', horizontal: 'left' }}
            slotProps={{
              paper: {
                sx: {
                  width: 334, borderRadius: 1.5,
                  maxHeight: 440, display: 'flex', flexDirection: 'column', overflow: 'hidden',
                  boxShadow: '0px 3px 14px 2px rgba(93,109,126,0.09), 0px 8px 10px 1px rgba(93,109,126,0.14)',
                },
              },
            }}
          >
            <Typography variant="subtitle2" sx={{ px: 1.5, py: 1, fontWeight: 600, fontSize: '0.8125rem', letterSpacing: '0.15px', flexShrink: 0 }}>
              Cambiar Ubicación
            </Typography>

            {/* Scrollable tree */}
            <Box sx={{ overflow: 'auto', flex: 1 }}>
              {locVisibleNodes.map((node) => {
                const isRoot = node.type === 'root';
                const isSelected = locSelectedId === node.id;
                const isHovered = locHoveredId === node.id;
                const hasChildren = locGroupNodes.some(n => n.parentId === node.id);
                const isExpanded = locExpandedIds.has(node.id);
                const childCount = tree.filter(n => n.parentId === node.id).length;

                return (
                  <Box
                    key={node.id}
                    onMouseEnter={() => setLocHoveredId(node.id)}
                    onMouseLeave={() => setLocHoveredId(null)}
                    onClick={() => {
                      if (!isRoot) setLocSelectedId(node.id);
                      if (hasChildren) {
                        setLocExpandedIds(prev => {
                          const next = new Set(prev);
                          next.has(node.id) ? next.delete(node.id) : next.add(node.id);
                          return next;
                        });
                      }
                    }}
                    sx={{
                      display: 'flex', alignItems: 'center', height: 36,
                      pl: `${4 + node.level * 20}px`, pr: 1.5,
                      cursor: isRoot ? 'default' : 'pointer',
                      bgcolor: isSelected ? 'rgba(47,67,208,0.08)' : isHovered && !isRoot ? 'rgba(47,67,208,0.04)' : 'transparent',
                    }}
                  >

                    {/* Chevron */}
                    <Box sx={{ width: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {!isRoot && (hasChildren
                        ? (isExpanded
                            ? <IconChevronDown size={12} color="rgba(16,24,64,0.54)" />
                            : <IconChevronRight size={12} color="rgba(16,24,64,0.54)" />)
                        : null
                      )}
                    </Box>

                    {/* Icon */}
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, mr: '4px' }}>
                      {isSelected
                        ? <IconCircleCheckFilled size={14} color="#5323de" />
                        : isRoot
                          ? <IconBuildingCommunity size={14} color="rgba(16,24,64,0.54)" />
                          : <IconSitemap size={14} color="rgba(16,24,64,0.54)" />
                      }
                    </Box>

                    {/* Label */}
                    <Typography
                      variant="body2"
                      sx={{
                        flex: 1, fontSize: '0.8125rem', whiteSpace: 'nowrap',
                        overflow: 'hidden', textOverflow: 'ellipsis',
                        color: isSelected ? 'primary.main' : 'text.primary',
                        fontWeight: isSelected ? 500 : 400,
                      }}
                    >
                      {node.label}
                    </Typography>

                    {/* Count */}
                    <Typography variant="caption" sx={{ color: 'text.secondary', flexShrink: 0, fontSize: '0.75rem', fontWeight: 500, ml: 0.5 }}>
                      {childCount}
                    </Typography>
                  </Box>
                );
              })}
            </Box>

            {/* Footer */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1, px: 1.5, py: 1, borderTop: '1px solid', borderColor: 'divider', flexShrink: 0 }}>
              <Box
                onClick={() => { setLocationAnchor(null); setLocationItemId(null); }}
                sx={{ cursor: 'pointer', fontSize: '0.8125rem', color: 'text.secondary', px: 1, py: 0.5, borderRadius: 0.5, '&:hover': { bgcolor: 'action.hover' } }}
              >
                Cancelar
              </Box>
              <Box
                onClick={() => {
                  if (locationItemId && locSelectedId) moveNode(locationItemId, locSelectedId);
                  setLocationAnchor(null);
                  setLocationItemId(null);
                }}
                sx={{
                  cursor: 'pointer', fontSize: '0.8125rem', fontWeight: 500,
                  bgcolor: 'primary.main', color: 'white',
                  px: 1.5, py: 0.5, borderRadius: 0.5,
                  '&:hover': { bgcolor: 'primary.dark' },
                }}
              >
                Cambiar
              </Box>
            </Box>
          </Popover>

          {/* Cosmos loader — centered, only during extraction */}
          {!isCompleted && (
            <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', pointerEvents: 'none' }}>
              <CosmosLoader />
            </Box>
          )}
        </Box>
      </Box>

      {/* Floating bulk-action bar — appears when 1+ rows are selected */}
      {selectedIds.size > 0 && (
        <Box sx={{
          position: 'absolute',
          bottom: 12,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 680,
          borderRadius: '4px',
          border: '0.5px solid #495bdc',
          background: 'linear-gradient(90deg, rgba(47,67,208,0.08), rgba(47,67,208,0.08)), #fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 2,
          py: 1.5,
          zIndex: 20,
          boxShadow: '0px 4px 16px rgba(47,67,208,0.12)',
        }}>
          <Typography variant="body2" sx={{ fontSize: '0.8125rem', whiteSpace: 'nowrap' }}>
            {selectedIds.size} seleccionado{selectedIds.size !== 1 ? 's' : ''}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <Button
              variant="text"
              size="medium"
              onClick={() => setSelectedIds(new Set())}
              sx={{ textTransform: 'none', fontSize: '0.8125rem', color: 'primary.main', py: '6px', px: 2 }}
            >
              Cancelar
            </Button>
            <Button
              variant="outlined"
              size="medium"
              onClick={() => { setMassSuspendMotivo(''); setMassSuspendFecha(null); setMassSuspendOpen(true); }}
              sx={{ textTransform: 'none', fontSize: '0.8125rem', color: 'primary.main', borderColor: 'rgba(47,67,208,0.5)', py: '6px', px: 2 }}
            >
              Suspender
            </Button>
          </Box>
        </Box>
      )}

      {/* Mass suspend dialog */}
      {(() => {
        const currentTab = UNIT_TYPE_TABS[activeTab];
        const unitPlural = currentTab?.name.toLowerCase() ?? 'unidades';
        const count = selectedIds.size;
        const confirmSuspend = () => {
          const ids = Array.from(selectedIds);
          ids.forEach(id => updateNodeStatus(id, 'Suspendida'));
          setSelectedIds(new Set());
          setMassSuspendOpen(false);
          setSnackbarMsg(`${count} ${unitPlural} suspendidos`);
          setSnackbarOpen(true);
        };
        return (
          <Dialog
            open={massSuspendOpen}
            onClose={() => setMassSuspendOpen(false)}
            maxWidth={false}
            slotProps={{ paper: { sx: { width: 444, borderRadius: '4px' } } }}
          >
            {/* Header */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 3, pt: 2, pb: 1.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 32, height: 32, borderRadius: '50%', flexShrink: 0, bgcolor: 'rgba(249,104,0,0.10)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <IconAlertTriangle size={18} color="#f96800" />
                </Box>
                <Typography sx={{ fontWeight: 600, fontSize: '1rem', lineHeight: 1.3 }}>
                  Suspender {count} {unitPlural}
                </Typography>
              </Box>
              <IconButton size="small" onClick={() => setMassSuspendOpen(false)} sx={{ color: 'action.active', alignSelf: 'flex-start' }}>
                <IconX size={16} />
              </IconButton>
            </Box>

            {/* Body */}
            <Box sx={{ px: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography variant="body2" sx={{ fontSize: '0.8125rem', lineHeight: 1.6 }}>
                {'Los '}
                <Box component="span" sx={{ fontWeight: 600 }}>{count} {unitPlural}</Box>
                {' seleccionados dejarán de estar disponibles para nuevos hechos económicos. Podrás reactivarlos más adelante cuando lo necesites.'}
              </Typography>

              {/* Motivo */}
              <Box sx={{ position: 'relative', mt: '4px' }}>
                <Typography component="span" sx={{ position: 'absolute', top: -9, left: 10, px: '4px', bgcolor: 'background.paper', fontSize: '0.6875rem', color: 'text.secondary', lineHeight: 1, zIndex: 1 }}>
                  Agrega un motivo (opcional)
                </Typography>
                <Box sx={{ border: '1px solid rgba(16,24,64,0.23)', borderRadius: '4px', '&:focus-within': { borderColor: 'primary.main', outline: '1px solid', outlineColor: 'primary.main' } }}>
                  <InputBase
                    value={massSuspendMotivo}
                    onChange={e => setMassSuspendMotivo(e.target.value)}
                    placeholder="Ej.: Cierre temporal por remodelación..."
                    sx={{ width: '100%', px: 1.5, py: '7px', fontSize: '0.8125rem', '& input': { p: 0 } }}
                  />
                </Box>
              </Box>

              <Typography variant="body2" sx={{ fontSize: '0.8125rem', lineHeight: 1.6 }}>
                También puedes definir una fecha estimada de reactivación.
              </Typography>

              {/* Date */}
              <DatePicker
                label="Fecha estimada de reactivación"
                value={massSuspendFecha}
                onChange={setMassSuspendFecha}
                format="DD/MM/YYYY"
                slotProps={{ textField: { size: 'small', sx: { width: 280 } } }}
              />
            </Box>

            {/* Footer */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, px: 3, py: 2 }}>
              <Button
                variant="text" size="small"
                onClick={() => setMassSuspendOpen(false)}
                sx={{ textTransform: 'none', fontSize: '0.875rem', color: 'text.secondary' }}
              >
                Cancelar
              </Button>
              <Button
                variant="contained" size="small" color="warning"
                onClick={confirmSuspend}
                sx={{ textTransform: 'none', fontSize: '0.875rem' }}
              >
                Suspender
              </Button>
            </Box>
          </Dialog>
        );
      })()}

      <CrearGrupoDrawer
        open={crearGrupoOpen}
        onClose={() => setCrearGrupoOpen(false)}
        onCrear={() => { setSnackbarMsg('Grupo creado'); setSnackbarOpen(true); }}
      />
      <CrearUnidadDrawer
        open={Boolean(crearUnidadType)}
        unitType={crearUnidadType ?? null}
        onClose={() => setCrearUnidadType(null)}
        onCrear={(_, __, ut) => {
          const MENSAJES: Record<string, string> = {
            'Grupo': 'Grupo creado', 'Centro de costos': 'Centro de costos creado',
            'Proyecto': 'Proyecto creado', 'Sucursal': 'Sucursal creada',
            'Inmueble': 'Inmueble creado', 'Departamento': 'Departamento creado',
          };
          setSnackbarMsg(MENSAJES[ut] ?? `${ut} creado`);
          setSnackbarOpen(true);
        }}
        onGuardarBorrador={(_, __, ut) => {
          setSnackbarMsg(ut ? `${ut} guardado como borrador` : 'Borrador guardado');
          setSnackbarOpen(true);
        }}
      />
      <ConfirmarAccionDialog
        open={Boolean(accionDialog)}
        state={accionDialog}
        onClose={() => setAccionDialog(null)}
        onConfirm={(state) => {
          const STATUS_MAP: Record<AccionType, OrgNodeStatus> = {
            suspender: 'Suspendida',
            inactivar: 'Inactivo',
            reactivar: 'Activa',
            reabrir:   'Activa',
          };
          updateNodeStatus(state.itemId, STATUS_MAP[state.accion]);
          setSnackbarMsg(getMensajeAccion(state.accion, state.unitType));
          setSnackbarOpen(true);
          setAccionDialog(null);
        }}
      />
      <EditarUnidadDrawer
        open={Boolean(editDrawerNode)}
        nodeId={editDrawerNode?.id ?? null}
        unitType={editDrawerNode?.unitType ?? null}
        initialNombre={editDrawerNode?.nombre ?? ''}
        initialCodigo={editDrawerNode?.codigo ?? ''}
        initialParentId={editDrawerNode?.parentId ?? null}
        onClose={() => setEditDrawerNode(null)}
        onSave={(nodeId, nombre, codigo, newParentId) => {
          updateNode(nodeId, nombre, codigo);
          if (newParentId && newParentId !== editDrawerNode?.parentId) moveNode(nodeId, newParentId);
          setEditDrawerNode(null);
        }}
      />

      {/* Revisar borrador drawer */}
      <RevisarBorradorDrawer
        open={Boolean(revisarState)}
        state={revisarState}
        tree={tree}
        onClose={() => setRevisarState(null)}
        onActivar={(id, nombre, codigo, selectedParentId) => {
          updateNodeStatus(id, 'Activa');
          updateNode(id, nombre, codigo);
          if (selectedParentId && selectedParentId !== revisarState?.itemParentId) moveNode(id, selectedParentId);
          setRevisarState(null);
          setSnackbarMsg(`${revisarState?.unitType ?? 'Unidad'} activado`);
          setSnackbarOpen(true);
        }}
        onDescartar={(id) => {
          updateNodeStatus(id, 'Descartada');
          setRevisarState(null);
          setSnackbarMsg(`${revisarState?.unitType ?? 'Unidad'} descartado`);
          setSnackbarOpen(true);
        }}
      />

      {/* Descartar directo desde menú (sin abrir el drawer) */}
      <DescartarBorradorDialog
        open={Boolean(descartarDirectoState)}
        state={descartarDirectoState}
        onClose={() => setDescartarDirectoState(null)}
        onConfirm={(id) => {
          updateNodeStatus(id, 'Descartada');
          setDescartarDirectoState(null);
          setSnackbarMsg(`${descartarDirectoState?.unitType ?? 'Unidad'} descartado`);
          setSnackbarOpen(true);
        }}
      />

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={5000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        slots={{ transition: SlideUp }}
      >
        <SnackbarContent
          sx={{ bgcolor: '#f2f9e7', minWidth: 'auto', color: 'text.primary' }}
          message={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <IconCircleCheckFilled size={16} color="#72b525" />
              <Typography variant="body2" sx={{ color: 'text.primary' }}>
                {snackbarMsg}
              </Typography>
            </Box>
          }
          action={
            <IconButton size="small" onClick={() => setSnackbarOpen(false)} sx={{ color: 'text.secondary' }}>
              <IconX size={16} />
            </IconButton>
          }
        />
      </Snackbar>
    </Box>
  );
}
