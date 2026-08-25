import React from 'react'
import Input, { InputProps, InputMeta, InputMetaContext } from '../Input'

const ValueComponent = (props: InputProps) => {
  return props.value;
}

const InputComponent = (props: InputProps) => {
  const input = React.useContext(InputMetaContext);

  return <textarea
    value={props.value ?? ''}
    onChange={(e) => input.changeValue(e.currentTarget.value) }
    aria-describedby="passwordHelpInline"
    rows={5}
    placeholder={input.description?.placeholder ?? input.description?.title}
    className={
      ""
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
    renderValueComponent={(input: InputMeta) => <ValueComponent {...props} />}
    renderInputComponent={(input: InputMeta) => <InputComponent {...props} />}
    {...props}
  />;
};

export default TextareaInput;
