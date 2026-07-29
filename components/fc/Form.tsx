import React, { Component, useState, useCallback, useEffect, useRef } from 'react';
import { flushSync } from 'react-dom';
import * as uuid from 'uuid';
import moment from "moment";

import request from "../../core/Request";
import Spinner from "../cc/Spinner";
import App from '../../core/App';

import { deepObjectMerge } from "../../core/Helper";
import { useTranslation } from './TranslatedComponent';
import ErpWorkflowSelector from '../cc/ErpWorkflowSelector';
import ModalSimple from "../cc/ModalSimple";
import HtmlFrame from "../cc/HtmlFrame";

import { InputProps } from "./Input";
import InputLookup from "../cc/Inputs/Lookup";
import InputVarchar from "./Inputs/Varchar";
import InputPassword from "../cc/Inputs/Password";
import InputTextarea from "../cc/Inputs/Textarea";
import InputInt from "./Inputs/Int";
import InputBoolean from "../cc/Inputs/Boolean";
import InputColor from "../fc/Inputs/Color";
import InputFile from "../cc/Inputs/File";
import InputImage from "../cc/Inputs/Image";
import InputTags from "../cc/Inputs/Tags2";
import InputDateTime from "../cc/Inputs/DateTime";
import InputEnumValues from "../cc/Inputs/EnumValues";

interface Content {
  [key: string]: ContentCard | any;
}

interface ContentCard {
  title: string
}

interface InvalidInput {
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
  onRender?: (form: any) => React.JSX.Element,
}

export type FormTabs = Array<FormTab>;

export interface FormProps {
  activeTab?: number,
  activeTabUid?: string,
  children?: any,
  componentName?: string,
  content?: Content,
  creatingRecord: boolean,
  customEndpointParams?: any,
  deleteButtonDisabled: boolean,
  deletingRecord: boolean,
  description?: FormDescription,
  descriptionSource?: 'props' | 'request' | 'both',
  endpoint?: FormEndpoint,
  folderUrl?: string,
  getRecordFormUrl?: (form: any) => string,
  hideOverlay?: boolean,
  id?: any,
  invalidInputs: Array<InvalidInput>,
  invalidRecordId: boolean,
  isFullscreen: boolean,
  isInitialized?: boolean,
  isInlineEditing?: boolean,
  loadRecordError: any,
  modal?: any,
  model: string,
  nextId?: any,
  onChange?: (form: any, changedRecord: FormRecord) => void,
  onClose?: (form: any) => void,
  onAfterCopyRecord?: (form: any, record: FormRecord) => void,
  onAfterDeleteRecord?: (form: any, saveResponse: any) => void,
  onAfterFormInitialized?: (form: any) => void,
  onAfterRecordLoaded: (record: FormRecord) => FormRecord,
  onAfterSaveRecord?: (form: any, saveResponse: any, customSaveOptions?: any) => void,
  onBeforeCopyRecord?: (form: any, record: FormRecord) => FormRecord,
  onBeforeSaveRecord?: (form: any, record: FormRecord) => FormRecord,
  onTabChange?: (form: any) => void,
  originalRecord: FormRecord,
  params: any,
  parentTable?: any,
  permissions: FormPermissions,
  prevId?: any,
  readonly?: boolean,
  record?: any,
  recordChanged: boolean,
  recordDeleted: boolean,
  renderContent?: (form: any) => any,
  renderTab?: (form: any) => any,
  renderTitle?: (form: any) => any,
  renderSubTitle?: (form: any) => any,
  saveRecordWhenInitialized?: any,
  savedSuccessfully: boolean,
  saveError: any,
  showFooter?: boolean,
  showHeader?: boolean,
  showInModal?: boolean,
  tabs?: Array<FormTab>,
  tag?: string,
  uid?: string,
  updatingRecord: boolean,
  translationContext?: string,
  translationContextInner?: string,

  junctionTitle?: string,
  junctionModel?: string,
  junctionSourceColumn?: string,
  junctionDestinationColumn?: string,
  junctionSourceRecordId?: number,
  junctionSaveEndpoint?: string,
  renderWorkflowUi?: boolean,
  renderOwnerManagerUi?: boolean,
  renderPreviewUi?: boolean,
  timeline?: Array<any>,

  showOwnerManagerSelector?: boolean,
  showPreviewUi?: boolean,
  htmlPreview?: any,

  parentApp?: any,
}

