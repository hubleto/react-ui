import React, { useCallback, useState } from 'react'
import AsyncSelect from 'react-select/async'
import AsyncCreatable from 'react-select/async-creatable'
import request from '@hubleto/react-ui/core/Request'
import { useInput, InputProps, InputState, InputHandle, InputChrome, UseInputOptions } from '../Input'

export interface VarcharInputState extends InputState {
  data: Array<any>,
  showPredefinedValues: boolean,
}

// `Varchar` used to be `extends Input` and was itself extended by
// `Tel`/`Hyperlink`/`Mailto`. It's now a hook (`useVarcharInput`) that those
// three call in place of `extends Varchar`, plus a standalone `Varchar`
// function component for anywhere `<Varchar ...>` was rendered directly.
export function useVarcharInput(
  props: InputProps,
  options: UseInputOptions<VarcharInputState> = {}
): InputHandle<VarcharInputState> {
  const input = useInput<VarcharInputState>(props, {
    ...options,
    getStateFromProps: (p, base) => {
      const varcharBase: VarcharInputState = {
        ...base,
        data: [],
        showPredefinedValues: true,
        isInitialized: true,
      };
      return options.getStateFromProps ? options.getStateFromProps(p, varcharBase as any) : varcharBase;
    },
  });

  const getEndpointUrl = useCallback((): string => {
    return input.state.description?.autocomplete?.endpoint ?? '';
  }, [input.state.description]);

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
        input.setState({ isInitialized: true, data: dataConv });
        if (callback) callback(dataConv);
      }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getEndpointUrl]);

  // componentDidMount: load autocomplete data if configured.
  React.useEffect(() => {
    if (input.props.description?.autocomplete) {
      loadData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // componentDidUpdate: reload if the autocomplete endpoint changes.
  const prevEndpointRef = React.useRef(props.description?.autocomplete?.endpoint);
  React.useEffect(() => {
    const prevEndpoint = prevEndpointRef.current;
    prevEndpointRef.current = props.description?.autocomplete?.endpoint;
    if (
      props.description?.autocomplete
      && props.description?.autocomplete.endpoint != prevEndpoint
    ) {
      loadData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.description?.autocomplete?.endpoint]);

  return { ...input, loadData, getEndpointUrl } as InputHandle<VarcharInputState> & {
    loadData: typeof loadData, getEndpointUrl: typeof getEndpointUrl
  };
}

export function renderVarcharInputElement(input: ReturnType<typeof useVarcharInput>) {
  const { props, state } = input;

  if (props.description?.autocomplete) {
    let selectProps = {
      value: {
        label: state.value ?? '',
        value: state.value ?? '',
      },
      isClearable: true,
      isDisabled: state.readonly || !state.isInitialized,
      loadOptions: (inputValue: string, callback: any) => (input as any).loadData(inputValue, callback),
      defaultOptions: state.data,
      getOptionLabel: (option: any) => { return option.label },
      getOptionValue: (option: any) => { return option.value },
      onChange: (item: any) => { input.onChange(item?.value ?? ''); },
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
        ref={input.refInput}
        type='text'
        value={state.value ?? ''}
        onChange={(e) => input.onChange(input.refInput.current.value)}
        placeholder={props.placeholder}
        className={
          (state.invalid ? 'is-invalid' : '')
          + " " + (props.cssClass ?? "")
          + " " + (state.readonly ? "bg-muted" : "bg-white dark:bg-slate-800 dark:text-white dark:border-slate-700")
          + " border border-slate-200 rounded-sm p-1 w-full"
        }
        disabled={state.readonly}
      />
      {props.description?.predefinedValues ?
        state.showPredefinedValues ?
          <div>
            <select className='h-full'
              onChange={(e) => { input.onChange(e.currentTarget.value); }}
            >
              <option value=''></option>
              {props.description?.predefinedValues.map((item: string, index: any) => {
                return <option key={index} value={item}>{item}</option>
              })}
            </select>
          </div>
        :
          <button className="mt-1 btn btn-transparent" onClick={() => { input.setState({showPredefinedValues: true}); }}>
            <span className="text">Choose from predefined options...</span>
          </button>
      : null}
    </div>;
  }
}

export default function Varchar(rawProps: InputProps) {
  const input = useVarcharInput({ inputClassName: 'varchar', ...rawProps });
  return <InputChrome input={input} renderInputElement={() => renderVarcharInputElement(input)} />;
}
