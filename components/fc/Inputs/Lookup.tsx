import React, { useState } from 'react'
import AsyncSelect from 'react-select/async'
import Input, { InputProps, InputMeta, InputMetaContext } from '../Input'
import request from '../../../core/Request'

export interface LookupInputProps extends InputProps {
  model?: string
  endpoint?: string,
  customEndpointParams?: any,
  urlAdd?: string,
  uiStyle?: 'default' | 'select' | 'buttons' | 'buttons-vertical';
}

const getEndpointParams = (props: any, input: any): object => {
  let formRecord: any = null;

  if (input.parentForm) {
    formRecord = {...input.parentForm.record};
    (input.parentForm.record._RELATIONS ?? []).map((relName) => {
      delete formRecord[relName];
    })
  }

  return {
    model: props.model,
    context: input.context,
    formRecord: formRecord,
    __IS_AJAX__: '1',
    ...(input.parentForm?.state.customEndpointParams ?? {}),
    ...input.customEndpointParams,
  };
}

const loadData = (props: any, input: any, searchValue: string|null = null) => {
  request.post(
    props.endpoint,
    {...getEndpointParams(props, input), search: searchValue},
    {},
    (data: any) => {
      input.setIsInitialized(true);
      input.setData(data);
    }
  );
}


const ValueComponent = (props: LookupInputProps): React.JSX.Element => {
  const input = React.useContext(InputMetaContext);

  if (input.data && input.data[input.value]?._LOOKUP) {
    let value = input.data[input.value];
    let urlDetail = value._URL_DETAIL ?? '';

    let style = {};
    if (value._LOOKUP_COLOR) style['borderLeft'] = '0.5em solid ' + value._LOOKUP_COLOR;

    return <>
      <a className="btn btn-transparent" style={style}>
        <span className={"text " + (value._LOOKUP_CLASS ? value._LOOKUP_CLASS : "text-primary")}>{value._LOOKUP}</span>
      </a>
      {urlDetail && input.value ? <a className="btn btn-transparent ml-2" target="_blank" href={globalThis.hubleto.config.projectUrl + "/" + urlDetail}>
        <span className="icon"><i className="fas fa-arrow-up-right-from-square"></i></span>
      </a> : null}
    </>;
  } else {
    return <span className='no-value'></span>;
  }
}

const InputComponent = (props: LookupInputProps): React.JSX.Element => {
  const input = React.useContext(InputMetaContext);
  let urlDetail = input.data[input.value]?._URL_DETAIL ?? '';
  let value = input.data[input.value]?.id ?? 0;

  const [urlAdd, setUrlAdd] = useState(props.urlAdd);
  const [uiStyle, setUiStyle] = useState(props.uiStyle);

  if (uiStyle == 'select') {
    return <>
      <select
        ref={input.refInput}
        value={value}
        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => input.changeValue(e.target.value)}
        className={
          (input.invalid ? 'is-invalid' : '')
          + " " + (input.cssClass ?? "")
          + " " + (input.readonly ? "bg-muted" : "")
        }
        disabled={input.readonly}
      >
        {Object.keys(input.data).map((key: any): React.JSX.Element => {
          if (input.data == undefined) return <></>;
          return <option key={key} value={key}>{input.data[key]?._LOOKUP ?? ''}</option>
        })}
      </select>
    </>;
  } else if (uiStyle == 'buttons' || uiStyle == 'buttons-vertical') {
    return <div
      ref={input.refInput}
      className={"btn-group gap-1 flex-wrap " + (uiStyle == 'buttons-vertical' ? " flex-col w-full" : "")}
    >{Object.keys(input.data).map((key: any) => {
      const value = input.data ? (input.data[key]?.id ?? 0) : 0;
      const lookup = input.data ? (input.data[key]?._LOOKUP ?? '') : '';
      const color = input.data ? (input.data[key]?._LOOKUP_COLOR ?? '') : '';
      return <>
        <button
          className={
            "btn " + (input.readonly && input.value != value ? "btn-disabled" : "")
            + " " + (input.value == value ? "btn-primary" : "btn-transparent")
          }
          style={{borderLeft: (color ? "0.5em solid " + color : "")}}
          onClick={() => { if (!input.readonly) input.changeValue((input.value == value ? null : value)); }}
        >
          <span className="text">{lookup}</span>
        </button>
      </>;
    })}</div>;
  } else {
    return <>
      <AsyncSelect
        ref={input.refInput}
        value={{
          id: value,
          _LOOKUP: input.data[input.value]?._LOOKUP ?? '',
        }}
        isClearable={true}
        isDisabled={input.readonly || !input.isInitialized}
        loadOptions={(searchValue: string, callback: any) => loadData(props, searchValue, callback)}
        defaultOptions={Object.values(input.data ?? {})}
        getOptionLabel={(option: any) => { return option._LOOKUP }}
        getOptionValue={(option: any) => { return option.id }}
        onChange={(item: any) => { input.changeValue(item?.id ?? 0); }}
        placeholder={input.description?.placeholder}
        className="hubleto-lookup"
        // allowCreateWhileLoading={false}
        // formatCreateLabel={(inputValue: string) => <span className="create-new">{this.translate('Create', 'Hubleto\\Erp\\Loader', 'Components\\Inputs\\Lookup') + ': ' + inputValue}</span>}
        // getNewOptionData={(value, label) => { return { id: {_isNew_: true, _LOOKUP: label}, _LOOKUP: label }; }}
        styles={{ container: (base) => ({ ...base, minWidth: '16rem' }), menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
        menuPosition="fixed"
        menuPortalTarget={document.body}
      />
      {urlDetail ? <a className="btn btn-transparent" target="_blank" href={globalThis.hubleto.config.projectUrl + "/" + urlDetail}>
        <span className="icon"><i className="fas fa-arrow-up-right-from-square"></i></span>
      </a> : null}
      {urlAdd && !input.readonly ? <a className="btn btn-transparent ml-2" target="_blank" href={globalThis.hubleto.config.projectUrl + "/" + urlAdd}>
        <span className="icon"><i className="fas fa-plus"></i></span>
      </a> : null}
    </>;
  }
}


const LookupInput = React.memo((props: LookupInputProps) => {
  const normalizedProps: LookupInputProps = {
    ...props,
    inputClassName: 'lookup',
    uiStyle: 'default',
    endpoint: props.endpoint
    ? props.endpoint
    : (props.description && props.description.endpoint
      ? props.description.endpoint
      : (globalThis.hubleto.config.defaultLookupEndpoint ?? 'api/record/lookup')
    ),
    model: props.model ? props.model : (props.description && props.description.model ? props.description.model : ''),
    customEndpointParams: props.customEndpointParams ?? {},
  };

  return <Input
    {...normalizedProps}
    onInit={(input: any) => {
      loadData(normalizedProps, input, '');
    }}
    renderValueComponent={(input: InputMeta) => <ValueComponent {...normalizedProps} />}
    renderInputComponent={(input: InputMeta) => <InputComponent {...normalizedProps} />}
  />;
}, () => true);

export default LookupInput;