import Box from '@mui/material/Box';
import GlobalStyles from '@mui/material/GlobalStyles';
import IconButton from '@mui/material/IconButton';
import Slide from '@mui/material/Slide';
import type { SlideProps } from '@mui/material/Slide';
import Snackbar from '@mui/material/Snackbar';
import SnackbarContent from '@mui/material/SnackbarContent';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { IconCircleCheckFilled, IconLayoutColumns, IconSitemap, IconSparkles, IconUpload, IconX } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { CargarEstructuraEmptyState } from './CargarEstructuraEmptyState';
import { CargarEstructuraExtrayendo } from './CargarEstructuraExtrayendo';
import { useCargarEstructura } from '../hooks/useCargarEstructura';
import { VisualizarEstructura } from '@/widgets/visualizar-estructura';
import { useEstructuraStore } from '@/shared/model/estructura.store';

function SlideUp(props: SlideProps) {
  return <Slide {...props} direction="up" />;
}

export function CargarEstructuraWidget() {
  const {
    estado,
    snackbarAbierto,
    fileInputRef,
    handleCargarArchivo,
    handleArchivoSeleccionado,
    handleSnackbarCerrar,
  } = useCargarEstructura();

  const { tree } = useEstructuraStore();
  const [vista, setVista] = useState<'tabla' | 'estructura'>('tabla');
  const [hasCreatedFromEmpty, setHasCreatedFromEmpty] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const [bannerReady, setBannerReady] = useState(false);
  const [pendienteTrigger, setPendienteTrigger] = useState(0);
  const isExtracting = estado === 'extrayendo';

  const pendingCount = tree.filter(n => n.type === 'unidad' && n.status === 'Pendiente').length;

  // Show banner after a random delay (3–7 s), only once extraction has completed
  useEffect(() => {
    if (estado !== 'completado' || !pendingCount || bannerDismissed || bannerReady) return;
    const delay = 3000 + Math.random() * 4000;
    const timer = setTimeout(() => setBannerReady(true), delay);
    return () => clearTimeout(timer);
  }, [estado, pendingCount, bannerDismissed, bannerReady]);

  const togglesEnabled = estado === 'completado' || hasCreatedFromEmpty;
  const showEmptyState = estado === 'vacio' && !(hasCreatedFromEmpty && vista === 'estructura');
  const showExtrayendo = estado === 'extrayendo' || (estado === 'completado' && vista === 'tabla');

  return (
    <>
    <GlobalStyles
      styles={{
        '@keyframes cargar-fade': {
          '0%, 100%': { opacity: 0.5 },
          '50%': { opacity: 1 },
        },
      }}
    />
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.default',
      }}
    >
      {/* 4-sided ambient lavender glow during extraction */}
      {isExtracting && (
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            zIndex: 10,
            animation: 'cargar-fade 2.0s ease-in-out infinite',
            background: [
              'linear-gradient(to bottom, rgba(83,35,222,0.16) 0%, transparent 14%)',
              'linear-gradient(to top, rgba(83,35,222,0.10) 0%, transparent 12%)',
              'linear-gradient(to right, rgba(83,35,222,0.16) 0%, transparent 10%)',
              'linear-gradient(to left, rgba(83,35,222,0.16) 0%, transparent 10%)',
            ].join(', '),
          }}
        />
      )}

      {/* Title bar */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 1.5,
          py: 1,
          minHeight: 50,
          flexShrink: 0,
          position: 'relative',
          zIndex: 1,
        }}
      >
        <Typography variant="h6">Estructura Organizacional</Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <ToggleButtonGroup
            size="small"
            value={togglesEnabled ? vista : null}
            exclusive
            onChange={(_, v: 'tabla' | 'estructura') => { if (v && togglesEnabled) setVista(v); }}
            sx={{
              '& .MuiToggleButton-root.Mui-selected': {
                color: '#5323de',
                bgcolor: 'rgba(83,35,222,0.08)',
                '&:hover': { bgcolor: 'rgba(83,35,222,0.12)' },
              },
              '& .MuiToggleButton-root.Mui-disabled': {
                color: 'action.disabled',
                borderColor: 'action.disabled',
              },
            }}
          >
            <ToggleButton value="tabla" disabled={!togglesEnabled}>
              <IconLayoutColumns size={16} />
              <Typography variant="button" sx={{ ml: 0.5 }}>Tabla</Typography>
            </ToggleButton>
            <ToggleButton value="estructura" disabled={!togglesEnabled}>
              <IconSitemap size={16} />
              <Typography variant="button" sx={{ ml: 0.5 }}>Estructura</Typography>
            </ToggleButton>
          </ToggleButtonGroup>

          <Tooltip title="Cargar estructura" placement="bottom">
            <IconButton size="small" onClick={handleCargarArchivo}>
              <IconUpload size={16} />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Alert banner — borradores pendientes */}
      {bannerReady && pendingCount > 0 && !bannerDismissed && (togglesEnabled || isExtracting) && (
        <Box sx={{ width: '80%', mx: 'auto', mb: 1, flexShrink: 0, position: 'relative', zIndex: 1 }}>
          <Box sx={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            bgcolor: 'rgba(0,188,212,0.08)', borderRadius: 1, px: 1.5, py: 1,
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <IconSparkles size={20} color="#00bcd4" />
              <Typography variant="h5" sx={{ fontWeight: 600, lineHeight: 1.2, color: 'text.primary' }}>
                {pendingCount}
              </Typography>
              <Typography variant="subtitle1" sx={{ color: 'text.primary', letterSpacing: '0.15px' }}>
                borradores pendientes que requieren revisión y resolución
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Typography
                variant="button"
                onClick={() => { setVista('tabla'); setPendienteTrigger(t => t + 1); setBannerDismissed(true); }}
                sx={{ color: '#00adc9', fontSize: '0.75rem', fontWeight: 500, letterSpacing: '0.4px', cursor: 'pointer', textTransform: 'none' }}
              >
                Revisar
              </Typography>
              <IconButton size="small" onClick={() => setBannerDismissed(true)} sx={{ p: '2px', color: 'rgba(0,188,212,0.7)', '&:hover': { color: '#00bcd4' } }}>
                <IconX size={14} />
              </IconButton>
            </Box>
          </Box>
        </Box>
      )}

      {/* Content card — pulsing border during extraction, flat otherwise */}
      <Box
        sx={{
          flex: 1,
          width: '80%',
          mx: 'auto',
          mb: 2,
          bgcolor: 'background.paper',
          borderRadius: 2,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          zIndex: 1,
          boxShadow: 'none',
        }}
      >
        {showEmptyState && (
          <CargarEstructuraEmptyState
            onCargarArchivo={handleCargarArchivo}
            onCrear={() => { setHasCreatedFromEmpty(true); setVista('estructura'); }}
          />
        )}
        {showExtrayendo && (
          <CargarEstructuraExtrayendo estado={estado} pendienteTrigger={pendienteTrigger} />
        )}
        {/* File-load flow: mount at extrayendo so initTree(ORG_TREE) runs immediately and data is available during animation */}
        {(estado === 'extrayendo' || estado === 'completado') && (
          <Box sx={{ display: (estado === 'completado' && vista === 'estructura') ? 'flex' : 'none', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
            <VisualizarEstructura initFromOrg={true} />
          </Box>
        )}
        {/* Empty-state creation flow: only mount when actually showing, no ORG_TREE */}
        {hasCreatedFromEmpty && vista === 'estructura' && estado !== 'completado' && (
          <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
            <VisualizarEstructura initFromOrg={false} />
          </Box>
        )}
      </Box>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        style={{ display: 'none' }}
        onChange={handleArchivoSeleccionado}
      />

      {/* Snackbar — only after extraction completes */}
      <Snackbar
        open={snackbarAbierto && estado === 'completado'}
        autoHideDuration={5000}
        onClose={handleSnackbarCerrar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        slots={{ transition: SlideUp }}
      >
        <SnackbarContent
          sx={{ bgcolor: '#f2f9e7', minWidth: 'auto', color: 'text.primary' }}
          message={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <IconCircleCheckFilled size={16} color="#72b525" />
              <Typography variant="body2" sx={{ color: 'text.primary' }}>
                Estructura organizacional cargada
              </Typography>
            </Box>
          }
          action={
            <IconButton size="small" onClick={handleSnackbarCerrar} sx={{ color: 'text.secondary' }}>
              <IconX size={16} />
            </IconButton>
          }
        />
      </Snackbar>
    </Box>
    </>
  );
}
