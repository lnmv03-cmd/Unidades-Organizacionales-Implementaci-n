import { useState } from 'react';
import { useEstructuraStore, sortDFS } from '@/shared/model/estructura.store';
import { ORG_TREE } from '../lib/org-tree';
import type { FilterKey, OrgNode, UnitType } from '@/shared/config/org-types';

function isDescendantOf(nodeId: string, ancestorId: string, nodes: OrgNode[]): boolean {
  let curr = nodes.find(n => n.id === nodeId);
  while (curr?.parentId) {
    if (curr.parentId === ancestorId) return true;
    curr = nodes.find(n => n.id === curr!.parentId);
  }
  return false;
}

function getAncestorIds(node: OrgNode, nodes: OrgNode[]): Set<string> {
  const ids = new Set<string>();
  let curr = node;
  while (curr.parentId) {
    ids.add(curr.parentId);
    curr = nodes.find(n => n.id === curr.parentId) ?? curr;
    if (!curr.parentId) break;
  }
  return ids;
}

const UNIT_ABBREV: Record<UnitType, string> = {
  'Centro de costos': 'CC',
  'Proyecto': 'PR',
  'Sucursal': 'SU',
  'Inmueble': 'IN',
  'Departamento': 'DP',
};

function genAutoCode(
  type: 'grupo' | 'unidad',
  unitType: UnitType | undefined,
  nodes: OrgNode[],
): string {
  if (type === 'grupo') {
    const n = nodes.filter(nd => nd.type === 'grupo').length + 1;
    return `GRP-${String(n).padStart(3, '0')}`;
  }
  const prefix = unitType ? UNIT_ABBREV[unitType] : 'UN';
  const n = nodes.filter(nd => nd.unitType === unitType).length + 1;
  return `${prefix}-${String(n).padStart(3, '0')}`;
}

export type InlineCreate = {
  parentId: string;
  level: number;
  type: 'grupo' | 'unidad';
  unitType?: UnitType;
  autoCode: string;
};

export type InlineEdit = {
  nodeId: string;
};

