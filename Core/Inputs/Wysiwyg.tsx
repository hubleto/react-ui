import React, { Component } from 'react'
import { Input, InputProps, InputState } from '../Input'
import * as uuid from 'uuid';
import { Editor } from 'primereact/editor';

interface WysiwygInputState extends InputState {
}

export default class Wysiwyg extends Input<InputProps, WysiwygInputState> {
  static defaultProps = {
    inputClassName: 'Wysiwyg',
    id: uuid.v4(),
  }

  constructor(props: InputProps) {
    super(props);

    this.state = {
      ...this.state, // Parent state
      isInitialized: true,
    };
  }

  renderInputElement() {
    return <>
      <Editor
        className="w-full relative"
        style={{ height: '320px' }}
        value={this.state.value}
        onTextChange={(e) => this.onChange(e.htmlValue)} 
      />
    </>;
  }
}
