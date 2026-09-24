import React, { useState, useEffect } from 'react'
import Input, { InputProps, InputMeta, InputMetaContext } from '../Input'
import FileInput, { FileInputProps } from './File';

export const ImageInput = (props: FileInputProps) => {
  return <FileInput
    uploadButtonText='Upload image'
    acceptType={['jpg', 'png', 'bmp', 'jpef', 'webp', 'tiff', 'tif']}
    {...props}
  />;
};

export default ImageInput;