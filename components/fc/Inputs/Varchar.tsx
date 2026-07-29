import React, { useCallback, useState, useEffect, useContext } from 'react'
import AsyncSelect from 'react-select/async'
import AsyncCreatable from 'react-select/async-creatable'
import request from '@hubleto/react-ui/core/Request'
import Input, { getInputHandle, InputProps } from '../Input'

export default function Varchar(props: InputProps) {
// console.log('a', props);
  const handle = getInputHandle(props);

  const [showPredefinedValues, setShowPredefinedValues] = useState(false);

  const getEndpointUrl = useCallback((): string => {
    return handle.description?.autocomplete?.endpoint ?? '';
  }, [handle.description]);

  const loadData = useCallback((inputValue: string | null = null, callback: ((option: Array<any>) => void) | null = null) => {
    request.post(
      getEndpointUrl(),
      { search: inputValue },
      {},
      (data: any) => {
        let dataConv: Array<any> = [];
        for (let i in data) {
          dataConv.push({ label: data[i], value: data[i] });
        }
        handle.setIsInitialized(true);
        handle.setData(dataConv);
        if (callback) callback(dataConv);
      }
    );
  }, [getEndpointUrl]);

  useEffect(() => {
    if (handle.description?.autocomplete) {
      loadData();
    }
  }, []);

  const renderInputElement = useCallback((): React.JSX.Element => {
    console.log('render', handle);
    if (props.description?.autocomplete) {
      let selectProps = {
        value: {
          label: handle.value ?? '',
          value: handle.value ?? '',
        },
        isClearable: true,
        isDisabled: handle.readonly || !handle.isInitialized,
        loadOptions: (inputValue: string, callback: any) => (handle as any).loadData(inputValue, callback),
        defaultOptions: handle.data,
        getOptionLabel: (option: any) => { return option.label },
        getOptionValue: (option: any) => { return option.value },
        onChange: (item: any) => { handle.setValue(item?.value ?? ''); },
        placeholder: props.description?.placeholder,
        className: 'hubleto-lookup',
        styles: { menuPortal: (base) => ({ ...base, zIndex: 9999 }) },
        menuPortalTarget: document.body,
      }

      if (props.description?.autocomplete.creatable) return <AsyncCreatable {...selectProps} />;
      else return <AsyncSelect {...selectProps} />;
    } else {
      return <div className="flex gap-2 w-full">
        <input
          ref={handle.refInput}
          type='text'
          value={handle.value ?? ''}
          onChange={(e) => handle.setValue(handle.refInput.current.value)}
          placeholder={props.placeholder}
          className={
            (handle.invalid ? 'is-invalid' : '')
            + " " + (props.cssClass ?? "")
            + " " + (handle.readonly ? "bg-muted" : "bg-white dark:bg-slate-800 dark:text-white dark:border-slate-700")
            + " border border-slate-200 rounded-sm p-1 w-full"
          }
          disabled={handle.readonly}
        />
        {props.description?.predefinedValues ?
          showPredefinedValues ?
            <div>
              <select className='h-full'
                onChange={(e) => { handle.setValue(e.currentTarget.value); }}
              >
                <option value=''></option>
                {props.description?.predefinedValues.map((item: string, index: any) => {
                  return <option key={index} value={item}>{item}</option>
                })}
              </select>
            </div>
          :
            <button className="mt-1 btn btn-transparent" onClick={() => { setShowPredefinedValues(true); }}>
              <span className="text">Choose from predefined options...</span>
            </button>
        : null}
      </div>;
    }
  }, [handle]);

  return <Input
    {...props}
    {...handle}
    isInitialized={true}
    renderInputElement={() => renderInputElement()}
  />;
}