export class FormCustomizer {

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

export default React.memo((props: FormProps) => {

  const isCreatingRecord = (id: any): boolean => { return id ? id == -1 : false; };
  const getCallback = (callback: string): any => {
    return (props[callback] ?? defaultCallbacks[callback]);
  }
  const { translate } = useTranslation(props.translationContext, props.translationContextInner);
  const calculatePermissions = (record: any) => {
    if (!record) return {
      canCreate: true,
      canRead: true,
      canUpdate: true,
      canDelete: true,
    };

    let permissions = { canCreate: false, canRead: false, canUpdate: false, canDelete: false };

    permissions.canCreate = record._PERMISSIONS ? record._PERMISSIONS[0] ?? true : true;
    permissions.canRead = record._PERMISSIONS ? record._PERMISSIONS[1] ?? true : true;
    permissions.canUpdate = record._PERMISSIONS ? record._PERMISSIONS[2] ?? true : true;
    permissions.canDelete = record._PERMISSIONS ? record._PERMISSIONS[3] ?? true : true;

    if (description?.permissions) {
      const p = description.permissions;
      permissions.canCreate = permissions.canCreate && (p.canCreate ?? true);
      permissions.canRead = permissions.canRead && (p.canRead ?? true);
      permissions.canUpdate = permissions.canUpdate && (p.canUpdate ?? true);
      permissions.canDelete = permissions.canDelete && (p.canDelete ?? true);
    }

    if (description?.permissions) {
      const p = description.permissions;
      permissions.canCreate = permissions.canCreate && (p.canCreate ?? true);
      permissions.canRead = permissions.canRead && (p.canRead ?? true);
      permissions.canUpdate = permissions.canUpdate && (p.canUpdate ?? true);
      permissions.canDelete = permissions.canDelete && (p.canDelete ?? true);
    }

    return permissions;
  }

  const getEndpointUrl = (action: string) => {
    return endpoint[action as keyof FormEndpoint] ?? '';
  }

  const getEndpointParams = (): object => {
    return {
      model: model,
      id: id,
      tag: tag,
      includeRelations: description?.includeRelations,
      __IS_AJAX__: '1',
      ...customEndpointParams
    };
  }

  const getParentApp = (): App => {
    if (typeof props.parentApp == 'string') return globalThis.hubleto.getApp(props.parentApp);
    else return props.parentApp;
  }

  const getTabsLeft = (): FormTabs => {
    return props.tabs ?? [];
  }

  const getCustomTabs = (): FormTabs => {
    return getParentApp()?.getCustomFormTabs() ?? [];
  }

  const getTabsRight = (): FormTabs => {
    return [];
  }

  const getTabs = (): FormTabs => {
    return [
      ...getTabsLeft(),
      ...getCustomTabs(),
      ...getTabsRight(),
    ];
  }

  const getTitleAsText = (): string => {
    return model.split('/').pop() + ' ' + record.id;
  }

  const getRecordFormUrl = (): string => {
    return props.getRecordFormUrl ? props.getRecordFormUrl(_this) : '';
  }

  const defaultCallbacks = {
    onChange: (form: any, changedRecord: FormRecord) => {},
    onClose: (form: any) => {},
    onAfterCopyRecord: (form: any, record: FormRecord) => {},
    onAfterDeleteRecord: (form: any, saveResponse: any) => {},
    onAfterFormInitialized: (form: any) => {
      if (saveRecordWhenInitialized) {
        saveRecord();
      }
      onTabChange();
    },
    onAfterRecordLoaded: (record: FormRecord): FormRecord => { return record; },
    onAfterSaveRecord: (form: any, saveResponse: any, customSaveOptions?: any) => {
      if (
        props.junctionSaveEndpoint
        && props.junctionModel
        && props.junctionSourceColumn
        && props.junctionDestinationColumn
        && props.junctionSourceRecordId
      ) {
        request.post(
          props.junctionSaveEndpoint,
          {
            junctionModel: props.junctionModel,
            junctionSourceColumn: props.junctionSourceColumn,
            junctionDestinationColumn: props.junctionDestinationColumn,
            junctionSourceRecordId: props.junctionSourceRecordId,
            junctionDestinationRecordId: saveResponse.savedRecord['id'],
          },
          {},
          (data: any) => { /* */ }
        );
      }
    },
    onBeforeCopyRecord: (form: any, record: FormRecord) => { return { ...record, id: -1 }; },
    onBeforeSaveRecord: (form: any, record: FormRecord) => { return record; },
    onTabChange: (form: any) => {},
  }

  const defaultState = {
    activeTab: props.activeTab,
    activeTabUid: props.activeTabUid,
    content: props.content,
    creatingRecord: isCreatingRecord(props.id),
    customEndpointParams: props.customEndpointParams ?? {},
    deleteButtonDisabled: false,
    deletingRecord: false,
    description: props.description ?? {
      inputs: {},
      defaultValues: {},
      permissions: calculatePermissions(null),
      ui: {},
    },
    descriptionSource: 'both',
    endpoint: props.endpoint ? props.endpoint : (globalThis.hubleto.config.defaultFormEndpoint ?? {
      describeForm: 'api/form/describe',
      saveRecord: 'api/record/save',
      deleteRecord: 'api/record/delete',
      getRecord: 'api/record/get',
    }),
    folderUrl: '',
    hideOverlay: true,
    htmlPreview: '',
    id: props.id,
    invalidInputs: {},
    invalidRecordId: false,
    isFullscreen: false,
    isInitialized: false,
    isInlineEditing: props.isInlineEditing ? props.isInlineEditing : true,
    loadRecordError: null,
    modal: true,
    model: '',
    nextId: props.nextId,
    originalRecord: {},
    params: null,
    parentTable: null,
    permissions: calculatePermissions(null),
    prevId: props.prevId,
    readonly: props.readonly,
    record: {},
    recordChanged: false,
    recordDeleted: false,
    saveRecordWhenInitialized: false,
    savedSuccessfully: false,
    saveError: null,
    showFooter: true,
    showHeader: true,
    showInModal: true,
    showOwnerManagerSelector: false,
    showPreviewUi: false,
    tabs: getTabs(),
    tag: '',
    uid: '_form_' + uuid.v4().replace('-', '_'),
    updatingRecord: !isCreatingRecord(props.id),
  };

  const [activeTab, setActiveTab] = useState(props.activeTab ?? defaultState.activeTab);
  const [activeTabUid, setActiveTabUid] = useState(props.activeTabUid ?? defaultState.activeTabUid);
  const [content, setContent] = useState(props.content ?? defaultState.content);
  const [creatingRecord, setCreatingRecord] = useState(props.creatingRecord ?? defaultState.creatingRecord);
  const [customEndpointParams, setCustomEndpointParams] = useState(props.customEndpointParams ?? defaultState.customEndpointParams);
  const [deleteButtonDisabled, setDeleteButtonDisabled] = useState(props.deleteButtonDisabled ?? defaultState.deleteButtonDisabled);
  const [deletingRecord, setDeletingRecord] = useState(props.deletingRecord ?? defaultState.deletingRecord);
  const [description, setDescription] = useState(props.description ?? defaultState.description);
  const [descriptionSource, setDescriptionSource] = useState(props.descriptionSource ?? defaultState.descriptionSource);
  const [endpoint, setEndpoint] = useState(props.endpoint ?? defaultState.endpoint);
  const [hideOverlay, setHideOverlay] = useState(props.hideOverlay ?? defaultState.hideOverlay);
  const [htmlPreview, setHtmlPreview] = useState(props.htmlPreview ?? defaultState.htmlPreview);
  const [id, setId] = useState(props.id ?? defaultState.id);
  const [invalidInputs, setInvalidInputs] = useState(props.invalidInputs ?? defaultState.invalidInputs);
  const [invalidRecordId, setInvalidRecordId] = useState(props.invalidRecordId ?? defaultState.invalidRecordId);
  const [isFullscreen, setIsFullscreen] = useState(props.isFullscreen ?? defaultState.isFullscreen);
  const [isInitialized, setIsInitialized] = useState(props.isInitialized ?? defaultState.isInitialized);
  const [isInlineEditing, setIsInlineEditing] = useState(props.isInlineEditing ?? defaultState.isInlineEditing);
  const [loadRecordError, setLoadRecordError] = useState(props.loadRecordError ?? defaultState.loadRecordError);
  const [modal, setModal] = useState(props.modal ?? defaultState.modal);
  const [model, setModel] = useState(props.model ?? defaultState.model);
  const [nextId, setNextId] = useState(props.nextId ?? defaultState.nextId);
  const [originalRecord, setOriginalRecord] = useState(props.originalRecord ?? defaultState.originalRecord);
  const [parentTable, setParentTable] = useState(props.parentTable ?? defaultState.parentTable);
  const [permissions, setPermissions] = useState(props.permissions ?? defaultState.permissions);
  const [prevId, setPrevId] = useState(props.prevId ?? defaultState.prevId);
  const [readonly, setReadonly] = useState(props.readonly ?? defaultState.readonly);
  const [record, setRecord] = useState(props.record ?? defaultState.record);
  const [recordChanged, setRecordChanged] = useState(props.recordChanged ?? defaultState.recordChanged);
  const [recordDeleted, setRecordDeleted] = useState(props.recordDeleted ?? defaultState.recordDeleted);
  const [savedSuccessfully, setSavedSuccessfully] = useState(props.savedSuccessfully ?? defaultState.savedSuccessfully);
  const [saveError, setSaveError] = useState(props.saveError ?? defaultState.saveError);
  const [saveRecordWhenInitialized, setSaveRecordWhenInitialized] = useState(props.saveRecordWhenInitialized ?? defaultState.saveRecordWhenInitialized);
  const [showFooter, setShowFooter] = useState(props.showFooter ?? defaultState.showFooter);
  const [showHeader, setShowHeader] = useState(props.showHeader ?? defaultState.showHeader);
  const [showInModal, setShowInModal] = useState(props.showInModal ?? defaultState.showInModal);
  const [showOwnerManagerSelector, setShowOwnerManagerSelector] = useState(props.showOwnerManagerSelector ?? defaultState.showOwnerManagerSelector);
  const [showPreviewUi, setShowPreviewUi] = useState(props.showPreviewUi ?? defaultState.showPreviewUi);
  const [tabs, setTabs] = useState(props.tabs ?? defaultState.tabs);
  const [tag, setTag] = useState(props.tag ?? defaultState.tag);
  const [uid, setUid] = useState(props.uid ?? defaultState.uid);
  const [updatingRecord, setUpdatingRecord] = useState(props.updatingRecord ?? defaultState.updatingRecord);

  useEffect(() => { globalThis.hubleto.reactElements[uid] = _this; }, [uid]);
  useEffect(() => { loadDescription(); }, []);
  useEffect(() => {
    if (isInitialized) {
      getCallback('onAfterFormInitialized')(_this);
    }
  }, [isInitialized])

  useEffect(() => {
    if (id == -1) {
      updateRecord(description.defaultValues ?? {});
    } else {
      loadRecord();
    }
  }, [id]);






  const updatePreview = (idTemplate: number) => {
    request.post(
      'documents/api/get-preview-html',
      {
        model: model,
        recordId: record.id,
        idTemplate: idTemplate,
      },
      {},
      (result: any) => {
        setHtmlPreview(result.html);
      }
    );
  }

  const showPreviewVars = (): void => {
    request.post(
      'documents/api/get-preview-vars',
      {
        model: model,
        recordId: record.id,
      },
      {},
      (vars: any) => {
        setHtmlPreview('<pre>' + JSON.stringify(vars.vars, null, 2) + '</pre>');
      }
    );
  }

  const generatePdf = (): void => {
    request.post(
      'documents/api/generate-pdf',
      {
        model: model,
        recordId: record.id,
        documentName: getTitleAsText(),
      },
      {},
      (result: any) => {
        if (result && result.pdfFile) {
          changeRecord({
            idDocument: result.idDocument,
            pdf: result.pdfFile,
          }, () => { saveRecord(); });
        }
      }
    );
  }





  const onAfterLoadDescription = (description: FormDescription): FormDescription => {
    return description;
  }

  const loadDescription = (): void => {

    request.post(
      getEndpointUrl('describeForm'),
      getEndpointParams(),
      {},
      (description: any) => {

        if (description && descriptionSource == 'both') description = deepObjectMerge(description, description);

        description = onAfterLoadDescription(description);

        let permissions = calculatePermissions(record);

        let newTabs = tabs;
        let hasCustomColumns = false;
        let inputs = description?.inputs;

        if (inputs) {
          Object.keys(inputs).map((inpName, index) => {
            if (inputs[inpName].isCustom) hasCustomColumns = true;
          });
        }

        if (newTabs && hasCustomColumns) {
          newTabs.push({
            uid: '__custom_columns',
            title: 'Custom',
            onRender: (form: any) => {
              // const inputs = form.state.description?.inputs;
              // return <>{Object.keys(inputs).map((inpName, index) => {
              //   if (inputs[inpName].isCustom) {
              //     return form.inputWrapper(inpName);
              //   }
              // })}</>;
              return form.renderCustomInputs();
            }
          });
        }

        setDescription(description);
        setTabs(newTabs);
        setReadonly(!(permissions.canUpdate || permissions.canCreate));
        setPermissions(permissions);

      }
    );
  }

  const updateRecord = (record: any, onSuccess?: any) => {
    record = getCallback('onAfterRecordLoaded')(record);
    let p = calculatePermissions(record);

    setIsInitialized(true);
    setRecord(record);
    setOriginalRecord(JSON.parse(JSON.stringify(record)));
    setPermissions(p);
    setReadonly(!(p.canUpdate || p.canCreate));

    if (onSuccess) onSuccess(record);
  }

  const reload = (): void => {
    setIsInitialized(false);
  }

  const loadRecord = (): void => {
    request.post(
      getEndpointUrl('getRecord'),
      getEndpointParams(),
      {},
      (record: any) => {
        if (id != -1 && !record.id) {
          setIsInitialized(true);
          setInvalidRecordId(true);
        } else {
          updateRecord(record);
        }
      },
      (error) => {
        setLoadRecordError(error.data);
      }
    );
  }

  const onTabChange = (): void => {
    const urlParams = new URLSearchParams(window.location.search);
    const tabExists = (tabs && tabs.filter((t) => t.uid == activeTabUid).length > 0);

    if (activeTabUid == 'default' || !tabExists) urlParams.delete('tab');
    else urlParams.set('tab', activeTabUid ?? '');

    window.history.pushState({}, "", '?' + urlParams.toString());

    if (activeTabUid == 'preview') {
      updatePreview(record.id_template);
    }

    getCallback('onTabChange')(_this);
  }


  const saveRecord = (customSaveOptions?: any): void => {
    setInvalidInputs([]);

    let recordToSave = { ...record, id: id };

    (recordToSave._RELATIONS ?? []).map((relName: any) => {
      if (!(description?.includeRelations ?? []).includes(relName)) {
        delete recordToSave[relName];
      }
    });

    recordToSave = getCallback('onBeforeSaveRecord')(_this, recordToSave);

    request.post(
      getEndpointUrl('saveRecord'),
      { ...getEndpointParams(), record: recordToSave },
      {},
      (saveResponse: any) => {
        if (creatingRecord && parentTable && parentTable.setRecordFormUrl) {
          parentTable.setRecordFormUrl(saveResponse.savedRecord?.id);
        }

        setSavedSuccessfully(true);
        setSaveError(null);
        setRecord(saveResponse.savedRecord);
        setId(saveResponse.savedRecord?.id);
        setRecordChanged(false);
        setUpdatingRecord(true);
        setCreatingRecord(false);

        getCallback('onAfterSaveRecord')(_this, saveResponse, customSaveOptions);
      },
      (err: any) => {
        setSaveError(err.data);
        if (err.data?.invalidInputs != undefined) {
          setInvalidInputs(err.data.invalidInputs);
        }
      }
    );
  }

  const copyRecord = (): void => {
    let newRecord = getCallback('onBeforeCopyRecord')(_this, record);

    setId(-1);
    setRecord(newRecord);
    setUpdatingRecord(false);
    setCreatingRecord(false);
    setRecordChanged(true);
  
    const formUrl = getRecordFormUrl();
    if (formUrl != '') {
      window.history.pushState({}, "", globalThis.hubleto.config.projectUrl + '/' + formUrl);
    }

    getCallback('onAfterCopyRecord')(_this, newRecord);
  }

  const deleteRecord = (): void => {
    request.post(
      getEndpointUrl('deleteRecord'),
      {
        ...getEndpointParams(),
        hash: record._idHash_ ?? '',
      },
      {},
      (saveResponse: any) => {
        setDeletingRecord(false);
        setRecordDeleted(true);
        getCallback('onAfterDeleteRecord')(_this, saveResponse);
      },
      (err: any) => {
        setDeletingRecord(false);
        const message = err?.data?.message;
        if (message) globalThis.hubleto.showDialogWarning(message);
      }
    );
  }

  const normalizeRecord = (record: FormRecord): FormRecord => {
    return record;
  }

  const changeRecord = (changedValues: any, onSuccess?: any) => {
    const normalizedRecord = normalizeRecord(record);
    const changedRecord = deepObjectMerge({...normalizedRecord}, changedValues);
    
    setRecordChanged(JSON.stringify(originalRecord) !== JSON.stringify(changedRecord));
    setSavedSuccessfully(false);
    setRecord(changedRecord);

    if (onSuccess) onSuccess(changedRecord);
  }

  const closeForm = (): void => {
    let ok = true;
    if (recordChanged) ok = confirm(translate("You have unsaved changes. Are you sure to close?", 'Hubleto\\Erp\\Loader', 'Components\\Form'));
    if (ok) {

      const urlParams = new URLSearchParams(window.location.search);
      urlParams.delete('tab');
      window.history.pushState({}, "", '?' + urlParams.toString());

      getCallback('onClose')(_this);
    }
  }

  const openNextRecord = (): void => {
    if (nextId && parentTable) {
      parentTable.openForm(nextId);
    }
  }

  const openPrevRecord = (): void => {
    if (prevId && parentTable) {
      parentTable.openForm(prevId);
    }
  }

  const contentClassName = (): string => {
    return '';
  }

  const renderCustomInputs = (): React.JSX.Element|Array<React.JSX.Element> => {
    let customInputs: any = [];

    if (description?.inputs) {
      Object.keys(description.inputs).map((inputName) => {
        const inputDesc: any = description?.inputs ? description?.inputs[inputName] : null;
        if (inputDesc?.isCustom) {
          customInputs.push(renderInputWrapper(inputName));
        }
      });
    }

    return customInputs;
  }

  const renderTabTitle = (tabIndex: number): React.JSX.Element => {
    const tab = tabs ? tabs[tabIndex] : null;
    if (tab) {
      const R = record;
      const title = tab.title;

      if (tab.showCountFor) {
        const count = tab.showCountFor && R[tab.showCountFor] ? R[tab.showCountFor].length : 0;
        return <>{title} ({count})</>;
      } else {
        return <>{title}</>;
      }
    } else {
      return <>?</>;
    }
  }

  const renderTopMenuButton = (index: number): React.JSX.Element => {
    let tabUid = activeTabUid ?? '';
    if (tabUid == '') tabUid = 'default';
    let mainTabUid = tabUid.split('.')[0] ?? 'default';

    let tabTitle = renderTabTitle(index);
    let tab = tabs[index];

    const isActive = tab['uid'] == mainTabUid;

    return <button
      key={index}
      className={"btn " + (isActive ? "btn-primary" : (tab.cssClass ?? "btn-transparent"))}
      onClick={() => {
        const tab = tabs ? tabs[index] : null;
        const tabUid = (tab ? tab.uid : 'default');

        flushSync(() => {
          setActiveTab(index);
          setActiveTabUid(tabUid);
        })

        onTabChange();
      }}
    >
      {tab.icon ? <span className="icon"><i className={tab.icon}></i></span> : null}
      {tabTitle ? <span className={"text " + (tab.isCustom ? "italic" : "")}>{tabTitle}</span> : null}
    </button>
  }

  const renderTopMenu = (): null|React.JSX.Element => {
    let topMenu = null;

    if (tabs && Object.keys(tabs).length > 1) {
      topMenu = <div className="top-menu-wrapper">
        <div>
          {tabs.map((item: any, index: number) => {
            if (item.position != 'right') {
              return renderTopMenuButton(index);
            }
          })}
        </div>
        <div>
          {tabs.map((item: any, index: number) => {
            if (item.position == 'right') {
              return renderTopMenuButton(index);
            }
          })}
        </div>
      </div>;
    }

    const dynamicMenu = globalThis.hubleto.injectDynamicContent(
      props.componentName + ':TopMenu',
      {form: this}
    );

    let topMenuWithDynamicMenu = null;
    if (topMenu != null || dynamicMenu != null) {
      topMenuWithDynamicMenu = <>{topMenu} {dynamicMenu}</>;
    }

    let workflowUi = null;

    if (props.renderWorkflowUi) {
      workflowUi = renderWorkflowUi();
    }

    let ownerManagerUi = null;

    if (props.renderOwnerManagerUi) {
      ownerManagerUi = renderOwnerManagerUi();
    }

    return <div className='flex flex-col'>
      <div className='flex'>
        {topMenuWithDynamicMenu}
        {description && description.inputs && description.inputs.color
          ? <div className="p-2">{renderInput('color')}</div>
          : null
        }
      </div>
      <div className='flex justify-between'>
        {ownerManagerUi}
        {workflowUi}
        {description && description.inputs && description.inputs.shared_with
          ? <div className="p-2">{renderInput('shared_with')}</div>
          : null
        }
      </div>
    </div>
  }

  const renderTimeline = (timelineConfig: any): null|React.JSX.Element => {
    let timeline: any = null;
    let timelinePointsUnsorted: any = {};

    timelineConfig.map((aboutEntry: any, key: string) => {
      const entries = aboutEntry.data(this) ?? [];
      
      entries.map((entry: any, key: string) => {
        timelinePointsUnsorted[aboutEntry.timestampFormatter(entry)] = {
          icon: aboutEntry.icon,
          color: aboutEntry.color,
          value: aboutEntry.valueFormatter ? aboutEntry.valueFormatter(entry) : null,
          userName: aboutEntry.userNameFormatter ? aboutEntry.userNameFormatter(entry) : null,
        };
      });
    });

    let timelinePoints = Object.keys(timelinePointsUnsorted)
      .sort() // Sort the keys alphabetically
      .reverse()
      .reduce((obj: any, key: string) => {
        obj[key] = timelinePointsUnsorted[key]; // Rebuild the object with sorted keys
        return obj;
      }, {});

    if (JSON.stringify(timelinePoints) != '{}') {
      let now = moment();
      timeline = Object.keys(timelinePoints).map((key) => {
        const days = moment(now).diff(moment(key), 'days');
        const entry = timelinePoints[key];

        now = moment(key);

        return <>
          {days <= 0 ? null : <div className='badge text-xs'>{days} day(s)</div>}
          <div
            className='
              flex items-center p-2 border-l border-l-4 overflow-hidden hover:shadow-sm
              justify-center bg-white
            '
            style={{borderColor: entry.color}}
          >
            {/* <div className='text-xs'><i className={entry.icon}></i></div> */}
            <div className='text-xs font-bold text-nowrap'>{key}</div>
            <div className='p-2 text-center text-xs'>{entry.value}</div>
            {/* {entry.userName ? <div className='badge text-xs'>@{entry.userName}</div> : null} */}
          </div>
        </>;
      });
    }

    if (timeline) {
      return <div className='card card-body max-w-92 m-auto'>{timeline}</div>
    } else {
      return null;
    }
  }

  const renderTemplateElement = (elRenderer: string, elData: any): React.JSX.Element => {
    switch (elRenderer) {
      case 'form.columns':
        if (!elData.props) elData.props = {};
        elData.props.className = (elData.props?.className ?? '') + ' flex gap-2 flex-col md:flex-row';
        return React.createElement('div', elData.props, renderFromTemplate(elData.columns));
      break;
      case 'form.column':
        if (!elData.props) elData.props = {};
        elData.props.className = (elData.props?.className ?? '') + ' w-full flex gap-2 flex-col';
        return React.createElement('div', elData.props, renderFromTemplate(elData.items));
      break;
      case 'form.text':
        return <div>{elData}</div>;
      break;
      case 'form.divider':
        return renderDivider(elData.text);
      break;
      case 'form.input':
        return renderInputWrapper(elData.input);
      break;
      default:
        return <>Unknown element renderer: {elRenderer}</>;
      break;
    }
  }

  const renderFromTemplate = (template: any): Array<React.JSX.Element> => {
    let content: Array<React.JSX.Element> = [];
    Object.keys(template).map((elDefinition: string) => {
      let tmp = elDefinition.split('#');
      let elRenderer = tmp[0] ?? '';
      let elId = tmp[1] ?? '';
      let elData = template[elDefinition] ?? null;

      content.push(renderTemplateElement(elRenderer, { elId, ...elData }));
    });

    return content;
  }

  const renderTab = (tab: string): null|React.JSX.Element => {
    if (props.renderTab) return props.renderTab(_this);

    let template: any = {};

    if (description?.ui?.templateJson) {
      try {
        template = JSON.parse(description?.ui?.templateJson);
      } catch(ex) {
        console.error('Failed to render form from template.');
        console.error(description?.ui?.templateJson);
        return <div>Failed to render form from template. Check console for more details.</div>;
      }
    } else {
      template = null;
    }

    let tabTemplate = template && template.tabs && template.tabs[tab] ? template.tabs[tab] : null;

    if (tab == 'default' && !tabTemplate) {
      let tabInputs: any = {};

      Object.keys(description?.inputs ?? {}).map((inputName: string) => {
        tabInputs['form.input#' + inputName] = {input: inputName};
      });
      tabTemplate = {'form.column': { items: tabInputs } };
    }

    if (!tabTemplate) {
      return <></>;
    } else {
      return <>{renderFromTemplate(tabTemplate)}</>;
    }
  }

  const renderPreviewUi = (): null|React.JSX.Element => {
    return <ModalSimple
      uid='projects_table_discussions_modal'
      isOpen={true}
      type='centered large theme-secondary'
      showHeader={true}
      title={<>
        <h2>{translate("Print", 'Hubleto\\Erp\\Loader', 'Components\\Form')}</h2>
      </>}
      onClose={(modal: ModalSimple) => { setShowPreviewUi(false); }}
    >
      <div className='flex gap-2 h-full'>
        <div className='flex-1 w-72 flex flex-col gap-2'>
          <div className='grow'>
            {renderInputWrapper('id_template', {
              uiStyle: 'buttons-vertical',
              onChange: (input: any) => {
                updatePreview(input.state.value);
              }
            })}
            <div className='flex flex-col gap-2'>
              <button
                className='btn btn-add-outline btn-large'
                onClick={() => {
                  generatePdf();
                }}
              >
                <span className='icon'><i className='fas fa-file-pdf'></i></span>
                <span className='text'>{translate('Generate PDF')}</span>
              </button>
              <button
                className='btn btn-add-outline btn-large'
                onClick={() => {
                  const iframe = window.frames[uid + '_preview'];
                  const origDocumentTitle = document.title;

                  document.title += getTitleAsText();

                  iframe.contentWindow.focus();
                  iframe.contentWindow.print();

                  document.title = origDocumentTitle;
                }}
              >
                <span className='icon'><i className='fas fa-print'></i></span>
                <span className='text'>{translate('Print')}</span>
              </button>
            </div>
          </div>
          {renderInputWrapper('id_document', {readonly: true})}
        </div>
        <div className='flex-3 flex flex-col'>
          <div className='flex gap-2 align-center justify-end'>
            <div>
              {renderInput('pdf', {readonly: true})}
            </div>
          </div>
          <div className='w-full h-full card mt-2'>
            <div className="card-body">
              <HtmlFrame
                uid={uid + '_preview'}
                className='w-full h-full'
                iframeId={uid + '_preview'}
                content={htmlPreview}
              />
            </div>
            <div className='card-footer'>
              <a
                href='#'
                onClick={() => {
                  showPreviewVars();
                }}
              >{translate('Show variables available in template')}</a>
            </div>
          </div>
        </div>
      </div>
    </ModalSimple>;

  }

  const renderContent = (): null|React.JSX.Element => {
    if (props.renderContent) return props.renderContent(_this);

    let tabUid = activeTabUid ?? '';
    if (tabUid == '') tabUid = 'default';

    let mainTabUid = tabUid.split('.')[0] ?? '';
    if (mainTabUid == '') mainTabUid = 'default';

    let mainTab: FormTab = tabs.filter((t) => t['uid'] == mainTabUid)[0] ?? null;

    let subTabUid = tabUid.split('.')[1] ?? (mainTab?.subTabs ? mainTab?.subTabs[0]?.uid ?? '' : '');
    let mainContent = null;

    if (mainTab && typeof mainTab.onRender === 'function') {
      const tabContent = mainTab.onRender(this);
      mainContent = tabContent;
    } else {
      const tabContent = renderTab(mainTabUid + (subTabUid ? '.' + subTabUid : ''));

      if (mainTab && mainTab.subTabs && mainTab.subTabs.length > 0) {

        return <div className='flex h-full gap-2'>
          <div className='btn-group vertical flex-1'>{mainTab.subTabs.map((subTab, index) => {
            return <button
              key={index}
              className={'btn ' + (subTab.uid == subTabUid ? 'btn-primary' : (subTab.cssClass ?? 'btn-transparent'))}
              onClick={() => {
                flushSync(() => {
                  setActiveTab(index);
                  setActiveTabUid( mainTab.uid + '.' + subTab.uid);
                });

                onTabChange();
              }}
            >
              {subTab.icon ? <span className='icon'><i className={subTab.icon}></i></span> : null}
              <span className='text text-nowrap'>{subTab.title}</span>
            </button>
          })}</div>
          <div className='flex-5'>{tabContent}</div>
        </div>;
      } else {
        return tabContent;
      }
    }

    return <>
      {mainContent}
      {showPreviewUi ? renderPreviewUi() : null}
    </>;
  }

  const getInputProps = (inputName: string, customInputProps?: any): InputProps => {
    const inputs = description?.inputs ?? {};
    const inputDescription = inputs[inputName] ?? {};
    const inputType = inputDescription.type ?? '';
    const enumValues = inputDescription.enumValues;
    const lastIndexOfBackslash = model.lastIndexOf('/');
    const rawModelName = model.substring(lastIndexOfBackslash + 1);
    const modelInputName = rawModelName + '.' + inputName;
    const invalid = Array.isArray(invalidInputs) ? invalidInputs.some((v: any) => String(v.name).toLowerCase() === String(modelInputName).toLowerCase() && v.id === (record.id ?? -1)) : false;

    if (!customInputProps) customInputProps = {};

    let value = null;
    if (updatingRecord) value = record[inputName];
    else value = record[inputName] ?? (description.defaultValues ? description.defaultValues[inputName] : null);

    if (
      !customInputProps.wrapperCssClass
      && (
        ['boolean', 'date', 'datetime', 'decimal'].indexOf(inputType) >= 0
        || (inputType == 'int' && !enumValues)
      )
    ) {
      customInputProps.wrapperCssClass = 'flex gap-2';
    }

    return {
      inputName: inputName,
      inputClassName: '',
      record: record,
      description: inputDescription,
      value: value,
      cssClass: inputs[inputName]?.cssClass,
      readonly: readonly || inputs[inputName]?.readonly || inputs[inputName]?.disabled,
      uid: uid + '_' + uuid.v4(),
      parentForm: this,
      isModified: record[inputName] !== originalRecord[inputName],
      isInitialized: false,
      isInlineEditing: isInlineEditing,
      showInlineEditingButtons: false, // !this.state.isInlineEditing,
      invalid: invalid,
      ...inputs[inputName]?.inputProps,
      ...customInputProps,
      onInlineEditCancel: () => { },
      onInlineEditSave: () => { saveRecord(); },
      onChange: (input: any, value: any) => {
        let changedRecord = {...record};
        if (value === '') value = null;
        changedRecord[inputName] = value;

        setRecord(changedRecord);
        setRecordChanged(JSON.stringify(originalRecord) !== JSON.stringify(changedRecord));
        setSavedSuccessfully(false);

        getCallback('onChange')(_this, changedRecord);
      },
    };
  }

  const renderInput = (inputName: string, customInputProps?: any): React.JSX.Element => {
    const inputProps = getInputProps(inputName, customInputProps);

    let inputToRender: React.JSX.Element = <></>;
    let description: any = inputProps.description;

    if (!description) {
      return <div className="alert alert-warning">No description for input [{inputProps.inputName}]. Check console for error log.</div>
    }

    try {
      if (description.enumValues) {
        inputToRender = <InputEnumValues {...inputProps} enumValues={description.enumValues} enumCssClasses={description.enumCssClasses}/>
      } else {
        if (typeof description.reactComponent === 'string' && description.reactComponent !== '') {
          inputToRender = globalThis.hubleto.renderReactElement(description.reactComponent, inputProps) ?? <></>;
        } else {
          switch (description.type ?? '') {
            case 'varchar': inputToRender = <InputVarchar {...inputProps} data={null} />; break;
            case 'password': inputToRender = <InputPassword {...inputProps} />; break;
            case 'text': inputToRender = <InputTextarea {...inputProps} />; break;
            case 'json': inputToRender = <InputTextarea {...inputProps} />; break;
            case 'decimal': case 'int': case 'currency': inputToRender = <InputInt {...inputProps} data={null} />; break;
            case 'boolean': inputToRender = <InputBoolean {...inputProps} />; break;
            case 'lookup': inputToRender = <InputLookup {...inputProps} />; break;
            case 'color': inputToRender = <InputColor {...inputProps} />; break;
            //@ts-ignore
            case 'tags': inputToRender = <InputTags {...inputProps} model={description.model} recordId={inputProps.record.id} />; break;
            case 'file': inputToRender = <InputFile {...inputProps} />; break;
            case 'image': inputToRender = <InputImage {...inputProps} />; break;
            case 'datetime': case 'date': case 'time': inputToRender = <InputDateTime {...inputProps} type={description.type} />; break;
            default: inputToRender = <InputVarchar {...inputProps} data={null} />;
          }
        }
      }
    } catch (e) {
      inputToRender = <div className="alert alert-danger">Failed to initialize input [{inputProps.inputName}]. Check console for error log.</div>
      console.error('Failed to initialize input for ' + inputProps.inputName);
      console.error(e);
    }

    return inputToRender;
  }

  const renderInputWrapper = (inputName: string, customInputProps?: any) => {
    const inputProps = getInputProps(inputName, customInputProps);

    return renderInputWrapperCustom(
      inputName,
      inputProps,
      inputProps.description?.title ?? '',
      <>
        {renderInput(inputName, customInputProps)}
        {inputProps.description?.info}
      </>
    );
  }

  const renderInputWrapperCustom = (inputName: string, inputProps: any, label: string|React.JSX.Element, body: string|React.JSX.Element): React.JSX.Element => {
    return <div
      id={uid + '_' + inputName}
      className={
        "input-wrapper"
        + (inputProps.wrapperCssClass ? " " + inputProps.wrapperCssClass : "")
        + (inputProps.description?.required == true ? " required" : "")
        + (inputProps.isModified == true ? " modified" : "")
      }
      key={inputName}
    >
      <label className="input-label" htmlFor={uid + '_' + inputName}>
        {label}
      </label>

      <div className="input-body" key={inputName}>
        {inputProps.description?.icon ?
          <div className='input-icon'>
            <i className={inputProps.description?.icon}></i>
          </div>
        : null}

        {body}
      </div>

      {inputProps.description?.description
        ? <div className="input-description">{inputProps.description?.description}</div>
        : null
      }
    </div>;
  }

  const renderDivider = (content: any): React.JSX.Element => {
    return <div className="divider"><div><div><div></div></div><div><span>{content}</span></div></div></div>;
  }

  const renderHeaderButtons = (): null|React.JSX.Element => {
    const headerButtons = FormCustomizer.getFormHeaderButtons(props.componentName);
    if (headerButtons && headerButtons.length > 0) {
      return headerButtons.map((button: any, key: any) => {
        return <button
          key={key}
          className='btn btn-small btn-primary-outline'
          onClick={() => { button.onClick(this); }}
        >
          <span className='text'>{button.title}</span>
        </button>;
      });
    } else {
      return null;
    }
  }

  const renderFooterButtons = (): null|React.JSX.Element => {
    const footerButtons = FormCustomizer.getFormFooterButtons(props.componentName);
    if (footerButtons && footerButtons.length > 0) {
      return footerButtons.map((button: any, key: any) => {
        return <button
          key={key}
          className='btn btn-primary'
          onClick={() => { button.onClick(this); }}
        >
          {button.icon == '' ? null : <span className='icon'><i className={button.icon}></i></span>}
          <span className='text'>{button.title}</span>
        </button>;
      });
    } else {
      return null;
    }
  }

  const renderSaveButton = (): null|React.JSX.Element => {
    let showButton =
      description?.ui?.showSaveButton
      && (
        creatingRecord && permissions.canCreate
        || updatingRecord && permissions.canUpdate
      )
    ;

    const saveIcon = "fas " + (savedSuccessfully ? "fa-check" : "fa-save");

    return <>
      {showButton ? <>
        <button
          onClick={(e: any) => {
            if (!e.isFromDropdownMenu) saveRecord({closeAfterSave: false});
          }}
          className={"btn " + (recordChanged ? (savedSuccessfully ? "btn-success" : "btn-add") : "btn-disabled")}
          title="Save: Ctrl+S"
        >
          {updatingRecord
            ? <>
              <span className="icon"><i className={saveIcon}></i></span>
              <span className="text">
                {savedSuccessfully
                  ? translate("Saved", 'Hubleto\\Erp\\Loader', 'Components\\Form')
                  : (description?.ui?.saveButtonText ?? translate("Save", 'Hubleto\\Erp\\Loader', 'Components\\Form'))
                }
              </span>
            </> : <>
              <span className="icon"><i className="fas fa-plus"></i></span>
              <span className="text">
                {description?.ui?.addButtonText ?? translate("Add", 'Hubleto\\Erp\\Loader', 'Components\\Form')}
              </span>
            </>
          }
        </button>
      </> : null}
    </>;
  }

  const renderCopyButton = (): null|React.JSX.Element => {
    return <>
      {updatingRecord && description?.ui?.showCopyButton && permissions.canCreate ? <button
        onClick={() => copyRecord()}
        className={"btn btn-transparent"}
      >
        <span className="icon"><i className="fas fa-save"></i></span>
        <span className="text"> {description?.ui?.copyButtonText ?? translate("Copy", 'Hubleto\\Erp\\Loader', 'Components\\Form')}</span>
      </button> : null}
    </>;
  }

  const renderDeleteButton = (): null|React.JSX.Element => {
    return <>
      {updatingRecord && description?.ui?.showDeleteButton && permissions.canDelete ? <button
        onClick={() => {
          if (!deleteButtonDisabled) {
            if (deletingRecord) deleteRecord();
            else {
              flushSync(() => {
                setDeletingRecord(true);
                setDeleteButtonDisabled(true);
              });
              setTimeout(() => setDeleteButtonDisabled(false), 1000);
            }
          }
        }}
        className={
          "btn "
          + (deletingRecord ? "font-bold" : "") + " " + (deleteButtonDisabled ? "btn-light" : "btn-delete")
          + " hidden md:flex"
        }
      >
        <span className="icon"><i className="fas fa-trash-alt"></i></span>
        <span className="text text-nowrap">
          {deletingRecord ?
            translate("Confirm delete", 'Hubleto\\Erp\\Loader', 'Components\\Form')
            : description?.ui?.deleteButtonText ?? translate("Delete", 'Hubleto\\Erp\\Loader', 'Components\\Form')
          }
        </span>
      </button> : null}
    </>;
  }

  const renderPrevRecordButton = (): null|React.JSX.Element => {
    return (
      <button
        onClick={() => { openPrevRecord(); }}
        className={"btn btn-transparent" + (prevId ? "" : " btn-disabled")}
      >
        <span className="icon">
          <i className="fas fa-angle-left"></i>
        </span>
        <span className="shortcut">Ctrl+Shift+PgUp</span>
      </button>
    );
  }

  const renderNextRecordButton = (): null|React.JSX.Element => {
    return (
      <button
        onClick={() => { openNextRecord() }}
        className={"btn btn-transparent" + (nextId ? "" : " btn-disabled")}
      >
        <span className="icon">
          <i className="fas fa-angle-right"></i>
        </span>
        <span className="shortcut">Ctrl+Shift+PgDn</span>
      </button>
    );
  }

  const renderEditButton = (): null|React.JSX.Element => {
    return <>
      {permissions.canUpdate ? <button
        onClick={() => setIsInlineEditing(true)}
        className="btn btn-edit"
      >
        <span className="icon"><i className="fas fa-pencil-alt"></i></span>
        <span className="text">{translate('Edit', 'Hubleto\\Erp\\Loader', 'Components\\Form')}</span>
      </button> : null}
    </>;
  }

  const renderFullscreenButton = (): null|React.JSX.Element => {
    return (
      <button
        className="btn btn-transparent hidden md:block"
        type="button"
        aria-label="Fullscreen"
        onClick={() => {
          setIsFullscreen(!isFullscreen);
          // modal.current.setState({isFullscreen: !this.props.modal.current.state.isFullscreen});
        }}
      >
        <span className="icon">
          <i className={"fas fa-" + (isFullscreen ? "compress" : "expand")}></i>
        </span>
      </button>
    );
  }

  const renderCloseButton = (): null|React.JSX.Element => {
    return (
      <button
        className="btn btn-close"
        type="button"
        data-dismiss="modal"
        aria-label="Close"
        onClick={() => {
          closeForm();
        }}
      >
        <span className="icon">
          <i className="fas fa-xmark"></i>
          <span className="shortcut">Esc</span>
        </span>
      </button>
    );
  }

  const renderHeaderLeft = (): null|React.JSX.Element => {
    return <div className='flex gap-2 items-center'>
      <div className='flex flex-col gap-2'>
        <div className='flex gap-2'>
          {isInlineEditing ? renderSaveButton() : renderEditButton()}
          {props.renderPreviewUi ? <>
            <button
              onClick={(e: any) => {
                setShowPreviewUi(true);
              }}
              className={"btn btn-transparent"}
            >
              <span className="icon"><i className="fas fa-print"></i></span>
              <span className="text">
                {translate("Print", 'Hubleto\\Erp\\Loader', 'Components\\Form')}
              </span>
            </button>
            {record && record.pdf ?
              <a href={globalThis.hubleto.config.uploadUrl + '/' + record.pdf}
                className="btn btn-transparent" target="_blank"
                title={translate("Download PDF", 'Hubleto\\Erp\\Loader', 'Components\\Form')}
              >
                <span className="icon"><i className="fas fa-file-pdf"></i></span>
              </a>
            : null}
          </> : null}
        </div>
      </div>
    </div>;
  }

  const renderHeaderRight = (): null|React.JSX.Element => {
    return modal ? <>
      {renderFullscreenButton()}
      {renderCloseButton()}
    </> : null;
  }

  const renderFooter = (): null|React.JSX.Element => {
    return <>
      {record.id > 0 ? <a
        className='btn btn-primary-outline'
        href={globalThis.hubleto.config.projectUrl + '/ai-assistant?model=' + model + '&id=' + record.id}
        target='_blank'
      >
        <span className='icon'><i className='fas fa-wand-magic-sparkles'></i></span>
      </a> : null}
      <div className='w-full flex justify-between flex-col md:flex-row'>
        <div className="flex gap-2 items-center dark:text-white">
          <div>#{record.id}</div>
          <div>{renderPrevRecordButton()}</div>
          <div>{renderNextRecordButton()}</div>
          {recordChanged ? <div className='badge badge-small badge-warning block '>{translate('unsaved changes', 'Hubleto\\Erp\\Loader', 'Components\\FormExtended')}</div> : null}
        </div>
        <div className='flex gap-2 items-center'>
          {getRecordFormUrl() ? <>
            <a
              className='text-sm text-gray-500 text-nowrap'
              title={translate('Open in new tab', 'Hubleto\\Erp\\Loader', 'Components\\FormExtended')}
              href={globalThis.hubleto.config.projectUrl + '/' + getRecordFormUrl()}
              target='_blank'
            >
              {globalThis.hubleto.config.projectUrl + '/' + getRecordFormUrl()}
            </a>
            <button
              className='btn btn-transparent'
              title={translate('Copy link to clipboard', 'Hubleto\\Erp\\Loader', 'Components\\FormExtended')}
              onClick={() => {
                navigator.clipboard.writeText(globalThis.hubleto.config.projectUrl + '/' + getRecordFormUrl());
              }}
            >
              <span className='icon'><i className='fas fa-copy'></i></span>
            </button>
          </> : null}
        </div>
        {props.junctionModel ?
          <div className='badge flex gap-2'>
            <div><i className='fas fa-link'></i></div>
            <div>{props.junctionTitle}</div>
            <div>#{props.junctionSourceRecordId}<br/></div>
          </div>
        : null}
        <div className='flex gap-2'>
          {renderCopyButton()}
          {renderDeleteButton()}
        </div>
      </div>
    </>;
  }

  const renderSubTitle = (): null|React.JSX.Element => {
    if (props.renderSubTitle) return props.renderSubTitle(_this);

    if (description?.ui?.subTitle) {
      return <small>{description?.ui?.subTitle}</small>;
    } else {
      return <></>;
    }
  }

  const renderTitle = (): null|React.JSX.Element => {
    if (props.renderTitle) return props.renderTitle(_this);

    let title = description?.ui?.title ??
      (updatingRecord
        ? translate('Record', 'Hubleto\\Erp\\Loader', 'Components\\Form') + ' #' + (record?.id ?? '-')
        : translate('New record', 'Hubleto\\Erp\\Loader', 'Components\\Form')
      )
    ;

    return <>
      <h2>{title}</h2>
      {renderSubTitle()}
    </>
  }

  const renderWorkflowUi = (): React.JSX.Element => {
    return (id <= 0 ? null : <div className='flex grow p-2 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800'>
      <div className='flex-2'>
        <ErpWorkflowSelector
          parentForm={this}
          readonly={readonly}
        ></ErpWorkflowSelector>
      </div>
      {description && description.inputs && description.inputs.is_closed
        ? <div className='text-right'>{renderInputWrapper('is_closed', {wrapperCssClass: 'flex gap-2'})}</div>
        : null
      }
    </div>);
  }

  const renderCalendarTodoList = (): React.JSX.Element => {
    return <>
    </>;
  }

  const renderOwnerManagerUi = (): React.JSX.Element => {
    const idOwner = record.id_owner;
    const owner = globalThis.hubleto.users ? globalThis.hubleto.users[idOwner] : null;
    const idManager = record.id_manager;
    const manager = globalThis.hubleto.users ? globalThis.hubleto.users[idManager] : null;

    return <div className='p-2 flex flex-col'>
      <div className='btn-group border-primary'>
        <div className='btn btn-transparent' onClick={() => { setShowOwnerManagerSelector(!showOwnerManagerSelector) }}>
          <span className="text flex gap-2">{owner ? <>
            {/* <span className='text-xs text-gray-500'>Owner</span> */}
            {owner.photo ?
              <img
                src={globalThis.hubleto.config.uploadUrl + '/' + owner.photo}
                className='max-w-4 max-h-4 rounded-xl'
              />
            : null}
            <span className='text-xs text-primary'>{
              owner.nick ? owner.nick :
                (Array.from(owner.first_name ?? '')[0]).toString()
                + (Array.from(owner.last_name ?? '')[0]).toString()
                + (owner.id == globalThis.hubleto.idUser ? ' (you) ' : '')
            }</span>
          </> : '-'}</span>
        </div>
        <div className='btn btn-transparent' onClick={() => { setShowOwnerManagerSelector(!showOwnerManagerSelector) }}>
          <span className="text flex gap-2">{manager ? <>
            {manager.photo ?
              <img
                src={globalThis.hubleto.config.uploadUrl + '/' + manager.photo}
                className='max-w-4 max-h-4 rounded-xl'
              />
            : null}
            <span className='text-xs text-primary'>{
              manager.nick ? manager.nick :
                (Array.from(manager.first_name ?? '')[0]).toString()
                + (Array.from(manager.last_name ?? '')[0]).toString()
                + (manager.id == globalThis.hubleto.idUser ? ' (you) ' : '')
            }</span>
          </> : '-'}</span>
        </div>
      </div>
      {showOwnerManagerSelector ? <div
        className='relative w-0 h-0'
        style={{zIndex: 99999999999}}
      >
        <div
          className='mt-2 shadow min-w-64 border border-primary bg-white rounded'
        >
          {renderInputWrapper('id_owner')}
          {renderInputWrapper('id_manager')}
        </div>
      </div> : null}
    </div>;
  }

  const renderWarningsOrErrors = (): null|React.JSX.Element => {
    if (recordDeleted) {
      return <>
        <div className="alert alert-danger m-1">
          Record has been deleted.
        </div>
      </>
    }

    if (!isInitialized || !record) {
      return <Spinner content="Loading..." />;
    }

    if (invalidRecordId) {
      return <>
        <div className="alert alert-danger m-1">
          Unable to load record.
        </div>
      </>
    }

    return null;
  }

  const renderErrorAlert = (message: string) => {
    return <>
      <div className="alert alert-danger m-1">
        {message ?? "An error occured while performing the last operation."}
      </div>
    </>;
  }

  const renderSaveErrorMessage = (): null|React.JSX.Element => {
    return saveError && saveError.message
      ? <div className='text-white bg-red-300 p-2 whitespace-pre-line'>{saveError.message}</div>
      : null
    ;
  }


  const _this = {
    activeTab,
    activeTabUid,
    content,
    creatingRecord,
    customEndpointParams,
    deleteButtonDisabled,
    deletingRecord,
    description,
    descriptionSource,
    endpoint,
    hideOverlay,
    htmlPreview,
    id,
    invalidInputs,
    invalidRecordId,
    isFullscreen,
    isInitialized,
    isInlineEditing,
    loadRecordError,
    modal,
    model,
    nextId,
    originalRecord,
    parentTable,
    permissions,
    prevId,
    readonly,
    record,
    recordChanged,
    recordDeleted,
    savedSuccessfully,
    saveError,
    saveRecordWhenInitialized,
    showFooter,
    showHeader,
    showInModal,
    showOwnerManagerSelector,
    showPreviewUi,
    tabs,
    tag,
    uid,
    updatingRecord,

    renderDivider,
    renderInputWrapper,
  };













  if (loadRecordError) {
    return <>
      <div className="alert alert-danger m-4">Unable to load record. Check your permissions or contact administrator.</div>
      <div className="m-4"><code>{loadRecordError.message}</code></div>
    </>
  } else {
    try {
      const warningsOrErrors = renderWarningsOrErrors();
      const saveErrorMessage = renderSaveErrorMessage();

      const formTitle = renderTitle();
      const formContentClassName = contentClassName();
      const formContent = (warningsOrErrors ? warningsOrErrors : renderContent());
      const formFooter = renderFooter();
      const formTopMenu = (isInitialized ? renderTopMenu() : null);
      const headerLeft = (warningsOrErrors ? null : renderHeaderLeft());
      const headerRight = (warningsOrErrors ? renderCloseButton() : renderHeaderRight());
      const headerButtons = renderHeaderButtons();
      const footerButtons = renderFooterButtons();

      if (modal && modal.current) {
        return <>
          {showHeader ? <>
            <div className={"modal-header " + (modal.current.state.isActive ? "active" : "") + " " + description?.ui?.headerClassName}>
              <div className="modal-header-left">{headerLeft}</div>
              <div className="modal-header-title">{formTitle}</div>
              <div className="modal-header-right">{headerRight}</div>
            </div>
            {headerButtons ? <div className='modal-header-buttons'>{headerButtons}</div> : null}
          </> : null}
          {saveErrorMessage}
          {formTopMenu ? <div className="modal-top-menu">{formTopMenu}</div> : null}
          <div className={"modal-body " + formContentClassName}>
            {formContent}
          </div>
          {footerButtons ? <div className='modal-footer-buttons'>{footerButtons}</div> : null}
          {showFooter ? <>
            {formFooter ? <div className="modal-footer">{formFooter}</div> : null}
          </> : null}
        </>;
      } else {
        return <>
          <div id={"hubleto-form-" + uid} className="hubleto component form">
            {showHeader ? <>
              <div className="form-header">
                <div className="form-header-left">{headerLeft}</div>
                <div className="form-header-title">{formTitle}</div>
                <div className="form-header-right">{headerRight}</div>
              </div>
            </> : null}
            {saveErrorMessage}
            {formTopMenu ? <div className="form-top-menu">{formTopMenu}</div> : null}
            <div className={"form-body" + formContentClassName}>
              {formContent}
            </div>
            {showFooter ? <>
              {formFooter ? <div className="form-footer">{formFooter}</div> : null}
            </> : null}
          </div>
        </>;
      }
    } catch(e) {
      console.error('Failed to render form.');
      console.error(e);
      return <div className="alert alert-danger">Failed to render form. Check console for error log.</div>
    }
  }
});
