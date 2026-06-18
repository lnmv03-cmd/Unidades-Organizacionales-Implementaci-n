import { useState, useMemo } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Drawer from '@mui/material/Drawer';
import InputAdornment from '@mui/material/InputAdornment';
import Tooltip from '@mui/material/Tooltip';
import Collapse from '@mui/material/Collapse';
import {
  IconHistory,
  IconX,
  IconSearch,
  IconArrowNarrowUp,
  IconArrowsVertical,
  IconChevronDown,
  IconChevronUp,
} from '@tabler/icons-react';
import type { EventoHistorial, TipoEventoHistorial } from '@/shared/types/historial';

const TIPO_CONFIG: Record<TipoEventoHistorial, { label: string; color: string; ring: string }> = {
  eliminacion:   { label: 'Eliminación',   color: '#e8a1a1', ring: '#f9e8e8' },
  asignacion:    { label: 'Asignación',    color: '#d6d5ff', ring: '#f3f3ff' },
  actualizacion: { label: 'Actualización', color: '#96cfe2', ring: '#e6f3f8' },
  activacion:    { label: 'Activación',    color: '#c7e49d', ring: '#f2f9e7' },
};

function EventoDot({ tipo }: { tipo: TipoEventoHistorial }) {
  const { label, color, ring } = TIPO_CONFIG[tipo];
  return (
    <Tooltip title={label} placement="left" arrow>
      <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: color, boxShadow: `0 0 0 5px ${ring}`, flexShrink: 0, cursor: 'default' }} />
    </Tooltip>
  );
}

function EventoRow({ evento, isLast, expanded, onToggle }: { evento: EventoHistorial; isLast: boolean; expanded: boolean; onToggle: () => void }) {
  const tieneDetalle = Boolean(evento.detalles?.length || evento.motivo);

  return (
    <Box sx={{ display: 'flex', gap: 1.5, px: 1, alignItems: 'flex-start', width: '100%' }}>
      {/* Fecha/hora */}
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', flexShrink: 0, width: 63 }}>
        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.6875rem', lineHeight: '14px', letterSpacing: '0.4px', whiteSpace: 'nowrap' }}>
          {evento.fecha}
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.6875rem', lineHeight: '14px', letterSpacing: '0.4px', whiteSpace: 'nowrap' }}>
          {evento.hora}
        </Typography>
      </Box>

      {/* Conector */}
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0, width: 16, alignSelf: 'stretch' }}>
        <Box sx={{ py: 0.5, display: 'flex', alignItems: 'center' }}>
          <EventoDot tipo={evento.tipo} />
        </Box>
        {!isLast && <Box sx={{ flex: '1 0 0', width: '2px', bgcolor: 'divider', minHeight: '4px' }} />}
      </Box>

      {/* Contenido */}
      <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 1.5, pb: isLast ? 0 : 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="body2" sx={{ lineHeight: '16px', letterSpacing: '0.15px', whiteSpace: 'nowrap' }}>
            {evento.titulo}
          </Typography>
          {tieneDetalle && (
            <IconButton size="small" onClick={onToggle} sx={{ p: '3px' }}>
              {expanded ? <IconChevronUp size={16} /> : <IconChevronDown size={16} />}
            </IconButton>
          )}
        </Box>

        <Collapse in={expanded} unmountOnExit>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, pb: 1.5 }}>
            {evento.detalles && evento.detalles.length > 0 && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                {evento.detalles.map((d, i) => (
                  <Typography key={i} component="li" variant="body2" sx={{ fontSize: '0.8125rem', lineHeight: '16px', letterSpacing: '0.17px', listStyleType: 'disc', listStylePosition: 'outside', ml: 2.5 }}>
                    <Box component="span" sx={{ color: 'text.secondary' }}>{d.label}:</Box>
                    {' '}{d.valor}
                  </Typography>
                ))}
              </Box>
            )}
            {evento.motivo && (
              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8125rem', lineHeight: '16px' }}>
                  Motivo:
                </Typography>
                <Typography variant="body2" sx={{ fontSize: '0.8125rem', lineHeight: '16px', fontStyle: 'italic' }}>
                  {evento.motivo}
                </Typography>
              </Box>
            )}
          </Box>
        </Collapse>
      </Box>
    </Box>
  );
}

