import React, { useState } from "react";
import ModalSimple from "../../cc/ModalSimple";
import Translator from "@hubleto/react-ui/core/Translator";
import FormInput from "./Input";
import HtmlFrame from "../../cc/HtmlFrame";
import { FormMetaContext } from "../Form";
import request from "@hubleto/react-ui/core/Request";

export interface PrintPreviewUiProps {

};

const translate = new Translator(
  'Hubleto\\ReactUi',
  'Components\\PrintPreview'
).translate;

const PrintPreviewUi = React.memo((props: PrintPreviewUiProps) => {
  const form = React.useContext(FormMetaContext);

  const [htmlPreview, setHtmlPreview] = useState('');

  const updatePreview = (idTemplate: number) => {
    request.post(
      'documents/api/get-preview-html',
      {
        model: form.model,
        recordId: form.id,
        idTemplate: idTemplate,
      },
      {},
      (result: any) => {
        setHtmlPreview(result.html);
      }
    );
  }

  const showPreviewVars = (): void => {
    request.post(
      'documents/api/get-preview-vars',
      {
        model: form.model,
        recordId: form.id,
      },
      {},
      (vars: any) => {
        setHtmlPreview('<pre>' + JSON.stringify(vars.vars, null, 2) + '</pre>');
      }
    );
  }

  const generatePdf = (): void => {
    request.post(
      'documents/api/generate-pdf',
      {
        model: form.model,
        recordId: form.id,
        documentName: form.getTitleAsText(),
      },
      {},
      (result: any) => {
        if (result && result.pdfFile) {
          form.changeRecord({
            idDocument: result.idDocument,
            pdf: result.pdfFile,
          }, () => { form.saveRecord(); });
        }
      }
    );
  }

  return (form.showPreviewUi ? <ModalSimple
    uid='projects_table_discussions_modal'
    isOpen={true}
    type='centered large theme-secondary'
    showHeader={true}
    title={<>
      <h2>{translate("Print", 'Hubleto\\Erp\\Loader', 'Components\\Form')}</h2>
    </>}
    onClose={(modal: ModalSimple) => { form.setShowPreviewUi(false); }}
  >
    <div className='flex gap-2 h-full'>
      <div className='flex-1 w-72 flex flex-col gap-2'>
        <div className='grow'>
          <FormInput name='id_template' debug customInputProps={{
            uiStyle: 'buttons-vertical',
            onChange: (input: any) => {
              updatePreview(input.value);
            }
          }} />
          <div className='flex flex-col gap-2'>
            <button
              className='btn btn-add-outline btn-large'
              onClick={() => {
                generatePdf();
              }}
            >
              <span className='icon'><i className='fas fa-file-pdf'></i></span>
              <span className='text'>{translate('Generate PDF')}</span>
            </button>
            <button
              className='btn btn-add-outline btn-large'
              onClick={() => {
                const iframe = window.frames[form.uid + '_preview'];
                const origDocumentTitle = document.title;

                document.title += form.getTitleAsText();

                iframe.contentWindow.focus();
                iframe.contentWindow.print();

                document.title = origDocumentTitle;
              }}
            >
              <span className='icon'><i className='fas fa-print'></i></span>
              <span className='text'>{translate('Print')}</span>
            </button>
          </div>
        </div>
        <FormInput name='id_document' readonly={true} />
      </div>
      <div className='flex-3 flex flex-col'>
        <div className='flex gap-2 align-center justify-end'>
          <div>
            <FormInput name='pdf' renderOnlyInputField customInputProps={{readonly: true}} />
          </div>
        </div>
        <div className='w-full h-full card mt-2'>
          <div className="card-body">
            <HtmlFrame
              uid={form.uid + '_preview'}
              className='w-full h-full'
              iframeId={form.uid + '_preview'}
              content={htmlPreview}
            />
          </div>
          <div className='card-footer'>
            <a
              href='#'
              onClick={() => {
                showPreviewVars();
              }}
            >{translate('Show variables available in template')}</a>
          </div>
        </div>
      </div>
    </div>
  </ModalSimple> : null);
}, () => true);

export default PrintPreviewUi;