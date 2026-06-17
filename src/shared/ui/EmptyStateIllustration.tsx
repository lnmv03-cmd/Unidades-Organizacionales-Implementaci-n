import Box from '@mui/material/Box';
import dotSrc from '../assets/empty-state/dot.svg';
import ufoSrc from '../assets/empty-state/ufo.svg';
import orbitOuterSrc from '../assets/empty-state/orbit-outer.svg';
import orbitInnerSrc from '../assets/empty-state/orbit-inner.svg';

export function EmptyStateIllustration() {
  return (
    <Box sx={{ position: 'relative', width: 138, height: 83, overflow: 'hidden', flexShrink: 0 }}>
      {/* Outer orbit */}
      <Box
        component="img"
        src={orbitOuterSrc}
        alt=""
        sx={{ position: 'absolute', top: 0, left: 4, width: 134, height: 134 }}
      />
      {/* Inner orbit */}
      <Box
        component="img"
        src={orbitInnerSrc}
        alt=""
        sx={{ position: 'absolute', top: 21, left: 25, width: 91, height: 91 }}
      />
      {/* UFO icon */}
      <Box
        component="img"
        src={ufoSrc}
        alt=""
        sx={{ position: 'absolute', top: 48, left: 52, width: 34, height: 34 }}
      />
      {/* Orbit dots */}
      <Box
        component="img"
        src={dotSrc}
        alt=""
        sx={{ position: 'absolute', top: 73, left: 23, width: 8, height: 8 }}
      />
      <Box
        component="img"
        src={dotSrc}
        alt=""
        sx={{ position: 'absolute', top: 52, left: 111, width: 8, height: 8 }}
      />
      <Box
        component="img"
        src={dotSrc}
        alt=""
        sx={{ position: 'absolute', top: 63, left: 0, width: 8, height: 8 }}
      />
      <Box
        component="img"
        src={dotSrc}
        alt=""
        sx={{ position: 'absolute', top: 7, left: 103, width: 8, height: 8 }}
      />
    </Box>
  );
}
