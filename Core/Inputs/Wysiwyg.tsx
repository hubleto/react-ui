import React, { Component } from 'react'
import { Input, InputProps, InputState } from '../Input'
import * as uuid from 'uuid';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

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
      <ReactQuill
        theme="snow"
        className="w-full relative"
        value={this.state.value}
        onChange={(newValue) => this.onChange(newValue)}
      />
    </>;
  }
}
