import React, { useState } from 'react'
import Editor from 'react-simple-code-editor';
import { highlight, languages } from 'prismjs/components/prism-core';
import 'prismjs/components/prism-markup';
//@ts-ignore
import 'prismjs/themes/prism.css'; //Example style, you can use another
import Translator from "@hubleto/react-ui/core/Translator";
import Input, { InputMetaContext, InputProps } from "../Input";

const translate = new Translator(
  'Hubleto\\ReactUi',
  'Components\\Inputs\\TextareaWithHtmlPreview'
).translate;

const InputComponent = ({ inputWrapper }) => {
  const input = React.useContext(InputMetaContext);
  // const refPreview = React.createRef();

  let editorStyle: any = {
    overflow: 'auto',
    fontFamily: 'monospace',
    fontSize: 11,
    maxWidth: '1200px',
  };
  let wrapperStyle: any = {};

  // if (this.state.isFullscreen) {
  //   wrapperStyle.position = 'absolute';
  //   wrapperStyle.left = '0px';
  //   wrapperStyle.top = '0px';
  //   wrapperStyle.width = '100%';
  //   // wrapperStyle.height = '100vh';
  //   wrapperStyle.background = 'white';
  //   wrapperStyle.padding = '1em';
  //   wrapperStyle.zIndex = 9999999;
  //   // editorStyle.height = 'calc(100vh - 10em)';
  // } else {
  //   wrapperStyle.width = '100%';
  // }

  if (inputWrapper.showPreview) {
    return <div className='card w-full'>
      <div className='card-header'>
        <div>
          {translate('Preview', 'Hubleto\\Erp\\Loader', 'Components\\Inputs\\TextareaWithHtmlPreview')}
          <button
            className='btn btn-small btn-transparent ml-2'
            onClick={() => { inputWrapper.setShowPreview(false); }}
          >
            <span className='icon'><i className='fas fa-code'></i></span>
            <span className='text'>{translate('Show source', 'Hubleto\\Erp\\Loader','Components\\Inputs\\TextareaWithHtmlPreview')}</span>
          </button>
        </div>
        {/* <div>
          <button
            className='btn btn-small btn-transparent'
            onClick={() => { this.setState({isFullscreen: !this.state.isFullscreen}); }}
          >
            <span className='icon'><i className='fas fa-expand'></i></span>
            <span className='text'>{this.translate('Toggle fullscreen', 'Hubleto\\Erp\\Loader','Components\\Inputs\\TextareaWithHtmlPreview')}</span>
          </button>
        </div> */}
      </div>
      <div className='card-body min-h-96 w-full'>
        <iframe
          // ref={refPreview}
          src="about:blank"
          className='w-full min-h-96'
          srcDoc={inputWrapper.textareaValue}
        />
        {/* <HtmlFrame
          ref={refPreview}
          className='w-full min-h-96 '
          content={inputWrapper.textareaValue}
        /> */}
      </div>
    </div>;
  } else {
    return <div className='card h-full'>
      <div className='card-header'>
        <div>
          {translate('Source', 'Hubleto\\Erp\\Loader', 'Components\\Inputs\\TextareaWithHtmlPreview')}
          <button
            className='btn btn-small btn-transparent ml-2'
            onClick={() => { inputWrapper.setShowPreview(true); }}
          >
            <span className='icon'><i className='fas fa-eye'></i></span>
            <span className='text'>{translate('Show preview', 'Hubleto\\Erp\\Loader','Components\\Inputs\\TextareaWithHtmlPreview')}</span>
          </button>
        </div>
        <div>
          <button
            className='btn btn-small btn-transparent'
            onClick={() => { inputWrapper.setIsFullscreen(!inputWrapper.isFullscreen); }}
          >
            <span className='icon'><i className='fas fa-expand'></i></span>
            <span className='text'>{translate('Toggle fullscreen', 'Hubleto\\Erp\\Loader','Components\\Inputs\\TextareaWithHtmlPreview')}</span>
          </button>
        </div>
      </div>
      <div className='card-body flex flex-col overflow-y-auto'>
        <Editor
          className="w-full overflow-y"
          value={inputWrapper.textareaValue ?? ''}
          onValueChange={(newValue) => {
            inputWrapper.setTextareaValue(newValue);
            input.changeValue(newValue)
          }}
          highlight={code => highlight(code, languages.markup)}
          padding={10}
          style={editorStyle}
        />
      </div>
    </div>;
  }
}

const TextareaWithHtmlPreview = (props: InputProps) => {

  const [textareaValue, setTextareaValue] = useState(props.value);
  const [previewInvalidated, setPreviewInvalidated] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showPreview, setShowPreview] = useState(true);

  const myself = {
    props,
    textareaValue, setTextareaValue,
    previewInvalidated, setPreviewInvalidated,
    isFullscreen, setIsFullscreen,
    showPreview, setShowPreview,
  }

  return <Input
    inputClassName='textarea-with-html-preview'
    isInitialized={true}
    inputComponent={<InputComponent inputWrapper={myself} />}
    {...props}
  />;
};

export default TextareaWithHtmlPreview;

