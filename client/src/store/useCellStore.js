import { create } from 'zustand';

export const useCellStore = create((set, get) => ({
  myInfo: null,
  cells: {},
  users: [],
  selectedCell: null,

  setMyInfo: (info) => set({ myInfo: info }),
  setCells: (cells) => set({ cells }),
  setUsers: (users) => set({ users }),

  updateCell: (cellId, partial) => set((state) => ({
    cells: {
      ...state.cells,
      [cellId]: {
        ...state.cells[cellId],
        ...partial,
        dna: {
          ...(state.cells[cellId]?.dna || {}),
          ...(partial?.dna || {}),
        }
      }
    }
  })),

  addChatMsg: (cellId, msg) => set((state) => {
    const cell = state.cells[cellId] || { dna: { chats: [] } };
    const chats = [...(cell.dna?.chats || []), msg];
    return {
      cells: {
        ...state.cells,
        [cellId]: { ...cell, dna: { ...cell.dna, chats } }
      }
    };
  }),

  selectCell: (cellId) => set({ selectedCell: cellId }),
}));
