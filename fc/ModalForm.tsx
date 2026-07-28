import React from 'react';
import { useModal, ModalProps } from './Modal';

export interface ModalFormProps extends ModalProps {
  form: any,
}

export default function ModalForm(rawProps: ModalFormProps) {
  // Replicates `static defaultProps = { type: 'centered' }`.
  const props: ModalFormProps = { ...rawProps, type: rawProps.type ?? 'centered' };

  const { state } = useModal(props);

  if (!state.isOpen) return <></>;

  return <>
    <div
      key={props.uid}
      id={"hubleto-modal-" + props.uid}
      className={"modal " + (state.isFullscreen ? "fullscreen" : "") + " " + props.type}
    >
      <div className={"modal-inner" + (props.type === 'inside-parent' ? " !bg-white dark:!bg-gray-900 dark:!border-gray-700" : "")}>
        {props.children}
      </div>
    </div>
  </>;
}
