import React, { Component } from 'react';
import * as uuid from 'uuid';

export interface FormInputProps {
  children: any,
  title?: string|React.JSX.Element,
  description?: string,
  required?: boolean,
}

interface FormInputState {
  uid: string,
  title?: string|React.JSX.Element,
  description: string,
  required: boolean,
}

export default class FormInput extends Component<FormInputProps> {
  state: FormInputState = null;

  constructor(props: FormInputProps) {
    super(props);

    this.state = {
      uid: uuid.v4(),
      title: this.props.title,
      description: this.props.description ?? '',
      required: this.props.required ?? false,
    };
  }

  render(): React.JSX.Element {
    return <>
      <div
        id={this.state.uid}
        className={"input-wrapper" + (this.state.required == true ? " required" : "")}
        key={this.state.uid}
      >
        {this.state.title ?
          <label className="input-label" htmlFor={this.state.uid}>
            {this.state.title}
          </label>
        : null}

        <div className="input-body" key={this.state.uid}>
          {this.props.children}
        </div>

        {this.state.description
          ? <>
            <i
              className="input-description fas fa-info"
              title={this.state.description}
            ></i>
          </>
          : null
        }
      </div>
    </>;
  } 
}
