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

export interface FormUiComponents {
  title?: React.JSX.Element,
  content?: React.JSX.Element,
  tabs?: FormTabs,
  saveButton?: React.JSX.Element,
  closeButton?: React.JSX.Element,
  printPreviewUiButton?: React.JSX.Element,
  printPreviewUi?: React.JSX.Element,
  headerExtraButtons?: React.JSX.Element,
  footerButtons?: React.JSX.Element,
}

export interface FormProps {
  activeTabUid?: string,
  children?: any,
  componentName?: string,
  description?: FormDescription,
  descriptionSource?: FormDescriptionSource,
  endpoint?: FormEndpoint,
  endpointParams?: any,
  folderUrl?: string,
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
  renderContent?: (form: FormMeta) => any,
  renderTab?: (form: FormMeta) => any,
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
  uiComponents?: FormUiComponents,
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
  translate, saveRecord, closeForm,
  loadRecord, id,
  getTitleAsText, setShowPreviewUi, changeRecord,
  showPreviewUi, description, renderTimeline,
  changeField, setReadonly,
  recordStore, getRecord,
  activeTabUid
};

export type FormTabs = { [key: string]: FormTab; };
export type FormDescriptionSource = 'props' | 'request' | 'both';
export type FormInvalidInputs = Array<FormInvalidInput>;

