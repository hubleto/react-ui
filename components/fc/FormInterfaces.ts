import React from "react";
import { InputProps } from "./Input";

export default interface FormInvalidInput {
  name: string,
  id: number,
}

export interface FormEndpoint {
  describeForm: string,
  getRecord: string,
  saveRecord: string,
  deleteRecord: string,
}

export interface FormPermissions {
  canCreate?: boolean,
  canRead?: boolean,
  canUpdate?: boolean,
  canDelete?: boolean,
}

export interface FormInputs {
  [key: string]: any;
}

export interface FormRecord {
  [key: string]: any;
}

export interface FormUi {
  templateJson?: string,
  title?: string,
  subTitle?: string,
  showSaveButton?: boolean;
  showCopyButton?: boolean;
  showDeleteButton?: boolean;
  saveButtonText?: string,
  addButtonText?: string,
  copyButtonText?: string,
  deleteButtonText?: string,
  headerClassName?: string,
}

export interface FormDescription {
  inputs?: FormInputs,
  defaultValues?: FormRecord,
  permissions?: FormPermissions,
  ui?: FormUi,
  includeRelations?: Array<string>,
}

export interface FormTab {
  title?: string|React.JSX.Element,
  icon?: string,
  cssClass?: string,
  showCountFor?: string,
  isCustom?: boolean,
  subTabs?: Array<FormTab>,
  position?: string,
  content: () => React.JSX.Element,
}

// export interface FormUiComponents {
//   title?: React.JSX.Element,
//   content?: React.JSX.Element,
//   tabs?: FormTabs,
//   saveButton?: React.JSX.Element,
//   closeButton?: React.JSX.Element,
//   printPreviewUiButton?: React.JSX.Element,
//   printPreviewUi?: React.JSX.Element,
//   headerExtraButtons?: React.JSX.Element,
//   footerExtraButtons?: React.JSX.Element,
// }

export interface FormProps {
  activeTabUid?: string,
  children?: any,
  componentName?: string,
  context?: string,
  description?: FormDescription,
  descriptionSource?: FormDescriptionSource,
  endpoint?: FormEndpoint,
  endpointParams?: any,
  folderUrl?: string,
  showInModal?: boolean,
  getContentClassName?: (form: FormMeta) => string,
  getEndpointParams?: (form: FormMeta) => object,
  getEndpointUrl?: (form: FormMeta) => string,
  getRecordFormUrl?: (form: FormMeta) => string,
  getTabs?: (form: FormMeta) => FormTabs,
  id?: any,
  isFullscreen?: boolean,
  isInitialized?: boolean,
  junctionDestinationColumn?: string,
  junctionModel?: string,
  junctionSaveEndpoint?: string,
  junctionSourceColumn?: string,
  junctionSourceRecordId?: number,
  junctionTitle?: string,
  modal?: any,
  model?: string,
  nextId?: any,
  onAfterCopyRecord?: (form: FormMeta, record: FormRecord) => void,
  onAfterDeleteRecord?: (form: FormMeta, saveResponse: any) => void,
  onAfterFormInitialized?: (form: FormMeta) => void,
  onAfterRecordLoaded?: (form: FormMeta, record: FormRecord) => void,
  onAfterSaveRecord?: (form: FormMeta, saveResponse: any, customSaveOptions?: any) => void,
  onBeforeCopyRecord?: (form: FormMeta, record: FormRecord) => FormRecord,
  onBeforeSaveRecord?: (form: FormMeta, record: FormRecord) => FormRecord,
  onChange?: (form: FormMeta, changedRecord: FormRecord) => void,
  onClose?: (form: FormMeta) => void,
  onTabChange?: (form: FormMeta) => void,
  parentApp?: any,
  parentTable?: any,
  permissions?: FormPermissions,
  prevId?: any,
  readonly?: boolean,
  record?: any,
  saveRecordWhenInitialized?: any,
  showOwnerManagerSelector?: boolean,
  showOwnerManagerUi?: boolean,
  showWorkflowUi?: boolean,
  showPreviewUi?: boolean,
  tabs?: FormTabs,
  tag?: string,
  timeline?: Array<any>,
  translationContext?: string,
  translationContextInner?: string,
  uid?: string,
  urlSlug?: string,
  title?: any,

