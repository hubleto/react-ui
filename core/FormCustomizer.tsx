import { FormMeta, FormTab } from "../components/fc/FormInterfaces";

export interface FormExtraButton {
  title: string,
  icon: string,
  onClick: any,
}

export default class FormCustomizer {

  static tabs: any = {};
  static headerExtraButtons: any = {};
  static footerExtraButtons: any = {};

  static addTab(
    componentName: string,
    tabUid: string,
    mount: (form: FormMeta) => boolean|FormTab,
  ) {
    if (!this.tabs[componentName]) {
      this.tabs[componentName] = [];
    }
    this.tabs[componentName][tabUid] = {mount: mount};
  }

  static getTabs(componentName: string) {
    return this.tabs[componentName] ?? [];
  }

  static addFormHeaderExtraButton(
    componentName: string,
    mount: (form: FormMeta) => boolean|FormExtraButton,
  ) {
    if (!this.headerExtraButtons[componentName]) {
      this.headerExtraButtons[componentName] = [];
    }
    this.headerExtraButtons[componentName].push({mount: mount});
  }

  static getFormHeaderExtraButtons(componentName: string) {
    return this.headerExtraButtons[componentName] ?? [];
  }

  static addFormFooterExtraButton(
    componentName: string,
    mount: (form: FormMeta) => boolean|FormExtraButton,
  ) {
    if (!this.footerExtraButtons[componentName]) {
      this.footerExtraButtons[componentName] = [];
    }
    this.footerExtraButtons[componentName].push({mount: mount});
  }

  static getFormFooterExtraButtons(componentName: string) {
    return this.footerExtraButtons[componentName] ?? [];
  }

}