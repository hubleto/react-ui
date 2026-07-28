import React from 'react';
import { useModal, ModalProps } from './Modal';

export default function ModalSimple(rawProps: ModalProps) {
  // Replicates `static defaultProps = { type: 'centered' }`.
  const props: ModalProps = { ...rawProps, type: rawProps.type ?? 'centered' };

  const { state, close } = useModal(props);

  if (!state.isOpen) return <></>;

  return <>
    <div
      key={props.uid}
      id={"hubleto-modal-" + props.uid}
      className={"modal " + props.type}
    >
      <div className="modal-inner">
        {props.showHeader ? <>
          <div className={"modal-header " + (state.isActive ? "active" : "")}>
            <div className="modal-header-left">{props.headerLeft}</div>
            <div className="modal-header-title">{props.title}</div>
            <div className="modal-header-right">
              <button
                className="btn btn-close"
                type="button"
                data-dismiss="modal"
                aria-label="Close"
                onClick={close}
              ><span className="icon"><i className="fas fa-xmark"></i></span></button>
            </div>
          </div>
        </> : null}
        {props.topMenu ? <div className="modal-top-menu">{props.topMenu}</div> : null}
        <div className="modal-body">{props.children}</div>
      </div>
    </div>
  </>;
}
