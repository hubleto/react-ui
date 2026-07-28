import React, { Component } from 'react';

export interface TranslatedComponentProps {}
export interface  TranslatedComponentState {}
export default class TranslatedComponent<P, S> extends Component<TranslatedComponentProps, TranslatedComponentState> {
  translationContext: string = '';
  translationContextInner: string = '';

  props: TranslatedComponentProps = null;
  state: TranslatedComponentState = null;

  constructor(props) {
    super(props);
    this.props = props;
    this.state = {};
  }

  translate(orig: string, context?: string, contextInner?: string, vars?: any): string {
    try {
      return globalThis.hubleto.translate(
        orig,
        context ?? this.translationContext,
        contextInner ?? this.translationContextInner,
        vars
      );
    } catch (e) {
      return orig;
    }
  }

}
