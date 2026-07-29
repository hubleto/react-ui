import React, { useCallback, useState, useEffect, useContext } from 'react'
import request from '@hubleto/react-ui/core/Request'
import Input, { getInputHandle, InputProps } from '../Input'
import Compact from '@uiw/react-color-compact';

const InputColor = (props: InputProps) => {
  const handle = getInputHandle(props);

  console.log('inputclo');
  const [showColorSelector, setShowColorSelector] = useState(props.showColorSelctor ?? false);

  const renderInputElement = useCallback((): React.JSX.Element => {
    console.log('reu', showColorSelector);
    return <div className='flex flex-col gap-2 bg-white'>--{showColorSelector}--
      <div className="flex justify-between items-center">
        <div
          style={{background: handle.value}}
          className="mr-2 cursor-pointer w-20 h-4 rounded border border-gray-400"
          onClick={() => { console.log(showColorSelector); setShowColorSelector(!showColorSelector) }}
        ></div>
        {showColorSelector &&
          <button className="btn btn-transparent" onClick={() => setShowColorSelector(!showColorSelector)}>
            <i className="fas fa-times"></i>
          </button>
        }
      </div>
      {showColorSelector ?
        <div className="no-scrollbar w-full">
          <Compact
            ref={handle.refInput}
            color={handle.value}
            onChange={(color: any) => handle.onChange(handle, color.hex)}
          />
        </div>
      : null}
    </div>;
  }, [handle, showColorSelector]);

  return <Input
    {...props}
    {...handle}
    isInitialized={true}
    renderInputElement={() => renderInputElement()}
  />;
};

export default InputColor;
