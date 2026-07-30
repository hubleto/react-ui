import React, { useState } from 'react'
import Input, { InputProps } from '../Input'

export interface IntInputProps extends InputProps {
  step?: number,
  decimals?: number,
  unit?: number,
}

const IntInput = (props: IntInputProps) => {

  const [step, setStep] = useState(props.step);
  const [decimals, setDecimals] = useState(props.decimals);
  const [unit, setUnit] = useState(props.unit);

  return <Input
    {...props}
    inputClassName='int'
    renderInputElement={(input: any): React.JSX.Element => {
      return <div className='flex gap-2'>
        <input
          ref={input.refInput}
          type="number"
          step={step}
          value={input.value}
          onChange={(e) => input.setValue(e.currentTarget.value.replace('e', ''))}
          placeholder={props.description?.placeholder ?? '0' + (decimals > 0 ? '.' + '0'.repeat(decimals) : '')}
          className={
            "form-control"
            + " " + (input.invalid ? 'is-invalid' : '')
            + " " + (input.cssClass ?? "")
            + " " + (input.readonly ? "bg-muted" : "")
            + " max-w-40"
          }
          disabled={input.readonly}
        />
        {unit ? <div>{unit}</div> : null}
      </div>;
    }}
  />;
};

export default IntInput;
