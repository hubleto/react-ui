import React, { useState, useEffect, useRef, useContext } from 'react'
import Input, { InputProps, InputMeta, InputMetaContext } from '../Input'
import request from '../../../core/Request'
import LoaderBar from '../LoaderBar';
import Dialog, { DialogMetaContext } from '../Dialog';

interface TagsInputProps extends InputProps {
  model?: string
  endpoint?: string,
  targetColumn: string,
  sourceColumn: string,
  colorColumn?: string,
  showSelect?: boolean,
  showTagButtons?: boolean,
  editTagsUrl?: string,
  onNewTag?: (title: string) => object,
}

const ValueComponent = (args: { parent: any }) => {
  const input = React.useContext(InputMetaContext);

  const { parent } = args;

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
    return <div className='min-h-8'>{items}</div>;
  } else {
    return <span className='no-value'></span>;
  }
}

const ManageTagsDialogContent = (props: any) => {
  const dialog = useContext(DialogMetaContext);
  
  const [value, setValue] = useState('');

  const addNewTag = (tag: string) => {
    request.post(
      "api/record/save",
      {
        model: props.parent.props.model,
        id: -1,
        record: {
          name: tag,
          title: tag,
          tag: tag,
          color: '#ffdf20',
        }
      },
      {},
      (saveResponse: any) => {
        props.parent.loadOptions();
      },
      (err: any) => {
        console.log("Unable to create new Tag");
      }
    );
  }

  return <div className='flex flex-col gap-2'>
    <input
      value={value}
      onChange={(e) => setValue(e.currentTarget.value)}
      placeholder='Add new tag'
    />
    <div className='flex-dyn'>
      <button
        className='btn btn-add'
        onClick={() => {
          addNewTag(value);
          dialog.close();
        }}
      >
        <span className='icon'><i className='fas fa-plus'></i></span>
        <span className='text'>Add tag</span>
      </button>
      <button
        className='btn btn-transparent'
        onClick={() => {
          window.open(globalThis.hubleto.config.projectUrl + '/' + props.parent.props.editTagsUrl);
        }}
      >
        <span className='icon'><i className='fas fa-cog'></i></span>
        <span className='text'>Manage tags</span>
      </button>
    </div>
  </div>;
}

const InputComponent = (args: { parent: any }) => {
  const { parent } = args;
  const props = parent.props;
  const input = React.useContext(InputMetaContext);

  const convertedValue = parent.convertValueToOptionList(input.value);

  const [showSelect, setShowSelect] = useState(props.showSelect);
  const [showTagButtons, setShowTagButtons] = useState(props.showTagButtons);

  // if (!(props.onNewTag ?? false)) {
  //   return <Select
  //     ref={input.refInput}
  //     value={parent.convertValueToOptionList(input.value)}
  //     isMulti
  //     isSearchable={true}
  //     options={parent.options}
  //     className="hubleto-lookup"
  //     onChange={(selectedOptions: any) => parent.handleChange(selectedOptions)}
  //   />;
  // }

  return <div className='list horizontal min-h-8'>
    {showTagButtons ? <>
      {Object.keys(parent.options).map((key, reactKey) => {
        const option = parent.options[key];
        const isSelected = input.value ? input.value.filter((item) => item.id_tag == option.value).length > 0 : false;

        return <div
          key={reactKey}
          className='btn btn-list-item btn-transparent items-center'
          style={{background: (isSelected ? (option.color ?? '#ffffff') + '50' : '')}}
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
          <span className='icon' style={{color: option.color, borderLeftWidth: '3px', borderLeftColor: option.color ?? ''}}><i className='fas fa-tag'></i></span>
          <span className='text text-nowrap text-xs'>{option.label ?? '-'}</span>
        </div>;
      })}
      <button
        className='btn btn-list-item btn-small btn-transparent'
        onClick={() => { setShowSelect(true); }}
      >
        <span className='icon'><i className='fas fa-cog'></i></span>
      </button>
    </> : null}
    {showSelect ? <Dialog
      uid={props.uid + '_add_tag'}
      onClose={() => setShowSelect(false)}
      headerClassName='dialog-warning-header'
      contentClassName='dialog-warning-content'
      renderHeader={(dialog: any) => <>Manage tags</>}
    >
      <ManageTagsDialogContent
        uid={props.uid}
        input={input}
        convertedValue={convertedValue}
        parent={parent}
      ></ManageTagsDialogContent>
    </Dialog> : null}
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
    input.setIsInitialized(false);
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

    if (value && value.map) {
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

  const handleChange = (selectedOptions: any) => {
    const input = inputRef.current;
    input.changeValue([...selectedOptions]);
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
    loadOptions,
  };

  return <Input
    ref={inputRef}
    isInitialized={false}
    renderLoadingComponent={(input: InputMeta) => <div className='h-8 w-full'><LoaderBar size="xs"></LoaderBar></div>}
    renderValueComponent={(input: InputMeta) => <ValueComponent parent={myself} />}
    renderInputComponent={(input: InputMeta) => <InputComponent parent={myself} />}
    {...normalizedProps}
  />;

}

export default Tags;