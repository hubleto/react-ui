import React, { useState } from 'react'
import Input, { InputProps, InputMeta, InputMetaContext } from '../Input'

const InputComponent = (props: InputProps) => {
  const input = React.useContext(InputMetaContext);
  const decimals = input.description.decimals ?? 0;
  const unit = input.description.unit;
  const step = input.description.step ?? 1;

  return <div className='flex gap-2'>
    <input
      ref={input.refInput}
      type="number"
      step={step}
      value={input.value}
      onChange={(e) => input.changeValue(e.currentTarget.value.replace('e', ''))}
      placeholder={input.description?.placeholder ?? '0' + (decimals > 0 ? '.' + '0'.repeat(decimals) : '')}
      className={
        "form-control"
        + " " + (input.invalid ? 'is-invalid' : '')
        + " " + (input.cssClass ?? "")
        + " " + (input.readonly ? "bg-muted" : "")
      }
      disabled={input.readonly}
    />
    {unit ? <div>{unit}</div> : null}
  </div>;
}

const IntInput = (props: InputProps) => {
  return <Input
    inputClassName='int'
    isInitialized={true}
    renderInputComponent={(input: InputMeta) => <InputComponent {...props} />}
    {...props}
  />;
};

export default IntInput;
