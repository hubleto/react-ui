import React, { Component } from 'react';
import { HubletoComponentProps } from './Component';

export interface DialogProps extends HubletoComponentProps {
  headerClassName?: string,
  contentClassName?: string,
  footerClassName?: string,
  children: any,
}
export interface DialogState {
  visible: boolean,
}
export default class Dialog extends Component {

  props: DialogProps = null;
  state: DialogState = null;

  constructor(props) {
    super(props);
    this.props = props;

    if (this.props.uid) {
      globalThis.hubleto.reactElements[this.props.uid] = this;
    }

    this.state = this.getStateFromProps(props);
  }
  
  getStateFromProps(props: DialogProps) {
    return {
      visible: false,
    }
  }

  show() {
    this.setState({visible: true});
  }

  hide() {
    this.setState({visible: false});
  }

  render() {
    if (this.state.visible) {
      return <div className="hubleto component dialog">
        <div className={"dialog-header " + (this.props.headerClassName ?? '')}>
          
        </div>
        <div className={"dialog-content " + (this.props.contentClassName ?? '')}>
          {this.props.children}
        </div>
        <div className={"dialog-footer " + (this.props.footerClassName ?? '')}>
          <div
            className="btn btn-transparent"
            onClick={() => this.hide()}
          >
            <span className="text">Close</span>
          </div>
        </div>
      </div>;
    } else return null;
  }
}
