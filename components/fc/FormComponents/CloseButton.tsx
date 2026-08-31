import React from "react";
import { FormMetaContext } from "../Form";

const CloseButton = React.memo(({ content }: any) => {
  const form = React.useContext(FormMetaContext);

  return <button
    className="btn btn-close"
    type="button"
    data-dismiss="modal"
    aria-label="Close"
    onClick={() => {
      form.closeForm();
    }}
  >
    <span className="icon">
      <i className="fas fa-xmark"></i>
    </span>
  </button>;
}, () => true);

export default CloseButton;