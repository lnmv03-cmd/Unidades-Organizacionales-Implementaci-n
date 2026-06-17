import { Fragment, useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import InputBase from '@mui/material/InputBase';
import ListItemIcon from '@mui/material/ListItemIcon';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Slide from '@mui/material/Slide';
import type { SlideProps } from '@mui/material/Slide';
import Snackbar from '@mui/material/Snackbar';
import SnackbarContent from '@mui/material/SnackbarContent';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import {
  IconArrowsSplit,
  IconBuildingCommunity,
  IconCheck,
  IconChevronDown,
  IconChevronRight,
  IconCircleCheckFilled,
  IconCircleMinus,
  IconClipboardText,
  IconCornerDownRight,
  IconDeviceDesktopAnalytics,
  IconChecklist,
  IconInfoCircle,
  IconDotsVertical,
  IconGitMerge,
  IconGripVertical,
  IconLock,
  IconMap2,
  IconPencil,
  IconPlayerPause,
  IconPlayerPlay,
  IconPlus,
  IconSearch,
  IconSitemap,
  IconTrash,
  IconUsers,
  IconX,
} from '@tabler/icons-react';
import { CrearGrupoDrawer } from '@/features/crear-grupo';
import { CrearUnidadDrawer } from '@/features/crear-unidad';
import { ConfirmarAccionDialog } from '@/features/confirmar-accion-unidad';
import type { AccionDialogState, AccionType } from '@/features/confirmar-accion-unidad';
import { RevisarBorradorDrawer, DescartarBorradorDialog } from '@/features/revisar-borrador';
import type { RevisarBorradorState, DescartarBorradorState } from '@/features/revisar-borrador';
import { useEstructuraStore } from '@/shared/model/estructura.store';
import type { OrgNodeStatus, UnitType } from '@/shared/config/org-types';
import { IaLabel, EmptyStateIllustration } from '@/shared/ui';
import {
  FILTER_CHIPS,
  type FilterKey,
  type OrgNode,
} from '../lib/org-tree';
import { useVisualizarEstructura } from '../hooks/useVisualizarEstructura';

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

// ---------------------------------------------------------------------------
// Status chip config (shown on hover rows)
// ---------------------------------------------------------------------------

const STATUS_CHIP: Partial<Record<OrgNodeStatus, { label: string; color: string }>> = {
  Suspendida: { label: 'Suspendida', color: '#f96800' },
  Descartada: { label: 'Descartada', color: '#c63434' },
  Pendiente:  { label: 'Pendiente',  color: '#228db8' },
};

// ---------------------------------------------------------------------------
// Context menu actions per status (⋮ button)
// Figma: node 6211-37867, menus 6211-34102 / 6214-45901 / 6214-46729 / 6214-48158
// ---------------------------------------------------------------------------

type TablerIcon = typeof IconPencil;
type MenuAction = { label: string; Icon: TablerIcon; dividerBefore?: boolean; danger?: boolean };

const STATUS_MENU_ACTIONS: Partial<Record<OrgNodeStatus, MenuAction[]>> = {
  Activa: [
    { label: 'Suspender', Icon: IconPlayerPause },
    { label: 'Fusionar',  Icon: IconGitMerge },
    { label: 'Dividir',   Icon: IconArrowsSplit },
    { label: 'Inactivar', Icon: IconCircleMinus, dividerBefore: true, danger: true },
  ],
  Suspendida: [
    { label: 'Reactivar', Icon: IconPlayerPlay },
    { label: 'Fusionar',  Icon: IconGitMerge },
    { label: 'Dividir',   Icon: IconArrowsSplit },
    { label: 'Inactivar', Icon: IconCircleMinus, dividerBefore: true, danger: true },
  ],
  Inactivo: [
    { label: 'Reabrir', Icon: IconLock },
  ],
  Pendiente: [
    { label: 'Revisar',   Icon: IconChecklist },
    { label: 'Descartar', Icon: IconTrash, dividerBefore: true, danger: true },
  ],
};

// Grupos only have the Inactivar action (Figma node 6211-33464)
const GRUPO_MENU_ACTIONS: MenuAction[] = [
  { label: 'Inactivar', Icon: IconCircleMinus, danger: true },
];

// Inactive grupos only show Reactivar (Figma node 6334-36240)
const GRUPO_INACTIVO_MENU_ACTIONS: MenuAction[] = [
  { label: 'Reactivar', Icon: IconPlayerPlay },
];

// ---------------------------------------------------------------------------
// Inactivar grupo dialog (Figma node 6306-60516)
// ---------------------------------------------------------------------------

interface InactivarGrupoState { grupoId: string; grupoNombre: string }

function getAllDescendants(id: string, tree: OrgNode[]): OrgNode[] {
  const children = tree.filter(n => n.parentId === id);
  return [...children, ...children.flatMap(c => getAllDescendants(c.id, tree))];
}

function InactivarGrupoDialog({ open, state, tree, onClose, onConfirm }: {
  open: boolean;
  state: InactivarGrupoState | null;
  tree: OrgNode[];
  onClose: () => void;
  onConfirm: (s: InactivarGrupoState) => void;
}) {
  const [motivo, setMotivo] = useState('');
  const [prevId, setPrevId] = useState<string | null>(null);
  const currentId = state?.grupoId ?? null;
  if (currentId !== prevId) { setPrevId(currentId); setMotivo(''); }

  if (!state) return null;
  const targetNode = tree.find(n => n.id === state.grupoId);
  const descendants = getAllDescendants(state.grupoId, tree);
  const grupoCount = 1 + descendants.filter(n => n.type === 'grupo').length;
  const unidadCount = descendants.filter(n => n.type === 'unidad').length;
  const impactNodes = targetNode ? [targetNode, ...descendants] : [];
  const baseLevel = targetNode?.level ?? 0;

  return (
    <Dialog open={open} onClose={onClose} PaperProps={{ sx: { maxWidth: 540, width: '100%', borderRadius: 1 } }}>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 2, px: 3 }}>
        <Box sx={{ bgcolor: '#f1c7c7', borderRadius: '50px', p: '6px', display: 'flex', flexShrink: 0 }}>
          <IconCircleMinus size={20} color="#c63434" />
        </Box>
        <Typography sx={{ flex: 1, fontWeight: 600, fontSize: '1rem', letterSpacing: '0.15px' }}>
          Inactivar grupo y su estructura asociada
        </Typography>
        <IconButton size="small" sx={{ p: '3px', flexShrink: 0 }} onClick={onClose}>
          <IconX size={16} />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ px: 2, pt: 1, pb: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Typography variant="body2" sx={{ fontSize: '0.8125rem', lineHeight: 1.6, letterSpacing: '0.17px' }}>
          El grupo <Box component="span" sx={{ fontWeight: 500 }}>{state.grupoNombre}</Box> se inactivará junto con todos los elementos que dependen de él. Esta acción se aplicará en cascada sobre{' '}
          <Box component="span" sx={{ fontWeight: 500 }}>{grupoCount} grupos y {unidadCount} unidades asociadas.</Box>
        </Typography>

        <TextField
          label="* Motivo de inactivación"
          placeholder="Ej.: Unificación con otro centro de costos..."
          value={motivo}
          onChange={e => setMotivo(e.target.value)}
          size="small"
          fullWidth
          variant="outlined"
          InputLabelProps={{ shrink: true }}
        />

        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <Typography sx={{ fontSize: '0.8125rem', fontWeight: 500, letterSpacing: '0.1px' }}>
              Impacto en la estructura
            </Typography>
            <Tooltip
              placement="right"
              slotProps={{
                tooltip: {
                  sx: {
                    bgcolor: 'white',
                    color: 'rgba(16,24,64,0.87)',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
                    border: '1px solid #eaebec',
                    borderRadius: '8px',
                    p: 1.5,
                    maxWidth: 280,
                  },
                },
                arrow: { sx: { display: 'none' } },
              }}
              title={
                <Box>
                  <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, mb: '6px', color: 'rgba(16,24,64,0.87)' }}>
                    Detalle del impacto
                  </Typography>
                  <Box component="ul" sx={{ m: 0, pl: '16px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <Box component="li">
                      <Typography sx={{ fontSize: '0.75rem', lineHeight: 1.5, color: 'rgba(16,24,64,0.8)' }}>
                        Las unidades en estado <Box component="strong" sx={{ fontWeight: 600 }}>Pendiente</Box> se descartarán.
                      </Typography>
                    </Box>
                    <Box component="li">
                      <Typography sx={{ fontSize: '0.75rem', lineHeight: 1.5, color: 'rgba(16,24,64,0.8)' }}>
                        Las unidades <Box component="strong" sx={{ fontWeight: 600 }}>Activas</Box> y <Box component="strong" sx={{ fontWeight: 600 }}>Suspendidas</Box> pasarán a estado <Box component="strong" sx={{ fontWeight: 600 }}>Inactiva</Box>.
                      </Typography>
                    </Box>
                    <Box component="li">
                      <Typography sx={{ fontSize: '0.75rem', lineHeight: 1.5, color: 'rgba(16,24,64,0.8)' }}>
                        Los subgrupos también pasarán a estado <Box component="strong" sx={{ fontWeight: 600 }}>Inactiva</Box>.
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              }
            >
              <Box sx={{ display: 'flex', cursor: 'help' }}><IconInfoCircle size={16} color="rgba(16,24,64,0.54)" /></Box>
            </Tooltip>
          </Box>
          <Box sx={{ bgcolor: '#fbfbfb', border: '1px solid #eaebec', borderRadius: '4px', overflow: 'hidden', maxHeight: 280, overflowY: 'auto' }}>
            {impactNodes.map(node => {
              const rel = node.level - baseLevel;
              const isGrupo = node.type === 'grupo' || node.type === 'root';
              const base = 8 + rel * 16;
              const pl = isGrupo ? base : base + 16;
              return (
                <Box key={node.id} sx={{ display: 'flex', alignItems: 'center', height: 36, pl: `${pl}px`, pr: '8px', gap: '4px' }}>
                  {isGrupo && (
                    <Box sx={{ width: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {rel === 0
                        ? <IconChevronDown size={12} color="rgba(16,24,64,0.54)" />
                        : <IconChevronRight size={12} color="rgba(16,24,64,0.54)" />
                      }
                    </Box>
                  )}
                  <Box sx={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                    {isGrupo
                      ? <IconSitemap size={16} color="rgba(16,24,64,0.54)" />
                      : <IconCornerDownRight size={16} color="rgba(16,24,64,0.54)" />
                    }
                  </Box>
                  <Typography sx={{ fontSize: '0.8125rem', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {node.label}
                  </Typography>
                  {node.type === 'unidad' && node.unitType && (
                    <>
                      <Box sx={{ width: '1px', height: '12px', bgcolor: 'divider', mx: '4px', flexShrink: 0 }} />
                      <Typography sx={{ fontSize: '0.6875rem', color: 'text.secondary', whiteSpace: 'nowrap', flexShrink: 0, letterSpacing: '0.4px' }}>
                        {node.unitType}
                      </Typography>
                    </>
                  )}
                  <Chip label="Inactiva" size="small" sx={{ ml: 'auto', flexShrink: 0, bgcolor: '#fcd4d4', color: '#c63434', borderRadius: '4px', height: 18, fontSize: '0.6875rem', '& .MuiChip-label': { px: '6px' } }} />
                </Box>
              );
            })}
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 2, py: 1, gap: 1 }}>
        <Button variant="text" size="small" onClick={onClose} sx={{ textTransform: 'none', fontSize: '0.75rem', color: 'text.primary' }}>
          Cancelar
        </Button>
        <Button variant="contained" color="error" size="small" disabled={!motivo.trim()} onClick={() => onConfirm(state)} sx={{ textTransform: 'none', fontSize: '0.75rem' }}>
          Inactivar
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// OrgTreeRow props
// ---------------------------------------------------------------------------

interface RowProps {
  node: OrgNode;
  expanded: boolean;
  hasChildren: boolean;
  hovered: boolean;

  isDragging: boolean;
  onToggle: () => void;
  onSelect: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onDragStart: (e: React.DragEvent) => void;
  onDragEnd: () => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onDrop: () => void;
  onPlusClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
  onDotsClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
  onEditClick: () => void;
}

// ---------------------------------------------------------------------------
// Row component
// ---------------------------------------------------------------------------

function OrgTreeRow({
  node, expanded, hasChildren, hovered,
  isDragging,
  onToggle, onSelect, onMouseEnter, onMouseLeave,
  onDragStart, onDragEnd, onDragOver, onDragLeave, onDrop,
  onPlusClick, onDotsClick, onEditClick,
}: RowProps) {
  const isInactive = node.status === 'Inactivo' || node.status === 'Descartada';
  const statusChip = node.status ? STATUS_CHIP[node.status] : undefined;
  const indent = node.level * 20;
  const isRoot = node.type === 'root';
  const isGrupo = node.type === 'grupo';
  const isUnidad = node.type === 'unidad';
  const showChevron = isGrupo && hasChildren;

  return (
    <Box
      draggable={!isRoot && node.status !== 'Descartada'}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={isRoot || isUnidad ? undefined : onSelect}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      sx={{
        display: 'flex',
        alignItems: 'center',
        height: 36,
        pl: `${indent}px`,
        pr: 2,
        width: '100%',
        minWidth: 0,
        overflow: 'hidden',
        boxSizing: 'border-box',
        position: 'relative',
        opacity: isDragging ? 0.25 : 1,
        bgcolor: hovered ? 'rgba(47,67,208,0.04)' : 'transparent',
        borderBottom: isRoot ? '1px solid' : 'none',
        borderColor: 'divider',
        cursor: isRoot || isUnidad ? 'default' : 'pointer',
        transition: 'background-color 0.1s, opacity 0.15s',
      }}
    >
      {/* Drag handle */}
      <Box sx={{
        width: 14, height: 14, display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0, mr: '4px',
        visibility: hovered && !isRoot ? 'visible' : 'hidden',
        cursor: 'grab',
      }}>
        <IconGripVertical size={12} color="rgba(16,24,64,0.38)" />
      </Box>

      {/* Slot 1 (20px) — chevron para grupos, corner arrow para unidades.
           Ambos ocupan la misma posición horizontal → mismo nivel visual */}
      <Box
        sx={{ width: 16, height: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, mr: '4px', cursor: showChevron ? 'pointer' : 'default' }}
        onClick={e => { if (showChevron) { e.stopPropagation(); onToggle(); } }}
      >
        {isUnidad
          ? <IconCornerDownRight size={13} color="rgba(16,24,64,0.26)" />
          : showChevron
            ? expanded
              ? <IconChevronDown size={12} color="rgba(16,24,64,0.54)" />
              : <IconChevronRight size={12} color="rgba(16,24,64,0.54)" />
            : null
        }
      </Box>

      {/* Slot 2 — ícono de tipo o checkmark; omitido para unidades (sin contenido) */}
      {!isUnidad && (
        <Box sx={{ width: 16, display: 'flex', alignItems: 'center', flexShrink: 0, mr: '6px' }}>
          {isRoot && <IconBuildingCommunity size={16} color="rgba(47,67,208,1)" />}
          {isGrupo && <IconSitemap size={16} color={isInactive ? 'rgba(16,24,64,0.26)' : 'rgba(47,67,208,0.8)'} />}
        </Box>
      )}

      {/* Label — all nodes show "codigo nombre" when codigo is set */}
      <Box sx={{ display: 'flex', alignItems: 'baseline', gap: '4px', minWidth: 0, flexShrink: 1, mr: 1 }}>
        <Typography
          component="span"
          sx={{
            fontSize: '0.8125rem',
            color: isInactive ? 'text.disabled' : 'text.primary',
            fontWeight: isRoot ? 600 : isGrupo ? 500 : 400,
            textDecoration: isInactive && isUnidad ? 'line-through' : 'none',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            minWidth: 0,
          }}
        >
          {node.codigo ? `${node.codigo} ${node.label}` : node.label}
        </Typography>
      </Box>

      {/* Unit type */}
      {isUnidad && node.unitType && (
        <>
          <Typography variant="caption" sx={{ color: 'rgba(16,24,64,0.2)', fontSize: '0.75rem', flexShrink: 0, mr: 0.5 }}>|</Typography>
          <Typography
            variant="caption"
            sx={{
              color: isInactive ? 'text.disabled' : 'text.secondary',
              fontSize: '0.75rem',
              flexShrink: 0,
              mr: 1,
              textDecoration: isInactive ? 'line-through' : 'none',
            }}
          >
            {node.unitType}
          </Typography>
        </>
      )}

      {/* Status chip */}
      {statusChip && (
        <Box sx={{
          display: 'inline-flex', alignItems: 'center', flexShrink: 0, mr: 1,
          border: '1px solid', borderColor: statusChip.color, borderRadius: '4px',
          px: 0.75, height: 18,
        }}>
          <Typography variant="caption" sx={{ color: statusChip.color, fontSize: '0.6875rem', lineHeight: 1 }}>
            {statusChip.label}
          </Typography>
        </Box>
      )}

      <Box sx={{ flex: 1 }} />

      {/* Count badge — grupos when not hovered */}
      {!isUnidad && (
        <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.75rem', fontWeight: 500, flexShrink: 0 }}>
          {node.count}
        </Typography>
      )}

      {/* Hover actions — Descartada and inactive units show nothing */}
      {hovered && node.status !== 'Descartada' && !(isUnidad && isInactive) && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '2px', flexShrink: 0, ml: !isUnidad ? '4px' : 0 }}>
          {(isRoot || (isGrupo && !isInactive)) && (
            <Box sx={{ bgcolor: 'background.paper', border: '1px solid', borderColor: 'grey.200', borderRadius: '4px', p: '2px', display: 'flex' }}>
              <Tooltip title="Agregar" placement="top" arrow>
                <IconButton
                  size="small"
                  sx={{ p: '3px', color: 'primary.main' }}
                  onClick={e => { e.stopPropagation(); onPlusClick(e); }}
                >
                  <IconPlus size={14} />
                </IconButton>
              </Tooltip>
            </Box>
          )}
          {((isGrupo && !isInactive) || isUnidad) && (
            <Tooltip title="Editar" placement="top" arrow>
              <IconButton size="small" sx={{ p: '3px', color: 'primary.main' }}
                onClick={e => { e.stopPropagation(); onEditClick(); }}>
                <IconPencil size={14} />
              </IconButton>
            </Tooltip>
          )}
          {!isRoot && (
            <Tooltip title="Más opciones" placement="top" arrow>
              <IconButton
                size="small"
                sx={{ p: '3px', color: 'primary.main' }}
                onClick={e => { e.stopPropagation(); onDotsClick(e); }}
              >
                <IconDotsVertical size={14} />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      )}
    </Box>
  );
}

// ---------------------------------------------------------------------------
// Shared inline input row — used for both create (after parent) and edit (in place)
// ---------------------------------------------------------------------------

interface InlineInputRowProps {
  level: number;
  type: 'grupo' | 'unidad';
  initialCode: string;
  initialName: string;
  suggestedCode?: boolean;
  onConfirm: (name: string, code: string) => void;
  onCancel: () => void;
}

function InlineInputRow({ level, type, initialCode, initialName, suggestedCode, onConfirm, onCancel }: InlineInputRowProps) {
  const [name, setName] = useState(initialName);
  const [code, setCode] = useState(initialCode);
  const isGrupo = type === 'grupo';
  const indent = level * 20;
  const canConfirm = name.trim().length > 0;

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') { e.preventDefault(); if (canConfirm) onConfirm(name, code); }
    if (e.key === 'Escape') onCancel();
  };

  return (
    <Box sx={{
      display: 'flex', alignItems: 'center', height: 36,
      pl: `${indent}px`, pr: 1,
      width: '100%', minWidth: 0, overflow: 'hidden', boxSizing: 'border-box',
      bgcolor: 'rgba(47,67,208,0.06)',
      borderBottom: '1px solid rgba(47,67,208,0.12)',
    }}>
      {/* Grip placeholder */}
      <Box sx={{ width: 14, mr: '4px', flexShrink: 0 }} />

      {/* Slot 1: chevron or corner */}
      <Box sx={{ width: 16, height: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, mr: '4px' }}>
        {isGrupo
          ? <IconChevronRight size={12} color="rgba(16,24,64,0.38)" />
          : <IconCornerDownRight size={13} color="rgba(16,24,64,0.26)" />
        }
      </Box>

      {/* Slot 2: type icon (grupos only) */}
      {isGrupo && (
        <Box sx={{ width: 16, display: 'flex', alignItems: 'center', flexShrink: 0, mr: '6px' }}>
          <IconSitemap size={16} color="rgba(47,67,208,0.7)" />
        </Box>
      )}

      {/* Code input */}
      <InputBase
        value={code}
        onChange={e => setCode(e.target.value)}
        onKeyDown={handleKey}
        endAdornment={suggestedCode
          ? <InputAdornment position="end" sx={{ ml: '4px', mr: '4px' }}><IaLabel /></InputAdornment>
          : undefined
        }
        sx={{
          width: 96, flexShrink: 0, mr: '6px',
          border: '1px solid', borderColor: 'divider', borderRadius: '4px',
          pl: '8px', height: 26, fontSize: '0.8125rem',
          bgcolor: 'white', '& input': { p: 0 },
        }}
      />

      {/* Name input */}
      <InputBase
        autoFocus={!initialName}
        value={name}
        onChange={e => setName(e.target.value)}
        onKeyDown={handleKey}
        placeholder={isGrupo ? 'Nombre del grupo...' : 'Nombre de la unidad...'}
        sx={{
          width: '50%', mr: '6px',
          border: '1px solid', borderColor: 'primary.main',
          borderRadius: '4px', px: '8px', height: 26,
          fontSize: '0.8125rem', bgcolor: 'white', '& input': { p: 0 },
        }}
      />

      <IconButton size="small" sx={{ p: '3px', color: 'primary.main', '&:disabled': { color: 'action.disabled' } }}
        onClick={() => { if (canConfirm) onConfirm(name, code); }} disabled={!canConfirm}>
        <IconCheck size={14} />
      </IconButton>
      <IconButton size="small" sx={{ p: '3px', color: 'text.secondary' }} onClick={onCancel}>
        <IconX size={14} />
      </IconButton>
    </Box>
  );
}

// ---------------------------------------------------------------------------
// Main widget
// ---------------------------------------------------------------------------

export function VisualizarEstructura({ initFromOrg = true }: { initFromOrg?: boolean }) {
  const v = useVisualizarEstructura(initFromOrg);
  const { updateNodeStatus, updateNode, moveNode } = useEstructuraStore();
  const [rowHovered, setRowHovered] = useState<string | null>(null);
  const [accionDialog, setAccionDialog] = useState<AccionDialogState | null>(null);
  const [revisarState, setRevisarState] = useState<RevisarBorradorState | null>(null);
  const [descartarDirectoState, setDescartarDirectoState] = useState<DescartarBorradorState | null>(null);
  const [crearUnidadType, setCrearUnidadType] = useState<UnitType | null>(null);
  const [inactivarGrupoState, setInactivarGrupoState] = useState<InactivarGrupoState | null>(null);

  // ⋮ context menu state — capture position at click time so the element can unmount safely
  const [dotsPos, setDotsPos] = useState<{ top: number; left: number } | null>(null);
  const [dotsNode, setDotsNode] = useState<OrgNode | null>(null);

  // + add-child menu state
  const [addPos, setAddPos] = useState<{ top: number; left: number } | null>(null);
  const [addParentId, setAddParentId] = useState<string | null>(null);

  const handleDotsOpen = (e: React.MouseEvent<HTMLButtonElement>, node: OrgNode) => {
    const r = e.currentTarget.getBoundingClientRect();
    setDotsPos({ top: r.bottom + 2, left: r.right });
    setDotsNode(node);
  };

  const handleDotsClose = () => {
    setDotsPos(null);
    setDotsNode(null);
  };

  const dotsActions: MenuAction[] =
    dotsNode?.type === 'unidad' && dotsNode.status
      ? (STATUS_MENU_ACTIONS[dotsNode.status] ?? [])
      : dotsNode?.status === 'Inactivo'
        ? GRUPO_INACTIVO_MENU_ACTIONS
        : GRUPO_MENU_ACTIONS;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', position: 'relative' }}>

      {/* Search bar + Crear button */}
      <Box sx={{ display: 'flex', alignItems: 'center', px: 2, py: 1, gap: 1, flexShrink: 0 }}>
        <Box sx={{
          display: 'flex', alignItems: 'center', flex: 1, maxWidth: 462,
          border: '1px solid', borderColor: 'divider', borderRadius: 1, px: 1.5, height: 32,
          '&:focus-within': { borderColor: 'primary.main' },
        }}>
          <InputAdornment position="start" sx={{ mr: 0.5 }}>
            <IconSearch size={16} color="rgba(16,24,64,0.38)" />
          </InputAdornment>
          <InputBase
            placeholder="Buscar..."
            value={v.searchText}
            onChange={e => v.setSearchText(e.target.value)}
            sx={{ flex: 1, fontSize: '0.8125rem', '& input': { p: 0 } }}
          />
        </Box>

        <Box sx={{ flex: 1 }} />

        <Box
          onClick={e => v.setCrearMenuAnchor(e.currentTarget as HTMLElement)}
          sx={{
            display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer',
            bgcolor: 'primary.main', borderRadius: 1, px: '10px', height: 26,
            color: 'white',
            '&:hover': { bgcolor: 'primary.dark' },
          }}
        >
          <IconPlus size={14} />
          <Typography sx={{ fontSize: '0.75rem', fontWeight: 500, letterSpacing: '0.4px', lineHeight: '18px' }}>
            Crear
          </Typography>
          <IconChevronDown size={14} />
        </Box>
      </Box>

      {/* Filter chips */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 2, pb: 1, flexShrink: 0, flexWrap: 'wrap' }}>
        {FILTER_CHIPS.map(f => {
          const count = f.key === 'Todos'
            ? v.tree.filter(n => n.type === 'unidad').length
            : v.tree.filter(n => n.type === 'unidad' && n.unitType === f.key).length;
          const active = v.activeFilter === f.key;
          return (
            <Box
              key={f.key}
              onClick={() => v.setActiveFilter(f.key as FilterKey)}
              sx={{
                display: 'inline-flex', alignItems: 'center',
                height: 20, borderRadius: '4px', overflow: 'hidden',
                cursor: 'pointer', userSelect: 'none',
                bgcolor: active ? '#e1e6ff' : 'transparent',
                border: active ? 'none' : '1px solid #eaebec',
                '&:hover': {
                  bgcolor: active ? '#d0d8ff' : 'rgba(47,67,208,0.04)',
                  borderColor: active ? undefined : 'rgba(47,67,208,0.3)',
                },
              }}
            >
              <Typography sx={{ fontSize: '0.6875rem', lineHeight: '14px', letterSpacing: '0.16px', color: active ? '#2f43d0' : '#101840', fontWeight: 400, px: '6px', py: '3px', whiteSpace: 'nowrap' }}>
                {f.label}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mr: '4px', px: '5px', py: '2.5px', borderRadius: '100px', bgcolor: active ? '#2f43d0' : '#eaebec', minWidth: 14 }}>
                <Typography sx={{ fontSize: '0.6875rem', lineHeight: '11px', letterSpacing: '0.14px', color: active ? 'white' : 'rgba(16,24,64,0.6)', fontWeight: 500 }}>
                  {count}
                </Typography>
              </Box>
            </Box>
          );
        })}
      </Box>

      {/* Tree */}
      <Box sx={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', display: 'flex', flexDirection: 'column', px: 1, pb: 1 }}>
        {v.visibleNodes.length === 0 ? (
          <Box sx={{
            flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            gap: 3, bgcolor: '#fbfbfb', borderRadius: 2, px: 1, py: 1.5,
          }}>
            <EmptyStateIllustration />
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, width: '100%' }}>
              <Typography sx={{ fontFamily: 'Schibsted Grotesk, sans-serif', fontWeight: 600, fontSize: '1rem', lineHeight: '16px', letterSpacing: '0.15px', color: '#101840', textAlign: 'center' }}>
                Sin resultados
              </Typography>
              <Typography sx={{ fontSize: '0.875rem', lineHeight: '16px', letterSpacing: '0.15px', color: 'rgba(16,24,64,0.6)', textAlign: 'center' }}>
                No encontramos coincidencias para tu búsqueda.
              </Typography>
            </Box>
          </Box>
        ) : (
        <Box sx={{ px: '8px' }}>
        {v.visibleNodes.map(node => (
          <Fragment key={node.id}>
            {v.inlineEdit?.nodeId === node.id ? (
              <InlineInputRow
                level={node.level}
                type={node.type === 'unidad' ? 'unidad' : 'grupo'}
                initialCode={node.codigo ?? ''}
                initialName={node.label}
                suggestedCode={false}
                onConfirm={(name, code) => v.commitInlineEdit(node.id, name, code)}
                onCancel={v.cancelInlineEdit}
              />
            ) : (
              <OrgTreeRow
                node={node}
                expanded={v.expandedIds.has(node.id)}
                hasChildren={v.nodeHasChildren(node.id)}
                hovered={rowHovered === node.id || dotsNode?.id === node.id}
                isDragging={v.draggingId === node.id}
                onToggle={() => v.toggleNode(node.id)}
                onSelect={() => v.setSelectedId(v.selectedId === node.id ? null : node.id)}
                onMouseEnter={() => setRowHovered(node.id)}
                onMouseLeave={() => setRowHovered(null)}
                onDragStart={e => {
                  const el = e.currentTarget as HTMLElement;
                  const rect = el.getBoundingClientRect();
                  const clone = el.cloneNode(true) as HTMLElement;
                  clone.style.cssText = `
                    position:fixed;top:${-rect.height * 3}px;left:0;
                    width:${rect.width}px;height:${rect.height}px;
                    background:white;opacity:0.85;pointer-events:none;
                    border-radius:8px;box-shadow:0 8px 24px rgba(0,0,0,0.14);
                  `;
                  document.body.appendChild(clone);
                  e.dataTransfer.setDragImage(clone, e.clientX - rect.left, rect.height / 2);
                  requestAnimationFrame(() => document.body.removeChild(clone));
                  v.handleDragStart(node.id);
                }}
                onDragEnd={() => v.handleDragEnd()}
                onDragOver={e => v.handleDragOver(e, node.id)}
                onDragLeave={() => v.handleDragLeave(node.id)}
                onDrop={() => v.handleDrop(node.id)}
                onPlusClick={e => {
                  const r = e.currentTarget.getBoundingClientRect();
                  setAddPos({ top: r.bottom + 2, left: r.left });
                  setAddParentId(node.id);
                }}
                onDotsClick={e => handleDotsOpen(e, node)}
                onEditClick={() => v.startInlineEdit(node.id)}
              />
            )}
            {/* Predictive drop gap */}
            {v.dropTargetId === node.id && (
              <Box sx={{
                height: 36,
                pl: `${(node.level + 1) * 20}px`,
                pr: 2,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                mx: '4px',
                mb: '1px',
                bgcolor: 'rgba(47,67,208,0.05)',
                border: '1.5px dashed rgba(47,67,208,0.35)',
                borderRadius: '6px',
                animation: 'dropGapIn 0.12s ease',
                '@keyframes dropGapIn': {
                  from: { opacity: 0, transform: 'scaleY(0.4)' },
                  to:   { opacity: 1, transform: 'scaleY(1)' },
                },
              }}>
                <Box sx={{ width: 14, height: 14, border: '1.5px dashed rgba(47,67,208,0.4)', borderRadius: '3px', flexShrink: 0 }} />
                <Typography sx={{ fontSize: '0.6875rem', color: 'rgba(47,67,208,0.5)', fontStyle: 'italic', letterSpacing: '0.2px' }}>
                  Suelta aquí
                </Typography>
              </Box>
            )}
            {v.inlineCreate?.parentId === node.id && (
              <InlineInputRow
                level={v.inlineCreate.level}
                type={v.inlineCreate.type}
                initialCode={v.inlineCreate.autoCode}
                initialName=""
                suggestedCode={true}
                onConfirm={v.commitInlineCreate}
                onCancel={v.cancelInlineCreate}
              />
            )}
          </Fragment>
        ))}
        </Box>
        )}
      </Box>

      {/* Global Crear menu (top-right button) */}
      <Menu
        anchorEl={v.crearMenuAnchor}
        open={Boolean(v.crearMenuAnchor)}
        onClose={() => v.setCrearMenuAnchor(null)}
        elevation={8}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        MenuListProps={{ dense: true, sx: { py: 1 } }}
        slotProps={{ paper: { sx: { borderRadius: 1, minWidth: 173 } } }}
      >
        <MenuItem dense onClick={() => { v.setCrearMenuAnchor(null); v.setCrearGrupoOpen(true); }}>
          <ListItemIcon sx={{ minWidth: 28, color: 'action.active' }}><IconSitemap size={16} /></ListItemIcon>
          <Typography variant="body2" sx={{ letterSpacing: '0.17px' }}>Grupo</Typography>
        </MenuItem>
        <Divider />
        <MenuItem dense onClick={() => { v.setCrearMenuAnchor(null); setCrearUnidadType('Centro de costos'); }}>
          <ListItemIcon sx={{ minWidth: 28, color: 'action.active' }}><IconUsers size={16} /></ListItemIcon>
          <Typography variant="body2" sx={{ letterSpacing: '0.17px' }}>Centro de costos</Typography>
        </MenuItem>
        <MenuItem dense onClick={() => { v.setCrearMenuAnchor(null); setCrearUnidadType('Proyecto'); }}>
          <ListItemIcon sx={{ minWidth: 28, color: 'action.active' }}><IconClipboardText size={16} /></ListItemIcon>
          <Typography variant="body2" sx={{ letterSpacing: '0.17px' }}>Proyecto</Typography>
        </MenuItem>
        <MenuItem dense onClick={() => { v.setCrearMenuAnchor(null); setCrearUnidadType('Sucursal'); }}>
          <ListItemIcon sx={{ minWidth: 28, color: 'action.active' }}><IconMap2 size={16} /></ListItemIcon>
          <Typography variant="body2" sx={{ letterSpacing: '0.17px' }}>Sucursal</Typography>
        </MenuItem>
        <MenuItem dense onClick={() => { v.setCrearMenuAnchor(null); setCrearUnidadType('Inmueble'); }}>
          <ListItemIcon sx={{ minWidth: 28, color: 'action.active' }}><IconBuildingCommunity size={16} /></ListItemIcon>
          <Typography variant="body2" sx={{ letterSpacing: '0.17px' }}>Inmueble</Typography>
        </MenuItem>
        <MenuItem dense onClick={() => { v.setCrearMenuAnchor(null); setCrearUnidadType('Departamento'); }}>
          <ListItemIcon sx={{ minWidth: 28, color: 'action.active' }}><IconDeviceDesktopAnalytics size={16} /></ListItemIcon>
          <Typography variant="body2" sx={{ letterSpacing: '0.17px' }}>Departamento</Typography>
        </MenuItem>
      </Menu>

      {/* Per-row + (add child) menu — same options as global Crear */}
      <Menu
        anchorReference="anchorPosition"
        anchorPosition={addPos ?? { top: 0, left: 0 }}
        open={Boolean(addPos)}
        onClose={() => setAddPos(null)}
        elevation={8}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        MenuListProps={{ dense: true, sx: { py: 1 } }}
        slotProps={{ paper: { sx: { borderRadius: 1, minWidth: 173 } } }}
      >
        <MenuItem dense onClick={() => { setAddPos(null); if (addParentId) v.startInlineCreate(addParentId, 'grupo'); }}>
          <ListItemIcon sx={{ minWidth: 28, color: 'action.active' }}><IconSitemap size={16} /></ListItemIcon>
          <Typography variant="body2" sx={{ letterSpacing: '0.17px' }}>Grupo</Typography>
        </MenuItem>
        <Divider />
        <MenuItem dense onClick={() => { setAddPos(null); if (addParentId) v.startInlineCreate(addParentId, 'unidad', 'Centro de costos'); }}>
          <ListItemIcon sx={{ minWidth: 28, color: 'action.active' }}><IconUsers size={16} /></ListItemIcon>
          <Typography variant="body2" sx={{ letterSpacing: '0.17px' }}>Centro de costos</Typography>
        </MenuItem>
        <MenuItem dense onClick={() => { setAddPos(null); if (addParentId) v.startInlineCreate(addParentId, 'unidad', 'Proyecto'); }}>
          <ListItemIcon sx={{ minWidth: 28, color: 'action.active' }}><IconClipboardText size={16} /></ListItemIcon>
          <Typography variant="body2" sx={{ letterSpacing: '0.17px' }}>Proyecto</Typography>
        </MenuItem>
        <MenuItem dense onClick={() => { setAddPos(null); if (addParentId) v.startInlineCreate(addParentId, 'unidad', 'Sucursal'); }}>
          <ListItemIcon sx={{ minWidth: 28, color: 'action.active' }}><IconMap2 size={16} /></ListItemIcon>
          <Typography variant="body2" sx={{ letterSpacing: '0.17px' }}>Sucursal</Typography>
        </MenuItem>
        <MenuItem dense onClick={() => { setAddPos(null); if (addParentId) v.startInlineCreate(addParentId, 'unidad', 'Inmueble'); }}>
          <ListItemIcon sx={{ minWidth: 28, color: 'action.active' }}><IconBuildingCommunity size={16} /></ListItemIcon>
          <Typography variant="body2" sx={{ letterSpacing: '0.17px' }}>Inmueble</Typography>
        </MenuItem>
        <MenuItem dense onClick={() => { setAddPos(null); if (addParentId) v.startInlineCreate(addParentId, 'unidad', 'Departamento'); }}>
          <ListItemIcon sx={{ minWidth: 28, color: 'action.active' }}><IconDeviceDesktopAnalytics size={16} /></ListItemIcon>
          <Typography variant="body2" sx={{ letterSpacing: '0.17px' }}>Departamento</Typography>
        </MenuItem>
      </Menu>

      {/* Per-row ⋮ context menu — status-specific actions */}
      <Menu
        anchorReference="anchorPosition"
        anchorPosition={dotsPos ?? { top: 0, left: 0 }}
        open={Boolean(dotsPos)}
        onClose={handleDotsClose}
        elevation={8}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        MenuListProps={{ dense: true, sx: { py: 1 } }}
        slotProps={{ paper: { sx: { borderRadius: 1, minWidth: 160 } } }}
      >
        {(() => {
          const ACCION_MAP: Partial<Record<string, AccionType>> = {
            Suspender: 'suspender', Inactivar: 'inactivar',
            Reactivar: 'reactivar', Reabrir:   'reabrir',
          };
          return dotsActions.map((action, i) => [
            action.dividerBefore && <Divider key={`div-${i}`} />,
            <MenuItem
              key={action.label}
              dense
              onClick={() => {
                const accionType = ACCION_MAP[action.label];
                handleDotsClose();
                if (action.label === 'Revisar' && dotsNode?.type === 'unidad') {
                  setRevisarState({ itemId: dotsNode.id, itemNombre: dotsNode.label, itemCodigo: dotsNode.codigo ?? '', itemParentId: dotsNode.parentId, unitType: dotsNode.unitType });
                  return;
                }
                if (action.label === 'Descartar' && dotsNode?.type === 'unidad') {
                  setDescartarDirectoState({ itemId: dotsNode.id, itemNombre: dotsNode.label, itemCodigo: dotsNode.codigo ?? '', unitType: dotsNode.unitType });
                  return;
                }
                if (action.label === 'Inactivar' && dotsNode?.type === 'grupo') {
                  setInactivarGrupoState({ grupoId: dotsNode.id, grupoNombre: dotsNode.label });
                  return;
                }
                if (action.label === 'Reactivar' && dotsNode?.type === 'grupo') {
                  const affected = [dotsNode.id, ...getAllDescendants(dotsNode.id, v.tree).map(n => n.id)];
                  affected.forEach(id => updateNodeStatus(id, 'Activa'));
                  v.setSnackbarMsg('Grupo reactivado');
                  return;
                }
                if (accionType && dotsNode?.type === 'unidad') {
                  const parent = v.tree.find(n => n.id === dotsNode.parentId);
                  setAccionDialog({
                    accion: accionType,
                    itemId: dotsNode.id,
                    itemCodigo: dotsNode.codigo ?? '',
                    itemNombre: dotsNode.label,
                    itemUbicacion: parent?.label ?? '',
                    unitType: dotsNode.unitType,
                  });
                }
              }}
              sx={{ gap: 1, px: 2, py: 0.5 }}
            >
              <ListItemIcon sx={{ minWidth: 24, color: action.danger ? 'error.main' : 'action.active' }}>
                <action.Icon size={16} />
              </ListItemIcon>
              <Typography
                variant="body2"
                sx={{ letterSpacing: '0.17px', color: action.danger ? 'error.main' : 'text.primary' }}
              >
                {action.label}
              </Typography>
            </MenuItem>,
          ]);
        })()}
      </Menu>

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
          setAccionDialog(null);
          v.setSnackbarMsg(getMensajeAccion(state.accion, state.unitType));
        }}
      />

      <CrearGrupoDrawer
        open={v.crearGrupoOpen}
        onClose={() => v.setCrearGrupoOpen(false)}
        onCrear={() => { v.setCrearGrupoOpen(false); v.setSnackbarMsg('Grupo creado'); }}
      />

      <CrearUnidadDrawer
        open={Boolean(crearUnidadType)}
        unitType={crearUnidadType}
        onClose={() => setCrearUnidadType(null)}
        onCrear={(_, __, ut) => { setCrearUnidadType(null); v.setSnackbarMsg(ut ? `${ut} creado` : 'Unidad creada'); }}
        onGuardarBorrador={(_, __, ut) => { setCrearUnidadType(null); v.setSnackbarMsg(ut ? `${ut} guardado como borrador` : 'Borrador guardado'); }}
      />

      <RevisarBorradorDrawer
        open={Boolean(revisarState)}
        state={revisarState}
        tree={v.tree}
        onClose={() => setRevisarState(null)}
        onActivar={(id, nombre, codigo, selectedParentId) => {
          updateNodeStatus(id, 'Activa');
          updateNode(id, nombre, codigo);
          if (selectedParentId && selectedParentId !== revisarState?.itemParentId) moveNode(id, selectedParentId);
          setRevisarState(null);
          v.setSnackbarMsg(`${revisarState?.unitType ?? 'Unidad'} activado`);
        }}
        onDescartar={(id) => {
          updateNodeStatus(id, 'Descartada');
          setRevisarState(null);
          v.setSnackbarMsg(`${revisarState?.unitType ?? 'Unidad'} descartado`);
        }}
      />

      <DescartarBorradorDialog
        open={Boolean(descartarDirectoState)}
        state={descartarDirectoState}
        onClose={() => setDescartarDirectoState(null)}
        onConfirm={(id) => {
          updateNodeStatus(id, 'Descartada');
          setDescartarDirectoState(null);
          v.setSnackbarMsg(`${descartarDirectoState?.unitType ?? 'Unidad'} descartado`);
        }}
      />

      <InactivarGrupoDialog
        open={Boolean(inactivarGrupoState)}
        state={inactivarGrupoState}
        tree={v.tree}
        onClose={() => setInactivarGrupoState(null)}
        onConfirm={(s) => {
          const affected = [s.grupoId, ...getAllDescendants(s.grupoId, v.tree).map(n => n.id)];
          affected.forEach(id => updateNodeStatus(id, 'Inactivo'));
          setInactivarGrupoState(null);
          v.setSnackbarMsg('Grupo inactivado');
        }}
      />

      <Snackbar
        open={Boolean(v.snackbarMsg)}
        autoHideDuration={5000}
        onClose={() => v.setSnackbarMsg(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        slots={{ transition: SlideUp }}
      >
        <SnackbarContent
          sx={{ bgcolor: '#f2f9e7', minWidth: 'auto', color: 'text.primary' }}
          message={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <IconCircleCheckFilled size={16} color="#72b525" />
              <Typography variant="body2" sx={{ color: 'text.primary' }}>{v.snackbarMsg}</Typography>
            </Box>
          }
          action={
            <IconButton size="small" onClick={() => v.setSnackbarMsg(null)} sx={{ color: 'text.secondary' }}>
              <IconX size={16} />
            </IconButton>
          }
        />
      </Snackbar>
    </Box>
  );
}
