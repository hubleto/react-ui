import React from 'react'
import { useInput, InputProps, InputState, InputChrome } from '../Input'

export interface IntInputProps extends InputProps {
  unit?: string
}

export default function Int(rawProps: IntInputProps) {
  const props: IntInputProps = { inputClassName: 'int', ...rawProps };

  const input = useInput<InputState>(props, {
    getStateFromProps: (p, base) => ({
      ...base,
      isInitialized: true,
    }),
  });

  const renderInputElement = () => {
    const decimals = props.description?.decimals ?? 0;
    const step = props.description?.step ?? 1;
    return <div className='flex gap-2'>
      <input
        ref={input.refInput}
        type="number"
        step={step}
        value={input.state.value}
        onChange={(e) => input.onChange(e.currentTarget.value.replace('e', ''))}
        placeholder={props.description?.placeholder ?? '0' + (decimals > 0 ? '.' + '0'.repeat(decimals) : '')}
        className={
          "form-control"
          + " " + (input.state.invalid ? 'is-invalid' : '')
          + " " + (props.cssClass ?? "")
          + " " + (input.state.readonly ? "bg-muted" : "")
          + " max-w-40"
        }
        disabled={input.state.readonly}
      />
      {props.unit ? <div>{props.unit}</div> : null}
    </div>;
  };

  return <InputChrome input={input} renderInputElement={renderInputElement} />;
}
