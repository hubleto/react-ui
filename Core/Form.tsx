import React, { Component } from 'react';
import * as uuid from 'uuid';

import { ProgressBar } from 'primereact/progressbar';
import { Tooltip } from 'primereact/tooltip';
import request from "./Request";

import { deepObjectMerge } from "./Helper";

import TranslatedComponent from "./TranslatedComponent";
import { InputProps } from "./Input";
import { InputFactory } from "./InputFactory";

interface Content {
  [key: string]: ContentCard | any;
}

interface ContentCard {
  title: string
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

export interface FormTabs {
  title: string,
  icon: string,
}

export interface FormProps {
  isInitialized?: boolean,
  parentTable?: any,
  uid?: string,
  model: string,
  id?: any,
  prevId?: any,
  nextId?: any,
  readonly?: boolean,
  content?: Content,
  hideOverlay?: boolean,
  showInModal?: boolean,
  showInModalSimple?: boolean,
  isInlineEditing?: boolean,
  customEndpointParams?: any,

  tabs?: FormTabs,
  activeTab?: string,

  tag?: string,
  context?: any,
  children?: any,

  description?: FormDescription,
  descriptionSource?: 'props' | 'request' | 'both',
  endpoint?: FormEndpoint,

  onChange?: (input: any, value: any) => void,
  onClose?: () => void,
  onSaveCallback?: (form: Form<FormProps, FormState>, saveResponse: any) => void,
  onCopyCallback?: (form: Form<FormProps, FormState>, saveResponse: any) => void,
  onDeleteCallback?: (form: Form<FormProps, FormState>, saveResponse: any) => void,
}

export interface FormState {
  isInitialized: boolean,
  id?: any,
  prevId?: any,
  nextId?: any,
  readonly?: boolean,
  content?: Content,

  tabs?: FormTabs,
  activeTab?: string,

  description: FormDescription,
  record: FormRecord,
  endpoint: FormEndpoint,
  customEndpointParams: any,

  creatingRecord: boolean,
  updatingRecord: boolean,
  deletingRecord: boolean,
  recordDeleted: boolean,
  deleteButtonDisabled: boolean,
  isInlineEditing: boolean,
  invalidInputs: Object,
  folderUrl?: string,
  params: any,
  invalidRecordId: boolean,

  recordChanged: boolean,

  permissions: FormPermissions,
}

export default class Form<P, S> extends TranslatedComponent<FormProps, FormState> {
  static defaultProps = {
    uid: '_form_' + uuid.v4().replace('-', '_'),
    descriptionSource: 'both',
  }

  props: FormProps;
  state: FormState;

  newState: any;

  model: string;
  components: Array<React.JSX.Element> = [];
  translationContext: string = 'form';

  // DEPRECATED
  jsxContentRendered: boolean = false;
  jsxContent: JSX.Element;

  inputs: any = {};

  constructor(props: FormProps) {
    super(props);

    if (this.props.uid) {
      globalThis.main.reactElements[this.props.uid] = this;
    }

    this.state = this.getStateFromProps(props);
  }

  getStateFromProps(props: FormProps) {
    const isCreatingRecord: boolean = props.id ? props.id == -1 : false;
    return {
      isInitialized: false,
      endpoint: props.endpoint ? props.endpoint : (globalThis.main.config.defaultFormEndpoint ?? {
        describeForm: 'api/form/describe',
        saveRecord: 'api/record/save',
        deleteRecord: 'api/record/delete',
        getRecord: 'api/record/get',
      }),
      id: props.id,
      prevId: props.prevId,
      nextId: props.nextId,
      readonly: props.readonly,
      description: props.description ?? {
        inputs: {},
        defaultValues: {},
        permissions: this.calculatePermissions(),
        ui: {},
      },
      content: props.content,
      creatingRecord: isCreatingRecord,
      updatingRecord: !isCreatingRecord,
      deletingRecord: false,
      recordDeleted: false,
      isInlineEditing: props.isInlineEditing ? props.isInlineEditing : isCreatingRecord,
      invalidInputs: {},
      record: {},
      params: null,
      invalidRecordId: false,
      customEndpointParams: props.customEndpointParams ?? {},
      recordChanged: false,
      deleteButtonDisabled: false,
      permissions: this.calculatePermissions(),
      tabs: this.props.tabs,
      activeTab: this.props.activeTab,
    };
  }

