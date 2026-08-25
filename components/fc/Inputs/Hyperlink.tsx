import React, { Component } from 'react'
import { InputProps, InputMeta, InputMetaContext } from '../Input';
import Varchar, { InputComponent as VarcharInputComponent } from './Varchar'

const ValueComponent = (props: InputProps) => {
  const input = React.useContext(InputMetaContext);
  if (props.value) {
    return <>
      <i className="fas fa-link"></i>
      <a
        href={props.value}
        target='_blank'
        onClick={(e) => { e.stopPropagation(); }}
        className="btn btn-blue-outline btn-small max-w-60"
      >
        <span className="icon"><i className="fa-solid fa-up-right-from-square"></i></span>
        <span className="text">{props.value ? props.value : ''}</span>
      </a>
      <button className="btn btn-transparent btn-small ml-2">
        <span className="icon"><i className="fa-solid fa-pencil"></i></span>
      </button>
    </>;
  } else {
    return <span className="no-value"></span>;
  }
}

const InputComponent = (props: InputProps) => {
  const input = React.useContext(InputMetaContext);
  return <div className="w-full flex gap-2 items-center">
    {/* <i className="fas fa-link"></i> */}
    <VarcharInputComponent {...props} />
    <a
      href={props.value}
      target='_blank'
      onClick={(e) => { e.stopPropagation(); }}
      className="btn btn-transparent"
    >
      <span className="icon"><i className="fa-solid fa-up-right-from-square"></i></span>
    </a>
  </div>
}

const Hyperlink = (props: InputProps) => {
  return <Varchar
    renderValueComponent={(input: InputMeta) => <ValueComponent {...props} />}
    renderInputComponent={(input: InputMeta) => <InputComponent {...props} />}
    {...props}
  />
}

export default Hyperlink;
