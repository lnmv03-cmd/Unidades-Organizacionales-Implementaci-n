import { Fragment, useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import InputBase from '@mui/material/InputBase';
import Typography from '@mui/material/Typography';
import {
  IconBuildingCommunity,
  IconCheck,
  IconChevronDown,
  IconChevronRight,
  IconCircleCheckFilled,
  IconPencil,
  IconPlus,
  IconSitemap,
  IconX,
} from '@tabler/icons-react';
import { IaLabel } from '@/shared/ui';
import { useCrearGrupo } from '../hooks/useCrearGrupo';
import type { UbicacionNode } from '../hooks/useCrearGrupo';

// --- private helpers ---

interface CodigoFieldProps {
  codigo: string;
  codigoManual: boolean;
  editandoCodigo: boolean;
  onEditarCodigo: () => void;
  onCodigoChange: (v: string) => void;
  onCodigoBlur: () => void;
}

function CodigoField({ codigo, codigoManual, editandoCodigo, onEditarCodigo, onCodigoChange, onCodigoBlur }: CodigoFieldProps) {
  const hasValue = codigo.length > 0;
  const parts = hasValue ? codigo.split('-').filter(Boolean) : [];

  return (
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
            onChange={e => onCodigoChange(e.target.value)}
            onBlur={onCodigoBlur}
            placeholder="Ej.: CC-000"
            sx={{ flex: 1, fontSize: '0.8125rem', '& input': { p: 0 } }}
          />
        </Box>
      ) : (
        <Box sx={{
          height: 32, display: 'flex', alignItems: 'center',
          gap: '4px', px: 1, borderRadius: '4px',
        }}>
          {!hasValue ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
              <Typography sx={{ fontSize: '0.8125rem', color: 'text.disabled', fontWeight: 400 }}>Ej.:</Typography>
              <Typography sx={{ fontSize: '0.8125rem', color: 'text.disabled', fontWeight: 500 }}>CC</Typography>
              <Typography sx={{ fontSize: '0.8125rem', color: 'text.disabled', fontWeight: 500 }}>-</Typography>
              <Typography sx={{ fontSize: '0.8125rem', color: 'text.disabled', fontWeight: 500 }}>000</Typography>
            </Box>
          ) : (
            <>
              {!codigoManual && <IaLabel />}
              <Box sx={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: 0, overflow: 'hidden' }}>
                {parts.length > 1 ? (
                  parts.map((part, i) => (
                    <Fragment key={i}>
                      <Typography sx={{ fontSize: '0.8125rem', fontWeight: 500, color: 'text.primary', letterSpacing: '0.1px', lineHeight: '16px', whiteSpace: 'nowrap' }}>
                        {part}
                      </Typography>
                      {i < parts.length - 1 && (
                        <Typography sx={{ fontSize: '0.8125rem', fontWeight: 500, color: 'text.disabled', letterSpacing: '0.1px', lineHeight: '16px' }}>
                          -
                        </Typography>
                      )}
                    </Fragment>
                  ))
                ) : (
                  <Typography sx={{ fontSize: '0.8125rem', fontWeight: 500, color: 'text.primary', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {codigo}
                  </Typography>
                )}
              </Box>
              <IconButton size="small" sx={{ p: '2px', color: 'text.secondary', flexShrink: 0 }} onClick={onEditarCodigo}>
                <IconPencil size={16} />
              </IconButton>
            </>
          )}
        </Box>
      )}
    </Box>
  );
}

interface UbicacionItemProps {
  node: UbicacionNode;
  expanded: boolean;
  selected: boolean;
  hasChildren: boolean;
  onToggle: () => void;
  onSelect: () => void;
  onAddChild: () => void;
}

