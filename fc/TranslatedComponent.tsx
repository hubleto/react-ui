import { useCallback } from 'react';

// The original `TranslatedComponent` was a base class meant to be extended by
// `Input`, `Tree`, `Form`, and `Table`, each of which set `translationContext`
// / `translationContextInner` as instance fields. Function components can't
// be subclassed, so this becomes a composable hook instead: any component
// that used to `extends TranslatedComponent` now calls
// `const { translate } = useTranslation(context, contextInner)` and gets the
// same `translate(orig, context?, contextInner?, vars?)` signature back.

export function useTranslation(translationContext: string = '', translationContextInner: string = '') {
  const translate = useCallback((orig: string, context?: string, contextInner?: string, vars?: any): string => {
    try {
      return globalThis.hubleto.translate(
        orig,
        context ?? translationContext,
        contextInner ?? translationContextInner,
        vars
      );
    } catch (e) {
      return orig;
    }
  }, [translationContext, translationContextInner]);

  return { translate };
}