  renderTopMenuButton?: (form: FormMeta, tabUid: string) => React.JSX.Element,
  renderTopInputs?: (form: FormMeta) => React.JSX.Element,
  renderTopMenu?: (form: FormMeta) => React.JSX.Element,
  renderTimeline?: (form: FormMeta, timelineConfig: any) => React.JSX.Element,
  renderTab?: (form: FormMeta, tab: string) => React.JSX.Element,
  renderContent?: (form: FormMeta) => React.JSX.Element,
  renderPrintPreviewUi?: (form: FormMeta) => React.JSX.Element,
  renderHeaderExtraButtons?: (form: FormMeta) => React.JSX.Element,
  renderFooterExtraButtons?: (form: FormMeta) => React.JSX.Element,
  renderSaveButton?: (form: FormMeta) => React.JSX.Element,
  renderCopyButton?: (form: FormMeta) => React.JSX.Element,
  renderDeleteButton?: (form: FormMeta) => React.JSX.Element,
  renderPrevRecordButton?: (form: FormMeta) => React.JSX.Element,
  renderNextRecordButton?: (form: FormMeta) => React.JSX.Element,
  renderFullscreenButton?: (form: FormMeta) => React.JSX.Element,
  renderCloseButton?: (form: FormMeta) => React.JSX.Element,
  renderPrintPreviewUiButton?: (form: FormMeta) => React.JSX.Element,
  renderHeader?: (form: FormMeta) => React.JSX.Element,
  renderHeaderLeft?: (form: FormMeta) => React.JSX.Element,
  renderHeaderRight?: (form: FormMeta) => React.JSX.Element,
  renderFooter?: (form: FormMeta) => React.JSX.Element,
  renderTitle?: (form: FormMeta) => React.JSX.Element,
  renderWarningsOrErrors?: (form: FormMeta) => React.JSX.Element,
  renderSaveErrorMessage?: (form: FormMeta) => React.JSX.Element,
}

export interface FormMeta {
  readonly, model, uid,
  originalRecord: FormRecord,
  invalidInputs: FormInvalidInputs,
  creatingRecord,
  updatingRecord,
  permissions,
  recordChanged,
  savedSuccessfully,
  saveRecord, closeForm,
  loadRecord, id,
  getTitleAsText, setShowPreviewUi, changeRecord,
  showPreviewUi, description,
  changeField, setReadonly,
  recordStore, getRecord,
  activeTabUid

  renderDefaultTopMenuButton: (tabUid: string) => React.JSX.Element,
  renderDefaultTopMenu: () => React.JSX.Element,
  renderDefaultTimeline: (timelineConfig: any) => React.JSX.Element,
  renderDefaultTab: (tab: string) => React.JSX.Element,
  renderDefaultContent: () => React.JSX.Element,
  renderDefaultPrintPreviewUi: () => React.JSX.Element,
  renderDefaultHeaderExtraButtons: () => React.JSX.Element,
  renderDefaultFooterExtraButtons: () => React.JSX.Element,
  renderDefaultSaveButton: () => React.JSX.Element,
  renderDefaultCopyButton: () => React.JSX.Element,
  renderDefaultDeleteButton: () => React.JSX.Element,
  renderDefaultPrevRecordButton: () => React.JSX.Element,
  renderDefaultNextRecordButton: () => React.JSX.Element,
  renderDefaultFullscreenButton: () => React.JSX.Element,
  renderDefaultCloseButton: () => React.JSX.Element,
  renderDefaultPrintPreviewUiButton: () => React.JSX.Element,
  renderDefaultHeader: () => React.JSX.Element,
  renderDefaultHeaderLeft: () => React.JSX.Element,
  renderDefaultHeaderRight: () => React.JSX.Element,
  renderDefaultFooter: () => React.JSX.Element,
  renderDefaultTitle: () => React.JSX.Element,
  renderDefaultWarningsOrErrors: () => React.JSX.Element,
  renderDefaultSaveErrorMessage: () => React.JSX.Element,
};

export type FormTabs = { [key: string]: FormTab; };
export type FormDescriptionSource = 'props' | 'request' | 'both';
export type FormInvalidInputs = Array<FormInvalidInput>;