interface HistorialDrawerProps {
  open: boolean;
  eventos: EventoHistorial[];
  onClose: () => void;
}

export function HistorialDrawer({ open, eventos, onClose }: HistorialDrawerProps) {
  const [search, setSearch] = useState('');
  const [sortAsc, setSortAsc] = useState(false);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    const result = q ? eventos.filter(e => e.titulo.toLowerCase().includes(q)) : [...eventos];
    return sortAsc ? result.reverse() : result;
  }, [eventos, search, sortAsc]);

  const allExpandable = filtered.filter(e => e.detalles?.length || e.motivo);
  const allExpanded = allExpandable.length > 0 && allExpandable.every(e => expandedIds.has(e.id));

  const toggleEvento = (id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleExpandAll = () => {
    setExpandedIds(allExpanded ? new Set() : new Set(allExpandable.map(e => e.id)));
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      variant="temporary"
      hideBackdrop
      sx={{
        '& .MuiDrawer-paper': {
          width: 440,
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0px 3px 7px rgba(93,109,126,0.09), 0px 8px 5px rgba(93,109,126,0.14), 0px 5px 2.5px rgba(93,109,126,0.18)',
        },
      }}
    >
      {/* Header */}
      <Box sx={{ bgcolor: 'grey.50', px: 2, py: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
          <Box sx={{ color: 'text.secondary', display: 'flex', pt: '1px' }}>
            <IconHistory size={16} />
          </Box>
          <Box>
            <Typography variant="subtitle1" sx={{ fontSize: '0.875rem', fontWeight: 500, lineHeight: '16px', letterSpacing: '0.15px' }}>
              Historial de eventos
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.6875rem', lineHeight: '14px', letterSpacing: '0.4px' }}>
              Total de eventos: {eventos.length}
            </Typography>
          </Box>
        </Box>
        <IconButton size="small" onClick={onClose} sx={{ p: '3px' }}>
          <IconX size={16} />
        </IconButton>
      </Box>

      {/* Body */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, pt: 2, px: 2 }}>
        {/* Search + toolbar */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2, flexShrink: 0 }}>
          <TextField
            size="small"
            placeholder="Buscar evento"
            value={search}
            onChange={e => setSearch(e.target.value)}
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconSearch size={16} />
                  </InputAdornment>
                ),
              },
            }}
            sx={{
              '& .MuiOutlinedInput-root': { height: 32, fontSize: '0.8125rem' },
              '& .MuiOutlinedInput-input': { py: 1, px: 1.5 },
            }}
            fullWidth
          />
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Button
              variant="text"
              size="small"
              endIcon={<IconArrowNarrowUp size={16} style={{ transform: sortAsc ? 'rotate(180deg)' : undefined }} />}
              onClick={() => setSortAsc(v => !v)}
              sx={{ px: 0, fontSize: '0.75rem', fontWeight: 500, letterSpacing: '0.4px' }}
            >
              {sortAsc ? 'Más antiguos primero' : 'Más recientes primero'}
            </Button>
            <Button
              variant="text"
              size="small"
              endIcon={<IconArrowsVertical size={16} />}
              onClick={toggleExpandAll}
              sx={{ px: 0, fontSize: '0.75rem', fontWeight: 500, letterSpacing: '0.4px' }}
            >
              {allExpanded ? 'Colapsar todo' : 'Expandir todo'}
            </Button>
          </Box>
        </Box>

        {/* Timeline */}
        <Box sx={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
          {filtered.map((evento, idx) => (
            <EventoRow
              key={evento.id}
              evento={evento}
              isLast={idx === filtered.length - 1}
              expanded={expandedIds.has(evento.id)}
              onToggle={() => toggleEvento(evento.id)}
            />
          ))}
          {filtered.length === 0 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', pt: 4 }}>
              <Typography variant="body2" color="text.secondary">Sin resultados</Typography>
            </Box>
          )}
        </Box>
      </Box>
    </Drawer>
  );
}
