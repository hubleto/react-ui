import React, { useCallback, useState, useEffect, useContext } from 'react'
import request from '@hubleto/react-ui/core/Request'
import Input, { getInputHandle, InputProps } from '../Input'

export interface IntInputProps extends InputProps {
  step?: number,
  decimals?: number,
  unit?: number,
}

const InputInt = (props: IntInputProps) => {
  const handle = getInputHandle(props);

  const [step, setStep] = useState(props.step);
  const [decimals, setDecimals] = useState(props.decimals);
  const [unit, setUnit] = useState(props.unit);

  const renderInputElement = useCallback((): React.JSX.Element => {
    return <div className='flex gap-2'>
      <input
        ref={handle.refInput}
        type="number"
        step={step}
        value={handle.value}
        onChange={(e) => handle.setValue(e.currentTarget.value.replace('e', ''))}
        placeholder={props.description?.placeholder ?? '0' + (decimals > 0 ? '.' + '0'.repeat(decimals) : '')}
        className={
          "form-control"
          + " " + (handle.invalid ? 'is-invalid' : '')
          + " " + (handle.cssClass ?? "")
          + " " + (handle.readonly ? "bg-muted" : "")
          + " max-w-40"
        }
        disabled={handle.readonly}
      />
      {unit ? <div>{unit}</div> : null}
    </div>;
  }, [handle]);

  return <Input
    {...props}
    {...handle}
    isInitialized={true}
    renderInputElement={() => renderInputElement()}
  />;
};

export default InputInt;
