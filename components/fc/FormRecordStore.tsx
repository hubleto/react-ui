import React from "react";
import { FormRecord } from "./FormInterfaces";

type Listener = () => void;

export function createRecordStore(initial: FormRecord) {
  let record = initial;
  const listeners = new Set<Listener>();

  return {
    getField: (field: string) => record[field] ?? null,
    getRecord: () => record,
    subscribe: (listener: Listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    setRecord: (updater: (prev: FormRecord) => FormRecord) => {
      record = updater(record);
      listeners.forEach((l) => l());
    },
  };
}

export function useRecordStore() {
  const store = React.useContext(FormRecordStoreContext);
  // if (!store) throw new Error('useRecordStore must be used within FormProvider');
  return store;
}

export function useRecordField<T>(field: string): T {
  const store = useRecordStore();
  return (store ? React.useSyncExternalStore(
    store.subscribe,
    () => store.getField(field)
  ) : null);
}

export function useRecord(): FormRecord {
  const store = useRecordStore();
  return React.useSyncExternalStore(
    store.subscribe,
    () => store.getRecord()
  );
}

export type FormRecordStore = ReturnType<typeof createRecordStore>;

export const FormRecordStoreContext = React.createContext<FormRecordStore | null>(null);
