import { useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import IconButton from '@mui/material/IconButton';
import InputBase from '@mui/material/InputBase';
import Typography from '@mui/material/Typography';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import type { Dayjs } from 'dayjs';
import {
  IconAlertTriangle,
  IconCircleCheckFilled,
  IconX,
} from '@tabler/icons-react';
import type { UnitType } from '@/shared/config/org-types';

// ─── types ────────────────────────────────────────────────────────────────────

export type AccionType = 'suspender' | 'inactivar' | 'reactivar' | 'reabrir';

export interface AccionDialogState {
  accion: AccionType;
  itemId: string;
  itemCodigo: string;
  itemNombre: string;
  itemUbicacion: string;
  unitType: UnitType | undefined;
  /** only relevant for reactivar/reabrir — true disables the confirm button */
  blocked?: boolean;
}

// ─── private helpers ──────────────────────────────────────────────────────────

interface InputProps {
  label: string;
  required?: boolean;
  optional?: boolean;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  endIcon?: React.ReactNode;
}

function FloatingInput({ label, required, optional, placeholder, value, onChange, endIcon }: InputProps) {
  return (
    <Box sx={{ position: 'relative', mt: '4px' }}>
      <Typography component="span" sx={{
        position: 'absolute', top: -9, left: 10, px: '4px',
        bgcolor: 'background.paper', fontSize: '0.6875rem',
        color: 'text.secondary', lineHeight: 1, zIndex: 1,
        display: 'inline-flex', alignItems: 'center', gap: '2px',
      }}>
        {required && <Box component="span" sx={{ color: 'error.main' }}>*</Box>}
        {label}
        {optional && <Box component="span" sx={{ color: 'text.disabled', ml: '2px' }}>(opcional)</Box>}
      </Typography>
      <Box sx={{
        border: '1px solid rgba(16,24,64,0.23)', borderRadius: '4px',
        display: 'flex', alignItems: 'center',
        '&:focus-within': { borderColor: 'primary.main', outline: '1px solid', outlineColor: 'primary.main' },
      }}>
        <InputBase
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          sx={{ flex: 1, px: 1.5, py: '9px', fontSize: '0.875rem', '& input': { p: 0 } }}
        />
        {endIcon && <Box sx={{ pr: 1.5, color: 'text.secondary', display: 'flex', alignItems: 'center' }}>{endIcon}</Box>}
      </Box>
    </Box>
  );
}


interface InfoRowProps { label: string; value: string; extra?: string }
function InfoRow({ label, value, extra }: InfoRowProps) {
  return (
    <Typography variant="body2" sx={{ fontSize: '0.875rem', lineHeight: 1.6 }}>
      <Box component="span" sx={{ fontWeight: 600 }}>{label} </Box>
      {value}
      {extra && <Box component="span" sx={{ color: 'text.secondary', ml: 1.5 }}>{extra}</Box>}
    </Typography>
  );
}

// ─── unit labels ──────────────────────────────────────────────────────────────

const UNIT: Record<UnitType, { art: string; nom: string; pron: 'lo' | 'la' }> = {
  'Centro de costos': { art: 'El centro de costos', nom: 'centro de costos', pron: 'lo' },
  'Proyecto':         { art: 'El proyecto',          nom: 'proyecto',         pron: 'lo' },
  'Sucursal':         { art: 'La sucursal',           nom: 'sucursal',         pron: 'la' },
  'Inmueble':         { art: 'El inmueble',           nom: 'inmueble',         pron: 'lo' },
  'Departamento':     { art: 'El departamento',       nom: 'departamento',     pron: 'lo' },
};
const FALLBACK_UNIT = { art: 'La unidad', nom: 'unidad', pron: 'la' as const };

// ─── main component ───────────────────────────────────────────────────────────

interface Props {
  open: boolean;
  state: AccionDialogState | null;
  onClose: () => void;
  onConfirm: (state: AccionDialogState, motivo?: string, fecha?: string) => void;
}

export function ConfirmarAccionDialog({ open, state, onClose, onConfirm }: Props) {
  const [motivo, setMotivo] = useState('');
  const [fecha, setFecha] = useState<Dayjs | null>(null);

  // Reset form on new dialog open
  const [prevKey, setPrevKey] = useState('');
  const key = state ? `${state.accion}-${state.itemId}` : '';
  if (key !== prevKey) {
    setPrevKey(key);
    setMotivo('');
    setFecha(null);
  }

  if (!state) return null;

  const { accion, itemCodigo, itemNombre, itemUbicacion, unitType, blocked } = state;
  const ul = unitType ? UNIT[unitType] : FALLBACK_UNIT;
  const isWarningIcon = accion === 'suspender' || accion === 'inactivar';

  type BtnColor = 'warning' | 'error' | 'primary';
  const CFG: Record<AccionType, {
    title: string; desc: string;
    confirmLabel: string; confirmColor: BtnColor;
    canConfirm: boolean;
  }> = {
    suspender: {
      title:        `Suspender ${ul.nom}`,
      desc:         ` dejará de estar disponible para nuevos hechos económicos. Podrás reactiva${ul.pron}${ul.pron === 'lo' ? 'rlo' : 'rla'} más adelante cuando lo necesites.`,
      confirmLabel: 'Suspender',
      confirmColor: 'warning',
      canConfirm:   true,
    },
    inactivar: {
      title:        `Inactivar ${ul.nom}`,
      desc:         ` dejará de estar disponible para nuevos hechos económicos. Esta acción es definitiva y no podrás reactiva${ul.pron === 'lo' ? 'rlo' : 'rla'} más adelante.`,
      confirmLabel: 'Inactivar',
      confirmColor: 'warning',
      canConfirm:   motivo.trim().length > 0,
    },
    reactivar: {
      title:        `Reactivar ${ul.nom}`,
      desc:         ' volverá a estar activo y disponible para nuevas operaciones.',
      confirmLabel: 'Reactivar',
      confirmColor: 'primary',
      canConfirm:   !blocked,
    },
    reabrir: {
      title:        `Reabrir ${ul.nom}`,
      desc:         ' volverá a estar activo y disponible para nuevas operaciones.',
      confirmLabel: 'Reabrir',
      confirmColor: 'primary',
      canConfirm:   !blocked && motivo.trim().length > 0,
    },
  };

  const cfg = CFG[accion];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={false}
      slotProps={{ paper: { sx: { width: 480, borderRadius: '12px', overflow: 'visible' } } }}
    >
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 3, pt: 3, pb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{
            width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
            bgcolor: isWarningIcon ? 'rgba(249,104,0,0.10)' : 'rgba(47,67,208,0.08)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {isWarningIcon
              ? <IconAlertTriangle size={20} color="#f96800" />
              : <IconCircleCheckFilled size={20} color="#2f43d0" />
            }
          </Box>
          <Typography sx={{ fontWeight: 600, fontSize: '1.0625rem', lineHeight: 1.3, textTransform: 'capitalize' }}>
            {cfg.title}
          </Typography>
        </Box>
        <IconButton size="small" onClick={onClose} sx={{ color: 'action.active', alignSelf: 'flex-start' }}>
          <IconX size={16} />
        </IconButton>
      </Box>

      {/* Body */}
      <Box sx={{ px: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>

        {/* Description */}
        <Typography variant="body2" sx={{ fontSize: '0.875rem', lineHeight: 1.6 }}>
          {ul.art}{' '}
          <Box component="span" sx={{ fontWeight: 600 }}>{itemCodigo} {itemNombre}</Box>
          {cfg.desc}
        </Typography>

        {/* ── Suspender ── */}
        {accion === 'suspender' && <>
          <FloatingInput
            label="Agrega un motivo"
            optional
            placeholder="Ej.: Cierre temporal por remodelación..."
            value={motivo}
            onChange={setMotivo}
          />
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
              También puedes definir una fecha estimada de reactivación.
            </Typography>
            <DatePicker
              label="Fecha estimada de reactivación"
              value={fecha}
              onChange={setFecha}
              format="DD/MM/YYYY"
              slotProps={{ textField: { size: 'small', fullWidth: true } }}
            />
          </Box>
        </>}

        {/* ── Inactivar ── */}
        {accion === 'inactivar' && (
          <FloatingInput
            label="Agrega un motivo"
            required
            placeholder="Ej.: Unificación con otro centro de costos..."
            value={motivo}
            onChange={setMotivo}
          />
        )}

        {/* ── Reactivar ── */}
        {accion === 'reactivar' && (
          <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, px: 1.5, py: 1.25, bgcolor: 'grey.50', display: 'flex', flexDirection: 'column', gap: 0.75 }}>
            <InfoRow label="Motivo suspensión:" value="Cierre temporal por remodelación." />
            <InfoRow label="Suspendida desde:" value="02/04/2026" extra="123 días" />
          </Box>
        )}

        {/* ── Reabrir ── */}
        {accion === 'reabrir' && <>
          <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, px: 1.5, py: 1.25, bgcolor: 'grey.50', display: 'flex', flexDirection: 'column', gap: 0.75 }}>
            <InfoRow label="Motivo:" value="Fusión" />
            <InfoRow label="Inactiva desde:" value="02/04/2026" extra="123 días" />
            <InfoRow label="Ubicación:" value={itemUbicacion} />
          </Box>
          <FloatingInput
            label="Agrega un motivo"
            required
            placeholder="Ej.: Justificación de reapertura..."
            value={motivo}
            onChange={setMotivo}
          />
        </>}

        {/* ── Blocked warning banner (Reactivar/Reabrir) ── */}
        {blocked && (
          <Box sx={{
            display: 'flex', gap: 1.5, p: 1.5,
            bgcolor: 'rgba(249,104,0,0.06)', borderRadius: 1,
            border: '1px solid rgba(249,104,0,0.20)',
          }}>
            <IconAlertTriangle size={16} color="#f96800" style={{ flexShrink: 0, marginTop: 2 }} />
            <Box>
              <Typography sx={{ fontWeight: 600, fontSize: '0.8125rem', color: '#b75200', lineHeight: 1.4 }}>
                No puedes {accion === 'reactivar' ? 'reactivar' : 'reabrir'} esta {ul.nom} todavía
              </Typography>
              <Typography sx={{ fontSize: '0.8125rem', color: 'text.secondary', lineHeight: 1.4, mt: 0.25 }}>
                La ubicación asociada a {accion === 'reactivar' ? 'este' : 'esta'} {ul.nom} está inactiva.
                Reactívala primero para poder continuar.
              </Typography>
            </Box>
          </Box>
        )}
      </Box>

      {/* Footer */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, px: 3, py: 2.5 }}>
        <Button
          variant="text" size="small" onClick={onClose}
          sx={{ textTransform: 'none', fontSize: '0.875rem', color: 'text.secondary' }}
        >
          Cancelar
        </Button>
        <Button
          variant="contained" size="small"
          color={cfg.confirmColor}
          disabled={!cfg.canConfirm}
          onClick={() => onConfirm(state, motivo || undefined, fecha?.format('YYYY-MM-DD') || undefined)}
          sx={{ textTransform: 'none', fontSize: '0.875rem' }}
        >
          {cfg.confirmLabel}
        </Button>
      </Box>
    </Dialog>
  );
}
