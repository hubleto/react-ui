import React from "react";
import { FormDescriptionContext, FormMetaContext } from "../Form";

const SaveButton = ({ content }: any) => {
  const description = React.useContext(FormDescriptionContext);
  const form = React.useContext(FormMetaContext);


  const id = form.id;
  const creatingRecord = form.creatingRecord;
  const updatingRecord = form.updatingRecord;
  const permissions = form.permissions;

  let showButton =
    description?.ui?.showSaveButton
    && (
      creatingRecord && permissions.canCreate
      || updatingRecord && permissions.canUpdate
    )
  ;

  const saveIcon = "fas " + (form.savedSuccessfully ? "fa-check" : "fa-save");

  return <>
    {showButton ? <>
      <button
        onClick={(e: any) => {
          if (!e.isFromDropdownMenu) form.saveRecord({closeAfterSave: false});
        }}
        className={"btn " + (form.recordChanged ? (form.savedSuccessfully ? "btn-success" : "btn-add") : "btn-disabled")}
        title="Save: Ctrl+S"
      >
        {updatingRecord
          ? <>
            <span className="icon"><i className={saveIcon}></i></span>
            <span className="text">
              {form.savedSuccessfully
                ? form.translate("Saved", 'Hubleto\\Erp\\Loader', 'Components\\Form')
                : (description?.ui?.saveButtonText ?? form.translate("Save", 'Hubleto\\Erp\\Loader', 'Components\\Form'))
              }
            </span>
          </> : <>
            <span className="icon"><i className="fas fa-plus"></i></span>
            <span className="text">
              {description?.ui?.addButtonText ?? form.translate("Add", 'Hubleto\\Erp\\Loader', 'Components\\Form')}
            </span>
          </>
        }
      </button>
    </> : null}
  </>;
}

export default SaveButton;