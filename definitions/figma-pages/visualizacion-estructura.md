# Visualización estructura

**Sección Figma:** `Visualización estructura` (node `6211:37451`)

---

## Página principal

| Estado | Link |
|--------|------|
| Vista Tabla — árbol de estructura organizacional | https://www.figma.com/design/fYzIv8Nzny2TNarXLm91y5/Estructura-Organizacional?node-id=6194-18586 |

---

## Vistas alternativas / estados

| Estado | Descripción | Link |
|--------|-------------|------|
| Vista Tabla — hover en nodo padre | Al pasar el cursor sobre un nodo tipo Grupo (LEVEL1 o raíz) aparece botón `+` a la derecha para crear un hijo directo | https://www.figma.com/design/fYzIv8Nzny2TNarXLm91y5/Estructura-Organizacional?node-id=6256-33067 |
| Vista Tabla — filtro activo | Chip "Centro de costos" activo (primary); el árbol muestra solo nodos de ese tipo; el conteo del chip "Todos" se opaca | https://www.figma.com/design/fYzIv8Nzny2TNarXLm91y5/Estructura-Organizacional?node-id=6211-27444 |

---

## Anatomía de la Vista Tabla

### Barra de título
- `<Typography>` "Estructura Organizacional"
- `<ToggleButtonGroup>` Tabla / Estructura (vista Tabla = `IconLayoutColumns`, vista Estructura = `IconSitemap`)
- `<IconButton>` cargar archivo (`IconUpload`)

### Área de contenido (900 px centrada)
- **Barra superior**: `<TextField>` Buscar... (462 px, `IconSearch` al final) + `<Button>` "+ Crear ↓" (primary, despliega menú)
- **Filter chips** (row): Todos · Centro de costos · Proyectos · Sucursales · Inmuebles · Departamentos — cada uno con badge de conteo

### Árbol (treeview, 868 px)

| Nivel | Tipo | Icono | Detalles |
|-------|------|-------|---------|
| Raíz | Empresa (único) | `IconBuildingCommunity` (primary.main) | Sin chevron; badge de conteo a la derecha; en hover: botón `+` a la derecha |
| LEVEL1 | Grupo (`<IconHierarchy>`) | `IconHierarchy` | Chevron expand/collapse; badge conteo; en hover: `IconPencil` + `IconPlus` + `IconDotsVertical` |
| LEVEL2+ | Sub-grupo | `IconHierarchy` | Igual a LEVEL1 con indentación adicional (20 px por nivel) |
| UND | Unidad organizacional (hoja) | Sin icono — conector `└` | Label + chip de tipo (ej. "Centro de costos") + badge estado ("Suspendida", "Inactiva", etc.) |

**Estados de nodo:**
- **Normal**: texto `text.primary`, icono `rgba(16,24,64,0.54)`
- **Inactivo/descartado**: texto tachado, color `text.disabled`, icono opaco
- **Suspendida**: badge chip naranja (`#f96800`) a la derecha del chip de tipo
- **Hover (padre)**: fondo `rgba(47,67,208,0.04)`, revela 3 IconButtons (`IconPencil`, `IconPlus`, `IconDotsVertical`) en `primary.main`

**Líneas conectoras del árbol**: líneas verticales/horizontales SVG (`rgba(16,24,64,0.12)`) que muestran la jerarquía entre nodos (mismo algoritmo `computeLinePatterns` del componente de extracción).

---

## Elementos complementarios

### Menús contextuales

| Descripción | Link |
|-------------|------|
| Menú "Crear" — opciones de creación de nodo | https://www.figma.com/design/fYzIv8Nzny2TNarXLm91y5/Estructura-Organizacional?node-id=6201-57359 |

**Opciones del menú Crear** (mismo menú que en la pantalla de carga):
- `IconSubtask` Grupo
- `IconUsers` Centro de costos
- `IconClipboardText` Proyecto
- `IconMap2` Sucursal
- `IconBuildingCommunity` Inmueble
- `IconDeviceDesktopAnalytics` Departamento

### Componentes de referencia

| Descripción | Link |
|-------------|------|
| `<TreeItem>LEVEL1` — componente standalone de nodo grupo | https://www.figma.com/design/fYzIv8Nzny2TNarXLm91y5/Estructura-Organizacional?node-id=6242-27891 |

**Anatomía TreeItem LEVEL1** (width=392, height=36):
- Spacer de indentación (16 px × nivel, oculto en nivel 0)
- `<Icon>` expand/collapse (16 px) — oculto si sin hijos
- `<Icon>` tipo de nodo (16 px): `IconHierarchy` para grupos, `IconBuildingCommunity` para raíz
- `<Typography>` label (flex 1)
- `<Badge>` conteo (18 px)
- `<IconButton>` `+` crear hijo (24 px, visible en hover)
- `<IconButton>` editar (20 px, visible en hover de nodos con edición)
- `<IconButton>` más opciones `⋮` (20 px, visible en hover)
