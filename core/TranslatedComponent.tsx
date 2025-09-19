import React, { Component } from 'react';

export default class TranslatedComponent<P, S> extends Component {
  translationContext: string = '';
  translationContextInner: string = '';

  translate(orig: string, context?: string, contextInner?: string): string {
    return globalThis.main.translate(
      orig,
      context ?? this.translationContext,
      contextInner ?? this.translationContextInner,
    );
  }

}
