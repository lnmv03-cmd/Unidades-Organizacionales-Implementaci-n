import { useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
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
  IconUsers,
  IconX,
} from '@tabler/icons-react';
import type { OrgNode, UnitType } from '@/shared/config/org-types';
import { useEstructuraStore } from '@/shared/model/estructura.store';

const UNIT_ICON: Record<UnitType, typeof IconUsers> = {
  'Centro de costos': IconUsers,
  'Proyecto':         IconClipboardText,
  'Sucursal':         IconMap2,
  'Inmueble':         IconBuildingCommunity,
  'Departamento':     IconDeviceDesktopAnalytics,
};

// ─── UbicacionItem ───────────────────────────────────────────────────────────

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
        {hasChildren && (expanded
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

// ─── Main Drawer ──────────────────────────────────────────────────────────────

interface Props {
  open: boolean;
  nodeId: string | null;
  unitType: UnitType | null;
  initialNombre: string;
  initialCodigo: string;
  initialDescripcion?: string;
  initialParentId?: string | null;
  onClose: () => void;
  onSave: (nodeId: string, nombre: string, codigo: string, newParentId: string | null) => void;
}

export function EditarUnidadDrawer({ open, nodeId, unitType, initialNombre, initialCodigo, initialDescripcion = '', initialParentId = null, onClose, onSave }: Props) {
  const { tree } = useEstructuraStore();

  const [nombre, setNombre] = useState(initialNombre);
  const [codigo, setCodigo] = useState(initialCodigo);
  const [descripcion, setDescripcion] = useState(initialDescripcion);
  const [editandoCodigo, setEditandoCodigo] = useState(false);
  const [descripcionVisible, setDescripcionVisible] = useState(Boolean(initialDescripcion));
  const [selectedParentId, setSelectedParentId] = useState<string | null>(initialParentId);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  // Adjust during render: sync when drawer opens for a new node
  const [prevNodeId, setPrevNodeId] = useState(nodeId);
  if (nodeId !== prevNodeId) {
    setPrevNodeId(nodeId);
    setNombre(initialNombre);
    setCodigo(initialCodigo);
    setDescripcion(initialDescripcion);
    setEditandoCodigo(false);
    setDescripcionVisible(Boolean(initialDescripcion));
    setSelectedParentId(initialParentId);

    const groups = tree.filter(n => n.type === 'root' || n.type === 'grupo');
    if (initialParentId) {
      const toExpand = new Set<string>();
      let cur: OrgNode | undefined = groups.find(n => n.id === initialParentId);
      while (cur) { toExpand.add(cur.id); cur = groups.find(n => n.id === cur!.parentId); }
      setExpandedIds(toExpand);
    } else {
      setExpandedIds(new Set(tree.filter(n => n.type === 'root').map(n => n.id)));
    }
  }

  const UnitIcon = unitType ? UNIT_ICON[unitType] : IconUsers;
  const title = unitType ? `Editar ${unitType.toLowerCase()}` : 'Editar';
  const canSave = nombre.trim().length > 0;

  // Groups-only tree for Ubicación
  const groups = tree.filter(n => n.type === 'root' || n.type === 'grupo');
  const groupHasChildren = (id: string) => groups.some(n => n.parentId === id);

  const toggleExpand = (id: string) => setExpandedIds(prev => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });

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

  const handleClose = () => { setEditandoCodigo(false); onClose(); };
  const handleSave = () => {
    if (!nodeId || !canSave) return;
    onSave(nodeId, nombre.trim(), codigo.trim(), selectedParentId);
    handleClose();
  };

  return (
    <Drawer
      open={open}
      anchor="right"
      onClose={handleClose}
      hideBackdrop
      variant="temporary"
      slotProps={{
        paper: {
          sx: {
            width: 440,
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
        <Typography variant="subtitle1" sx={{ fontWeight: 600, fontSize: '0.9375rem', flex: 1, textTransform: 'capitalize' }}>
          {title}
        </Typography>
        <IconButton size="small" sx={{ p: '4px', color: 'action.active' }} onClick={handleClose}>
          <IconX size={16} />
        </IconButton>
      </Box>

      {/* Content */}
      <Box sx={{ flex: 1, overflowY: 'auto', px: 2, pt: 1.5, pb: 1 }}>

        {/* Nombre + Código */}
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
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
                placeholder="Ej.: Servicios generales"
                value={nombre}
                onChange={e => setNombre(e.target.value)}
                sx={{ flex: 1, fontSize: '0.8125rem', '& input': { p: 0 } }}
              />
            </Box>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1, minWidth: 0 }}>
            <Typography variant="caption" sx={{ fontSize: '0.6875rem', color: 'text.secondary', lineHeight: 1.4 }}>
              Código
              <Box component="span" sx={{ color: 'error.main', ml: '2px' }}>*</Box>
            </Typography>
            <Box sx={{
              border: '1px solid',
              borderColor: editandoCodigo ? 'primary.main' : 'rgba(16,24,64,0.23)',
              borderWidth: editandoCodigo ? 2 : 1,
              borderRadius: '4px', height: 32, display: 'flex', alignItems: 'center', px: 1, gap: 0.5,
            }}>
              {editandoCodigo ? (
                <InputBase
                  autoFocus
                  value={codigo}
                  onChange={e => setCodigo(e.target.value)}
                  onBlur={() => setEditandoCodigo(false)}
                  sx={{ flex: 1, fontSize: '0.8125rem', '& input': { p: 0 } }}
                />
              ) : (
                <>
                  <Typography variant="body2" sx={{ flex: 1, fontSize: '0.8125rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {codigo || <Box component="span" sx={{ color: 'text.disabled' }}>Ej.: CC-000</Box>}
                  </Typography>
                  <IconButton size="small" sx={{ p: '2px', color: 'primary.main', flexShrink: 0 }} onClick={() => setEditandoCodigo(true)}>
                    <IconPencil size={12} />
                  </IconButton>
                </>
              )}
            </Box>
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
        {groups.length > 0 && (
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
        )}
      </Box>

      <Divider />

      {/* Footer */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', height: 50, px: 2, gap: 1, flexShrink: 0 }}>
        <Button variant="outlined" size="small" onClick={handleClose}
          sx={{ textTransform: 'none', fontSize: '0.8125rem', borderColor: 'divider', color: 'text.secondary' }}>
          Cancelar
        </Button>
        <Button variant="contained" size="small" disabled={!canSave} onClick={handleSave}
          sx={{ textTransform: 'none', fontSize: '0.8125rem' }}>
          Guardar
        </Button>
      </Box>
    </Drawer>
  );
}
