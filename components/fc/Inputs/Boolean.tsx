import React, { useState } from 'react'
import Input, { InputProps, InputMetaContext } from '../Input'

const ValueComponent = () => {
  const input = React.useContext(InputMetaContext);
  if (input.value) {
    return <span className="text-green-600" style={{fontSize: '1.2em'}}>✓</span>;
  } else {
    return <span className="text-red-600" style={{fontSize: '1.2em'}}>✕</span>;
  }
}

const InputComponent = () => {
  const input = React.useContext(InputMetaContext);

  return <div className='list horizontal'>
    <div
      className={'btn btn-list-item btn-small ' + (input.value ? 'btn-success' : 'btn-transparent')}
      onClick={() => { if (!input.readonly) input.changeValue(true)}}
    >
      <span className='icon text-sm'><i className='fas fa-check'></i></span>
    </div>
    <div
      className={'btn btn-list-item btn-small ' + (input.value ? 'btn-transparent' : 'btn-danger')}
      onClick={() => { if (!input.readonly) input.changeValue(false)}}
    >
      <span className='icon text-sm'><i className='fas fa-times'></i></span>
    </div>
  </div>;
}

const BooleanInput = (props: InputProps) => {

  const normalizedProps: InputProps = {
    ...props,
    inputClassName: 'boolean',
  };

  return <Input
    {...normalizedProps}
    valueComponent={<ValueComponent />}
    inputComponent={<InputComponent />}
    // renderInputElement={(input: any): React.JSX.Element => }
  />;
};

export default BooleanInput;
