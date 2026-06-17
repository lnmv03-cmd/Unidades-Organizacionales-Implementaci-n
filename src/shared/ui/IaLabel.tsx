import Box from '@mui/material/Box';

const IA_LABEL_SRC =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAOdEVYdFNvZnR3YXJlAEZpZ21hnrGWYwAAASBJREFUeAF9j0FLAlEUhc+oPScbkQKV3OSiRRHowkW0siACadUyiSgCIYJctqt2QYt+QT+hRatqlf8gsFUSOVSgaIQ6OuqMOteZJ47owg/e43I599xzQSaXd7+kqB2ahrPcPrrOfqh4kLOIR/zwiW7kfzRoXQOSxwmbQkmjZPqTMu8le/ownaebe3nMEdZXLOt24yVTo51kjhLnb6Q0R3EErjapqwaeX6t4fKrgX+mhNadgJdrDyW4Y6+EguDD31cLphQytI0BkDriYYApraEh//PlCOhyWWyjIEN/w8sxkAMLoBEhuhlQsBnu1hZkVV7cFfBd17niwN4/9rSV4xZmB45DFAMPZcWBQL4hIJZa5yMKFCaJrHkRWZ7G96R/r9wEtg7bjE8Q56AAAAABJRU5ErkJggg==';

export function IaLabel({ size = 10 }: { size?: number }) {
  return (
    <Box
      component="img"
      src={IA_LABEL_SRC}
      alt="IA"
      sx={{ width: size, height: size, display: 'block', flexShrink: 0 }}
    />
  );
}
