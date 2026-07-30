import React from 'react'
import * as uuid from 'uuid';
import { Input, InputProps, InputState } from '../Input'

interface ColorInputProps extends InputProps { }

interface ColorInputState extends InputState {
  showColorSelector: boolean
}

export default class Color extends Input<ColorInputProps, ColorInputState> {
  static defaultProps = {
    inputClassName: 'color',
    uid: uuid.v4(),
    id: uuid.v4(),
  }

  props: ColorInputProps = null;
  state: ColorInputState = null;

  constructor(props: InputProps) {
    super(props);
    this.props = props;
    this.state = this.getStateFromProps(props);
  }

  getStateFromProps(props: ColorInputProps) {
    return {
      ...super.getStateFromProps(props),
      isInitialized: true,
      showColorSelector: false,
    };
  }

  renderValueElement(): React.JSX.Element {
    if (this.state.value) {
      return <span style={{backgroundColor: this.state.value}}>&nbsp;&nbsp;&nbsp;&nbsp;</span>
    } else {
      return <span style={{border: '1px solid #EEEEEE'}}>&nbsp;&nbsp;&nbsp;&nbsp;</span>
    }
  }

  renderInputElement() {
    const colorPalette = ['#4D4D4D', '#999999', '#FFFFFF', '#F44E3B', '#FE9200', '#FCDC00', '#DBDF00', '#A4DD00', '#68CCCA', '#73D8FF', '#AEA1FF', '#FDA1FF', '#333333', '#808080', '#cccccc', '#D33115', '#E27300', '#FCC400', '#B0BC00', '#68BC00', '#16A5A5', '#009CE0', '#7B64FF', '#FA28FF', '#000000', '#666666', '#B3B3B3', '#9F0500', '#C45100', '#FB9E00', '#808900', '#194D33', '#0C797D', '#0062B1', '#653294', '#AB149E'];

    return <div className='flex flex-col gap-2 bg-white'>
      <div className="flex justify-between items-center">
        <div
          style={{background: this.state.value}}
          className="mr-2 cursor-pointer w-20 h-4 rounded border border-gray-400"
          onClick={() => {
            this.setState({showColorSelector: !this.state.showColorSelector});
          }}
        ></div>
        { this.state.showColorSelector &&
          <button className="btn btn-transparent" onClick={() => this.setState({showColorSelector: !this.state.showColorSelector})}>
            <i className="fas fa-times"></i>
          </button>
        }
      </div>
      {this.state.showColorSelector ?
        <div className="no-scrollbar w-full">
          {colorPalette.map((color, idx) => {
            const isSelected = this.state.value && this.state.value.toLocaleLowerCase() === color.toLocaleLowerCase();
            return <div
              className='w-4 h-4 cursor-pointer border border-gray-400'
              style={{backgroundColor: color}}
              tabIndex={0}
              key={idx}
              onClick={(e) => this.onChange(color)}
            >{isSelected ? '✓' : null}</div>;
          })}
        </div>
      : null}
    </div>;
  } 
}
