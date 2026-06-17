import { useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import InputBase from '@mui/material/InputBase';
import Typography from '@mui/material/Typography';
import {
  IconBuildingCommunity,
  IconChevronDown,
  IconChevronRight,
  IconCircleCheckFilled,
  IconClipboardText,
  IconDeviceDesktopAnalytics,
  IconMap2,
  IconPencil,
  IconPlus,
  IconSitemap,
  IconTrash,
  IconUsers,
  IconX,
} from '@tabler/icons-react';
import type { OrgNode, UnitType } from '@/shared/config/org-types';

// ─── helpers ──────────────────────────────────────────────────────────────────

const UNIT_ICON: Record<UnitType, typeof IconUsers> = {
  'Centro de costos': IconUsers,
  'Proyecto':         IconClipboardText,
  'Sucursal':         IconMap2,
  'Inmueble':         IconBuildingCommunity,
  'Departamento':     IconDeviceDesktopAnalytics,
};

function unitLabel(unitType: UnitType | undefined): string {
  if (!unitType) return 'unidad';
  const map: Record<UnitType, string> = {
    'Centro de costos': 'centro de costos',
    'Proyecto':         'proyecto',
    'Sucursal':         'sucursal',
    'Inmueble':         'inmueble',
    'Departamento':     'departamento',
  };
  return map[unitType];
}

// ─── Descartar Dialog ──────────────────────────────────────────────────────────

export interface DescartarBorradorState {
  itemId: string;
  itemNombre: string;
  itemCodigo: string;
  unitType: UnitType | undefined;
}

interface DescartarDialogProps {
  open: boolean;
  state: DescartarBorradorState | null;
  onClose: () => void;
  onConfirm: (id: string) => void;
}

export function DescartarBorradorDialog({ open, state, onClose, onConfirm }: DescartarDialogProps) {
  if (!state) return null;
  const label = unitLabel(state.unitType);
  const capitalized = label.charAt(0).toUpperCase() + label.slice(1);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={false}
      slotProps={{ paper: { sx: { width: 444, borderRadius: '12px' } } }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 3, pt: 3, pb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{
            width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
            bgcolor: 'rgba(198,52,52,0.10)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <IconTrash size={20} color="#c63434" />
          </Box>
          <Typography sx={{ fontWeight: 600, fontSize: '1.0625rem', lineHeight: 1.3 }}>
            Descartar borrador [{capitalized}]
          </Typography>
        </Box>
        <IconButton size="small" onClick={onClose} sx={{ color: 'action.active', alignSelf: 'flex-start' }}>
          <IconX size={16} />
        </IconButton>
      </Box>

      <Box sx={{ px: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Typography variant="body2" sx={{ fontSize: '0.875rem', lineHeight: 1.6 }}>
          El {label}{' '}
          <Box component="span" sx={{ fontWeight: 600 }}>{state.itemCodigo} {state.itemNombre}</Box>
          {' '}quedará en estado descartado y no podrá reactivarse ni reutilizarse su código.
        </Typography>
        <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, px: 1.5, py: 1.25, bgcolor: 'grey.50', display: 'flex', flexDirection: 'column', gap: 0.75 }}>
          <Typography variant="body2" sx={{ fontSize: '0.875rem', lineHeight: 1.6 }}>
            <Box component="span" sx={{ fontWeight: 600 }}>Solicitada por: </Box>
            Obligaciones por pagar
          </Typography>
          <Typography variant="body2" sx={{ fontSize: '0.875rem', lineHeight: 1.6 }}>
            <Box component="span" sx={{ fontWeight: 600 }}>Fecha solicitud: </Box>
            02/04/2026
            <Box component="span" sx={{ color: 'text.secondary', ml: 1.5 }}>3 días</Box>
          </Typography>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, px: 3, py: 2.5 }}>
        <Button variant="text" size="small" onClick={onClose}
          sx={{ textTransform: 'none', fontSize: '0.875rem', color: 'text.secondary' }}>
          Cancelar
        </Button>
        <Button variant="contained" size="small" color="error" onClick={() => onConfirm(state.itemId)}
          sx={{ textTransform: 'none', fontSize: '0.875rem' }}>
          Descartar
        </Button>
      </Box>
    </Dialog>
  );
}

// ─── UbicacionItem — matches CrearUnidadDrawer style ─────────────────────────