  calculatePermissions(customPermissions?: any) {
    const record = this.state?.record;
    let permissions = { canCreate: false, canRead: false, canUpdate: false, canDelete: false };

    if (record && record._PERMISSIONS) {
      permissions.canCreate = record._PERMISSIONS[0];
      permissions.canRead = record._PERMISSIONS[1];
      permissions.canUpdate = record._PERMISSIONS[2];
      permissions.canDelete = record._PERMISSIONS[3];
    }

    if (this.state?.description?.permissions) {
      const p = this.state.description.permissions;
      if (p.canCreate) permissions.canCreate = p.canCreate;
      if (p.canRead) permissions.canRead = p.canRead;
      if (p.canUpdate) permissions.canUpdate = p.canUpdate;
      if (p.canDelete) permissions.canDelete = p.canDelete;
    }

    if (this.props?.description?.permissions) {
      const p = this.props.description.permissions;
      if (p.canCreate) permissions.canCreate = p.canCreate;
      if (p.canRead) permissions.canRead = p.canRead;
      if (p.canUpdate) permissions.canUpdate = p.canUpdate;
      if (p.canDelete) permissions.canDelete = p.canDelete;
    }

    if (customPermissions) {
      const p = customPermissions;
      if (p.canCreate) permissions.canCreate = p.canCreate;
      if (p.canRead) permissions.canRead = p.canRead;
      if (p.canUpdate) permissions.canUpdate = p.canUpdate;
      if (p.canDelete) permissions.canDelete = p.canDelete;
    }

    return permissions;
  }

  /**
   * This function trigger if something change, for Form id of record
   */
  componentDidUpdate(prevProps: FormProps, prevState: FormState) {
    let newState: any = {};
    let setNewState: boolean = false;

    if (this.props.isInitialized != prevProps.isInitialized) {
      newState.isInitialized = this.props.isInitialized;
      setNewState = true;
    }

    if (prevProps.id !== this.props.id) {
      newState = this.getStateFromProps(this.props);
      newState.id = this.props.id;

      // this.checkIfIsEdit();
      this.loadFormDescription();

      newState.invalidInputs = {};
      newState.creatingRecord = this.props.id ? this.props.id <= 0 : false;
      newState.updatingRecord = this.props.id ? this.props.id > 0 : false;
      setNewState = true;
    }

    if (setNewState) {
      this.setState(newState);
    }
  }

  componentDidMount() {
    this.loadFormDescription();
  }

  getEndpointUrl(action: string) {
    return this.state.endpoint[action] ?? '';
  }

  getEndpointParams(): object {
    return {
      model: this.props.model,
      id: this.state.id ? this.state.id : 0,
      tag: this.props.tag,
      includeRelations: this.state.description?.includeRelations,
      __IS_AJAX__: '1',
      ...this.state.customEndpointParams
    };
  }

  onAfterLoadFormDescription(description: FormDescription): FormDescription {
    return description;
  }

  loadFormDescription() {

    request.post(
      this.getEndpointUrl('describeForm'),
      this.getEndpointParams(),
      {},
      (description: any) => {

        if (this.props.description && this.props.descriptionSource == 'both') description = deepObjectMerge(description, this.props.description);

        // const defaultValues = deepObjectMerge(this.state.description.defaultValues ?? {}, description.defaultValues);

        description = this.onAfterLoadFormDescription(description);
        const newPermissions = this.calculatePermissions(description?.permissions);

        this.setState({
          description: description,
          readonly: !(newPermissions.canUpdate || newPermissions.canCreate),
          permissions: newPermissions,
        }, () => {
          if (this.state.id !== -1) {
            this.loadRecord();
          } else {
            this.setRecord(description.defaultValues ?? {});
          }
        });
      }
    );
  }

  reload() {
    this.setState({isInitialized: false}, () => {
      this.loadFormDescription();
    });
  }

  loadRecord() {
    request.post(
      this.getEndpointUrl('getRecord'),
      this.getEndpointParams(),
      {},
      (record: any) => {
        if (this.state.id != -1 && !record.id) {
          this.setState({isInitialized: true, invalidRecordId: true});
        } else {
          this.setRecord(record);
        }
      }
    );
  }

  setRecord(record: any) {
    record = this.onAfterRecordLoaded(record);
    let p = this.calculatePermissions();

    this.setState({
      isInitialized: true,
      record: record,
      permissions: p,
      readonly: !(p.canUpdate || p.canCreate),
    }, () => {
      this.onAfterFormInitialized();
    });
  }

  onBeforeSaveRecord(record) {
    // to be overriden
    return record;
  }

