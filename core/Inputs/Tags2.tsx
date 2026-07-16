import React, { Component } from 'react'
import { Input, InputProps, InputState } from '../Input'
import request from '../Request'
import * as uuid from 'uuid';
import { ProgressBar } from 'primereact/progressbar';
import CreatableSelect from "react-select/creatable";
import Select from "react-select";

interface Tags2InputProps extends InputProps {
  params?: any,
  model?: string
  endpoint?: string,
  targetColumn: string,
  sourceColumn: string,
  colorColumn?: string,
  showSelect?: boolean,
  showTagButtons?: boolean,
  onNewTag?: (title: string) => object,
}

interface Tags2InputState extends InputState {
  options: Array<any>,
  model: string
  endpoint: string,
  targetColumn: string,
  sourceColumn: string,
  colorColumn: string,
  showSelect?: boolean,
  showTagButtons?: boolean,
}

export default class Tags2 extends Input<Tags2InputProps, Tags2InputState> {
  static defaultProps = {
    inputClassName: 'tags',
    uid: uuid.v4(),
    id: uuid.v4(),
    showSelect: true,
  }

  props: Tags2InputProps;
  state: Tags2InputState;

  constructor(props: Tags2InputProps) {
    super(props);

    this.state = this.getStateFromProps(props);
  }

  getStateFromProps(props: Tags2InputProps) {
    return {
      ...this.state, // Parent state
      endpoint:
        props.endpoint
          ? props.endpoint
          : (props.params && props.params.endpoint
              ? props.params.endpoint
              : (globalThis.hubleto.config.defaultLookupEndpoint ?? 'api/record/lookup')
          )
      ,
      model: props.model ? props.model : (props.params && props.params.model ? props.params.model : ''),
      options: [],
      targetColumn: props.targetColumn,
      sourceColumn: props.sourceColumn,
      showSelect: props.showSelect,
      showTagButtons: props.showTagButtons,
    };
  }

  addNewTag(title: string) {
    if (!this.props.onNewTag) return;

    const newTag = this.props.onNewTag(title);

    request.post(
      "api/record/save",
      {model: this.props.model, id: -1, record: newTag},
      {},
      (saveResponse: any) => {
        this.loadOptions(() => {
          const value = this.convertValueToOptionList(this.state.value);
          value.push(Object.values(this.state.options).find((opt) => opt.value == saveResponse.savedRecord.id) ?? {
            id: saveResponse.savedRecord?.id,
            value: saveResponse.savedRecord.id,
            label: title
          });
          this.handleChange(value);
        });
      },
      (err: any) => {
        console.log("Unable to create new Tag");
      }
    );
  }

  handleChange(selectedOptions: any) {
    const value: Array<any> = [];
    for (let i in selectedOptions) {
      value.push({
        id: selectedOptions[i].id ?? -1,
        [this.props.targetColumn]: {_useMasterRecordId_: true},
        [this.props.sourceColumn]: selectedOptions[i].value,
      });
    }
    this.onChange(value);
  }

  componentDidMount() {
    super.componentDidMount();
    this.loadOptions();
  }

  getEndpointUrl() {
    return this.state.endpoint;
  }

  getEndpointParams(): object {
    let formRecord: any = null;

    if (this.props.parentForm) {
      formRecord = {...this.props.parentForm.state.record};
      (this.props.parentForm.state.record._RELATIONS ?? []).map((relName) => {
        delete formRecord[relName];
      })
    }

    return {
      model: this.state.model,
      context: this.props.context,
      formRecord: formRecord,
      __IS_AJAX__: '1',
    };
  }

  loadOptions(callback = () => {}) {
    request.post(
      this.getEndpointUrl(),
      this.getEndpointParams(),
      {},
      (data: any) => {
        let options: Array<any> = [];
        for (let i in data) {
          options[data[i].id] = {
            value: data[i].id,
            label: data[i]._LOOKUP,
            color: data[i][this.props.colorColumn ?? ''] ?? '',
          };
        }

        this.setState({
          isInitialized: true,
          options: options,
        }, callback);
      }
    );
  }

  convertValueToOptionList(value): Array<any> {
    let optionList: Array<any> = [];
    if (value) {
      optionList = value.map((item) => {
        const optionId = item.id;
        const optionValue = item[this.props.sourceColumn];
        const optionData = this.state.options[optionValue];

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

  renderValueElement(): JSX.Element {
    const options: Array<any> = this.convertValueToOptionList(this.state.value);

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

  renderInputElement() {
    const convertedValue = this.convertValueToOptionList(this.state.value);

    if (!(this.props.onNewTag ?? false)) {
      return <Select
        ref={this.refInput}
        value={this.convertValueToOptionList(this.state.value)}
        isMulti
        isSearchable={true}
        options={this.state.options}
        className="hubleto-lookup"
        onChange={(selectedOptions: any) => this.handleChange(selectedOptions)}
      />;
    }

    return <div className='flex flex-col gap-2'>
      {this.state.showTagButtons ? <div className='flex gap-4'>
        {Object.keys(this.state.options).map((key) => {
          const option = this.state.options[key];
          const isSelected = this.state.value ? this.state.value.filter((item) => item.id_tag == option.value).length > 0 : false;

          return <div className='flex gap-1'>
            <span className='text-sm' style={{color: option.color}}><i className='fas fa-tag'></i></span>
            <button
              key={key}
              className={'btn btn-small ' + (isSelected ? 'btn-primary' : 'btn-transparent')}
              style={{borderLeftWidth: '3px', borderLeftColor: option.color ?? ''}}
              onClick={() => {
                let newValue = this.state.value ?? [];

                if (isSelected) {
                  newValue = newValue.filter((item) => {
                    return item[this.props.sourceColumn] != option.value
                  });
                } else {
                  newValue.push({
                    id: -1,
                    [this.props.targetColumn]: {_useMasterRecordId_: true},
                    [this.props.sourceColumn]: option.value,
                  });
                }

                this.onChange(newValue);
              }}
            >
              <span className='text text-sm text-nowrap'>{option.label ?? '-'}</span>
            </button>
          </div>;
        })}
        <button
            className='btn btn-small btn-transparent'
            onClick={() => { this.setState({showSelect: true}); }}
          >
            <span className='icon'><i className='fas fa-plus'></i></span>
          </button>
      </div>: null}
      {this.state.showSelect ?
        <CreatableSelect
          ref={this.refInput}
          value={convertedValue}
          isMulti
          options={Object.values(this.state.options)}
          className="hubleto-lookup"
          onChange={(selectedOptions: any) => this.handleChange(selectedOptions)}
          onCreateOption={(inputValue: string) => this.addNewTag(inputValue)}
        />
      : null}
    </div>;
  }
}