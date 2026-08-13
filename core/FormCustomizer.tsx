export default class FormCustomizer {

  static headerExtraButtons: any = {};
  static footerExtraButtons: any = {};

  static addFormHeaderExtraButton(componentName: string, title: string, icon: string, onClick: any) {
    if (!this.headerExtraButtons[componentName]) {
      this.headerExtraButtons[componentName] = [];
    }
    this.headerExtraButtons[componentName].push({ title: title, icon: icon, onClick: onClick });
  }

  static getFormHeaderExtraButtons(componentName: string) {
    return this.headerExtraButtons[componentName] ?? [];
  }

  static addFormFooterExtraButton(componentName: string, title: string, icon: string, onClick: any) {
    if (!this.footerExtraButtons[componentName]) {
      this.footerExtraButtons[componentName] = [];
    }
    this.footerExtraButtons[componentName].push({ title: title, icon: icon, onClick: onClick });
  }

  static getFormFooterExtraButtons(componentName: string) {
    return this.footerExtraButtons[componentName] ?? [];
  }

}