  onAfterSaveRecord(saveResponse) {
    if (this.props.onSaveCallback) this.props.onSaveCallback(this, saveResponse);
  }

  onAfterCopyRecord(copyResponse) {
    if (this.props.onCopyCallback) this.props.onCopyCallback(this, copyResponse);
  }

  onAfterDeleteRecord(deleteResponse) {
    if (this.props.onDeleteCallback) this.props.onDeleteCallback(this, deleteResponse);
  }

  saveRecord() {
    this.setState({invalidInputs: {}});

    let record = { ...this.state.record, id: this.state.id };

    (this.state.record._RELATIONS ?? []).map((relName) => {
      if (!(this.state.description?.includeRelations ?? []).includes(relName)) {
        delete record[relName];
      }
    });

    record = this.onBeforeSaveRecord(record);

    request.post(
      this.getEndpointUrl('saveRecord'),
      { ...this.getEndpointParams(), record: record },
      {},
      (saveResponse: any) => {
        this.setState({
          record: saveResponse.savedRecord,
          id: saveResponse.savedRecord.id,
          recordChanged: false,
          updatingRecord: true,
          creatingRecord: false,
        });
        this.onAfterSaveRecord(saveResponse);
      },
      (err: any) => {
        if (err.status == 422) {
          this.setState({invalidInputs: err.data.invalidInputs});
        }
      }
    );
  }

  copyRecord() {
    request.post(
      this.getEndpointUrl('saveRecord'),
      { ...this.getEndpointParams(), record: { ...this.state.record, id: -1 } },
      {},
      (saveResponse: any) => { this.onAfterCopyRecord(saveResponse); },
      (err: any) => {
        alert('An error ocured while copying the record.');
      }
    );
  }

  deleteRecord() {
    request.post(
      this.getEndpointUrl('deleteRecord'),
      {
        ...this.getEndpointParams(),
        hash: this.state.record._idHash_ ?? '',
      },
      {},
      (saveResponse: any) => {
        this.setState({deletingRecord: false, recordDeleted: true});
        this.onAfterDeleteRecord(saveResponse);
      },
      (err: any) => {
        this.setState({deletingRecord: false});
      }
    );
  }

  normalizeRecord(record: any): any {
    return record;
  }

  updateRecord(changedValues: any, onSuccess?: any) {
    const record = this.normalizeRecord(this.state.record);
    this.setState({recordChanged: true, record: deepObjectMerge(record, changedValues)}, onSuccess);
  }

  onAfterRecordLoaded(record: any) {
    return record;
  }

  onAfterFormInitialized() {
  }

  closeForm() {
    if (this.props.onClose) {
      this.props.onClose();
    } else {
    }
  }

  renderTopMenu(): null|JSX.Element {
    if (this.state.tabs && Object.keys(this.state.tabs).length > 1) {
      const tabs = this.state.tabs ?? {};
      const activeTab = this.state.activeTab ?? 'default';
      return <>{Object.keys(tabs).map((i: any) => {
        return <button
          key={i}
          className={"btn " + (activeTab == i ? "btn-primary" : "btn-transparent")}
          onClick={() => { this.setState({activeTab: i}); }}
        >
          {tabs[i].icon ? <span className="icon"><i className={tabs[i].icon}></i></span> : null}
          <span className="text">{tabs[i].title}</span>
        </button>;
      })}</>;
    } else {
      return null;
    }
  }

  renderTemplateElement(elRenderer: string, elData: any): JSX.Element {
    switch (elRenderer) {
      case 'form.columns':
        if (!elData.props) elData.props = {};
        elData.props.className = (elData.props?.className ?? '') + ' flex gap-2 flex-col md:flex-row';
        return React.createElement('div', elData.props, this.renderFromTemplate(elData.columns));
      break;
      case 'form.column':
        if (!elData.props) elData.props = {};
        elData.props.className = (elData.props?.className ?? '') + ' w-full flex gap-2 flex-col';
        return React.createElement('div', elData.props, this.renderFromTemplate(elData.items));
      break;
      case 'form.text':
        return <div>{elData}</div>;
      break;
      case 'form.divider':
        return this.divider(elData.text);
      break;
      case 'form.input':
        return this.inputWrapper(elData.input);
      break;
      default:
        return <>Unknown element renderer: {elRenderer}</>;
      break;
    }
  }

