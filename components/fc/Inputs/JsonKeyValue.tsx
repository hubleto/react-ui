import React, { useState } from 'react'
import Input, { type InputProps, type InputMeta, InputMetaContext } from '../Input'
import Translator from '@hubleto/react-ui/core/Translator';

const T = new Translator('Hubleto\\ReactUi', 'Components\\Inputs\\JsonKeyValue');

const getValueAsArray = (input: InputMeta) => {
  let valAsObj = null;
  try {
    valAsObj = JSON.parse(input.value ?? '{}');
  } catch (ex) {
    valAsObj = {};
  }

  if (!valAsObj) valAsObj = {};

  let valAsArray = [];
  Object.keys(valAsObj).map((key) => {
    valAsArray.push([key, valAsObj[key]]);
  })

  return valAsArray;
};

const convertArrayToObject = (input: InputMeta, valArray: any): object => {
  let valObj = {};
  valArray.map((keyValue, index) => { valObj[keyValue[0]] = keyValue[1]; });
  return valObj;
};

const addNewKeyValue = (input: InputMeta) => {
  let newValue = getValueAsArray(input);
  newValue.push(['', '']);
  input.changeValue(JSON.stringify(convertArrayToObject(input, newValue)));
};

const updateKeyValue = (input: InputMeta, index: number, key: string, value: string) => {
  let newValue = getValueAsArray(input);
  newValue[index] = [key, value];
  input.changeValue(JSON.stringify(convertArrayToObject(input, newValue)));
};

const ValueComponent = (props: InputProps) => {
  const input = React.useContext(InputMetaContext);
  return input.value;
}

const InputComponent = (props: InputProps) => {
  const input = React.useContext(InputMetaContext);
  const valArray = getValueAsArray(input);

  return <div>
    {valArray.map((item: any, index: number) => {
      const refKey: any = React.createRef();
      const refValue: any = React.createRef();
      return <div key={index} className="flex w-full gap-2">
        <input
          ref={refKey}
          value={valArray[index][0]}
          onChange={() => updateKeyValue(input, index, refKey.current.value, refValue.current.value)}
        />
        <input
          ref={refValue}
          value={valArray[index][1]}
          onChange={() => updateKeyValue(input, index, refKey.current.value, refValue.current.value)}
        />
      </div>;
    })}
    <div className="mt-2">
      <button
        className="btn btn-transparent btn-small"
        onClick={() => addNewKeyValue(input)}
      >
        <span className="icon"><i className="fas fa-plus"></i></span>
        <span className="text">{T.translate('Add value')}</span>
      </button>
    </div>
  </div>;
}

const JsonKeyValueInput = (props: InputProps) => {
  return <Input
    inputClassName='json-key-value'
    isInitialized={true}
    renderValueComponent={(input: InputMeta) => <InputComponent {...props} />}
    renderInputComponent={(input: InputMeta) => <InputComponent {...props} />}
    {...props}
  />;
};

export default JsonKeyValueInput;