import React, { useState } from 'react'
import Input, {  InputProps } from '../Input'

const ColorInput = (props: InputProps) => {
  const colorPalette = ['#4D4D4D', '#999999', '#FFFFFF', '#F44E3B', '#FE9200', '#FCDC00', '#DBDF00', '#A4DD00', '#68CCCA', '#73D8FF', '#AEA1FF', '#FDA1FF', '#333333', '#808080', '#cccccc', '#D33115', '#E27300', '#FCC400', '#B0BC00', '#68BC00', '#16A5A5', '#009CE0', '#7B64FF', '#FA28FF', '#000000', '#666666', '#B3B3B3', '#9F0500', '#C45100', '#FB9E00', '#808900', '#194D33', '#0C797D', '#0062B1', '#653294', '#AB149E'];
  const [showColorSelector, setShowColorSelector] = useState(false);

  return <Input
    {...props}
    inputClassName='color'
    renderInputElement={(input: any): React.JSX.Element => {
      return <div className='flex flex-wrap gap-1 bg-white'>
        <div className="flex justify-between items-center">
          <div
            style={{background: input.value}}
            className="mr-2 cursor-pointer w-16 h-4 border border-gray-400"
            onClick={() => { setShowColorSelector(!showColorSelector); }}
          ></div>
        </div>
        {showColorSelector ? colorPalette.map((color, idx) => {
          const isSelected = input.value && input.value.toLocaleLowerCase() === color.toLocaleLowerCase();
          return <div
            className='w-4 h-4 cursor-pointer border border-gray-400'
            style={{backgroundColor: color}}
            tabIndex={0}
            key={idx}
            onClick={(e) => input.setValue(color)}
          >{isSelected ? '✓' : null}</div>;
        }) : null}
      </div>;
    }}
  />;
};

export default ColorInput;
