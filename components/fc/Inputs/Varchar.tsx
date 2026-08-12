import React, { useState, useEffect } from 'react'
import AsyncSelect from 'react-select/async'
import AsyncCreatable from 'react-select/async-creatable'
import request from '@hubleto/react-ui/core/Request'
import Input, { InputProps, InputMeta, InputMetaContext } from '../Input'

const getEndpointUrl = (input: any): string => {
  return input.description?.autocomplete?.endpoint ?? '';
};

const loadData = (input: any, searchValue: string) => {
  request.post(
    getEndpointUrl(input),
    { search: searchValue },
    {},
    (data: any) => {
      let dataConv: Array<any> = [];
      for (let i in data) {
        dataConv.push({ label: data[i], value: data[i] });
      }
      input.setIsInitialized(true);
      input.setData(dataConv);
    }
  );
};

export const InputComponent = (props: InputProps) => {
  const input = React.useContext(InputMetaContext);
  const [showPredefinedValues, setShowPredefinedValues] = useState(false);

  if (input.description?.autocomplete) {
    let selectProps = {
      value: {
        label: input.value ?? '',
        value: input.value ?? '',
      },
      isClearable: true,
      isDisabled: input.readonly || !input.isInitialized,
      loadOptions: (searchValue: string, callback: any) => loadData(input, searchValue),
      defaultOptions: input.data,
      getOptionLabel: (option: any) => { return option.label },
      getOptionValue: (option: any) => { return option.value },
      onChange: (item: any) => { input.changeValue(item?.value ?? ''); },
      placeholder: input.description?.placeholder,
      className: 'hubleto-lookup',
      styles: { menuPortal: (base) => ({ ...base, zIndex: 9999 }) },
      menuPortalTarget: document.body,
    }

    if (input.description?.autocomplete.creatable) return <AsyncCreatable {...selectProps} />;
    else return <AsyncSelect {...selectProps} />;
  } else {
    return <div className="flex gap-2 w-full">
      <input
        type='text'
        value={input.value ?? ''}
        onChange={(e) => { input.changeValue(e.currentTarget.value)} }
        placeholder={props.placeholder}
        className={
          (input.invalid ? 'is-invalid' : '')
          + " " + (props.cssClass ?? "")
          + " " + (input.readonly ? "bg-muted" : "bg-white dark:bg-slate-800 dark:text-white dark:border-slate-700")
          + " border border-slate-200 rounded-sm p-1 w-full"
        }
        disabled={input.readonly}
      />
      {props.description?.predefinedValues ?
        showPredefinedValues ?
          <div>
            <select className='h-full'
              onChange={(e) => { input.changeValue(e.currentTarget.value); }}
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
};

export const VarcharInput = (props: InputProps) => {
  return <Input
    inputClassName='varchar'
    isInitialized={props.description?.autocomplete ? false : true}
    onInit={(input: any) => {
      if (props.description?.autocomplete) {
        loadData(input, '');
      }
    }}
    renderInputComponent={(input: InputMeta) => <InputComponent {...props} />}
    {...props}
  />;
};

export default VarcharInput;