function UbicacionItem({ node, expanded, selected, hasChildren, onToggle, onSelect, onAddChild }: UbicacionItemProps) {
  const [hovered, setHovered] = useState(false);
  const indent = node.level * 20;
  const iconColor = selected ? '#2f43d0' : 'rgba(16,24,64,0.54)';
  const isRoot = Boolean(node.isRoot);

  return (
    <Box
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onSelect}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        height: 36,
        pl: `${4 + indent}px`,
        pr: '4px',
        cursor: 'pointer',
        bgcolor: selected ? 'rgba(47,67,208,0.08)' : hovered ? 'rgba(47,67,208,0.04)' : 'transparent',
      }}
    >
      {/* Expand/collapse chevron — non-root nodes only */}
      {!isRoot && (
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
      )}

      {/* Node icon */}
      <Box sx={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
        {isRoot
          ? <IconBuildingCommunity size={16} color={iconColor} />
          : selected
            ? <IconCircleCheckFilled size={16} color="#2f43d0" />
            : <IconSitemap size={16} color={iconColor} />
        }
      </Box>

      {/* Label */}
      <Typography sx={{
        flex: 1,
        fontSize: selected ? '0.875rem' : '0.8125rem',
        fontWeight: selected ? 500 : 400,
        lineHeight: '16px',
        letterSpacing: selected ? '0.15px' : '0.17px',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        color: selected ? 'primary.main' : 'text.primary',
      }}>
        {node.label}
      </Typography>

      {/* Count badge — pill shape */}
      <Box sx={{ bgcolor: '#eaebec', borderRadius: '100px', px: '5px', py: '2.5px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Typography sx={{ fontSize: '0.6875rem', fontWeight: 500, color: 'text.secondary', lineHeight: '11px', letterSpacing: '0.14px' }}>
          {node.count}
        </Typography>
      </Box>

      {/* + button — visible on hover, bordered container */}
      <Box sx={{ width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        {hovered && (
          <Box
            sx={{ bgcolor: 'background.paper', border: '1px solid #eaebec', borderRadius: '4px', p: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            onClick={e => { e.stopPropagation(); onAddChild(); }}
          >
            <IconButton size="small" sx={{ p: '3px', color: 'primary.main', borderRadius: '100%' }}>
              <IconPlus size={14} />
            </IconButton>
          </Box>
        )}
      </Box>
    </Box>
  );
}

interface InlineAddRowProps {
  parentLevel: number;
  nombre: string;
  codigo: string;
  codigoManual: boolean;
  onNombreChange: (v: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
}

function InlineAddRow({ parentLevel, nombre, codigo, codigoManual, onNombreChange, onConfirm, onCancel }: InlineAddRowProps) {
  const pl = parentLevel * 20 + 16;
  const canConfirm = nombre.trim().length > 0;

  return (
    <Box sx={{
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
      height: 36,
      pl: `${pl}px`,
      pr: '4px',
      bgcolor: 'rgba(47,67,208,0.08)',
    }}>
      {/* Chevron down — decorative, indicates this is a group node */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <IconChevronDown size={12} color="rgba(16,24,64,0.54)" />
      </Box>

      {/* Group icon */}
      <Box sx={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
        <IconSitemap size={16} color="rgba(16,24,64,0.54)" />
      </Box>

      {/* Código display — auto-generated, read-only in inline context */}
      <Box sx={{
        width: 86,
        flexShrink: 0,
        border: '1px solid rgba(16,24,64,0.20)',
        borderRadius: '4px',
        bgcolor: 'background.paper',
        height: 24,
        display: 'flex',
        alignItems: 'center',
        px: '6px',
        gap: '4px',
        overflow: 'hidden',
      }}>
        <Typography sx={{ flex: 1, fontSize: '0.75rem', color: codigo ? 'text.primary' : 'text.disabled', fontWeight: codigo ? 500 : 400, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {codigo || '—'}
        </Typography>
        {!codigoManual && codigo && <IaLabel />}
      </Box>

      {/* Nombre input — focused */}
      <Box sx={{
        flex: 1,
        minWidth: 0,
        border: '2px solid',
        borderColor: 'primary.main',
        borderRadius: '4px',
        bgcolor: 'background.paper',
        height: 24,
        display: 'flex',
        alignItems: 'center',
        px: '6px',
      }}>
        <InputBase
          autoFocus
          value={nombre}
          onChange={e => onNombreChange(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') { e.preventDefault(); if (canConfirm) onConfirm(); }
            if (e.key === 'Escape') onCancel();
          }}
          placeholder="Nombre del grupo"
          sx={{ flex: 1, fontSize: '0.75rem', '& input': { p: 0 } }}
        />
      </Box>

      {/* Confirm / Cancel */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: '2px', flexShrink: 0 }}>
        <IconButton
          size="small"
          disabled={!canConfirm}
          sx={{ p: '3px', color: canConfirm ? 'primary.main' : 'action.disabled', borderRadius: '100%' }}
          onClick={onConfirm}
        >
          <IconCheck size={14} />
        </IconButton>
        <IconButton
          size="small"
          sx={{ p: '3px', color: 'text.secondary', borderRadius: '100%' }}
          onClick={onCancel}
        >
          <IconX size={14} />
        </IconButton>
      </Box>
    </Box>
  );
}

// --- public export ---

interface Props {
  open: boolean;
  onClose: () => void;
  isInitialState?: boolean;
  onCrear?: () => void;
}

export function CrearGrupoDrawer({ open, onClose, isInitialState = false, onCrear }: Props) {
  const g = useCrearGrupo(isInitialState);

  const handleClose = () => { g.reset(); onClose(); };

  const handleCrear = () => {
    if (!g.canCreate) return;
    g.createGroup();
    onCrear?.();
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
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '-4px 0 24px rgba(16,24,64,0.12)',
            overflow: 'hidden',
          },
        },
      }}
    >
      {/* Header */}
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        height: 46,
        px: 2,
        flexShrink: 0,
        gap: 1,
        borderBottom: '1px solid',
        borderColor: 'divider',
      }}>
        <IconSitemap size={16} color="rgba(16,24,64,0.54)" />
        <Typography variant="subtitle1" sx={{ fontWeight: 600, fontSize: '0.9375rem', flex: 1 }}>
          Crear grupo
        </Typography>
        <IconButton size="small" sx={{ p: '4px', color: 'action.active' }} onClick={handleClose}>
          <IconX size={16} />
        </IconButton>
      </Box>

      {/* Content */}
      <Box sx={{ flex: 1, overflowY: 'auto', px: 2, pt: 1.5, pb: 1 }}>

        {/* Nombre + Código row */}
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
          {/* Nombre */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: '4px', width: 230, flexShrink: 0 }}>
            <Typography variant="caption" sx={{ fontSize: '0.6875rem', color: 'text.secondary', lineHeight: 1.4 }}>
              Nombre
              <Box component="span" sx={{ color: 'error.main', ml: '2px' }}>*</Box>
            </Typography>
            <Box sx={{
              border: '1px solid',
              borderColor: 'rgba(16,24,64,0.23)',
              borderRadius: '4px',
              height: 32,
              display: 'flex',
              alignItems: 'center',
              px: 1.5,
              '&:focus-within': { borderColor: 'primary.main', borderWidth: 2 },
            }}>
              <InputBase
                placeholder="Ej.: Servicios generales"
                value={g.nombre}
                onChange={e => g.handleNombreChange(e.target.value)}
                sx={{ flex: 1, fontSize: '0.8125rem', '& input': { p: 0 } }}
              />
            </Box>
          </Box>

          {/* Código */}
          <CodigoField
            codigo={g.codigo}
            codigoManual={g.codigoManual}
            editandoCodigo={g.editandoCodigo}
            onEditarCodigo={g.handleEditarCodigo}
            onCodigoChange={g.handleCodigoChange}
            onCodigoBlur={g.handleCodigoBlur}
          />
        </Box>

        {/* Descripción */}
        <Box sx={{ mt: 2 }}>
          {g.descripcionVisible ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <Typography variant="caption" sx={{ fontSize: '0.6875rem', color: 'text.secondary', lineHeight: 1.4 }}>
                Descripción
              </Typography>
              <InputBase
                multiline
                minRows={2}
                maxRows={4}
                placeholder="Propósito o justificación..."
                value={g.descripcion}
                onChange={e => g.setDescripcion(e.target.value)}
                sx={{
                  fontSize: '0.8125rem',
                  border: '1px solid rgba(16,24,64,0.23)',
                  borderRadius: '4px',
                  px: 1.5,
                  py: 0.75,
                  '&.Mui-focused': { borderColor: 'primary.main' },
                  alignItems: 'flex-start',
                }}
              />
            </Box>
          ) : (
            <Button
              size="small"
              startIcon={<IconPlus size={14} />}
              onClick={() => g.setDescripcionVisible(true)}
              sx={{
                color: 'text.secondary',
                fontSize: '0.8125rem',
                fontWeight: 400,
                textTransform: 'none',
                px: 0,
                '&:hover': { bgcolor: 'transparent', color: 'primary.main' },
              }}
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
            {g.visibleNodes.map(node => (
              <Fragment key={node.id}>
                <UbicacionItem
                  node={node}
                  expanded={g.expandedIds.has(node.id)}
                  selected={g.selectedId === node.id}
                  hasChildren={g.nodeHasChildren(node.id)}
                  onToggle={() => g.toggleNode(node.id)}
                  onSelect={() => g.selectNode(node.id)}
                  onAddChild={() => g.handleAddUnder(node.id)}
                />
                {g.addingUnder === node.id && (
                  <InlineAddRow
                    parentLevel={node.level}
                    nombre={g.newNombre}
                    codigo={g.newCodigo}
                    codigoManual={g.newCodigoManual}
                    onNombreChange={g.handleNewNombreChange}
                    onConfirm={g.confirmAdd}
                    onCancel={g.cancelAdd}
                  />
                )}
              </Fragment>
            ))}
          </Box>
        </Box>
      </Box>

      <Divider />

      {/* Footer actions */}
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        height: 50,
        px: 2,
        gap: 1,
        flexShrink: 0,
      }}>
        <Button
          variant="outlined"
          size="small"
          onClick={handleClose}
          sx={{ textTransform: 'none', fontSize: '0.8125rem', borderColor: 'divider', color: 'text.secondary' }}
        >
          Cancelar
        </Button>
        <Button
          variant="contained"
          size="small"
          disabled={!g.canCreate}
          onClick={handleCrear}
          sx={{ textTransform: 'none', fontSize: '0.8125rem' }}
        >
          Crear
        </Button>
      </Box>
    </Drawer>
  );
}