  renderFromTemplate(template: any): Array<JSX.Element> {
    let content: Array<JSX.Element> = [];
    Object.keys(template).map((elDefinition: string) => {
      let tmp = elDefinition.split('#');
      let elRenderer = tmp[0] ?? '';
      let elId = tmp[1] ?? '';
      let elData = template[elDefinition] ?? null;

      content.push(this.renderTemplateElement(elRenderer, { elId, ...elData }));
    });

    return content;
  }

  renderTab(tab: string): null|JSX.Element {
    let template: any = {};

    if (this.state.description?.ui?.templateJson) {
      try {
        template = JSON.parse(this.state.description?.ui?.templateJson);
      } catch(ex) {
        console.error('Failed to render form from template.');
        console.error(this.state.description?.ui?.templateJson);
        return <div>Failed to render form from template. Check console for more details.</div>;
      }
    } else {
      template = null;
    }

    let tabTemplate = template && template.tabs && template.tabs[tab] ? template.tabs[tab] : null;

    if (tab == 'default' && !tabTemplate) {
      let tabInputs = {};

      Object.keys(this.state.description?.inputs ?? {}).map((inputName: string) => {
        tabInputs['form.input#' + inputName] = {input: inputName};
      });
      tabTemplate = {'form.column': { items: tabInputs } };
    }

    //@ts-ignore
    return this.renderFromTemplate(tabTemplate);
  }

  /**
   * Render content
   */
  renderContent(): null|JSX.Element {
    return this.renderTab(this.state.activeTab ?? 'default');
  }

  getInputProps(inputName: string, customInputProps?: any): InputProps {
    const record = this.state.record ?? {};
    const inputs = this.state.description?.inputs ?? {};
    const inputDescription = inputs[inputName] ?? {};
    const formDescription = this.state.description;

    // let customInputPropsWithoutOnchange = customInputProps;
    // delete customInputPropsWithoutOnchange.onChange;

    let value = null;
    if (this.state.updatingRecord) value = record[inputName];
    else value = record[inputName] ?? (formDescription.defaultValues ? formDescription.defaultValues[inputName] : null);

    return {
      inputName: inputName,
      inputClassName: '',
      record: record,
      description: inputDescription,
      value: value,
      invalid: this.state.invalidInputs[inputName] ?? false,
      cssClass: inputs[inputName]?.cssClass,
      readonly: this.props.readonly || inputs[inputName]?.readonly || inputs[inputName]?.disabled,
      uid: this.props.uid + '_' + uuid.v4(),
      parentForm: this,
      context: this.props.context ? this.props.context : this.props.uid,
      isInitialized: false,
      isInlineEditing: this.state.isInlineEditing,
      showInlineEditingButtons: false, // !this.state.isInlineEditing,
      ...inputs[inputName]?.extendedProps,
      ...customInputProps,
      onInlineEditCancel: () => { },
      onInlineEditSave: () => { this.saveRecord(); },
      onChange: (input: any, value: any) => {
        let record = {...this.state.record};
        record[inputName] = value;
        this.setState({record: record, recordChanged: true}, () => {
          if (this.props.onChange) this.props.onChange(input, value);
          if (customInputProps && customInputProps.onChange) customInputProps.onChange(input, value);
        });
      },
    };
  }

  /**
   * Render different input types
   */
  input(inputName: string, customInputProps?: any): JSX.Element {
    const inputProps = this.getInputProps(inputName, customInputProps);
    return InputFactory(inputProps);
  }

  inputWrapper(inputName: string, customInputProps?: any) {
    const inputProps = this.getInputProps(inputName, customInputProps);

    return this.inputWrapperCustom(
      inputName,
      inputProps,
      inputProps.description?.title ?? '',
      <>
        {this.input(inputName, customInputProps)}
        {inputProps.description?.info
          ? <>
            <Tooltip target={'#' + this.props.uid + '_' + inputName + ' .input-info'} />
            <i
              className="input-info fas fa-info"
              data-pr-tooltip={inputProps.description.info}
              data-pr-position="top"
            ></i>
          </>
          : null
        }
      </>
    );
  }

  inputWrapperCustom(inputName: string, inputProps: any, label: string|JSX.Element, body: string|JSX.Element): JSX.Element {
    return <>
      <div
        id={this.props.uid + '_' + inputName}
        className={"input-wrapper" + (inputProps.description?.required == true ? " required" : "")}
        key={inputName}
      >
        <label className="input-label" htmlFor={this.props.uid + '_' + inputName}>
          {label}
        </label>

        <div className="input-body" key={inputName}>
          {body}
        </div>

        {inputProps.description?.description
          ? <div className="input-description">{inputProps.description?.description}</div>
          : null
        }
      </div>
    </>;
  }

