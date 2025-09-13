import React from 'react'
import Compact from '@uiw/react-color-compact';
import * as uuid from 'uuid';
import { Input, InputProps, InputState } from '../Input'

interface ColorInputProps extends InputProps {
}

interface ColorInputState extends InputState {
  showColorSelector: boolean
}

export default class Color extends Input<ColorInputProps, ColorInputState> {
  static defaultProps = {
    inputClassName: 'color',
    id: uuid.v4(),
  }

  props: ColorInputProps;
  state: ColorInputState;

  constructor(props: ColorInputProps) {
    super(props);

    this.state = {
      ...this.state, // Parent state
      isInitialized: true,
      showColorSelector: false,
    };
  }

  renderValueElement(): JSX.Element {
    if (this.state.value) {
      return <span style={{backgroundColor: this.state.value}}>&nbsp;&nbsp;&nbsp;&nbsp;</span>
    } else {
      return <span style={{border: '1px solid #EEEEEE'}}>&nbsp;&nbsp;&nbsp;&nbsp;</span>
    }
  }

  renderInputElement() {
    return <div className='flex flex-col gap-2'>
      <div
        style={{background: this.state.value}}
        className="mr-2 cursor-pointer w-20 h-4 rounded"
        onClick={() => {
          this.setState({showColorSelector: !this.state.showColorSelector});
        }}
      ></div>
      {this.state.showColorSelector ?
        <div className="no-scrollbar w-full">
          <Compact
            ref={this.refInput}
            color={this.state.value}
            style={{
              width: '100%'
            }}
            onChange={(color: any) => this.onChange(color.hex)}
            // rectRender={(props) => {
            //   console.log(props.key)
            //   if (props.key == 35) {
            //     return <button key={props.key} style={{ width: 15, height: 15, padding: 0, lineHeight: "10px" }} onClick={() => setHex(null)}>x</button>
            //   }
            // }}
          />
        </div>
      : null}
    </div>;
  } 
}
