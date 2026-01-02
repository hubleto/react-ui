import React, { Component } from 'react';
import { HubletoComponentProps } from './Component';

export interface HtmlFrameProps {
  iframeId?: string,
  content?: string,
  className?: string,
}

export interface HtmlFrameState {
  content?: string,
}

export default class HtmlFrame extends Component<HtmlFrameProps, HtmlFrameState> {

  constructor(props) {
    super(props);

    this.state = { content: this.props.content }
  }

  render() {
    return <>
      <iframe
        src="about:blank"
        className={this.props.className}
        srcDoc={this.state.content}
        id={this.props.iframeId}
      />
    </>
  }
}
