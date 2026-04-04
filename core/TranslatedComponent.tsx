import React, { Component } from 'react';

export default class TranslatedComponent<P, S> extends Component {
  translationContext: string = '';
  translationContextInner: string = '';

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