// initFromOrg = true  → seed the store from ORG_TREE (file-load flow)
// initFromOrg = false → store already has user-created data; don't overwrite it
export function useVisualizarEstructura(initFromOrg = true) {
  const { tree, initialized, initTree, addNode, updateNode } = useEstructuraStore();

  // Only seed from ORG_TREE when coming from the file-load flow
  if (!initialized && initFromOrg) {
    initTree([...ORG_TREE]);
  }

  const [expandedIds, setExpandedIds] = useState<Set<string>>(() =>
    initFromOrg
      ? new Set(ORG_TREE.filter(n => n.type === 'root' || n.type === 'grupo').map(n => n.id))
      : new Set(tree.filter(n => n.type === 'root' || n.type === 'grupo').map(n => n.id))
  );
  const [activeFilter, setActiveFilter] = useState<FilterKey>('Todos');
  const [searchText, setSearchText] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [crearMenuAnchor, setCrearMenuAnchor] = useState<HTMLElement | null>(null);
  const [crearGrupoOpen, setCrearGrupoOpen] = useState(false);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dropTargetId, setDropTargetId] = useState<string | null>(null);
  const [inlineCreate, setInlineCreate] = useState<InlineCreate | null>(null);
  const [inlineEdit, setInlineEdit] = useState<InlineEdit | null>(null);
  const [snackbarMsg, setSnackbarMsg] = useState<string | null>(null);

  const nodeHasChildren = (id: string) => tree.some(n => n.parentId === id);

  const toggleNode = (id: string) => {
    if (!nodeHasChildren(id)) return;
    setExpandedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const matchesFilter = (node: OrgNode): boolean => {
    if (activeFilter === 'Todos') return true;
    if (node.type === 'unidad') return node.unitType === activeFilter;
    return tree.some(n => n.type === 'unidad' && n.unitType === activeFilter && isDescendantOf(n.id, node.id, tree));
  };

  const matchesSearch = (node: OrgNode): boolean => {
    if (!searchText.trim()) return true;
    const q = searchText.toLowerCase();
    if (node.label.toLowerCase().includes(q)) return true;
    return tree.some(n => n.label.toLowerCase().includes(q) && getAncestorIds(n, tree).has(node.id));
  };

  const isVisible = (node: OrgNode): boolean => {
    if (!matchesFilter(node)) return false;
    if (!matchesSearch(node)) return false;
    let curr = node;
    while (curr.parentId) {
      if (!expandedIds.has(curr.parentId)) return false;
      curr = tree.find(n => n.id === curr.parentId) ?? curr;
      if (!curr.parentId) break;
    }
    return true;
  };

  const visibleNodes = tree.filter(isVisible);

  // --- inline creation ---

  const startInlineCreate = (parentId: string, type: 'grupo' | 'unidad', unitType?: UnitType) => {
    const parent = tree.find(n => n.id === parentId);
    if (!parent) return;
    setInlineEdit(null);
    setExpandedIds(prev => new Set([...prev, parentId]));
    setInlineCreate({
      parentId,
      level: parent.level + 1,
      type,
      unitType,
      autoCode: genAutoCode(type, unitType, tree),
    });
  };

  const commitInlineCreate = (name: string, code: string) => {
    if (!inlineCreate || !name.trim()) return;
    const newNode: OrgNode = {
      id: `node-${Date.now()}`,
      label: name.trim(),
      codigo: code.trim() || inlineCreate.autoCode,
      type: inlineCreate.type,
      unitType: inlineCreate.unitType,
      status: inlineCreate.type === 'unidad' ? 'Activa' : undefined,
      parentId: inlineCreate.parentId,
      level: inlineCreate.level,
      count: 0,
    };
    addNode(newNode);
    const label = inlineCreate.type === 'grupo' ? 'Grupo creado' : 'Unidad creada';
    setInlineCreate(null);
    setSnackbarMsg(label);
  };

  const cancelInlineCreate = () => setInlineCreate(null);

  // --- inline edit ---

  const startInlineEdit = (nodeId: string) => {
    setInlineCreate(null);
    setInlineEdit({ nodeId });
  };

  const commitInlineEdit = (nodeId: string, name: string, code: string) => {
    if (!name.trim()) return;
    updateNode(nodeId, name.trim(), code.trim());
    setInlineEdit(null);
    setSnackbarMsg('Cambios guardados');
  };

  const cancelInlineEdit = () => setInlineEdit(null);

  // --- drag & drop ---

  const isValidDropTarget = (targetId: string): boolean => {
    if (!draggingId || draggingId === targetId) return false;
    const targetNode = tree.find(n => n.id === targetId);
    const draggedNode = tree.find(n => n.id === draggingId);
    if (!targetNode || !draggedNode) return false;
    if (targetNode.type === 'unidad') return false;
    if (targetNode.type === 'root' && draggedNode.type === 'unidad') return false;
    if (isDescendantOf(targetId, draggingId, tree)) return false;
    return true;
  };

  const handleDragStart = (id: string) => setDraggingId(id);

  const handleDragEnd = () => { setDraggingId(null); setDropTargetId(null); };

  const handleDragOver = (e: { preventDefault(): void }, targetId: string) => {
    if (!isValidDropTarget(targetId)) return;
    e.preventDefault();
    if (dropTargetId !== targetId) setDropTargetId(targetId);
  };

  const handleDragLeave = (targetId: string) => {
    setDropTargetId(prev => (prev === targetId ? null : prev));
  };

  const handleDrop = (targetId: string) => {
    if (!draggingId || !isValidDropTarget(targetId)) {
      setDraggingId(null);
      setDropTargetId(null);
      return;
    }
    const draggedNode = tree.find(n => n.id === draggingId)!;
    const targetNode = tree.find(n => n.id === targetId)!;
    const newLevel = targetNode.level + 1;
    const levelDelta = newLevel - draggedNode.level;

    const newTree = tree.map(n => {
      if (n.id === draggingId) return { ...n, parentId: targetId, level: newLevel };
      if (isDescendantOf(n.id, draggingId, tree)) return { ...n, level: n.level + levelDelta };
      return n;
    });

    useEstructuraStore.getState().initTree(sortDFS(newTree));
    setExpandedIds(prev => new Set([...prev, targetId]));
    setDraggingId(null);
    setDropTargetId(null);
  };

  return {
    tree,
    expandedIds, toggleNode,
    activeFilter, setActiveFilter,
    searchText, setSearchText,
    selectedId, setSelectedId,
    crearMenuAnchor, setCrearMenuAnchor,
    crearGrupoOpen, setCrearGrupoOpen,
    visibleNodes,
    nodeHasChildren,
    draggingId,
    dropTargetId,
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    isValidDropTarget,
    inlineCreate,
    startInlineCreate,
    commitInlineCreate,
    cancelInlineCreate,
    inlineEdit,
    startInlineEdit,
    commitInlineEdit,
    cancelInlineEdit,
    snackbarMsg,
    setSnackbarMsg,
  };
}
