import React, { Component } from 'react'
import { Input, InputProps, InputState } from '../Input'
import * as uuid from 'uuid';
import DOMPurify from 'dompurify';


interface TextareaWithHtmlPreviewInputState extends InputState {
  textareaValue: string,
}

export default class TextareaWithHtmlPreview extends Input<InputProps, TextareaWithHtmlPreviewInputState> {
  static defaultProps = {
    inputClassName: 'TextareaWithHtmlPreview',
    uid: uuid.v4(),
    id: uuid.v4(),
  }

  state: TextareaWithHtmlPreviewInputState;

  constructor(props: InputProps) {
    super(props);

    this.state = {
      ...this.state, // Parent state
      isInitialized: true,
      textareaValue: this.state.value,
    };
  }

  renderInputElement() {
    return <div className='flex gap-2 w-full'>
      <div className='flex-1 card'>
        <div className='card-header'>
          HTML content
        </div>
        <div className='card-body'>
          <textarea
            className='w-full min-h-[15em]'
            style={{fontFamily: 'courier'}}
            value={this.state.textareaValue}
            onChange={(e) => {
              this.setState({textareaValue: e.target.value});
            }}
          />

          <button
            className='btn btn-transparent mt-2 w-full'
            onClick={() => {
              const sanitized = DOMPurify.sanitize(this.state.textareaValue);
              this.setState({textareaValue: sanitized});
              this.onChange(sanitized);
            }}
          >
            <span className='icon'><i className='fas fa-arrow-right'></i></span>
            <span className='text'>Sanitize HTML and update preview</span>
          </button>
        </div>
      </div>
      <div className='flex-1 card'>
        <div className='card-header'>
          Preview
        </div>
        <div className='card-body'>
          {this.state.value
            ? <div dangerouslySetInnerHTML={{__html: this.state.value}}></div>
            : <div className='bg-gray-100 text-center p-4'>No preview available</div>
          }
        </div>
      </div>
    </div>;
  }
}
