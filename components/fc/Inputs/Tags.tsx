import React, { useState, useEffect, useRef } from 'react'
import Input, { InputProps, InputMetaContext } from '../Input'
import request from '../../../core/Request'
import * as uuid from 'uuid';
import CreatableSelect from "react-select/creatable";
import Select from "react-select";

interface TagsInputProps extends InputProps {
  model?: string
  endpoint?: string,
  targetColumn: string,
  sourceColumn: string,
  colorColumn?: string,
  showSelect?: boolean,
  showTagButtons?: boolean,
  onNewTag?: (title: string) => object,
}

const ValueComponent = (args: { parent: any }) => {
  const { parent } = args;
  const props = parent.props;
  const input = parent.inputRef.current;//React.useContext(InputMetaContext);
  const options: Array<any> = parent.convertValueToOptionList(input.value);

  if (options) {
    let items: Array<any> = [];
    for (let i in options) {
      items.push(
        <button
          key={i}
          className="btn btn-transparent btn-small mr-1"
          style={{borderColor: (options[i].color ? options[i].color : '')}}
        >
          <span
            className="text"
            style={{color: (options[i].color ? options[i].color : '')}}
          >{options[i].label}</span>
        </button>
      );
    }
    return <>{items}</>;
  } else {
    return <span className='no-value'></span>;
  }
}

const InputComponent = (args: { parent: any }) => {
  const { parent } = args;
  const props = parent.props;
  // const input = parent.inputRef.current;//React.useContext(InputMetaContext);
  const input = React.useContext(InputMetaContext);
  const convertedValue = parent.convertValueToOptionList(input.value);

  const [showSelect, setShowSelect] = useState(props.showSelect);
  const [showTagButtons, setShowTagButtons] = useState(props.showTagButtons);

  if (!(props.onNewTag ?? false)) {
    return <Select
      ref={input.refInput}
      value={parent.convertValueToOptionList(input.value)}
      isMulti
      isSearchable={true}
      options={parent.options}
      className="hubleto-lookup"
      onChange={(selectedOptions: any) => parent.handleChange(selectedOptions)}
    />;
  }

  return <div className='flex flex-col gap-2'>
    {showTagButtons ? <div className='flex gap-4'>
      {Object.keys(parent.options).map((key) => {
        const option = parent.options[key];
        const isSelected = input.value ? input.value.filter((item) => item.id_tag == option.value).length > 0 : false;

        return <div className='flex gap-1'>
          <span className='text-sm' style={{color: option.color}}><i className='fas fa-tag'></i></span>
          <button
            key={key}
            className={'btn btn-small ' + (isSelected ? 'btn-primary' : 'btn-transparent')}
            style={{borderLeftWidth: '3px', borderLeftColor: option.color ?? ''}}
            onClick={() => {
              let newValue = input.value ?? [];
              if (isSelected) {
                newValue = newValue.filter((item) => {
                  return item[props.sourceColumn] != option.value
                });
              } else {
                newValue.push({
                  id: -1,
                  [props.targetColumn]: {_useMasterRecordId_: true},
                  [props.sourceColumn]: option.value,
                });
              }

              parent.handleChange(newValue);
            }}
          >
            <span className='text text-sm text-nowrap'>{option.label ?? '-'}</span>
          </button>
        </div>;
      })}
      <button
          className='btn btn-small btn-transparent'
          onClick={() => { setShowSelect(true); }}
        >
          <span className='icon'><i className='fas fa-plus'></i></span>
        </button>
    </div>: null}
    {showSelect ?
      <CreatableSelect
        ref={input.refInput}
        value={convertedValue}
        isMulti
        options={Object.values(parent.options)}
        className="hubleto-lookup"
        onChange={(selectedOptions: any) => parent.handleChange(selectedOptions)}
        onCreateOption={(inputValue: string) => parent.addNewTag(inputValue)}
      />
    : null}
  </div>;
}

const Tags = (props: TagsInputProps) => {
  const inputRef = React.useRef(null);

  const normalizedProps = {
    endpoint:
      props.endpoint
        ? props.endpoint
        : (globalThis.hubleto.config.defaultLookupEndpoint ?? 'api/record/lookup')
    ,
    model: props.model,
    targetColumn: props.targetColumn,
    sourceColumn: props.sourceColumn,
    ...props
  };

  const [options, setOptions] = useState([]);

  const getEndpointParams = (): object => {
    let formRecord: any = null;

    // if (this.props.parentForm) {
    //   formRecord = {...this.props.parentForm.state.record};
    //   (this.props.parentForm.state.record._RELATIONS ?? []).map((relName) => {
    //     delete formRecord[relName];
    //   })
    // }

    return {
      model: normalizedProps.model,
      context: normalizedProps.context,
      formRecord: formRecord,
      __IS_AJAX__: '1',
    };
  }

  const loadOptions = (callback?: any) => {
    const input = inputRef.current;
    request.post(
      normalizedProps.endpoint,
      getEndpointParams(),
      {},
      (data: any) => {
        let options: Array<any> = [];
        for (let i in data) {
          options[data[i].id] = {
            value: data[i].id,
            label: data[i]._LOOKUP,
            color: data[i][normalizedProps.colorColumn ?? ''] ?? '',
          };
        }

        input.setIsInitialized(true);
        setOptions(options);
        if (callback) callback();
      }
    );
  }

  const convertValueToOptionList = (value): Array<any> => {
    let optionList: Array<any> = [];

    if (value) {
      optionList = value.map((item) => {
        const optionId = item.id;
        const optionValue = item[normalizedProps.sourceColumn];
        const optionData = options[optionValue];

        return {
          id: optionId,
          value: optionValue,
          label: optionData?.label ?? '[' + optionValue + ']',
          color: optionData?.color ?? '',
        }
      });
    }

    return optionList;

  }

  const addNewTag = (title: string) => {
    const input = inputRef.current;

    if (!normalizedProps.onNewTag) return;

    const newTag = normalizedProps.onNewTag(title);

    request.post(
      "api/record/save",
      {model: normalizedProps.model, id: -1, record: newTag},
      {},
      (saveResponse: any) => {
        loadOptions(() => {
          const value = convertValueToOptionList(input.value);
          value.push(Object.values(options).find((opt) => opt.value == saveResponse.savedRecord.id) ?? {
            id: saveResponse.savedRecord?.id,
            value: saveResponse.savedRecord.id,
            label: title
          });
          handleChange(value);
        });
      },
      (err: any) => {
        console.log("Unable to create new Tag");
      }
    );
  }

  const handleChange = (selectedOptions: any) => {
    const input = inputRef.current;
    // const value: Array<any> = [];

    // for (let i in selectedOptions) {
    //   value.push({
    //     id: selectedOptions[i].id ?? -1,
    //     [normalizedProps.targetColumn]: {_useMasterRecordId_: true},
    //     [normalizedProps.sourceColumn]: selectedOptions[i].value,
    //   });
    // }

    input.changeValue(selectedOptions);
  }


  useEffect(() => {
    loadOptions();
  }, []);

  const myself = {
    inputRef,
    props: normalizedProps,
    options,
    convertValueToOptionList,
    handleChange,
    addNewTag,
  };

  return <Input
    ref={inputRef}
    isInitialized={false}
    valueComponent={<ValueComponent parent={myself} />}
    inputComponent={<InputComponent parent={myself} />}
    {...normalizedProps}
  />;

}

export default Tags;