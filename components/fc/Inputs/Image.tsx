import React, { useState, useEffect } from 'react'
import Input, { type InputProps, type InputMeta, InputMetaContext } from '../Input'
import FileInput, { type FileInputProps } from './File';

export const ImageInput = (props: FileInputProps) => {
  return <FileInput
    uploadButtonText='Upload image'
    acceptType={['jpg', 'png', 'bmp', 'jpef', 'webp', 'tiff', 'tif']}
    {...props}
  />;
};

export default ImageInput;