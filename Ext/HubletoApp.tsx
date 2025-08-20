export type HubletoAppType = 'community' | 'external' | 'custom';

export default class HubletoApp {
  type: HubletoAppType;
  namespace: string;

  formHeaderButtons: Array<any> = [];

  constructor() {
  }

  init() {
    //
  }

  addFormHeaderButton(title: string, onClick: any)
  {
    this.formHeaderButtons.push({ title: title, onClick: onClick });
  }

  getFormHeaderButtons()
  {
    return this.formHeaderButtons;
  }

}
