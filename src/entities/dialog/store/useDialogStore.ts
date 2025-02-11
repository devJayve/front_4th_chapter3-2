import React from 'react';
import { create } from 'zustand';

interface DialogStore {
  isOpen: boolean;
  component: React.ReactNode | null;

  open: (component: React.ReactNode) => void;
  close: () => void;
}

export const useDialogStore = create<DialogStore>((set) => ({
  isOpen: false,
  component: null,

  open: (component) =>
    set({
      isOpen: true,
      component,
    }),

  close: () =>
    set({
      isOpen: false,
      component: null,
    }),
}));
