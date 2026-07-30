import React, { useState } from 'react'
import Input, { InputProps } from '../Input'

const TextareaInput = (props: InputProps) => {

  const normalizedProps = {
    ...props,
    inputClassName: 'textarea',
  };

  return <Input
    {...normalizedProps}
    renderInputElement={(input: any): React.JSX.Element => {
      return <textarea
        ref={input.refInput}
        value={input.value ?? ''}
        onChange={(e) => input.setValue(input.refInput.current.value) }
        aria-describedby="passwordHelpInline"
        rows={5}
        placeholder={input.description?.placeholder ?? input.description?.title}
        className={
          "bg-white"
          + " " + (input.cssClass ?? "")
          + " " + (input.invalid ? 'invalid' : '')
          + " " + (input.readonly ? "readonly" : "")
        }
        style={{...input.cssStyle, fontFamily: 'Courier'}}
        disabled={input.readonly}
      />;
      }}
  />;
};

export default TextareaInput;
