import React, { Component, createRef } from 'react'
import { Input, InputProps, InputState } from '@hubleto/react-ui/core/Input'
import * as uuid from 'uuid';
import { JsonEditor } from 'json-edit-react'

interface JsonInputState extends InputState {
  focused: boolean,
}

export default class Json extends Input<InputProps, JsonInputState> {
  static defaultProps = {
    inputClassName: 'json',
    id: uuid.v4(),
  }

  state: JsonInputState;

  constructor(props: InputProps) {
    super(props);
    this.state.isInitialized = true;
  }

  getStateFromProps(props: InputProps) {
    return {
      ...this.state, // Parent state
      focused: false,
    };
  }

  renderValueElement() {
    return <>
      <JsonEditor
        data={JSON.parse(this.state.value ?? '') ?? {}}
        onUpdate={(props: any) => {
          if (props.newData) this.onChange(JSON.stringify(props.newData) ?? '');
        }}
      />
    </>;
  }

  renderInputElement() {
    return this.renderValueElement();
  }
}
