import React from 'react'
import Input, { InputProps } from '../Input'

const TextareaInput = React.memo((props: InputProps) => {

  const normalizedProps: InputProps = {
    ...props,
    inputClassName: 'textarea',
    isInitialized: true,
  };

  return <Input
    {...normalizedProps}
    renderInputElement={(input: any): React.JSX.Element => {
      return <textarea
        value={input.value ?? ''}
        onChange={(e) => input.changeValue(e.currentTarget.value) }
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
}, () => true);

export default TextareaInput;
