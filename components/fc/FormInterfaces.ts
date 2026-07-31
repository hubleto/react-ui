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
  uid: string,
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
  title?: () => React.JSX.Element;
  tabs?: FormTabs,
}

export interface FormProps {
  activeTab?: number,
  activeTabUid?: string,
  children?: any,
  componentName?: string,
  creatingRecord: boolean,
  customEndpointParams?: any,
  deleteButtonDisabled: boolean,
  deletingRecord: boolean,
  description?: FormDescription,
  descriptionSource?: FormDescriptionSource,
  endpoint?: FormEndpoint,
  folderUrl?: string,
  getContentClassName?: (form: any) => string,
  getEndpointParams?: (form: any) => object,
  getEndpointUrl?: (form: any) => string,
  getInputProps?: (form: any, inputName: string, customInputProps?: any) => InputProps,
  getRecordFormUrl?: (form: any) => string,
  getTabs?: (form: any) => FormTabs,
  hideOverlay?: boolean,
  htmlPreview?: any,
  id?: any,
  invalidInputs: FormInvalidInputs,
  isFullscreen: boolean,
  isInitialized?: boolean,
  isInlineEditing?: boolean,
  junctionDestinationColumn?: string,
  junctionModel?: string,
  junctionSaveEndpoint?: string,
  junctionSourceColumn?: string,
  junctionSourceRecordId?: number,
  junctionTitle?: string,
  loadRecordError: any,
  modal?: any,
  model: string,
  nextId?: any,
  onAfterCopyRecord?: (form: any, record: FormRecord) => void,
  onAfterDeleteRecord?: (form: any, saveResponse: any) => void,
  onAfterFormInitialized?: (form: any) => void,
  onAfterRecordLoaded: (record: FormRecord) => FormRecord,
  onAfterSaveRecord?: (form: any, saveResponse: any, customSaveOptions?: any) => void,
  onBeforeCopyRecord?: (form: any, record: FormRecord) => FormRecord,
  onBeforeSaveRecord?: (form: any, record: FormRecord) => FormRecord,
  onChange?: (form: any, changedRecord: FormRecord) => void,
  onClose?: (form: any) => void,
  onTabChange?: (form: any) => void,
  originalRecord: FormRecord,
  parentApp?: any,
  parentTable?: any,
  permissions: FormPermissions,
  prevId?: any,
  readonly?: boolean,
  record?: any,
  recordChanged: boolean,
  recordDeleted: boolean,
  renderContent?: (form: any) => any,
  renderTab?: (form: any) => any,
  savedSuccessfully: boolean,
  saveError: any,
  saveRecordWhenInitialized?: any,
  showFooter?: boolean,
  showHeader?: boolean,
  showInModal?: boolean,
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
  updatingRecord: boolean,
  urlSlug?: string,
  uiComponents: FormUiComponents,
}

export interface FormContext extends FormProps {
  getCustomTabs: () => FormTabs,
  getEndpointParams: () => object,
  getEndpointUrl: (action: string) => string,
  getRecordFormUrl: () => string,
  getInputProps: (inputName: string, customInputProps?: any) => InputProps,
  renderDivider: (content: any) => React.JSX.Element,
  renderTab: (tab: string) => null|React.JSX.Element,
  changeRecord: (changedValues: any, onSuccess?: any) => void,
  loadRecord: () => void;
}

export type FormTabs = { [key: string]: FormTab; };
export type FormDescriptionSource = 'props' | 'request' | 'both';
export type FormInvalidInputs = Array<FormInvalidInput>;

