export default class Translator {
  context: string;
  contextInner: string;

  constructor(context: string, contextInner: string) {
    this.context = context;
    this.contextInner = contextInner;
  }

  translate(orig: string, context?: string, contextInner?: string, vars?: any): string {
    context = (context ?? this.context).replaceAll('/', '\\');
    contextInner = (contextInner ?? this.contextInner).replaceAll('/', '\\');

    try {
      return globalThis.hubleto.translate(
        orig,
        context,
        contextInner,
        vars
      );
    } catch (e) {
      return orig;
    }
  };
}