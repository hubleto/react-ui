import React, { Component } from 'react'
import { Input, InputProps, InputState } from '../Input'
import * as uuid from 'uuid';
import { Editor } from 'primereact/editor';

interface WysiwygInputState extends InputState {
  textareaValue: string,
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
      textareaValue: this.state.value,
    };
  }

  renderInputElement() {
    return <div className='flex gap-2'>
      <div className='flex-1'>
        <Editor
          className="w-full relative"
          style={{ height: '320px' }}
          value={this.state.value}
          onTextChange={(e) => {
            this.onChange(e.htmlValue);
            this.setState({textareaValue: e.htmlValue});
          }}
        />
      </div>
      <div className='flex-1'>
        <textarea
          className='w-full'
          value={this.state.textareaValue}
          onChange={(e) => {
            this.setState({textareaValue: e.target.value});
          }}
        />
        <button
          className='btn btn-transparent mt-2'
          onClick={() => {
            this.onChange(this.state.textareaValue);
          }}
        >
          <span className='icon'><i className='fas fa-arrow-left'></i></span>
          <span className='text'>Use this HTML code</span>
        </button>
      </div>
    </div>;
  }
}
