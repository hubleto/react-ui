import { FormTab } from '@hubleto/react-ui/core/Form';

export type HubletoAppType = 'community' | 'external' | 'custom';

export default class HubletoApp {
  type: HubletoAppType;
  namespace: string;

  formHeaderButtons: Array<any> = [];
  formTabs: Array<FormTab> = [];

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

  addFormTab(tab: FormTab)
  {
    this.formTabs.push(tab);
  }

  getFormTabs()
  {
    return this.formTabs;
  }

}
