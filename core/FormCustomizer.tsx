export default class FormCustomizer {

  static headerExtraButtons: any = {};
  static footerButtons: any = {};

  static addFormHeaderButton(componentName: string, title: string, icon: string, onClick: any) {
    if (!this.headerExtraButtons[componentName]) {
      this.headerExtraButtons[componentName] = [];
    }
    this.headerExtraButtons[componentName].push({ title: title, icon: icon, onClick: onClick });
  }

  static getFormHeaderExtraButtons(componentName: string) {
    return this.headerExtraButtons[componentName] ?? [];
  }

  static addFormFooterButton(componentName: string, title: string, icon: string, onClick: any) {
    if (!this.footerButtons[componentName]) {
      this.footerButtons[componentName] = [];
    }
    this.footerButtons[componentName].push({ title: title, icon: icon, onClick: onClick });
  }

  static getFormFooterButtons(componentName: string) {
    return this.footerButtons[componentName] ?? [];
  }

}