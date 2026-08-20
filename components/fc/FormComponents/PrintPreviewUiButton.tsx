import React from "react";
import { FormMetaContext } from "../Form";
import { useRecordField } from "../FormRecordStore";
import Translator from "@hubleto/react-ui/core/Translator";

const T = new Translator('Hubleto/ReactUi', 'Components/Form/PrintPreviewUiButton');

const PrintPreviewUiButton = ({ content }: any) => {
  const form = React.useContext(FormMetaContext);
  const description = form.description ?? {};
  const pdf = useRecordField('pdf');
  const available = description.inputs && description.inputs.pdf;

  if (!available) return <></>;

  return <>
    <button
      onClick={(e: any) => {
        form.setShowPreviewUi(true);
      }}
      className={"btn btn-transparent btn-square"}
    >
      <span className="icon"><i className="fas fa-print"></i></span>
      <span className="text">
        {T.translate("Print", 'Hubleto\\Erp\\Loader', 'Components\\Form')}
      </span>
    </button>
    {pdf ?
      <a href={globalThis.hubleto.config.uploadUrl + '/' + pdf}
        className="btn btn-transparent" target="_blank"
        title={T.translate("Download PDF", 'Hubleto\\Erp\\Loader', 'Components\\Form')}
      >
        <span className="icon"><i className="fas fa-file-pdf"></i></span>
      </a>
    : null}
  </>;
}

export default PrintPreviewUiButton;