  divider(content: any): JSX.Element {
    return <div className="divider"><div><div><div></div></div><div><span>{content}</span></div></div></div>;
  }

  renderSaveButton(): null|JSX.Element {
    let id = this.state.id ? this.state.id : 0;
    let showButton = 
      this.state.description?.ui?.showSaveButton
      && (id <= 0 && this.state.permissions.canCreate || id > 0 && this.state.permissions.canUpdate)
    ;

    return <>
      {showButton ? <button onClick={() => this.saveRecord()} className="btn btn-add">
        {this.state.updatingRecord
          ? <>
            <span className="icon"><i className="fas fa-save"></i></span>
            <span className="text">
              {this.state.description?.ui?.saveButtonText ?? this.translate("Save", 'Hubleto\\Core\\Loader::Components\\Form')}
            </span>
            {this.state.recordChanged ? <span className="text">*</span> : null}
          </> : <>
            <span className="icon"><i className="fas fa-plus"></i></span>
            <span className="text">
              {this.state.description?.ui?.addButtonText ?? this.translate("Add", 'Hubleto\\Core\\Loader::Components\\Form')}
            </span>
            {this.state.recordChanged ? <span className="text">*</span> : null}
          </>
        }
      </button> : null}
    </>;
  }

  renderCopyButton(): null|JSX.Element {
    let id = this.state.id ? this.state.id : 0;

    return <>
      {this.state.description?.ui?.showCopyButton && this.state.permissions.canCreate ? <button
        onClick={() => this.copyRecord()}
        className={"btn btn-transparent"}
      >
        <span className="icon"><i className="fas fa-save"></i></span>
        <span className="text"> {this.state.description?.ui?.copyButtonText ?? this.translate("Copy", 'Hubleto\\Core\\Loader::Components\\Form')}</span>
      </button> : null}
    </>;
  }

  renderDeleteButton(): null|JSX.Element {
    return <>
      {this.state.updatingRecord && this.state.description?.ui?.showDeleteButton && this.state.permissions.canDelete ? <button
        onClick={() => {
          if (!this.state.deleteButtonDisabled) {
            if (this.state.deletingRecord) this.deleteRecord();
            else {
              this.setState({deletingRecord: true, deleteButtonDisabled: true});
              setTimeout(() => this.setState({deleteButtonDisabled: false}), 1000);
            }
          }
        }}
        className={
          "btn "
          + (this.state.deletingRecord ? "font-bold" : "") + " " + (this.state.deleteButtonDisabled ? "btn-light" : "btn-delete")
          + " hidden md:flex"
        }
      >
        <span className="icon"><i className="fas fa-trash-alt"></i></span>
        <span className="text text-nowrap">
          {this.state.deletingRecord ?
            this.translate("Confirm delete", 'Hubleto\\Core\\Loader::Components\\Form')
            : this.state.description?.ui?.deleteButtonText ?? this.translate("Delete", 'Hubleto\\Core\\Loader::Components\\Form')
          }
        </span>
      </button> : null}
    </>;
  }

  renderPrevRecordButton(): null|JSX.Element {
    const prevId = this.state?.prevId ?? 0;

    return (
      <button
        onClick={() => {
          if (prevId && this.props.parentTable) {
            this.props.parentTable.openForm(prevId);
          }
        }}
        className={"btn btn-transparent" + (prevId ? "" : " btn-disabled")}
      >
        <span className="icon"><i className="fas fa-angle-left"></i></span>
      </button>
    );
  }

  renderNextRecordButton(): null|JSX.Element {
    const nextId = this.state?.nextId ?? 0;

    return (
      <button
        onClick={() => {
          if (nextId && this.props.parentTable) {
            this.props.parentTable.openForm(nextId);
          }
        }}
        className={"btn btn-transparent" + (nextId ? "" : " btn-disabled")}
      >
        <span className="icon"><i className="fas fa-angle-right"></i></span>
      </button>
    );
  }

  renderEditButton(): null|JSX.Element {
    return <>
      {this.state.permissions.canUpdate ? <button
        onClick={() => this.setState({ isInlineEditing: true })}
        className="btn btn-edit"
      >
        <span className="icon"><i className="fas fa-pencil-alt"></i></span>
        <span className="text">{this.translate('Edit', 'Hubleto\\Core\\Loader::Components\\Form')}</span>
      </button> : null}
    </>;
  }

