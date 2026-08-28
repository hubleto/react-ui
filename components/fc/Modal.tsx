import React, { useState, useEffect } from 'react';
import * as uuid from 'uuid';
import { ModalMeta, ModalProps } from './ModalInterfaces';

export const ModalMetaContext = React.createContext<ModalMeta>(null);

const Modal = (props: ModalProps) => {

  const [uid, setUid] = useState(props.uid ?? uuid.v4());
  const [stackUid, setStackUid] = useState(uuid.v4());
  const [form, setForm] = useState(null);
  const [isActive, setIsActive] = useState(false);
  const [type, setType] = useState(props.type ?? 'right');
  const [isOpen, setIsOpen] = useState(true);
  const [title, setTitle] = useState(props.title ?? '');
  const [isFullscreen, setIsFullscreen] = useState(props.isFullscreen ?? false);

  useEffect(() => {
    globalThis.hubleto.reactElements[props.uid] = this;
    globalThis.hubleto.addModalToStack(myself);
  }, []);

  const onClose = () => {
    if (props.onClose) props.onClose(myself);
  }

  const myself: ModalMeta = {
    uid,
    stackUid,
    type,
    title,
    isOpen,
    isFullscreen,
    isActive,
    form,
    onClose,
    setIsActive,
    setForm,
  }

  return <ModalMetaContext.Provider value={myself}>
    {isOpen ? <div
      key={uid}
      id={"hubleto-modal-" + uid}
      className={
        "modal "
        + (isActive ? "active" : "")
        + (isFullscreen ? "fullscreen" : "")
        + " " + type
      }
    >
      <div className={"modal-inner" + (type === 'inside-parent' ? " !bg-white dark:!bg-gray-900 dark:!border-gray-700" : "")}>
        {props.children}
      </div>
    </div> : null}
  </ModalMetaContext.Provider>;
}

export default Modal;