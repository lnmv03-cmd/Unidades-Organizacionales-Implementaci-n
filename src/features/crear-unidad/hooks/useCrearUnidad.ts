import { useState } from 'react';
import { useEstructuraStore } from '@/shared/model/estructura.store';

export type UbicacionNode = {
  id: string;
  label: string;
  level: number;
  count: number;
  parentId: string | null;
  isRoot?: boolean;
};

// Synthetic root used when store has no real root yet
const FALLBACK_ROOT: UbicacionNode = {
  id: '__company_root__',
  label: 'Empresa de insumos S.A.S',
  level: 0,
  count: 0,
  parentId: null,
  isRoot: true,
};

function sugerirCodigo(nombre: string): string {
  const palabras = nombre.trim().split(/\s+/).filter(Boolean);
  if (!palabras.length) return '';
  if (palabras.length === 1) return palabras[0].slice(0, 3).toUpperCase();
  return palabras.map(p => p.slice(0, 3).toUpperCase()).join('-');
}

// isInitialState = true  → opened from the empty-state page; show only root + inline-created groups
// isInitialState = false → opened from the data view; show full store tree
export function useCrearUnidad(isInitialState = false) {
  const storeTree = useEstructuraStore(s => s.tree);
  const addNode   = useEstructuraStore(s => s.addNode);

  // Groups created inline during this drawer session (for display in initial-state mode)
  const [localNodes, setLocalNodes] = useState<UbicacionNode[]>([]);

  const storeGroups: UbicacionNode[] = storeTree
    .filter(n => n.type === 'root' || n.type === 'grupo')
    .map(n => ({
      id:       n.id,
      label:    n.label,
      level:    n.level,
      count:    storeTree.filter(c => c.parentId === n.id).length,
      parentId: n.parentId,
      isRoot:   n.type === 'root',
    }));

  const allGroupNodes: UbicacionNode[] = isInitialState
    ? [FALLBACK_ROOT, ...localNodes]
    : storeGroups.length > 0
      ? storeGroups
      : [FALLBACK_ROOT];

  // ── expand / collapse ─────────────────────────────────────────────
  const allGroupIds = allGroupNodes.map(n => n.id).join(',');
  const [prevGroupIds, setPrevGroupIds] = useState(allGroupIds);
  const [expandedIds, setExpandedIds]   = useState<Set<string>>(
    () => new Set(allGroupNodes.map(n => n.id))
  );

  if (allGroupIds !== prevGroupIds) {
    setPrevGroupIds(allGroupIds);
    setExpandedIds(prev => {
      const next = new Set(prev);
      allGroupNodes.forEach(n => next.add(n.id));
      return next;
    });
  }

  const nodeHasChildren = (id: string) => allGroupNodes.some(n => n.parentId === id);

  const toggleNode = (id: string) => {
    const node = allGroupNodes.find(n => n.id === id);
    if (node?.isRoot) return;
    if (!nodeHasChildren(id)) return;
    setExpandedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const visibleNodes = allGroupNodes.filter(node => {
    if (!node.parentId) return true;
    let curr = node;
    while (curr.parentId) {
      if (!expandedIds.has(curr.parentId)) return false;
      const parent = allGroupNodes.find(n => n.id === curr.parentId);
      if (!parent) return false;
      curr = parent;
    }
    return true;
  });

  // ── main form ─────────────────────────────────────────────────────
  const [nombre,            setNombre]            = useState('');
  const [codigo,            setCodigo]            = useState('');
  const [codigoManual,      setCodigoManual]      = useState(false);
  const [editandoCodigo,    setEditandoCodigo]    = useState(false);
  const [descripcion,       setDescripcion]       = useState('');
  const [descripcionVisible,setDescripcionVisible]= useState(false);
  const [selectedId,        setSelectedId]        = useState<string | null>(isInitialState ? FALLBACK_ROOT.id : null);

  // ── inline sub-group creation ─────────────────────────────────────
  const [addingUnder,    setAddingUnder]    = useState<string | null>(null);
  const [newNombre,      setNewNombre]      = useState('');
  const [newCodigo,      setNewCodigo]      = useState('');
  const [newCodigoManual,setNewCodigoManual]= useState(false);

  // ── handlers ─────────────────────────────────────────────────────
  const handleNombreChange   = (v: string) => { setNombre(v); if (!codigoManual) setCodigo(sugerirCodigo(v)); };
  const handleEditarCodigo   = () => setEditandoCodigo(true);
  const handleCodigoChange   = (v: string) => { setCodigo(v); setCodigoManual(true); };
  const handleCodigoBlur     = () => setEditandoCodigo(false);
  const selectNode           = (id: string) => setSelectedId(prev => prev === id ? null : id);

  const handleAddUnder = (parentId: string) => {
    setAddingUnder(parentId);
    setExpandedIds(prev => new Set([...prev, parentId]));
    setNewNombre('');
    setNewCodigo('');
    setNewCodigoManual(false);
  };

  const handleNewNombreChange = (v: string) => {
    setNewNombre(v);
    if (!newCodigoManual) setNewCodigo(sugerirCodigo(v));
  };

  const handleNewCodigoChange = (v: string) => { setNewCodigo(v); setNewCodigoManual(true); };

  const cancelAdd = () => {
    setAddingUnder(null);
    setNewNombre('');
    setNewCodigo('');
    setNewCodigoManual(false);
  };

  const confirmAdd = () => {
    if (!addingUnder || !newNombre.trim()) return;
    const parent = allGroupNodes.find(n => n.id === addingUnder);
    const newId  = `g-${Date.now()}`;
    const newLevel = parent ? parent.level + 1 : 1;

    if (isInitialState) {
      const storeHasRoot = storeTree.some(n => n.type === 'root');
      if (!storeHasRoot && addingUnder === FALLBACK_ROOT.id) {
        addNode({
          id:       FALLBACK_ROOT.id,
          label:    FALLBACK_ROOT.label,
          type:     'root',
          parentId: null,
          level:    0,
          count:    0,
        });
      }
      addNode({
        id:       newId,
        label:    newNombre.trim(),
        codigo:   newCodigo.trim() || undefined,
        type:     'grupo',
        parentId: addingUnder,
        level:    newLevel,
        count:    0,
        status:   'Activa',
      });
      setLocalNodes(prev => [...prev, {
        id:       newId,
        label:    newNombre.trim(),
        level:    newLevel,
        count:    0,
        parentId: addingUnder,
      }]);
    } else {
      addNode({
        id:       newId,
        label:    newNombre.trim(),
        codigo:   newCodigo.trim() || undefined,
        type:     'grupo',
        parentId: addingUnder,
        level:    newLevel,
        count:    0,
        status:   'Activa',
      });
    }

    setExpandedIds(prev => new Set([...prev, newId]));
    cancelAdd();
  };

  const createUnit = (unitType: string, status: import('@/shared/config/org-types').OrgNodeStatus = 'Activa') => {
    if (!selectedId || !nombre.trim()) return;
    if (isInitialState) {
      const storeHasRoot = storeTree.some(n => n.type === 'root');
      if (!storeHasRoot) {
        addNode({ id: FALLBACK_ROOT.id, label: FALLBACK_ROOT.label, type: 'root', parentId: null, level: 0, count: 0 });
      }
    }
    const parent = allGroupNodes.find(n => n.id === selectedId);
    addNode({
      id:       `u-${Date.now()}`,
      label:    nombre.trim(),
      codigo:   codigo.trim() || undefined,
      type:     'unidad',
      unitType: unitType as import('@/shared/config/org-types').UnitType,
      parentId: selectedId,
      level:    parent ? parent.level + 1 : 1,
      count:    0,
      status,
    });
  };

  const reset = () => {
    setNombre(''); setCodigo(''); setCodigoManual(false); setEditandoCodigo(false);
    setDescripcion(''); setDescripcionVisible(false);
    setSelectedId(isInitialState ? FALLBACK_ROOT.id : null);
    setLocalNodes([]);
    const freshIds = isInitialState
      ? [FALLBACK_ROOT.id]
      : storeGroups.map(n => n.id);
    setExpandedIds(new Set(freshIds));
    cancelAdd();
  };

  return {
    nombre, handleNombreChange,
    codigo, codigoManual,
    editandoCodigo, handleEditarCodigo, handleCodigoChange, handleCodigoBlur,
    descripcion, setDescripcion,
    descripcionVisible, setDescripcionVisible,
    selectedId, selectNode,
    visibleNodes,
    expandedIds, toggleNode, nodeHasChildren,
    addingUnder, handleAddUnder,
    newNombre, handleNewNombreChange,
    newCodigo, newCodigoManual, handleNewCodigoChange,
    confirmAdd, cancelAdd,
    canCreate: nombre.trim().length > 0 && selectedId !== null,
    createUnit,
    reset,
  };
}
