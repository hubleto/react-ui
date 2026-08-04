import React, { useState } from 'react'
import Input, { InputProps, InputMetaContext } from '../Input'

const ValueComponent = () => {
  const input = React.useContext(InputMetaContext);

  return <div
    style={{background: input.value}}
    className="mr-2 cursor-pointer w-16 h-4 border border-gray-400"
  ></div>;
}

const InputComponent = () => {
  const input = React.useContext(InputMetaContext);
  const colorPalette = ['#4D4D4D', '#999999', '#FFFFFF', '#F44E3B', '#FE9200', '#FCDC00', '#DBDF00', '#A4DD00', '#68CCCA', '#73D8FF', '#AEA1FF', '#FDA1FF', '#333333', '#808080', '#cccccc', '#D33115', '#E27300', '#FCC400', '#B0BC00', '#68BC00', '#16A5A5', '#009CE0', '#7B64FF', '#FA28FF', '#000000', '#666666', '#B3B3B3', '#9F0500', '#C45100', '#FB9E00', '#808900', '#194D33', '#0C797D', '#0062B1', '#653294', '#AB149E'];
  const [showColorSelector, setShowColorSelector] = useState(false);
  return <div className='flex flex-col'>
    <div className="flex justify-between items-center">
      <div
        className="btn btn-transparent"
        onClick={() => { setShowColorSelector(!showColorSelector); }}
      ><span className='icon w-8' style={{background: input.value}}></span></div>
    </div>
    {showColorSelector ? <div className='relative w-0 h-0' style={{zIndex: 999999, left: '-100%'}}>
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
    </div> : null}
  </div>;
}

const ColorInput = (props: InputProps) => {
  return <Input
    isInitialized={true}
    readonly={true}
    inputClassName='color'
    valueComponent={<ValueComponent />}
    inputComponent={<InputComponent />}
    {...props}
  />;
};

export default ColorInput;
