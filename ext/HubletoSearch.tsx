import React, { Component } from "react";
import request from "@hubleto/react-ui/core/Request";
import AsyncSelect from 'react-select/async'
import { components } from "react-select";

export interface HubletoSearchProps {
  endpoint: string,
  endpointParams?: any,
}

export interface HubletoSearchState {
  // query?: any,
  results?: any
}

const Option = (innerProps, isDisabled) => {
  return (
    <components.Option {...innerProps}>
      <div>{innerProps.data.label}</div>
      <div className="text-xs">{innerProps.data.description}</div>
      <div className="text-xs text-gray-300">{innerProps.data.APP_NAMESPACE}</div>
    </components.Option>
  )
}

export default class HubletoSearch<P, S> extends Component<HubletoSearchProps, HubletoSearchState> {
  props: HubletoSearchProps;
  state: HubletoSearchState;

  searchRef: any;

  constructor(props: HubletoSearchProps) {
    super(props);

    this.searchRef = React.createRef();
    globalThis.main.reactElements['global-fulltext-search'] = this;

    this.state = {
      // query: '',
      results: null,
    }
  }

  loadOptions(inputValue: string|null = null, callback: ((option: Array<any>) => void)|null = null) {
    request.post(
      this.props.endpoint,
      {...this.props.endpointParams, query: inputValue},
      {},
      (results: any) => {
        this.setState({
          results: results
        });

        if (callback) callback(Object.values(results ?? {}));
      }
    );
  }

  onChange(item: any) {
    // let query = this.state.query;
    if (item) {
      if (item.url) {
        location.href = globalThis.main.config.projectUrl + '/' + item.url;
      }
      // if (item.autocomplete) {
      //   console.log('setva', {id: 0, label: item.autocomplete});
      //   this.searchRef.current.setValue({id: 0, label: item.autocomplete});
      //   this.searchRef.current
      // }
    }
    // this.setState({query: query});
  }

  render(): JSX.Element {
    // console.log('q', this.state.query);
    return <>
      <AsyncSelect
        // value={{
        //   id: 0,
        //   label: this.state.query
        // }}
        ref={this.searchRef}
        isClearable={true}
        // inputValue={this.state.query}
        // defaultInputValue="Type Ctrl+K to start searching..."
        loadOptions={(inputValue: string, callback: any) => this.loadOptions(inputValue, callback)}
        getOptionLabel={(option: any) => { return option.label }}
        getOptionValue={(option: any) => { return option.id }}
        // onKeyDown={(e: any) => { console.log(this.searchRef.current.getValue()); }}
        onChange={(item: any) => { this.onChange(item); }}
        components={{ Option }}
        placeholder='[Ctrl+K] Search in Hubleto...'
        className="hubleto-lookup"
        styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
        menuPosition="fixed"
        menuPortalTarget={document.body}
      />
    </>;
  }
}