  renderCloseButton(): null|JSX.Element {
    return (
      <button
        className="btn btn-close"
        type="button"
        data-dismiss="modal"
        aria-label="Close"
        onClick={() => {
          let ok = true;
          if (this.state.recordChanged) ok = confirm('You have unsaved changes. Are you sure to close?');
          if (ok) this.closeForm();
        }}
      ><span className="icon"><i className="fas fa-xmark"></i></span></button>
    );
  }

  renderHeaderLeft(): null|JSX.Element {
    return <>{this.state.isInlineEditing ? this.renderSaveButton() : this.renderEditButton()}</>;
  }

  renderHeaderRight(): null|JSX.Element {
    return <>
      {this.renderDeleteButton()}
      {this.props.showInModal ? this.renderCloseButton() : null}
    </>;
  }

  renderFooter(): null|JSX.Element {
    const prevId = this.state?.prevId ?? 0;
    const nextId = this.state?.nextId ?? 0;

    return <>
      {prevId || nextId ? <>
        <div className="pr-4">
          {this.renderPrevRecordButton()}
          {this.renderNextRecordButton()}
        </div>
      </> : null}
    </>;
  }

  renderSubTitle(): null|JSX.Element {
    let subTitle = this.state.description?.ui?.subTitle;
    if (subTitle) {
      return <small>{subTitle}</small>;
    } else {
      return <></>;
    }
  }

  renderTitle(): null|JSX.Element {
    let title = this.state.description?.ui?.title ??
      (this.state.updatingRecord
        ? this.translate('Record', 'Hubleto\\Core\\Loader::Components\\Form') + ' #' + (this.state.record?.id ?? '-')
        : this.translate('New record', 'Hubleto\\Core\\Loader::Components\\Form')
      )
    ;

    return <>
      <h2>{title}</h2>
      {this.renderSubTitle()}
    </>
  }

  renderWarningsOrErrors(): null|JSX.Element {
    if (this.state.recordDeleted) {
      return <>
        <div className="alert alert-danger m-1">
          Record has been deleted.
        </div>
      </>
    }

    if (!this.state.isInitialized || !this.state.record) {
      return (
        <div className="p-4 h-full flex items-center">
          <ProgressBar mode="indeterminate" style={{ flex: 1, height: '30px' }}></ProgressBar>
        </div>
      );
    }

    if (this.state.invalidRecordId) {
      return <>
        <div className="alert alert-danger m-1">
          Unable to load record.
        </div>
      </>
    }

    return null;
  }

  render() {
    try {
      globalThis.main.setTranslationContext(this.translationContext);

      const warningsOrErrors = this.renderWarningsOrErrors();

      const formTitle = this.renderTitle();
      const formContent = (warningsOrErrors ? warningsOrErrors : this.renderContent());
      const formFooter = this.renderFooter();
      const formTopMenu = (this.state.isInitialized ? this.renderTopMenu() : null);
      const headerLeft = (warningsOrErrors ? null : this.renderHeaderLeft());
      const headerRight = (warningsOrErrors ? this.renderCloseButton() : this.renderHeaderRight());

      if (this.props.showInModal) {
        return <>
          <div className={"modal-header " + this.state.description?.ui?.headerClassName ?? ''}>
            <div className="modal-header-left">{headerLeft}</div>
            <div className="modal-header-title">{formTitle}</div>
            <div className="modal-header-right">{headerRight}</div>
          </div>
          {formTopMenu ? <div className="modal-top-menu">{formTopMenu}</div> : null}
          <div className="modal-body">
            {formContent}
          </div>
          {formFooter ? <div className="modal-footer">{formFooter}</div> : null}
        </>;
      } else {
        return <>
          <div id={"hubleto-form-" + this.props.uid} className="hubleto component form">
            <div className="form-header">
              <div className="form-header-left">{headerLeft}</div>
              <div className="form-header-title">{formTitle}</div>
              <div className="form-header-right">{headerRight}</div>
            </div>
            {formTopMenu ? <div className="form-top-menu">{formTopMenu}</div> : null}
            <div className="form-body">
              {formContent}
            </div>
            {formFooter ? <div className="form-footer">{formFooter}</div> : null}
          </div>
        </>;
      }
    } catch(e) {
      console.error('Failed to render form.');
      console.error(e);
      return <div className="alert alert-danger">Failed to render form. Check console for error log.</div>
    }
  }
}
