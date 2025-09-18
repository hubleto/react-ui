import React, { Component } from 'react'
import AsyncSelect from 'react-select/async'
import AsyncCreatable from 'react-select/async-creatable'
import LookupInput, { LookupInputProps, LookupInputState } from './Lookup'
import request from '../Request'
import * as uuid from 'uuid';
import { ProgressBar } from 'primereact/progressbar';

interface UserSelectInputProps extends LookupInputProps {
  model?: string
  endpoint?: string,
  customEndpointParams?: any,
  urlAdd?: string,
  uiStyle?: 'default' | 'select' | 'buttons';
}

interface UserSelectInputState extends LookupInputState {
  data: Array<any>,
  model: string
  endpoint: string,
  customEndpointParams: any,
}

export default class UserSelect extends LookupInput<UserSelectInputProps, UserSelectInputState> {
  static defaultProps = {
    inputClassName: 'user-select',
    id: uuid.v4(),
    uiStyle: 'default',
  }

  getEndpointUrl() {
    return 'api/get-users';
  }

  renderValueElement() {
    return this.renderInputElement();
  }

  renderInputElement() {
    if (!this.state.data) return <>...</>;
    return <div className='flex gap-2 items-center'>
      <i className="fas fa-user"></i>
      <div ref={this.refInput} className="btn-group gap-1">
        {Object.keys(this.state.data).map((key: any) => {
          const user = this.state.data[key] ?? null;
          const userId = user.id ?? 0;
          return <>
            <button
              className={
                "btn " + (this.state.readonly && this.state.value != userId ? "btn-disabled" : "")
                + " " + (this.state.value == userId ? "btn-primary" : "btn-transparent")
              }
              onClick={() => {
                if (!this.state.readonly) this.onChange((this.state.value == userId ? null : userId));
              }}
            >
              <span className="text">{user.nick ?? (user.email ?? (user.last_name ?? '-'))}</span>
            </button>
          </>;
        })}
      </div>
    </div>;
  }
}
