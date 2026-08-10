import React, { useState } from 'react'
import Input, { InputProps, InputMeta, InputMetaContext } from '../Input'

const ValueComponent = (props: InputProps) => {
  const input = React.useContext(InputMetaContext);
  if (input.value) {
    return <span className="text-green-600" style={{fontSize: '1.2em'}}>✓</span>;
  } else {
    return <span className="text-red-600" style={{fontSize: '1.2em'}}>✕</span>;
  }
}

const InputComponent = (props: InputProps) => {
  const input = React.useContext(InputMetaContext);

  return <div className='list horizontal'>
    <div
      className={'btn btn-list-item btn-small ' + (input.value ? 'btn-success' : 'btn-transparent')}
      onClick={() => { if (!input.readonly) input.changeValue(1)}}
    >
      <span className='icon text-sm'><i className='fas fa-check'></i></span>
    </div>
    <div
      className={'btn btn-list-item btn-small ' + (input.value ? 'btn-transparent' : 'btn-danger')}
      onClick={() => { if (!input.readonly) input.changeValue(0)}}
    >
      <span className='icon text-sm'><i className='fas fa-times'></i></span>
    </div>
  </div>;
}

const BooleanInput = (props: InputProps) => {
  return <Input
    inputClassName='boolean'
    isInitialized={true}
    {...props}
    renderValueComponent={(input: InputMeta) => <ValueComponent {...props} />}
    renderInputComponent={(input: InputMeta) => <InputComponent {...props} />}
  />;
};

export default BooleanInput;
