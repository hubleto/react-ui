import React, { useState } from 'react'
import Input, { type InputMeta, InputMetaContext, type InputProps } from "../Input";
import MDEditor from '@uiw/react-md-editor/nohighlight';

const InputComponent = ({ parent }) => {
  const input = React.useContext(InputMetaContext);

  return <>
    <div data-color-mode="light" className="w-full">
      <div className="wmde-markdown-var"> </div>
      <MDEditor
        value={input.value}
        onChange={(value: string) => input.changeValue(value)}
        preview='preview'
        textareaProps={{
          placeholder: input.description?.placeholder,
        }}
      />
    </div>
  </>;
}

const TextareaMarkdownPreview = (props: InputProps) => {

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
    renderValueComponent={(input: InputMeta) => <InputComponent parent={myself} />}
    renderInputComponent={(input: InputMeta) => <InputComponent parent={myself} />}
    {...props}
  />;
};

export default TextareaMarkdownPreview;

