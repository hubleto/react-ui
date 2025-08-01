import React, { Component } from 'react';

export default class TranslatedComponent<P, S> extends Component {
  translationContext: string = '';

  translate(orig: string, context?: string): string {
    return globalThis.main.translate(orig, context ?? this.translationContext);
  }

}
