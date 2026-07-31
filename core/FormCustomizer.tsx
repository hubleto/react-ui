export default class FormCustomizer {

  static formHeaderButtons: any = {};
  static formFooterButtons: any = {};

  static addFormHeaderButton(componentName: string, title: string, icon: string, onClick: any) {
    if (!this.formHeaderButtons[componentName]) {
      this.formHeaderButtons[componentName] = [];
    }
    this.formHeaderButtons[componentName].push({ title: title, icon: icon, onClick: onClick });
  }

  static getFormHeaderButtons(componentName: string) {
    return this.formHeaderButtons[componentName] ?? [];
  }

  static addFormFooterButton(componentName: string, title: string, icon: string, onClick: any) {
    if (!this.formFooterButtons[componentName]) {
      this.formFooterButtons[componentName] = [];
    }
    this.formFooterButtons[componentName].push({ title: title, icon: icon, onClick: onClick });
  }

  static getFormFooterButtons(componentName: string) {
    return this.formFooterButtons[componentName] ?? [];
  }

}