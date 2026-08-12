import React from "react";
import { FormMetaContext } from "../Form";
import Translator from "@hubleto/react-ui/core/Translator";

const T = new Translator('Hubleto\\ReactUi', 'Components\\Form\\SaveButton');

const SaveButton = ({ content }: any) => {
  const form = React.useContext(FormMetaContext);
  const description = form.description;

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
        className={
          "btn " + (form.savedSuccessfully ? "btn-success" : form.recordChanged ? "btn-add" : "btn-disabled")}
        title="Save: Ctrl+S"
      >
        {updatingRecord
          ? <>
            <span className="icon"><i className={saveIcon}></i></span>
            <span className="text">
              {form.savedSuccessfully
                ? T.translate("Saved", 'Hubleto\\Erp\\Loader', 'Components\\Form')
                : (description?.ui?.saveButtonText ?? T.translate("Save", 'Hubleto\\Erp\\Loader', 'Components\\Form'))
              }
            </span>
          </> : <>
            <span className="icon"><i className="fas fa-plus"></i></span>
            <span className="text">
              {description?.ui?.addButtonText ?? T.translate("Add", 'Hubleto\\Erp\\Loader', 'Components\\Form')}
            </span>
          </>
        }
      </button>
    </> : null}
  </>;
}

export default SaveButton;