import React, { useState } from 'react'
import Input, { InputProps, InputMeta, InputMetaContext } from '../Input'

interface ColorInputProps extends InputProps {
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl',
}

const ValueComponent = (props: ColorInputProps) => {
  const input = React.useContext(InputMetaContext);

  return <div
    style={{background: input.value}}
    className="mr-2 cursor-pointer w-16 h-4 border border-gray-400"
  ></div>;
}

const InputComponent = (props: ColorInputProps) => {
  const input = React.useContext(InputMetaContext);
  const colorPalette = ['#4D4D4D', '#999999', '#FFFFFF', '#F44E3B', '#FE9200', '#FCDC00', '#DBDF00', '#A4DD00', '#68CCCA', '#73D8FF', '#AEA1FF', '#FDA1FF', '#333333', '#808080', '#cccccc', '#D33115', '#E27300', '#FCC400', '#B0BC00', '#68BC00', '#16A5A5', '#009CE0', '#7B64FF', '#FA28FF', '#000000', '#666666', '#B3B3B3', '#9F0500', '#C45100', '#FB9E00', '#808900', '#194D33', '#0C797D', '#0062B1', '#653294', '#AB149E'];
  const [showColorSelector, setShowColorSelector] = useState(false);

  let size = 1;
  if (props.size == 'xs') size = 0.5;
  if (props.size == 'sm') size = 0.75;
  if (props.size == 'lg') size = 2;
  if (props.size == 'xl') size = 3;

  return <button
    className="btn btn-transparent btn-dropdown"
    onClick={() => { setShowColorSelector(!showColorSelector); }}    
  >
    <span className='icon'>
      {input.value
      ? <div style={{background: input.value, width: size + 'em', height: size + 'em'}}></div>
      : <i className='fas fa-palette opacity-50'></i>}
    </span>
    <div className='menu'>
      <div className='w-44 bg-white p-2 mt-2 flex flex-wrap gap-2 shadow'>
        {colorPalette.map((color, idx) => {
          const isSelected = input.value && input.value.toLocaleLowerCase() === color.toLocaleLowerCase();
          return <div
            className={'w-4 h-4 rounded cursor-pointer ' + (isSelected ? 'border-b border-b-4 border-primary p-2' : '')}
            style={{backgroundColor: color}}
            tabIndex={0}
            key={idx}
            onClick={(e) => {
              input.changeValue(color);
              setShowColorSelector(false);
            }}
          ></div>;
        })}
      </div>
    </div>
  </button>;
}

const ColorInput = (props: ColorInputProps) => {
  return <Input
    isInitialized={true}
    readonly={true}
    inputClassName='color'
    renderValueComponent={(input: InputMeta) => <ValueComponent {...props} />}
    renderInputComponent={(input: InputMeta) => <InputComponent {...props} />}
    {...props}
  />;
};

export default ColorInput;
