import HtmlFrame from "@hubleto/react-ui/core/HtmlFrame";
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
  isFullscreen: boolean;
  showPreview: boolean;
}

export default class TextareaWithHtmlPreview extends Input<InputProps, TextareaWithHtmlPreviewInputState> {
  static defaultProps = {
    inputClassName: 'TextareaWithHtmlPreview',
    uid: uuid.v4(),
    id: uuid.v4(),
  }

  state: TextareaWithHtmlPreviewInputState;

  refPreview: any;

  constructor(props: InputProps) {
    super(props);

    this.refPreview = React.createRef();

    this.state = {
      ...this.state, // Parent state
      isInitialized: true,
      textareaValue: this.state.value,
      previewInvalidated: false,
      isFullscreen: false,
      showPreview: true,
    };
  }

  renderInputElement() {
    let editorStyle: any = {
      overflow: 'auto',
      fontFamily: 'monospace',
      fontSize: 11,
      maxWidth: '1200px',
    };
    let wrapperStyle: any = {};

    // if (this.state.isFullscreen) {
    //   wrapperStyle.position = 'absolute';
    //   wrapperStyle.left = '0px';
    //   wrapperStyle.top = '0px';
    //   wrapperStyle.width = '100%';
    //   // wrapperStyle.height = '100vh';
    //   wrapperStyle.background = 'white';
    //   wrapperStyle.padding = '1em';
    //   wrapperStyle.zIndex = 9999999;
    //   // editorStyle.height = 'calc(100vh - 10em)';
    // } else {
    //   wrapperStyle.width = '100%';
    // }

    if (this.state.showPreview) {
      return <div className='card w-full'>
        <div className='card-header'>
          <div>
            {this.translate('Preview', 'Hubleto\\Erp\\Loader', 'Components\\Inputs\\TextareaWithHtmlPreview')}
            <button
              className='btn btn-small btn-transparent ml-2'
              onClick={() => { this.setState({showPreview: false}); }}
            >
              <span className='icon'><i className='fas fa-code'></i></span>
              <span className='text'>{this.translate('Show source', 'Hubleto\\Erp\\Loader','Components\\Inputs\\TextareaWithHtmlPreview')}</span>
            </button>
          </div>
          {/* <div>
            <button
              className='btn btn-small btn-transparent'
              onClick={() => { this.setState({isFullscreen: !this.state.isFullscreen}); }}
            >
              <span className='icon'><i className='fas fa-expand'></i></span>
              <span className='text'>{this.translate('Toggle fullscreen', 'Hubleto\\Erp\\Loader','Components\\Inputs\\TextareaWithHtmlPreview')}</span>
            </button>
          </div> */}
        </div>
        <div className='card-body min-h-96 w-full'>
          <HtmlFrame
            ref={this.refPreview}
            className='w-full min-h-96 '
            content={this.state.textareaValue}
          />
        </div>
      </div>;
    } else {
      return <div className='card h-full'>
        <div className='card-header'>
          <div>
            {this.translate('Source', 'Hubleto\\Erp\\Loader', 'Components\\Inputs\\TextareaWithHtmlPreview')}
            <button
              className='btn btn-small btn-transparent ml-2'
              onClick={() => { this.setState({showPreview: true}); }}
            >
              <span className='icon'><i className='fas fa-eye'></i></span>
              <span className='text'>{this.translate('Show preview', 'Hubleto\\Erp\\Loader','Components\\Inputs\\TextareaWithHtmlPreview')}</span>
            </button>
          </div>
          <div>
            <button
              className='btn btn-small btn-transparent'
              onClick={() => { this.setState({isFullscreen: !this.state.isFullscreen}); }}
            >
              <span className='icon'><i className='fas fa-expand'></i></span>
              <span className='text'>{this.translate('Toggle fullscreen', 'Hubleto\\Erp\\Loader','Components\\Inputs\\TextareaWithHtmlPreview')}</span>
            </button>
          </div>
        </div>
        <div className='card-body flex flex-col overflow-y-auto'>
          <Editor
            className="w-full overflow-y"
            value={this.state.textareaValue ?? ''}
            onValueChange={(newValue) => {
              this.setState({textareaValue: newValue});
              this.onChange(newValue);
            }}
            highlight={code => highlight(code, languages.markup)}
            padding={10}
            style={editorStyle}
          />
        </div>
      </div>;
    }
  }
}
