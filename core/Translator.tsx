export default class Translator {
  context: string;
  contextInner: string;

  constructor(context: string, contextInner: string) {
    this.context = context;
    this.contextInner = contextInner;
  }

  translate(orig: string, context?: string, contextInner?: string, vars?: any): string {
    try {
      return globalThis.hubleto.translate(
        orig,
        context ?? this.context,
        contextInner ?? this.contextInner,
        vars
      );
    } catch (e) {
      return orig;
    }
  };
}