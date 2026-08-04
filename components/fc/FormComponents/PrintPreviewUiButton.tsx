import React from "react";
import { FormMetaContext } from "../Form";
import { useRecordField } from "../FormRecordStore";
import Translator from "@hubleto/react-ui/core/Translator";

const translate = new Translator(
  'Hubleto\\ReactUi',
  'Components\\PrintPreviewUiButton'
).translate;

const PrintPreviewUiButton = ({ content }: any) => {
  const form = React.useContext(FormMetaContext);
  // const R = useRecord()
  const pdf = useRecordField('pdf');

  return <>
    <button
      onClick={(e: any) => {
        form.setShowPreviewUi(true);
      }}
      className={"btn btn-transparent"}
    >
      <span className="icon"><i className="fas fa-print"></i></span>
      <span className="text">
        {translate("Print", 'Hubleto\\Erp\\Loader', 'Components\\Form')}
      </span>
    </button>
    {pdf ?
      <a href={globalThis.hubleto.config.uploadUrl + '/' + pdf}
        className="btn btn-transparent" target="_blank"
        title={translate("Download PDF", 'Hubleto\\Erp\\Loader', 'Components\\Form')}
      >
        <span className="icon"><i className="fas fa-file-pdf"></i></span>
      </a>
    : null}
  </>;
}

export default PrintPreviewUiButton;