interface UbicacionItemProps {
  node: OrgNode;
  expanded: boolean;
  selected: boolean;
  hasChildren: boolean;
  count: number;
  onToggle: () => void;
  onSelect: () => void;
}

function UbicacionItem({ node, expanded, selected, hasChildren, count, onToggle, onSelect }: UbicacionItemProps) {
  const [hovered, setHovered] = useState(false);
  const indent = node.level * 20;
  const isRoot = node.type === 'root';
  const iconColor = selected ? '#2f43d0' : 'rgba(16,24,64,0.54)';

  return (
    <Box
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onSelect}
      sx={{
        display: 'flex', alignItems: 'center', gap: '4px',
        height: 36, pl: `${4 + indent}px`, pr: '4px',
        cursor: 'pointer',
        bgcolor: selected ? 'rgba(47,67,208,0.08)' : (hovered ? 'rgba(47,67,208,0.04)' : 'transparent'),
      }}
    >
      <Box
        sx={{ width: 16, height: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
        onClick={e => { e.stopPropagation(); if (hasChildren) onToggle(); }}
      >
        {hasChildren && (
          expanded
            ? <IconChevronDown size={12} color="rgba(16,24,64,0.54)" />
            : <IconChevronRight size={12} color="rgba(16,24,64,0.54)" />
        )}
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
        {isRoot
          ? <IconBuildingCommunity size={16} color={iconColor} />
          : selected
            ? <IconCircleCheckFilled size={16} color="#2f43d0" />
            : <IconSitemap size={16} color={iconColor} />
        }
      </Box>

      <Typography sx={{
        flex: 1,
        fontSize: selected ? '0.875rem' : '0.8125rem',
        fontWeight: selected ? 500 : 400,
        lineHeight: '16px',
        letterSpacing: selected ? '0.15px' : '0.17px',
        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        color: selected ? 'primary.main' : 'text.primary',
      }}>
        {node.label}
      </Typography>

      <Box sx={{ bgcolor: '#eaebec', borderRadius: '100px', px: '5px', py: '2.5px', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
        <Typography sx={{ fontSize: '0.6875rem', fontWeight: 500, color: 'text.secondary', lineHeight: '11px' }}>
          {count}
        </Typography>
      </Box>
    </Box>
  );
}

// ─── Main Drawer ───────────────────────────────────────────────────────────────

export interface RevisarBorradorState {
  itemId: string;
  itemNombre: string;
  itemCodigo: string;
  itemParentId: string | null;
  unitType: UnitType | undefined;
}

interface Props {
  open: boolean;
  state: RevisarBorradorState | null;
  tree: OrgNode[];
  onClose: () => void;
  onActivar: (id: string, nombre: string, codigo: string, selectedParentId: string | null) => void;
  onDescartar: (id: string) => void;
}

export function RevisarBorradorDrawer({ open, state, tree, onClose, onActivar, onDescartar }: Props) {
  const [nombre, setNombre] = useState('');
  const [codigo, setCodigo] = useState('');
  const [editandoCodigo, setEditandoCodigo] = useState(false);
  const [descripcionVisible, setDescripcionVisible] = useState(false);
  const [descripcion, setDescripcion] = useState('');
  const [descartarOpen, setDescartarOpen] = useState(false);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [selectedParentId, setSelectedParentId] = useState<string | null>(null);

  // Reset all local state when a new item is opened (adjust during render)
  const [prevId, setPrevId] = useState<string | null>(null);
  const currentId = state?.itemId ?? null;
  if (currentId !== prevId) {
    setPrevId(currentId);
    setNombre(state?.itemNombre ?? '');
    setCodigo(state?.itemCodigo ?? '');
    setEditandoCodigo(false);
    setDescripcionVisible(false);
    setDescripcion('');
    setDescartarOpen(false);
    setSelectedParentId(state?.itemParentId ?? null);

    const groups = tree.filter(n => n.type === 'root' || n.type === 'grupo');
    if (state?.itemParentId) {
      const toExpand = new Set<string>();
      let cur: OrgNode | undefined = groups.find(n => n.id === state.itemParentId);
      while (cur) {
        toExpand.add(cur.id);
        cur = groups.find(n => n.id === cur!.parentId);
      }
      setExpandedIds(toExpand);
    } else {
      setExpandedIds(new Set(tree.filter(n => n.type === 'root').map(n => n.id)));
    }
  }

  if (!state) return null;

  const { itemId, unitType } = state;
  const UnitIcon = unitType ? UNIT_ICON[unitType] : IconUsers;
  const label = unitLabel(unitType);
  const capitalized = label.charAt(0).toUpperCase() + label.slice(1);

  // Groups-only tree for Ubicación
  const groups = tree.filter(n => n.type === 'root' || n.type === 'grupo');
  const groupHasChildren = (id: string) => groups.some(n => n.parentId === id);

  const toggleExpand = (id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const visibleGroups = groups.filter(node => {
    if (!node.parentId) return true;
    let curr = node;
    while (curr.parentId) {
      if (!expandedIds.has(curr.parentId)) return false;
      curr = groups.find(n => n.id === curr.parentId) ?? curr;
      if (!curr.parentId) break;
    }
    return true;
  });

  return (
    <>
      <Drawer
        open={open}
        anchor="right"
        onClose={onClose}
        hideBackdrop
        variant="temporary"
        slotProps={{
          paper: {
            sx: {
              width: 500,
              display: 'flex', flexDirection: 'column',
              boxShadow: '-4px 0 24px rgba(16,24,64,0.12)',
              overflow: 'hidden',
            },
          },
        }}
      >
        {/* Header */}
        <Box sx={{
          display: 'flex', alignItems: 'center', height: 46, px: 2,
          flexShrink: 0, gap: 1, borderBottom: '1px solid', borderColor: 'divider',
        }}>
          <UnitIcon size={16} color="rgba(16,24,64,0.54)" />
          <Typography variant="subtitle1" sx={{ fontWeight: 600, fontSize: '0.9375rem', flex: 1 }}>
            Revisar borrador [{capitalized}]
          </Typography>
          <IconButton size="small" sx={{ p: '4px', color: 'action.active' }} onClick={onClose}>
            <IconX size={16} />
          </IconButton>
        </Box>

        {/* Scrollable body */}
        <Box sx={{ flex: 1, overflowY: 'auto', px: 2, pt: 1.5, pb: 2 }}>

          {/* Info box */}
          <Box sx={{ mb: 1.5, p: 1.5, bgcolor: 'rgba(47,67,208,0.04)', borderRadius: 1, border: '1px solid rgba(47,67,208,0.12)' }}>
            <Typography variant="body2" sx={{ fontSize: '0.8125rem', lineHeight: 1.7 }}>
              <Box component="span" sx={{ fontWeight: 600 }}>Solicitada por: </Box>
              Obligaciones por pagar
            </Typography>
            <Typography variant="body2" sx={{ fontSize: '0.8125rem', lineHeight: 1.7 }}>
              <Box component="span" sx={{ fontWeight: 600 }}>Fecha solicitud: </Box>
              02/04/2026
              <Box component="span" sx={{ color: 'text.secondary', ml: 1.5 }}>3 días</Box>
            </Typography>
          </Box>

          {/* Nombre + Código */}
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>

            {/* Nombre */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: '4px', width: 230, flexShrink: 0 }}>
              <Typography variant="caption" sx={{ fontSize: '0.6875rem', color: 'text.secondary', lineHeight: 1.4 }}>
                Nombre
                <Box component="span" sx={{ color: 'error.main', ml: '2px' }}>*</Box>
              </Typography>
              <Box sx={{
                border: '1px solid', borderColor: 'rgba(16,24,64,0.23)', borderRadius: '4px',
                height: 32, display: 'flex', alignItems: 'center', px: 1.5,
                '&:focus-within': { borderColor: 'primary.main', borderWidth: 2 },
              }}>
                <InputBase
                  placeholder="Escriba un nombre"
                  value={nombre}
                  onChange={e => setNombre(e.target.value)}
                  sx={{ flex: 1, fontSize: '0.8125rem', '& input': { p: 0 } }}
                />
              </Box>
            </Box>

            {/* Código — pencil to edit */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1, minWidth: 0 }}>
              <Typography variant="caption" sx={{ fontSize: '0.6875rem', color: 'text.secondary', lineHeight: 1.4 }}>
                Código
                <Box component="span" sx={{ color: 'error.main', ml: '2px' }}>*</Box>
              </Typography>
              {editandoCodigo ? (
                <Box sx={{
                  border: '2px solid', borderColor: 'primary.main',
                  borderRadius: '4px', height: 32,
                  display: 'flex', alignItems: 'center', px: 1,
                }}>
                  <InputBase
                    autoFocus
                    value={codigo}
                    onChange={e => setCodigo(e.target.value)}
                    onBlur={() => setEditandoCodigo(false)}
                    placeholder="Ej.: CC-000"
                    sx={{ flex: 1, fontSize: '0.8125rem', '& input': { p: 0 } }}
                  />
                </Box>
              ) : (
                <Box sx={{ height: 32, display: 'flex', alignItems: 'center', gap: '4px', px: 1, borderRadius: '4px' }}>
                  <Typography sx={{
                    fontSize: '0.8125rem', fontWeight: 500, color: 'text.primary',
                    flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {codigo}
                  </Typography>
                  <IconButton size="small" sx={{ p: '2px', color: 'text.secondary', flexShrink: 0 }} onClick={() => setEditandoCodigo(true)}>
                    <IconPencil size={16} />
                  </IconButton>
                </Box>
              )}
            </Box>
          </Box>

          {/* Descripción */}
          <Box sx={{ mt: 2 }}>
            {descripcionVisible ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <Typography variant="caption" sx={{ fontSize: '0.6875rem', color: 'text.secondary', lineHeight: 1.4 }}>
                  Descripción
                </Typography>
                <InputBase
                  multiline minRows={2} maxRows={4}
                  placeholder="Propósito o justificación..."
                  value={descripcion}
                  onChange={e => setDescripcion(e.target.value)}
                  sx={{
                    fontSize: '0.8125rem', border: '1px solid rgba(16,24,64,0.23)',
                    borderRadius: '4px', px: 1.5, py: 0.75,
                    '&.Mui-focused': { borderColor: 'primary.main' },
                    alignItems: 'flex-start',
                  }}
                />
              </Box>
            ) : (
              <Button
                size="small"
                startIcon={<IconPlus size={14} />}
                onClick={() => setDescripcionVisible(true)}
                sx={{ color: 'text.secondary', fontSize: '0.8125rem', fontWeight: 400, textTransform: 'none', px: 0, '&:hover': { bgcolor: 'transparent', color: 'primary.main' } }}
              >
                Añadir descripción
              </Button>
            )}
          </Box>

          {/* Ubicación */}
          <Box sx={{ mt: 2 }}>
            <Typography variant="caption" sx={{ fontSize: '0.6875rem', color: 'text.secondary', lineHeight: 1.4 }}>
              Ubicación
            </Typography>
            <Box sx={{ mt: 0.5, bgcolor: '#fbfbfb', borderRadius: '4px', p: 1 }}>
              {visibleGroups.map(node => (
                <UbicacionItem
                  key={node.id}
                  node={node}
                  expanded={expandedIds.has(node.id)}
                  selected={selectedParentId === node.id}
                  hasChildren={groupHasChildren(node.id)}
                  count={tree.filter(c => c.parentId === node.id).length}
                  onToggle={() => toggleExpand(node.id)}
                  onSelect={() => setSelectedParentId(prev => prev === node.id ? null : node.id)}
                />
              ))}
            </Box>
          </Box>
        </Box>

        <Divider />

        {/* Footer */}
        <Box sx={{ display: 'flex', alignItems: 'center', height: 52, px: 2, flexShrink: 0 }}>
          <Button
            size="small"
            startIcon={<IconTrash size={14} />}
            onClick={() => setDescartarOpen(true)}
            sx={{ textTransform: 'none', fontSize: '0.8125rem', color: 'error.main', '&:hover': { bgcolor: 'rgba(198,52,52,0.06)' } }}
          >
            Descartar
          </Button>
          <Box sx={{ flex: 1 }} />
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button variant="outlined" size="small" onClick={onClose}
              sx={{ textTransform: 'none', fontSize: '0.8125rem', borderColor: 'divider', color: 'text.secondary' }}>
              Cancelar
            </Button>
            <Button
              variant="contained" size="small"
              disabled={!nombre.trim()}
              onClick={() => onActivar(itemId, nombre.trim(), codigo.trim(), selectedParentId)}
              sx={{ textTransform: 'none', fontSize: '0.8125rem' }}
            >
              Activar
            </Button>
          </Box>
        </Box>
      </Drawer>

      {/* Descartar from footer button */}
      <DescartarBorradorDialog
        open={descartarOpen}
        state={descartarOpen ? { itemId, itemNombre: state.itemNombre, itemCodigo: state.itemCodigo, unitType } : null}
        onClose={() => setDescartarOpen(false)}
        onConfirm={(id) => { onDescartar(id); setDescartarOpen(false); }}
      />
    </>
  );
}
