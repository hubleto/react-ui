import React, { Component } from 'react'
import { Input, InputProps, InputState } from '../Input'
import * as uuid from 'uuid';

interface WysiwygInputProps extends InputState {}
interface WysiwygInputState extends InputState {}

export default class Wysiwyg extends Input<WysiwygInputProps, WysiwygInputState> {
  static defaultProps = {
    inputClassName: 'Wysiwyg',
    uid: uuid.v4(),
    id: uuid.v4(),
  }

  props: WysiwygInputProps = null;
  state: WysiwygInputState = null;

  constructor(props: WysiwygInputProps) {
    super(props);
    this.props = props;
    this.state = this.getStateFromProps(props);
  }

  getStateFromProps(props: WysiwygInputProps) {
    return {
      ...super.getStateFromProps(props),
      isInitialized: true,
    };
  }

  renderInputElement() {
    return <div className='flex gap-2 w-full'>
      <textarea
        className='w-full min-h-[15em]'
        style={{fontFamily: 'courier', whiteSpace: 'nowrap', padding: '0.5em'}}
        value={this.state.value}
        onChange={(e) => {
          this.setState({value: e.target.value});
        }}
      />
    </div>;
  }
}
