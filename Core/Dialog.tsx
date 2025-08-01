import React, { Component } from 'react';
import { Dialog as PrimereactDialog, DialogProps as PrimereactDialogProps, DialogState as PrimereactDialogState } from 'primereact/dialog';
import { HubletoComponentProps } from './Component';

export default class Dialog extends Component {
  props: PrimereactDialogProps & HubletoComponentProps;
  state: PrimereactDialogState;

  constructor(props) {
    super(props);

    if (this.props.uid) {
      globalThis.main.reactElements[this.props.uid] = this;
    }
  }

  show() {
    this.setState({containerVisible: true});
  }

  hide() {
    this.setState({containerVisible: false});
  }

  render() {
    const props = {...this.props};
    props.resizable = false;
    props.headerClassName = this.props.headerClassName;
    props.contentClassName = this.props.contentClassName;
    props.onHide = () => { this.hide(); };

    if (this.state) props.visible = this.state.containerVisible;
    return <PrimereactDialog {...props}></PrimereactDialog>
  }
}
