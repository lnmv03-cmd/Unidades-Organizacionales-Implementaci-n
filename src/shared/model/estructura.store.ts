import { create } from 'zustand';
import type { OrgNode, OrgNodeStatus } from '../config/org-types';

function sortDFS(nodes: OrgNode[]): OrgNode[] {
  const result: OrgNode[] = [];
  const addChildren = (parentId: string | null) => {
    nodes
      .filter(n => n.parentId === parentId)
      .sort((a, b) => a.label.localeCompare(b.label, 'es', { sensitivity: 'base' }))
      .forEach(n => { result.push(n); addChildren(n.id); });
  };
  addChildren(null);
  return result;
}

interface EstructuraState {
  tree: OrgNode[];
  initialized: boolean;
  initTree: (nodes: OrgNode[]) => void;
  addNode: (node: OrgNode) => void;
  updateNode: (nodeId: string, label: string, codigo: string) => void;
  updateNodeStatus: (nodeId: string, status: OrgNodeStatus) => void;
  moveNode: (nodeId: string, newParentId: string) => void;
}

export const useEstructuraStore = create<EstructuraState>((set) => ({
  tree: [],
  initialized: false,

  initTree: (nodes) => set({ tree: nodes, initialized: true }),

  addNode: (node) => set(state => ({
    tree: sortDFS([...state.tree, node]),
  })),

  updateNode: (nodeId, label, codigo) => set(state => ({
    tree: state.tree.map(n =>
      n.id === nodeId ? { ...n, label, codigo } : n
    ),
  })),

  updateNodeStatus: (nodeId, status) => set(state => ({
    tree: state.tree.map(n => n.id === nodeId ? { ...n, status } : n),
  })),

  moveNode: (nodeId, newParentId) => set(state => {
    const target = state.tree.find(n => n.id === newParentId);
    if (!target) return {};
    return {
      tree: sortDFS(state.tree.map(n =>
        n.id === nodeId ? { ...n, parentId: newParentId, level: target.level + 1 } : n
      )),
    };
  }),
}));

export { sortDFS };
