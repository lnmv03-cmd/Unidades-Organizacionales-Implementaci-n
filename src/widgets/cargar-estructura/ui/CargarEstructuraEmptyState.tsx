import { useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Slide from '@mui/material/Slide';
import type { SlideProps } from '@mui/material/Slide';
import Snackbar from '@mui/material/Snackbar';
import SnackbarContent from '@mui/material/SnackbarContent';
import Typography from '@mui/material/Typography';
import type { ForwardRefExoticComponent, RefAttributes } from 'react';
import type { IconProps } from '@tabler/icons-react';
import {
  IconCircleCheckFilled,
  IconUpload,
  IconPlus,
  IconChevronDown,
  IconSitemap,
  IconUsers,
  IconClipboardText,
  IconMap2,
  IconBuildingCommunity,
  IconDeviceDesktopAnalytics,
  IconX,
} from '@tabler/icons-react';

function SlideUp(props: SlideProps) {
  return <Slide {...props} direction="up" />;
}

const MENSAJE_CREADO: Record<string, string> = {
  'Grupo':            'Grupo creado',
  'Centro de costos': 'Centro de costos creado',
  'Proyecto':         'Proyecto creado',
  'Sucursal':         'Sucursal creada',
  'Inmueble':         'Inmueble creado',
  'Departamento':     'Departamento creado',
};
import { EmptyStateIllustration } from '@/shared/ui';
import { CrearGrupoDrawer } from '@/features/crear-grupo';
import { CrearUnidadDrawer } from '@/features/crear-unidad';
import type { UnitType } from '@/shared/config/org-types';

type TablerIcon = ForwardRefExoticComponent<IconProps & RefAttributes<SVGSVGElement>>;

type OpcionCrear = {
  label: string;
  icon: TablerIcon;
  dividerAfter?: boolean;
  unitType?: UnitType;
};

const CREAR_OPCIONES: OpcionCrear[] = [
  { label: 'Grupo',           icon: IconSitemap,                   dividerAfter: true },
  { label: 'Centro de costos', icon: IconUsers,                    unitType: 'Centro de costos' },
  { label: 'Proyecto',         icon: IconClipboardText,            unitType: 'Proyecto' },
  { label: 'Sucursal',         icon: IconMap2,                     unitType: 'Sucursal' },
  { label: 'Inmueble',         icon: IconBuildingCommunity,        unitType: 'Inmueble' },
  { label: 'Departamento',     icon: IconDeviceDesktopAnalytics,   unitType: 'Departamento' },
];

type Props = {
  onCargarArchivo: () => void;
  onCrear?: () => void;
};

export function CargarEstructuraEmptyState({ onCargarArchivo, onCrear }: Props) {
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const [crearGrupoOpen, setCrearGrupoOpen] = useState(false);
  const [crearUnidadType, setCrearUnidadType] = useState<UnitType | null>(null);
  const [snackbarMsg, setSnackbarMsg] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  function mostrarSnackbar(msg: string) {
    setSnackbarMsg(msg);
    setSnackbarOpen(true);
  }

  function handleCrearClick(e: React.MouseEvent<HTMLElement>) {
    setMenuAnchor(e.currentTarget);
  }

  function handleMenuClose() {
    setMenuAnchor(null);
  }

  function handleOpcionClick(opcion: OpcionCrear) {
    handleMenuClose();
    if (opcion.unitType) {
      setCrearUnidadType(opcion.unitType);
    } else {
      setCrearGrupoOpen(true);
    }
  }

  return (
    <>
    <Box
      sx={{
        bgcolor: 'grey.50',
        borderRadius: 2,
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 3,
        px: 1,
        py: 1.5,
      }}
    >
      <EmptyStateIllustration />

      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, width: '100%' }}>
        <Typography variant="h6" align="center">
          Comienza a configurar tu estructura organizacional
        </Typography>
        <Typography variant="body1" color="text.secondary" align="center">
          Carga un archivo con tu información o crea la estructura desde cero.
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', justifyContent: 'center' }}>
        <Button
          variant="outlined"
          size="small"
          startIcon={<IconUpload size={16} />}
          onClick={onCargarArchivo}
          sx={{ borderColor: 'rgba(47,67,208,0.5)', color: 'primary.main' }}
        >
          Cargar archivo
        </Button>

        <Button
          variant="outlined"
          size="small"
          startIcon={<IconPlus size={16} />}
          endIcon={<IconChevronDown size={16} />}
          onClick={handleCrearClick}
          aria-haspopup="true"
          aria-expanded={Boolean(menuAnchor)}
          sx={{ borderColor: 'rgba(47,67,208,0.5)', color: 'primary.main' }}
        >
          Crear
        </Button>

        <Menu
          anchorEl={menuAnchor}
          open={Boolean(menuAnchor)}
          onClose={handleMenuClose}
          slotProps={{
            paper: {
              elevation: 8,
              sx: { borderRadius: 1, minWidth: 173 },
            },
          }}
          transformOrigin={{ horizontal: 'left', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
        >
          {CREAR_OPCIONES.map((opcion) => (
            <Box key={opcion.label}>
              <MenuItem
                dense
                onClick={() => handleOpcionClick(opcion)}
                sx={{
                  gap: 1,
                  px: 2,
                  py: 0.5,
                  fontSize: '0.875rem',
                  fontWeight: 400,
                  lineHeight: '24px',
                  letterSpacing: '0.17px',
                  color: 'text.primary',
                }}
              >
                <opcion.icon size={16} style={{ flexShrink: 0, color: 'rgba(16,24,64,0.54)' }} />
                {opcion.label}
              </MenuItem>
              {opcion.dividerAfter && <Divider />}
            </Box>
          ))}
        </Menu>
      </Box>
    </Box>

    <CrearGrupoDrawer
      open={crearGrupoOpen}
      onClose={() => setCrearGrupoOpen(false)}
      isInitialState
      onCrear={() => { mostrarSnackbar(MENSAJE_CREADO['Grupo']); onCrear?.(); }}
    />

    <CrearUnidadDrawer
      open={Boolean(crearUnidadType)}
      unitType={crearUnidadType}
      onClose={() => setCrearUnidadType(null)}
      isInitialState
      onCrear={(_, __, ut) => { mostrarSnackbar(MENSAJE_CREADO[ut] ?? `${ut} creado`); onCrear?.(); }}
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
    </>
  );
}
