import React, { Component } from 'react'
import { Input, InputProps, InputState } from '../Input'
import * as uuid from 'uuid';
import DOMPurify from 'dompurify';
import Editor from 'react-simple-code-editor';
import { highlight, languages } from 'prismjs/components/prism-core';
import 'prismjs/components/prism-markup';
import 'prismjs/themes/prism.css'; //Example style, you can use another

interface TextareaWithHtmlPreviewInputState extends InputState {
  textareaValue: string,
  previewInvalidated: boolean
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
      previewInvalidated: false,
    };
  }

  renderInputElement() {
    return <div className='flex gap-2 w-full'>
      <div className={'w-1/2 card ' + (this.state.previewInvalidated ? 'card-danger' : '')}>
        <div className='card-header'>
          Preview
        </div>
        <div className='card-body'>
          {this.state.previewInvalidated
            ? <button
              className='btn btn-danger'
              onClick={() => {
                const sanitized = DOMPurify.sanitize(this.state.textareaValue);
                this.setState({textareaValue: sanitized, previewInvalidated: false});
                this.onChange(sanitized);
              }}
            >
              <span className='icon'><i className='fas fa-arrows-rotate'></i></span>
              <span className='text'>Sanitize HTML and update preview</span>
            </button>
            : (this.state.value
              ? <div dangerouslySetInnerHTML={{__html: this.state.value}}></div>
              : <div className='bg-gray-100 text-center p-4'>No preview available</div>
            )
          }
        </div>
      </div>
      <div className='w-1/2 card' style={{overflowX: 'auto'}}>
        <div className='card-header'>
          HTML content
        </div>
        <div className='card-body' style={{maxWidth: '600px'}}>
          {/* <textarea
            className='w-full min-h-[15em]'
            style={{fontFamily: 'courier', whiteSpace: 'nowrap', padding: '0.5em'}}
            value={this.state.textareaValue}
            onChange={(e) => {
              this.setState({textareaValue: e.target.value});
            }}
          /> */}
          <Editor
            className="bg-slate-300"
            value={this.state.textareaValue ?? ''}
            onValueChange={(newValue) => {
              this.setState({textareaValue: newValue, previewInvalidated: true});
            }}
            highlight={code => highlight(code, languages.markup)}
            padding={10}
            style={{
              fontFamily: 'monospace',
              fontSize: 11,
            }}
          />
        </div>
      </div>
    </div>;
  }
}
