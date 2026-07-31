import React, { useState } from 'react'
import Input, { InputProps } from '../Input'

const BooleanInput = React.memo((props: InputProps) => {

  const normalizedProps: InputProps = {
    ...props,
    inputClassName: 'boolean',
  };

  return <Input
    {...normalizedProps}
    renderValueElement={(input: any): React.JSX.Element => {
      if (input.value) {
        return <span className="text-green-600" style={{fontSize: '1.2em'}}>✓</span>;
      } else {
        return <span className="text-red-600" style={{fontSize: '1.2em'}}>✕</span>;
      }
    }}
    renderInputElement={(input: any): React.JSX.Element => {
      return <div className='list horizontal'>
        <div
          className={'btn btn-list-item btn-extra-small ' + (input.value ? 'btn-success' : 'btn-transparent')}
          onClick={() => { if (!input.readonly) input.changeValue(true)}}
        >
          <span className='icon text-sm'><i className='fas fa-check'></i></span>
        </div>
        <div
          className={'btn btn-list-item btn-extra-small ' + (input.value ? 'btn-transparent' : 'btn-danger')}
          onClick={() => { if (!input.readonly) input.changeValue(false)}}
        >
          <span className='icon text-sm'><i className='fas fa-times'></i></span>
        </div>
      </div>;
    }}
  />;
}, () => true);

export default BooleanInput;
