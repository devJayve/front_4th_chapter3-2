import { useDialogStore } from '@/entities/dialog/store/useDialogStore.ts';

export function DialogProvider() {
  const { isOpen, component } = useDialogStore();

  if (!isOpen || !component) return null;

  return component;
}
