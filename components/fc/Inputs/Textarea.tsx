import React from 'react'
import Input, { InputProps, InputMetaContext } from '../Input'

const InputComponent = () => {
  const input = React.useContext(InputMetaContext);

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
}

const TextareaInput = (props: InputProps) => {
  return <Input
    inputClassName='textarea'
    isInitialized={true}
    inputComponent={<InputComponent />}
    {...props}
  />;
};

export default TextareaInput;
