import React, {  useState, useEffect } from 'react';
import * as uuid from 'uuid';
import moment from "moment";

import request from "../../core/Request";
import Spinner from "./Spinner";
import App from '../../core/App';

import { deepObjectMerge } from "../../core/Helper";
import FormWorkflowSelector from './FormComponents/WorkflowSelector';
import ModalSimple from "../cc/ModalSimple";
import HtmlFrame from "../cc/HtmlFrame";
import Translator from "../../core/Translator";
import FormCustomizer from "../../core/FormCustomizer";

import FormSaveButton from './FormComponents/SaveButton';
import FormCloseButton from './FormComponents/CloseButton';
import FormPrintPreviewUiButton from './FormComponents/PrintPreviewUiButton';

import { InputProps } from "./Input";
import FormInput from './FormComponents/Input';

import {
  FormEndpoint,
  FormPermissions,
  FormUi,
  FormRecord,
  FormDescription,
  FormInvalidInputs,
  FormTab,
  FormUiComponents,
  FormProps,
  FormTabs,
  FormDescriptionSource,
} from "./FormInterfaces"

import { FormRecordStore, FormRecordStoreContext, createRecordStore } from './FormRecordStore';



export const FormDescriptionContext = React.createContext<FormDescription | null>(null);
export const FormMetaContext = React.createContext<{
  readonly, model, uid,
  originalRecord: FormRecord,
  invalidInputs: FormInvalidInputs,
  creatingRecord,
  updatingRecord,
  permissions,
  recordChanged,
  savedSuccessfully,
  translate, saveRecord, closeForm,
  loadRecord, id, getInputProps,
  getTitleAsText, setShowPreviewUi, changeRecord,
  showPreviewUi, record, description, renderTimeline
}>(null);






/**
 * Form
 *
 * @var [type]
 */
