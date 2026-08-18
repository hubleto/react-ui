import React from "react";
import { ModalMetaContext } from "../Modal";
import { ModalMeta, ModalProps } from '../ModalInterfaces';

const Header = () => {
  const modal = React.useContext(ModalMetaContext);

  return <div className={"modal-header " + (modal.isActive ? "active" : "")}>
    <div className={"modal-header-left"}></div>
    <div className={"modal-header-title"}>
      <h2>{modal.title}</h2>
    </div>
    <div className={"modal-header-right"}>
      <button
        className="btn btn-close"
        type="button"
        onClick={() => {
          modal.onClose();
        }}
      >
        <span className="icon">
          <i className="fas fa-xmark"></i>
          <span className="shortcut">Esc</span>
        </span>
      </button>
    </div>
  </div>;
};

export default Header;