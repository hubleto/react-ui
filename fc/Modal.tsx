import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import * as uuid from 'uuid';

export interface ModalProps {
  onClose?: (modal: any) => void;
  uid: string,
  type?: string,
  children?: any;
  title?: any;
  showHeader?: boolean;
  headerLeft?: any;
  isOpen?: boolean;
  topMenu?: any;
  isFullscreen?: boolean,
}

interface ModalInternalState {
  stackUid?: string,
  isActive: boolean,
  uid: string,
  type: string,
  isOpen: boolean;
  title?: string;
  isFullscreen: boolean,
}

function getStateFromProps(props: ModalProps): ModalInternalState {
  return {
    uid: props.uid ?? uuid.v4(),
    type: props.type ?? "right",
    isOpen: props.isOpen ?? false,
    title: props.title,
    isFullscreen: props.isFullscreen,
    stackUid: uuid.v4(),
    isActive: false,
  };
}

// The original `Modal` class registered `this` into
// `globalThis.hubleto.reactElements[uid]` so external glue code (e.g.
// `HubletoReactUi.modalToggle(uid)`, `addModalToStack`, `removeModalFromStack`)
// could call `.setState(...)`, read `.props`/`.state`, or call `.close()` on it
// imperatively. `ModalForm` and `ModalSimple` also `extends Modal` and reused
// all of that behavior, only overriding `render()`.
//
// To preserve that exact external API without class inheritance, the shared
// behavior lives in this `useModal()` hook. It returns a `handle` object with
// the same shape external code expects (`props`, `state`, `setState`,
// `close`), plus the live `state` for rendering. `ModalForm` / `ModalSimple`
// call this hook instead of extending a class.
export function useModal(props: ModalProps) {
  const [state, setState] = useState<ModalInternalState>(() => getStateFromProps(props));

  const stateRef = useRef(state);
  stateRef.current = state;
  const propsRef = useRef(props);
  propsRef.current = props;
  const isFirstRender = useRef(true);

  const setStateMerge = useCallback((partial: Partial<ModalInternalState>) => {
    setState(prev => ({ ...prev, ...partial }));
  }, []);

  const close = useCallback(() => {
    if (propsRef.current.onClose) propsRef.current.onClose(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Stable handle mimicking the old class-instance API used by external code.
  const handle = useMemo(() => ({
    get props() { return propsRef.current; },
    get state() { return stateRef.current; },
    setState: setStateMerge,
    close,
  }), []);

  useEffect(() => {
    if (props.uid) {
      globalThis.hubleto.reactElements[props.uid] = handle;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.uid]);

  useEffect(() => {
    globalThis.hubleto.addModalToStack(handle);
    return () => {
      globalThis.hubleto.removeModalFromStack(handle);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // Matches the original componentDidUpdate: only reset state (including
    // regenerating stackUid, same as the original) when title/isOpen change,
    // and never on the initial mount.
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    setState(getStateFromProps(props));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.title, props.isOpen]);

  return { state, close, handle };
}

export default function Modal(props: ModalProps) {
  useModal(props);
  return <></>;
}
