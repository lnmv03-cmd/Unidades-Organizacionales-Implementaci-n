# Crear grupo

**Sección Figma:** `Crear grupo` (node `6199:24507`)

---

## Página principal

| Estado | Link |
|--------|------|
| Drawer abierto — estado inicial (nombre vacío, código placeholder) | https://www.figma.com/design/fYzIv8Nzny2TNarXLm91y5/Estructura-Organizacional?node-id=6199-24508 |

---

## Vistas del flujo del Drawer

Todas son pantallas de contexto: tabla a la izquierda + Drawer de creación abierto a la derecha.

| Estado | Descripción | Link |
|--------|-------------|------|
| Estado inicial — variante tabla grande | Drawer vacío, tab Centros de costos activo | https://www.figma.com/design/fYzIv8Nzny2TNarXLm91y5/Estructura-Organizacional?node-id=6214-59551 |
| Código sugerido por IA | Nombre vacío; IA sugiere código `SUC·BOG` + ícono editar | https://www.figma.com/design/fYzIv8Nzny2TNarXLm91y5/Estructura-Organizacional?node-id=6199-26336 |
| Código sugerido — variante 2 | Igual al anterior, tabla grande | https://www.figma.com/design/fYzIv8Nzny2TNarXLm91y5/Estructura-Organizacional?node-id=6214-57419 |
| Código en edición | Campo código con cursor activo para editar manualmente | https://www.figma.com/design/fYzIv8Nzny2TNarXLm91y5/Estructura-Organizacional?node-id=6214-58360 |
| Código en edición — variante 2 | Igual, tabla grande | https://www.figma.com/design/fYzIv8Nzny2TNarXLm91y5/Estructura-Organizacional?node-id=6199-27060 |
| Con descripción añadida | Nombre escrito ("Sucursales Bogotá"), descripción visible, botón Crear activo | https://www.figma.com/design/fYzIv8Nzny2TNarXLm91y5/Estructura-Organizacional?node-id=6247-46033 |
| Seleccionar ubicación — árbol en drawer | Nombre escrito, árbol de ubicación expandido dentro del drawer | https://www.figma.com/design/fYzIv8Nzny2TNarXLm91y5/Estructura-Organizacional?node-id=6247-46746 |
| Seleccionar ubicación — árbol completo extendido | Árbol con múltiples niveles visibles | https://www.figma.com/design/fYzIv8Nzny2TNarXLm91y5/Estructura-Organizacional?node-id=6250-29297 |
| Ubicación seleccionada (UbicaciónOk) | Nodo confirmado con checkmark, badge actualizado | https://www.figma.com/design/fYzIv8Nzny2TNarXLm91y5/Estructura-Organizacional?node-id=6250-30354 |
| Árbol de ubicación — crear sub-nodo | Árbol expandido con opción "+ Crear" en rama activa | https://www.figma.com/design/fYzIv8Nzny2TNarXLm91y5/Estructura-Organizacional?node-id=6214-53233 |
| Árbol de ubicación — sub-nodo creado (OK) | Rama creada y seleccionada | https://www.figma.com/design/fYzIv8Nzny2TNarXLm91y5/Estructura-Organizacional?node-id=6214-53298 |
| Árbol de ubicación — crear segunda rama | Segunda opción de creación de nodo | https://www.figma.com/design/fYzIv8Nzny2TNarXLm91y5/Estructura-Organizacional?node-id=6214-53364 |
| Árbol de ubicación — segunda rama creada (OK) | Segunda rama creada y seleccionada | https://www.figma.com/design/fYzIv8Nzny2TNarXLm91y5/Estructura-Organizacional?node-id=6214-53430 |
| Árbol de ubicación — selección activa (tab Proyectos) | Nodo "EA12 Región centro" en hover/selected | https://www.figma.com/design/fYzIv8Nzny2TNarXLm91y5/Estructura-Organizacional?node-id=6214-53495 |
| Árbol de ubicación — ubicación confirmada | Nodo confirmado, badge actualizado en todos los ancestros | https://www.figma.com/design/fYzIv8Nzny2TNarXLm91y5/Estructura-Organizacional?node-id=6214-53560 |

---

## Anatomía del Drawer `Crear grupo`

### DrawerHeader
- Ícono: `IconSubtask` (tabler)
- Título: **"Crear grupo"**
- Subtítulo / breadcrumb: `"Causación de gasto — COSMOS-SAS"`
- Botón cerrar: `IconX`

### ContentDrawer — campos en orden vertical

| Campo | Tipo | Comportamiento |
|-------|------|---------------|
| **Nombre** | TextField requerido | Placeholder `"Ej.: Servicios generales"`; label flotante `"Escriba un nombre"`; asterisco rojo izquierda |
| **Código** | Display → TextField | Auto-sugerido por IA; badge `✦` + label `IA`; muestra p.ej. `SUC·BOG`; `IconPencil` (primary) al lado para activar edición; al hacer click se convierte en TextField editable |
| **Descripción** | Colapsable | Por defecto: botón texto `+ Añadir descripción` con `IconPlus`; al hacer click expande y muestra TextField multiline con placeholder `"Propósito o justificación..."` |
| **Ubicación** | Árbol expandible inline | Jerarquía org; raíz `"Empresa de insumos S.A.S"` con `IconBuildingCommunity`; nodos hijos con `IconSitemap`; badge numérico de conteo por nodo; `IconChevronRight`/`IconChevronDown` para expandir; `IconPlus` al hover de cada nodo para crear sub-grupo en esa rama; nodo seleccionado: fondo `rgba(47,67,208,0.08)` + `IconCircleCheckFilled` en `primary.main` |

### Árbol de Ubicación — estados detallados

1. **Colapsado**: Solo raíz visible, `chevron-right`, badge `0`
2. **Expandido**: Hijos visibles con sus conteos
3. **Hover nodo**: Aparece `IconPlus` a la derecha → abre inline form "Crear grupo" anidado en esa rama
4. **Seleccionado**: `IconCircleCheckFilled` (primary), fondo `rgba(47,67,208,0.08)`, texto `primary.main`

### Actions (footer fijo)
- Izquierda: *(vacío en creación)* — reservado para "Inactivar" en modo edición
- Derecha: `Cancelar` (text/outlined) + `Crear` (contained, deshabilitado hasta que Nombre sea válido)

---

## Elementos complementarios

### Drawer standalone (sin contexto de tabla)

| Descripción | Link |
|-------------|------|
| Drawer Crear grupo aislado (para referencia de medidas) | https://www.figma.com/design/fYzIv8Nzny2TNarXLm91y5/Estructura-Organizacional?node-id=6201-56326 |
