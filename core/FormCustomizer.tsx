import { FormMeta } from "../components/fc/FormInterfaces";

export interface FormExtraButton {
  title: string,
  icon: string,
  onClick: any,
}

export default class FormCustomizer {

  static headerExtraButtons: any = {};
  static footerExtraButtons: any = {};

  static addFormHeaderExtraButton(
    componentName: string,
    onRender: (form: FormMeta) => FormExtraButton,
    onBeforeRender?: (form: FormMeta) => boolean
  ) {
    if (!this.headerExtraButtons[componentName]) {
      this.headerExtraButtons[componentName] = [];
    }
    this.headerExtraButtons[componentName].push({
      onRender: onRender,
      onBeforeRender: onBeforeRender,
    });
  }

  static getFormHeaderExtraButtons(componentName: string) {
    return this.headerExtraButtons[componentName] ?? [];
  }

  static addFormFooterExtraButton(
    componentName: string,
    onRender: (form: FormMeta) => FormExtraButton,
    onBeforeRender?: (form: FormMeta) => boolean
  ) {
    if (!this.footerExtraButtons[componentName]) {
      this.footerExtraButtons[componentName] = [];
    }
    this.footerExtraButtons[componentName].push({
      onRender: onRender,
      onBeforeRender: onBeforeRender,
    });
  }

  static getFormFooterExtraButtons(componentName: string) {
    return this.footerExtraButtons[componentName] ?? [];
  }

}