const Form = (props: FormProps) => {

  const storeRef = React.useRef<FormRecordStore>(null);
  if (!storeRef.current) storeRef.current = createRecordStore(props.record ?? {});
  const recordStore = storeRef.current;

  const isCreatingRecord = (id: any): boolean => { return id ? id == -1 : false; };
  const getCallback = (callback: string): any => {
    return (props[callback] ?? defaultCallbacks[callback]);
  }

  const translate = new Translator(
    props.translationContext ?? 'Hubleto\\ReactUi',
    props.translationContextInner ?? 'Components\\Form'
  ).translate;

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

  const getEndpointUrl = (action: string): string => {
    if (props.getEndpointUrl) return props.getEndpointUrl(_this);
    return endpoint[action as keyof FormEndpoint] ?? '';
  }

  const getEndpointParams = (): object => {
    if (props.getEndpointParams) return props.getEndpointParams(_this);

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

  const getTitleAsText = (): string => {
    return model.split('/').pop() + ' ' + record.id;
  }

  const getRecordFormUrl = (): string => {
    if (props.getRecordFormUrl) return props.getRecordFormUrl(_this);
    if (props.urlSlug != '') return props.urlSlug + '/' + (record.id > 0 ? record.id : 'add');
    return '';
  }

  const getContentClassName = (): string => {
    if (props.getContentClassName) props.getContentClassName(_this);
    return '';
  }

  const getInputProps = (inputName: string, customInputProps?: any): InputProps => {
    if (props.getInputProps) props.getInputProps(Form, inputName, customInputProps);

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
      // key: uid + '_input_' + inputName,
      inputName: inputName,
      inputClassName: '',
      record: record,
      description: inputDescription,
      value: value,
      cssClass: inputs[inputName]?.cssClass,
      readonly: readonly || inputs[inputName]?.readonly || inputs[inputName]?.disabled,
      uid: uid + '_' + inputName,
      parentForm: this,
      isModified: record[inputName] !== originalRecord[inputName],
      isInitialized: false,
      isInlineEditing: isInlineEditing,
      invalid: invalid,
      ...inputs[inputName]?.inputProps,
      ...customInputProps,
      onInlineEditCancel: () => { },
      onInlineEditSave: () => { saveRecord(); },
      onChange: (input: any, value: any) => {
        let changedValues = {};
        if (value === '') value = null;
        changedValues[inputName] = value;

        changeRecord(changedValues, (changedRecord: FormRecord) => {
          getCallback('onChange')(_this, changedRecord);
        });

      },
    };
  };

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
    description: props.description ?? {
      inputs: {},
      defaultValues: {},
      permissions: calculatePermissions(null),
      ui: {},
    },
    descriptionSource: 'both' as FormDescriptionSource,
    endpoint: props.endpoint ? props.endpoint : (globalThis.hubleto.config.defaultFormEndpoint ?? {
      describeForm: 'api/form/describe',
      saveRecord: 'api/record/save',
      deleteRecord: 'api/record/delete',
      getRecord: 'api/record/get',
    }),
    folderUrl: '',
    hideOverlay: true,
    id: props.id,
    isInitialized: false,
    isInlineEditing: props.isInlineEditing ? props.isInlineEditing : true,
    nextId: props.nextId,
    params: null,
    parentTable: null,
    permissions: calculatePermissions(null),
    prevId: props.prevId,
    readonly: props.readonly,
    savedSuccessfully: false,
    saveError: null,
    saveRecordWhenInitialized: false,
    showFooter: true,
    showHeader: true,
    showOwnerManagerSelector: false,
    showOwnerManagerUi: false,
    tabs: null,
    tag: '',
    uid: '_form_' + uuid.v4().replace('-', '_'),
    urlSlug: '',
  };

  const [activeTabUid, setActiveTabUid] = useState(props.activeTabUid == '' || !props.activeTabUid ? 'default' : props.activeTabUid);
  const [creatingRecord, setCreatingRecord] = useState(isCreatingRecord(props.id));
  const [customEndpointParams, setCustomEndpointParams] = useState(props.customEndpointParams ?? {});
  const [deleteButtonDisabled, setDeleteButtonDisabled] = useState(false);
  const [deletingRecord, setDeletingRecord] = useState(false);
  const [description, setDescription] = useState(props.description ?? defaultState.description);
  const [descriptionSource, setDescriptionSource] = useState(props.descriptionSource ?? defaultState.descriptionSource);
  const [endpoint, setEndpoint] = useState(props.endpoint ?? defaultState.endpoint);
  const [id, setId] = useState(props.id ?? defaultState.id);
  const [invalidInputs, setInvalidInputs] = useState([]);
  const [isActive, setIsActive] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(props.isFullscreen ?? false);
  const [isInitialized, setIsInitialized] = useState(props.isInitialized ?? defaultState.isInitialized);
  const [isInlineEditing, setIsInlineEditing] = useState(props.isInlineEditing ?? defaultState.isInlineEditing);
  const [loadRecordError, setLoadRecordError] = useState(null);
  const [modal, setModal] = useState(true);
  const [model, setModel] = useState(props.model ?? '');
  const [nextId, setNextId] = useState(props.nextId ?? defaultState.nextId);
  const [originalRecord, setOriginalRecord] = useState({} as FormRecord);
  const [parentTable, setParentTable] = useState(props.parentTable ?? defaultState.parentTable);
  const [permissions, setPermissions] = useState(props.permissions ?? defaultState.permissions);
  const [prevId, setPrevId] = useState(props.prevId ?? defaultState.prevId);
  const [readonly, setReadonly] = useState(props.readonly ?? defaultState.readonly);
  const [record, setRecord] = useState({} as FormRecord);
  const [recordChanged, setRecordChanged] = useState(false);
  const [recordDeleted, setRecordDeleted] = useState(false);
  const [savedSuccessfully, setSavedSuccessfully] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [saveRecordWhenInitialized, setSaveRecordWhenInitialized] = useState(props.saveRecordWhenInitialized ?? defaultState.saveRecordWhenInitialized);
  const [showFooter, setShowFooter] = useState(true);
  const [showHeader, setShowHeader] = useState(true);
  const [showOwnerManagerSelector, setShowOwnerManagerSelector] = useState(props.showOwnerManagerSelector ?? defaultState.showOwnerManagerSelector);
  const [showPreviewUi, setShowPreviewUi] = useState(false);
  const [tag, setTag] = useState(props.tag ?? defaultState.tag);
  const [uid, setUid] = useState(props.uid ?? defaultState.uid);
  const [updatingRecord, setUpdatingRecord] = useState(!isCreatingRecord(props.id));
  const [urlSlug, setUrlSlug] = useState(props.urlSlug ?? defaultState.urlSlug);

  useEffect(() => { globalThis.hubleto.reactElements[uid] = _this; }, [uid]);
  useEffect(() => { loadDescription(); }, []);
  useEffect(() => {
    if (isInitialized) {
      getCallback('onAfterFormInitialized')(_this);
    }
  }, [isInitialized])

  useEffect(() => {
    if (id == -1) {
      changeRecord(description.defaultValues ?? {});
    } else {
      loadRecord();
    }
  }, [id]);

  useEffect(() => {
    setIsInitialized(JSON.stringify(record) !== '{}');

    if (isInitialized) {
      setRecordChanged(true);
    }
  }, [record]);

  useEffect(() => {
    const tabs = props.uiComponents?.tabs;
    const urlParams = new URLSearchParams(window.location.search);
    const tabExists = tabs && tabs[activeTabUid] !== null;

    if (activeTabUid == 'default' || !tabExists) urlParams.delete('tab');
    else urlParams.set('tab', activeTabUid ?? '');

    window.history.pushState({}, "", '?' + urlParams.toString());

    // if (activeTabUid == 'preview') {
    //   updatePreview(record.id_template);
    // }

  }, [activeTabUid])

  const onAfterLoadDescription = (description: FormDescription): FormDescription => {
    return description;
  }

  const onTabChange = (): void => {
    getCallback('onTabChange')(_this);
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

        // let newTabs = getTabs();
        let hasCustomColumns = false;
        let inputs = description?.inputs;

        if (inputs) {
          Object.keys(inputs).map((inpName, index) => {
            if (inputs[inpName].isCustom) hasCustomColumns = true;
          });
        }

        setDescription(description);
        setReadonly(!(permissions.canUpdate || permissions.canCreate));
        setPermissions(permissions);

      }
    );
  }

  const reload = (): void => {
    setRecord({});
    recordStore.setRecord(prev => ({}));
    loadRecord();
  }

  const loadRecord = (): void => {
    request.post(
      getEndpointUrl('getRecord'),
      getEndpointParams(),
      {},
      (record: any) => {
        if (!record) return;

        if (!isInitialized) {
          setOriginalRecord(JSON.parse(JSON.stringify(record)));
        }

        if (id != -1 && !record.id) {
          setLoadRecordError('ERROR: Loading failed.');
        } else {
          let p = calculatePermissions(record);
          setPermissions(p);
          setReadonly(!(p.canUpdate || p.canCreate));

          changeRecord(record);
        }
      },
      (error) => {
        setLoadRecordError(error.data);
      }
    );
  }


  const saveRecord = (customSaveOptions?: any): void => {
    setInvalidInputs([]);

    // let recordToSave = { ...record, id: id };

    let recordToSave = recordStore.getRecord(); 

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
        // setRecord(saveResponse.savedRecord);
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
    setRecord(prev => newRecord);
    recordStore.setRecord(prev => (newRecord));
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

  const changeRecord = (changedValues: any, onSuccess?: any): void => {
    let changedRecord = normalizeRecord(record);
    Object.keys(changedValues).map((key: string) => changedRecord[key] = changedValues[key]);

    setRecordChanged(JSON.stringify(originalRecord) !== JSON.stringify(changedRecord));
    setSavedSuccessfully(false);
    setRecord(prev => ({...changedRecord}));
    recordStore.setRecord(prev => ({ ...changedRecord }));

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
  };

  const openNextRecord = (): void => {
    if (nextId && parentTable) {
      parentTable.openForm(nextId);
    }
  };

  const openPrevRecord = (): void => {
    if (prevId && parentTable) {
      parentTable.openForm(prevId);
    }
  };

  const renderTopMenuButton = (tabUid: string): React.JSX.Element => {
    if (tabUid == '') tabUid = 'default';

    const tabs: FormTabs = props.uiComponents?.tabs;
    if (!tabs) return <></>;

    const tab = tabs[tabUid];

    if (!tab) return <></>;

    const isActive = tabUid == activeTabUid;

    return <button
      key={tabUid}
      className={"btn " + (isActive ? "btn-primary" : (tab.cssClass ?? "btn-transparent"))}
      onClick={() => {
        setActiveTabUid(tabUid);
        onTabChange();
      }}
    >
      {tab.icon ? <span className="icon"><i className={tab.icon}></i></span> : null}
      {tab.title ? <span className={"text " + (tab.isCustom ? "italic" : "")}>{tab.title}</span> : null}
    </button>
  };

  const renderTopMenu = (): null|React.JSX.Element => {
    let topMenu = null;
    const tabs: FormTabs = props.uiComponents?.tabs;

    if (tabs && Object.keys(tabs).length > 1) {
      topMenu = <div className="top-menu-wrapper">
        <div>
          {Object.keys(tabs).map((tabUid: string) => {
            if (tabs[tabUid].position != 'right') {
              return renderTopMenuButton(tabUid);
            }
          })}
        </div>
        <div>
          {Object.keys(tabs).map((tabUid: string) => {
            if (tabs[tabUid].position == 'right') {
              return renderTopMenuButton(tabUid);
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

    return <div className='flex flex-col'>
      <div className='flex'>
        {topMenuWithDynamicMenu}
        {description && description.inputs && description.inputs.color
          ? <div className="p-2"><FormInput name='color' renderOnlyInputField /></div>
          : null
        }
      </div>
      <div className='flex justify-between'>
        {props.showOwnerManagerUi ? renderOwnerManagerUi() : null}
        {props.showWorkflowUi ? renderWorkflowUi() : null}
        {description && description.inputs && description.inputs.shared_with
          ? <div className="p-2"><FormInput name='shared_with' renderOnlyInputField /></div>
          : null
        }
      </div>
    </div>
  };

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
  };

  const renderTab = (tab: string): null|React.JSX.Element => {
    if (props.uiComponents?.tabs && props.uiComponents?.tabs[tab]) {
      return props.uiComponents.tabs[tab].content();
    }

    return <>{Object.keys(description?.inputs ?? {}).map((inputName: string) => {
      return <FormInput name={inputName} />
    })}</>;

  };

  // const renderPreviewUi = (): null|React.JSX.Element => {
    // return <ModalSimple
    //   uid='projects_table_discussions_modal'
    //   isOpen={true}
    //   type='centered large theme-secondary'
    //   showHeader={true}
    //   title={<>
    //     <h2>{translate("Print", 'Hubleto\\Erp\\Loader', 'Components\\Form')}</h2>
    //   </>}
    //   onClose={(modal: ModalSimple) => { setShowPreviewUi(false); }}
    // >
    //   <div className='flex gap-2 h-full'>
    //     <div className='flex-1 w-72 flex flex-col gap-2'>
    //       <div className='grow'>
    //         <FormInput name='id_template' customInputProps={{
    //           uiStyle: 'buttons-vertical',
    //           onChange: (input: any) => {
    //             updatePreview(input.state.value);
    //           }
    //         }} />
    //         <div className='flex flex-col gap-2'>
    //           <button
    //             className='btn btn-add-outline btn-large'
    //             onClick={() => {
    //               generatePdf();
    //             }}
    //           >
    //             <span className='icon'><i className='fas fa-file-pdf'></i></span>
    //             <span className='text'>{translate('Generate PDF')}</span>
    //           </button>
    //           <button
    //             className='btn btn-add-outline btn-large'
    //             onClick={() => {
    //               const iframe = window.frames[uid + '_preview'];
    //               const origDocumentTitle = document.title;

    //               document.title += getTitleAsText();

    //               iframe.contentWindow.focus();
    //               iframe.contentWindow.print();

    //               document.title = origDocumentTitle;
    //             }}
    //           >
    //             <span className='icon'><i className='fas fa-print'></i></span>
    //             <span className='text'>{translate('Print')}</span>
    //           </button>
    //         </div>
    //       </div>
    //       <FormInput name='id_document' readonly={true} />
    //     </div>
    //     <div className='flex-3 flex flex-col'>
    //       <div className='flex gap-2 align-center justify-end'>
    //         <div>
    //           <FormInput name='pdf' renderOnlyInputField customInputProps={{readonly: true}} />
    //         </div>
    //       </div>
    //       <div className='w-full h-full card mt-2'>
    //         <div className="card-body">
    //           <HtmlFrame
    //             uid={uid + '_preview'}
    //             className='w-full h-full'
    //             iframeId={uid + '_preview'}
    //             content={htmlPreview}
    //           />
    //         </div>
    //         <div className='card-footer'>
    //           <a
    //             href='#'
    //             onClick={() => {
    //               showPreviewVars();
    //             }}
    //           >{translate('Show variables available in template')}</a>
    //         </div>
    //       </div>
    //     </div>
    //   </div>
    // </ModalSimple>;
  // };

  const renderContent = (): null|React.JSX.Element => {
    if (props.uiComponents?.content) return props.uiComponents.content;

    return <>
      {renderTab(activeTabUid)}
      {props.uiComponents?.printPreviewUi}
    </>;
  };

  const renderHeaderExtraButtons = (): null|React.JSX.Element => {
    if (props.uiComponents?.headerExtraButtons) return props.uiComponents.headerExtraButtons;

    const headerExtraButtons = FormCustomizer.getFormHeaderExtraButtons(props.componentName);
    if (headerExtraButtons && headerExtraButtons.length > 0) {
      return headerExtraButtons.map((button: any, key: any) => {
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
  };

  const renderFooterButtons = (): null|React.JSX.Element => {
    if (props.uiComponents?.footerButtons) return props.uiComponents.footerButtons;

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
  };

  const renderSaveButton = (): null|React.JSX.Element => {
    if (props.uiComponents?.saveButton) return props.uiComponents.saveButton;
    return <FormSaveButton></FormSaveButton>;
  };

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
  };

  const renderDeleteButton = (): null|React.JSX.Element => {
    return <>
      {updatingRecord && description?.ui?.showDeleteButton && permissions.canDelete ? <button
        onClick={() => {
          if (!deleteButtonDisabled) {
            if (deletingRecord) deleteRecord();
            else {
              setDeletingRecord(true);
              setDeleteButtonDisabled(true);
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
  };

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
  };

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
  };

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
  };

  const renderFullscreenButton = (): null|React.JSX.Element => {
    return (
      <button
        className="btn btn-transparent hidden md:block"
        type="button"
        aria-label="Fullscreen"
        onClick={() => {
          setIsFullscreen(!isFullscreen);
        }}
      >
        <span className="icon">
          <i className={"fas fa-" + (isFullscreen ? "compress" : "expand")}></i>
        </span>
      </button>
    );
  };

  const renderCloseButton = (): null|React.JSX.Element => {
    if (props.uiComponents?.closeButton) return props.uiComponents.closeButton;
    return <FormCloseButton></FormCloseButton>;
  };

  const renderprintPreviewUiButton = (): null|React.JSX.Element => {
    if (props.uiComponents?.printPreviewUiButton) return props.uiComponents.printPreviewUiButton;
    return <FormPrintPreviewUiButton></FormPrintPreviewUiButton>;
  };

  const renderHeaderLeft = (): null|React.JSX.Element => {
    return <div className='flex gap-2 items-center'>
      <div className='flex flex-col gap-2'>
        <div className='flex gap-2'>
          {isInlineEditing ? renderSaveButton() : renderEditButton()}
          {props.uiComponents?.printPreviewUi ? renderprintPreviewUiButton() : null}
        </div>
      </div>
    </div>;
  };

  const renderHeaderRight = (): null|React.JSX.Element => {
    return modal ? <>
      {renderFullscreenButton()}
      {renderCloseButton()}
    </> : null;
  };

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
  };

  const renderTitle = (): null|React.JSX.Element => {
    if (props.uiComponents?.title) return props.uiComponents.title;

    let title = description?.ui?.title ??
      (updatingRecord
        ? translate('Record', 'Hubleto\\Erp\\Loader', 'Components\\Form') + ' #' + (record?.id ?? '-')
        : translate('New record', 'Hubleto\\Erp\\Loader', 'Components\\Form')
      )
    ;

    return <>
      <h2>{title}</h2>
      {description?.ui?.subTitle ? <small>{description?.ui?.subTitle}</small> : null}
    </>;
  };

  const renderWorkflowUi = (): React.JSX.Element => {
    return (id <= 0 ? null : <div className='flex grow p-2 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800'>
      <div className='flex-2'>
        <FormWorkflowSelector></FormWorkflowSelector>
      </div>
      {description && description.inputs && description.inputs.is_closed
        ? <div className='text-right'><FormInput name='is_closed' cssClass='flex gap-2' debug /></div>
        : null
      }
    </div>);
  };

  const renderCalendar = (): React.JSX.Element => {
    return <></>;
  };

  const renderCalendarTodoList = (): React.JSX.Element => {
    return <>
    </>;
  };

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
          <FormInput name='id_owner' />
          <FormInput name='id_manager' />
        </div>
      </div> : null}
    </div>;
  };

  const renderWarningsOrErrors = (): null|React.JSX.Element => {
    if (recordDeleted) {
      return <>
        <div className="alert alert-danger m-1">
          Record has been deleted.
        </div>
      </>
    }

    if (!isInitialized) {
      return <Spinner>{translate('Loading record, please wait.')}</Spinner>;
    }

    return null;
  };

  const renderErrorAlert = (message: string) => {
    return <>
      <div className="alert alert-danger m-1">
        {message ?? "An error occured while performing the last operation."}
      </div>
    </>;
  };

  const renderSaveErrorMessage = (): null|React.JSX.Element => {
    return saveError && saveError.message
      ? <div className='text-white bg-red-300 p-2 whitespace-pre-line'>{saveError.message}</div>
      : null
    ;
  };

  const _this = this;









  let finalContent = null;

  if (loadRecordError) {
    finalContent = <>
      <div className="alert alert-danger m-4">Unable to load record. Check your permissions or contact administrator.</div>
      <div className="m-4"><code>{loadRecordError.message}</code></div>
    </>
  } else {
    try {
      const warningsOrErrors = renderWarningsOrErrors();
      const saveErrorMessage = renderSaveErrorMessage();

      const formTitle = renderTitle();
      const formContentClassName = getContentClassName();
      const formContent = (warningsOrErrors ? warningsOrErrors : renderContent());
      const formFooter = renderFooter();
      const formTopMenu = (isInitialized ? renderTopMenu() : null);
      const headerLeft = (warningsOrErrors ? null : renderHeaderLeft());
      const headerRight = (warningsOrErrors ? renderCloseButton() : renderHeaderRight());
      const headerExtraButtons = renderHeaderExtraButtons();
      const footerButtons = renderFooterButtons();

      if (modal) {
        finalContent = <>
          {showHeader ? <>
            <div className={"modal-header " + (isActive ? "active" : "") + " " + description?.ui?.headerClassName}>
              <div className="modal-header-left">{headerLeft}</div>
              <div className="modal-header-title">{formTitle}</div>
              <div className="modal-header-right">{headerRight}</div>
            </div>
            {headerExtraButtons ? <div className='modal-header-buttons'>{headerExtraButtons}</div> : null}
          </> : null}
          {saveErrorMessage}
          {formTopMenu ? <div className="modal-top-menu shadow-lg">{formTopMenu}</div> : null}
          <div className={"modal-body " + formContentClassName}>
            {formContent}
          </div>
          {footerButtons ? <div className='modal-footer-buttons'>{footerButtons}</div> : null}
          {showFooter ? <>
            {formFooter ? <div className="modal-footer">{formFooter}</div> : null}
          </> : null}
        </>;
      } else {
        finalContent = <>
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
      finalContent = <div className="alert alert-danger">Failed to render form. Check console for error log.</div>
    }
  }

  return (
    <FormRecordStoreContext.Provider value={recordStore}>
      <FormDescriptionContext.Provider value={description}>
        <FormMetaContext.Provider value={{
          uid, readonly, model,
          originalRecord, invalidInputs,
          creatingRecord, updatingRecord,
          permissions, recordChanged, savedSuccessfully,
          translate, saveRecord, closeForm, loadRecord,
          id, getInputProps,
          getTitleAsText, setShowPreviewUi, changeRecord,
          showPreviewUi, record, description, renderTimeline
        }}>
          {finalContent}
        </FormMetaContext.Provider>
      </FormDescriptionContext.Provider>
    </FormRecordStoreContext.Provider>
  );
};

export default Form;
