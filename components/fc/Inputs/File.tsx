import React, { useState, useEffect } from 'react'
import ImageUploading, { ImageType } from 'react-images-uploading';
import request from '@hubleto/react-ui/core/Request'
import Input, { InputProps, InputMeta, InputMetaContext } from '../Input'
import Translator from '@hubleto/react-ui/core/Translator';

interface FileInputProps extends InputProps {
  acceptType?: Array<string>,
}

const T = new Translator('Hubleto\\ReactUi', 'Components\\Inputs\\File');

const getFileUrl = (input: any): string => {
  if (input.value) {
    if (input.value.fileData) {
      return input.value.fileData;
    } else {
      return globalThis.hubleto.config.uploadUrl + '/' + input.value;
    }
  } else {
    return '';
  }
}

const getFileName = (input: any): string => {
  if (input.value.fileName) {
    return input.value.fileName;
  } else if (input.value) {
    return input.value;
  } else {
    return '';
  }
}

const getFileSize = (input: any): number => {
  if (input.value.fileSize) {
    return input.value.fileSize;
  } else {
    return 0;
  }
}

const onFileChange = (input: any, files: Array<any>) => {
  let file: any = files[0];
console.log('onFileChange', input, files);
  input.changeValue({
    fileName: file ? file.file.name : null,
    fileData: file ? file.fileData : null,
    fileSize: file ? parseInt(file.fileSize) : null,
  });

};

export const ValueComponent = (props: FileInputProps) => {
  const input = React.useContext(InputMetaContext);
  return (input.value ? <>
    <a
      href={getFileUrl(input)}
      target='_blank'
      onClick={(e) => { e.stopPropagation(); }}
      className="btn btn-primary-outline btn-small"
    >
      <span className="icon"><i className="fa-solid fa-up-right-from-square"></i></span>
      <span className="text">{getFileName(input)}</span>
      {getFileSize(input) > 0 ? <span className="text">({Math.round(getFileSize(input) * 100 / 1024) / 100} kB)</span> : null}
    </a>
  </> : <></>);
}

export const InputComponent = (props: FileInputProps) => {
  const input = React.useContext(InputMetaContext);

  return <>
    <ValueComponent {...props} />
    {input.readonly ? null : <>
      <ImageUploading
        value={input.value && input.value.fileData != null
          ? [input.value]
          : []
        }
        onChange={(files: Array<ImageType>, addUpdateIndex: any) => onFileChange(input, files)}
        maxNumber={1}
        dataURLKey="fileData"
        acceptType={props.acceptType ?? []}
        allowNonImageType={true}
      >
        {({
          imageList,
          onImageUpload,
          onImageUpdate,
          onImageRemove,
          isDragging,
          dragProps,
        }) => (
          <div className="upload__image-wrapper">
            <button
              className="btn btn-small btn-transparent"
              style={isDragging ? { color: 'red' } : undefined}
              onClick={onImageUpload}
              {...dragProps}
            >
              <span className="icon"><i className="fas fa-cloud-arrow-up"></i></span>
              <span className="text">{T.translate('Upload file')}</span>
            </button>
          </div>
        )}
      </ImageUploading>
    </>}
  </>;
};

export const FileInput = (props: FileInputProps) => {
  return <Input
    inputClassName='varchar'
    isInitialized={props.description?.autocomplete ? false : true}
    renderValueComponent={(input: InputMeta) => <ValueComponent {...props} />}
    renderInputComponent={(input: InputMeta) => <InputComponent {...props} />}
    {...props}
  />;
};

export default FileInput;