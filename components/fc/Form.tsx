import React, {  useState, useEffect, useCallback } from 'react';
import { flushSync } from 'react-dom';
import * as uuid from 'uuid';
import moment from "moment";

import request from "../../core/Request";
import Spinner from "./Spinner";
import App from '../../core/App';
import { deepObjectMerge } from "../../core/Helper";
import WorkflowSelector from './FormComponents/WorkflowSelector';
import Translator from "../../core/Translator";
import FormCustomizer from "../../core/FormCustomizer";
import SaveButton from './FormComponents/SaveButton';
import CloseButton from './FormComponents/CloseButton';
import PrintPreviewUiButton from './FormComponents/PrintPreviewUiButton';

import Input from './FormComponents/Input';

import {
  FormEndpoint,
  FormRecord,
  FormDescription,
  FormProps,
  FormTabs,
  FormMeta,
} from "./FormInterfaces"

import { FormRecordStore, FormRecordStoreContext, createRecordStore, useRecordField } from './FormRecordStore';
import PrintPreviewUi from './FormComponents/PrintPreviewUi';
import { ModalMetaContext } from './Modal';

export const FormDescriptionContext = React.createContext<FormDescription | null>(null);
export const FormMetaContext = React.createContext<FormMeta>(null);



const T = new Translator('Hubleto\\ReactUi', 'Components\\Form');

/**
 * Form
 *
 * @var [type]
 */
const Form = (props: FormProps) => {

  const storeRef = React.useRef<FormRecordStore>(null);
  if (!storeRef.current) storeRef.current = createRecordStore(props.record ?? {});
  const recordStore = storeRef.current;
  const modal = React.useContext(ModalMetaContext);

  const cssClassNamePrefix = (modal ? "modal" : "form");
  const isCreatingRecord = (id: any): boolean => { return id ? id == -1 : false; };
  const getCallback = (callback: string): any => {
    return (props[callback] ?? defaultCallbacks[callback]);
  }

  const defaultCallbacks = {
    onChange: (form: FormMeta, changedRecord: FormRecord) => {},
    onClose: (form: FormMeta) => {},
    onAfterCopyRecord: (form: FormMeta, record: FormRecord) => {},
    onAfterDeleteRecord: (form: FormMeta, saveResponse: any) => {},
    onAfterFormInitialized: (form: FormMeta) => {},
    onAfterRecordLoaded: (form: FormMeta, record: FormRecord): void => {},
    onAfterSaveRecord: (form: FormMeta, saveResponse: any, customSaveOptions?: any) => {
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

  //////////////////////////////////
  // get*()
  //////////////////////////////////

  const getPermissions = (record: any) => {
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
    if (props.getEndpointUrl) return props.getEndpointUrl(myself);
    return endpoint[action as keyof FormEndpoint] ?? '';
  }

  const getEndpointParams = (): object => {
    if (props.getEndpointParams) return props.getEndpointParams(myself);

    return {
      model: model,
      id: id,
      tag: tag,
      includeRelations: description?.includeRelations,
      __IS_AJAX__: '1',
      ...props.endpointParams
    };
  }

  const getParentApp = (): App => {
    if (typeof props.parentApp == 'string') return globalThis.hubleto.getApp(props.parentApp);
    else return props.parentApp;
  }

  const getTitleAsText = (): string => {
    return model.split('/').pop() + ' ' + props.id;
  }

  const getRecordFormUrl = (): string => {
    if (props.getRecordFormUrl) return props.getRecordFormUrl(myself);
    if (props.urlSlug != '') return props.urlSlug + '/' + (props.id > 0 ? props.id : 'add');
    return '';
  }

  const getContentClassName = (): string => {
    if (props.getContentClassName) return props.getContentClassName(myself);

    const inputs = description.inputs;

    if (inputs && inputs.is_closed) {
      return useRecordField('is_closed') ? 'bg-gray-100 opacity-70' : '';
    } else {
      return '';
    }
  }

  const changeField = (input: any, value: any) => {
    changeRecord({[input.field]: value}, (changedRecord: FormRecord) => {
      getCallback('onChange')(myself, changedRecord);
    });

  }

  //////////////////////////////////
  // useState*()
  //////////////////////////////////

  const [activeTabUid, setActiveTabUid] = useState(props.activeTabUid == '' || !props.activeTabUid ? 'default' : props.activeTabUid);
  const [creatingRecord, setCreatingRecord] = useState(isCreatingRecord(props.id));
  const [deleteButtonDisabled, setDeleteButtonDisabled] = useState(false);
  const [deletingRecord, setDeletingRecord] = useState(false);
  const [description, setDescription] = useState(props.description ?? {
    inputs: {},
    defaultValues: {},
    permissions: getPermissions(null),
    ui: {},
  });
  const [descriptionSource, setDescriptionSource] = useState(props.descriptionSource ?? 'both');
  const [endpoint, setEndpoint] = useState(props.endpoint ?? props.endpoint ? props.endpoint : (globalThis.hubleto.config.defaultFormEndpoint ?? {
    describeForm: 'api/form/describe',
    saveRecord: 'api/record/save',
    deleteRecord: 'api/record/delete',
    getRecord: 'api/record/get',
  }));
  const [id, setId] = useState(props.id ?? 0);
  const [invalidInputs, setInvalidInputs] = useState([]);
  const [isActive, setIsActive] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(props.isFullscreen ?? false);
  const [isInitialized, setIsInitialized] = useState(props.isInitialized ?? false);
  const [loadRecordError, setLoadRecordError] = useState(null);
  const [model, setModel] = useState(props.model ?? '');
  const [nextId, setNextId] = useState(props.nextId ?? 0);
  const [originalRecord, setOriginalRecord] = useState({} as FormRecord);
  const [parentTable, setParentTable] = useState(props.parentTable ?? null);
  const [permissions, setPermissions] = useState(props.permissions ?? getPermissions(null));
  const [prevId, setPrevId] = useState(props.prevId ?? 0);
  const [readonly, setReadonly] = useState(props.readonly ?? false);
  const [recordChanged, setRecordChanged] = useState(false);
  const [recordDeleted, setRecordDeleted] = useState(false);
  const [savedSuccessfully, setSavedSuccessfully] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [showFooter, setShowFooter] = useState(true);
  const [showHeader, setShowHeader] = useState(true);
  const [showPreviewUi, setShowPreviewUi] = useState(false);
  const [tag, setTag] = useState(props.tag ?? '');
  const [updatingRecord, setUpdatingRecord] = useState(!isCreatingRecord(props.id));

  //////////////////////////////////
  // useEffect*()
  //////////////////////////////////

  useEffect(() => { globalThis.hubleto.reactElements[props.uid] = myself; }, [props.uid]);
  useEffect(() => { loadDescription(); }, []);
  useEffect(() => {
    if (isInitialized) {
      onTabChange();
      getCallback('onAfterFormInitialized')(myself);
    }
  }, [isInitialized])

  useEffect(() => { onTabChange(); }, [activeTabUid]);
  useEffect(() => { loadRecord(); }, [description]);

  useEffect(() => {
    const tabs = props.tabs;
    const urlParams = new URLSearchParams(window.location.search);
    const tabExists = tabs && tabs[activeTabUid] !== null;

    if (activeTabUid == 'default' || !tabExists) urlParams.delete('tab');
    else urlParams.set('tab', activeTabUid ?? '');

    window.history.pushState({}, "", '?' + urlParams.toString());

  }, [activeTabUid])

  const onTabChange = (): void => {
    getCallback('onTabChange')(myself);
  }

  //////////////////////////////////
  // load*()
  //////////////////////////////////

  const loadDescription = (): void => {

    request.post(
      getEndpointUrl('describeForm'),
      getEndpointParams(),
      {},
      (description: any) => {

        if (description && descriptionSource == 'both') description = deepObjectMerge(description, description);

        let permissions = getPermissions(recordStore.getRecord());

        let hasCustomColumns = false;
        let inputs = description?.inputs;

        if (inputs) {
          Object.keys(inputs).map((inpName, index) => {
            if (inputs[inpName].isCustom) hasCustomColumns = true;
          });
        }

        setDescription(description);
        if (!permissions.canUpdate && !permissions.canCreate) setReadonly(true);
        // setPermissions(permissions);

      }
    );
  }

  const loadRecord = (): void => {
    setIsInitialized(false);

    if (id == -1) {
      setIsInitialized(true);
      changeRecord(description.defaultValues ?? {});
    } else {
      request.post(
        getEndpointUrl('getRecord'),
        getEndpointParams(),
        {},
        (record: any) => {
          if (!record) return;

          setIsInitialized(true);
          setOriginalRecord(JSON.parse(JSON.stringify(record)));

          if (id != -1 && !record.id) {
            setLoadRecordError('ERROR: Loading failed.');
          } else {
            let p = getPermissions(record);
            setPermissions(p);
            if (!p.canUpdate && !p.canCreate) setReadonly(true);

            // changeRecord(record);
            recordStore.setRecord(prev => ({ ...record }));

            getCallback('onAfterRecordLoaded')(myself, record);
          }
        },
        (error) => {
          setLoadRecordError(error.data);
        }
      );
      
    }
  }

  //////////////////////////////////
  // form*()
  //////////////////////////////////

  const closeForm = (): void => {
    let ok = true;
    if (recordChanged) ok = confirm(T.translate("You have unsaved changes. Are you sure to close?", 'Hubleto\\Erp\\Loader', 'Components\\Form'));
    if (ok) {

      const urlParams = new URLSearchParams(window.location.search);
      urlParams.delete('tab');
      window.history.pushState({}, "", '?' + urlParams.toString());

      getCallback('onClose')(myself);
    }
  };

  //////////////////////////////////
  // record*()
  //////////////////////////////////

  const getRecord = (): FormRecord => {
    return recordStore.getRecord();
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

    recordToSave = getCallback('onBeforeSaveRecord')(myself, recordToSave);

    request.post(
      getEndpointUrl('saveRecord'),
      { ...getEndpointParams(), record: recordToSave },
      {},
      (saveResponse: any) => {
        if (creatingRecord && parentTable && parentTable.setRecordFormUrl) {
          parentTable.setRecordFormUrl(saveResponse.savedRecord?.id);
        }

        setSavedSuccessfully(true);
        setTimeout(() => { setSavedSuccessfully(false); }, 500)
        setSaveError(null);
        // setRecord(saveResponse.savedRecord);
        setId(saveResponse.savedRecord?.id);
        setRecordChanged(false);
        setUpdatingRecord(true);
        setCreatingRecord(false);
        loadRecord();

        getCallback('onAfterSaveRecord')(myself, saveResponse, customSaveOptions);
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
    let newRecord = getCallback('onBeforeCopyRecord')(myself, recordStore.getRecord());

    setId(-1);
    recordStore.setRecord(prev => (newRecord));
    setUpdatingRecord(false);
    setCreatingRecord(false);
    setRecordChanged(true);
  
    const formUrl = getRecordFormUrl();
    if (formUrl != '') {
      window.history.pushState({}, "", globalThis.hubleto.config.projectUrl + '/' + formUrl);
    }

    getCallback('onAfterCopyRecord')(myself, newRecord);
  }

  const deleteRecord = (): void => {
    request.post(
      getEndpointUrl('deleteRecord'),
      {
        ...getEndpointParams(),
        hash: props.record._idHash_ ?? '',
      },
      {},
      (saveResponse: any) => {
        setDeletingRecord(false);
        setRecordDeleted(true);
        getCallback('onAfterDeleteRecord')(myself, saveResponse);
      },
      (err: any) => {
        setDeletingRecord(false);
        const message = err?.data?.message;
        if (message) globalThis.hubleto.showDialogWarning(message);
      }
    );
  }

  const changeRecord = (changedValues: any, onSuccess?: any): void => {
    let changedRecord = recordStore.getRecord();
    Object.keys(changedValues).map((key: string) => changedRecord[key] = changedValues[key]);

    if (isInitialized) {
      setRecordChanged(JSON.stringify(originalRecord) !== JSON.stringify(changedRecord));
    }

    recordStore.setRecord(prev => ({ ...changedRecord }));

    if (onSuccess) onSuccess(changedRecord);
  }

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

  //////////////////////////////////
  // render*()
  //////////////////////////////////

  const RenderTopMenuButton = (p: { tabUid: string }) => (props.renderTopMenuButton ? props.renderTopMenuButton(myself, p.tabUid) : renderDefaultTopMenuButton(p.tabUid));
  const RenderTopInputs = useCallback(() => (props.renderTopInputs ? props.renderTopInputs(myself) : renderDefaultTopInputs()), [description, activeTabUid]);
  const RenderTopMenu = useCallback(() => (props.renderTopMenu ? props.renderTopMenu(myself) : renderDefaultTopMenu()), [description, activeTabUid]);
  const RenderTimeline = (p: { timelineConfig: any }) => (props.renderTimeline ? props.renderTimeline(myself, p.timelineConfig) : renderDefaultTimeline(p.timelineConfig));
  const RenderTab = (p: { tab: string }) => (props.renderTab ? props.renderTab(myself, p.tab) : renderDefaultTab(p.tab));
  const RenderContent = useCallback(() => (props.renderContent ? props.renderContent(myself) : renderDefaultContent()), [description, activeTabUid]);
  const RenderPrintPreviewUi = () => (props.renderPrintPreviewUi ? props.renderPrintPreviewUi(myself) : renderDefaultPrintPreviewUi());
  const RenderHeaderExtraButtons = () => (props.renderHeaderExtraButtons ? props.renderHeaderExtraButtons(myself) : renderDefaultHeaderExtraButtons());
  const RenderFooterExtraButtons = () => (props.renderFooterExtraButtons ? props.renderFooterExtraButtons(myself) : renderDefaultFooterExtraButtons());
  const RenderSaveButton = () => (props.renderSaveButton ? props.renderSaveButton(myself) : renderDefaultSaveButton());
  const RenderCopyButton = () => (props.renderCopyButton ? props.renderCopyButton(myself) : renderDefaultCopyButton());
  const RenderDeleteButton = () => (props.renderDeleteButton ? props.renderDeleteButton(myself) : renderDefaultDeleteButton());
  const RenderPrevRecordButton = () => (props.renderPrevRecordButton ? props.renderPrevRecordButton(myself) : renderDefaultPrevRecordButton());
  const RenderNextRecordButton = () => (props.renderNextRecordButton ? props.renderNextRecordButton(myself) : renderDefaultNextRecordButton());
  const RenderFullscreenButton = () => (props.renderFullscreenButton ? props.renderFullscreenButton(myself) : renderDefaultFullscreenButton());
  const RenderCloseButton = () => (props.renderCloseButton ? props.renderCloseButton(myself) : renderDefaultCloseButton());
  const RenderPrintPreviewUiButton = () => (props.renderPrintPreviewUiButton ? props.renderPrintPreviewUiButton(myself) : renderDefaultPrintPreviewUiButton());
  const RenderHeader = () => (props.renderHeader ? props.renderHeader(myself) : renderDefaultHeader());
  const RenderHeaderLeft = () => (props.renderHeaderLeft ? props.renderHeaderLeft(myself) : renderDefaultHeaderLeft());
  const RenderHeaderRight = () => (props.renderHeaderRight ? props.renderHeaderRight(myself) : renderDefaultHeaderRight());
  const RenderFooter = () => (props.renderFooter ? props.renderFooter(myself) : renderDefaultFooter());
  const RenderTitle = () => (props.renderTitle ? props.renderTitle(myself) : renderDefaultTitle());
  const RenderWarningsOrErrors = () => (props.renderWarningsOrErrors ? props.renderWarningsOrErrors(myself) : renderDefaultWarningsOrErrors());
  const RenderSaveErrorMessage = () => (props.renderSaveErrorMessage ? props.renderSaveErrorMessage(myself) : renderDefaultSaveErrorMessage());

  //////////////////////////////////
  // renderDefault*()
  //////////////////////////////////

  const renderDefaultTopInputs = (): React.JSX.Element => {
    const inputs = description.inputs;
    return (inputs ? <div className='flex justify-between gap-2 w-full'>
      <div className='flex gap-2'>
        {inputs.id_workflow && inputs.id_workflow_step ? <div className='grow'><WorkflowSelector /></div> : null}
      </div>
      <div className='flex gap-2'>
        {inputs.id_owner ? <Input field='id_owner' readonly={false} renderOnlyInputField /> : null}
        {inputs.id_manager ? <Input field='id_manager' readonly={false} renderOnlyInputField /> : null}
        {inputs.shared_with ? <Input field='shared_with' title='Share' renderOnlyInputField /> : null}
        {inputs.is_closed ? <Input field='is_closed' readonly={false} renderOnlyInputField customInputProps={{yesText: 'Closed', noText: 'Open', yesBtnClass: 'btn-danger', noBtnClass: 'btn-success'}} /> : null}
      </div>
    </div> : null);
  }

  const renderDefaultTopMenuButton = (tabUid: string): React.JSX.Element => {
    if (tabUid == '') tabUid = 'default';

    const tabs: FormTabs = props.tabs;
    if (!tabs) return <></>;

    const tab = tabs[tabUid];

    if (!tab) return <></>;

    const isActive = tabUid == activeTabUid;

    return <button
      key={tabUid}
      className={"btn " + (isActive ? "btn-primary" : (tab.cssClass ?? "btn-transparent"))}
      onClick={() => {
        setActiveTabUid(tabUid);
      }}
    >
      {tab.icon ? <span className="icon"><i className={tab.icon}></i></span> : null}
      {tab.title ? <span className={"text " + (tab.isCustom ? "italic" : "")}>{tab.title}</span> : null}
    </button>
  };

  const renderDefaultTopMenu = (): React.JSX.Element => {
    let topMenu = null;
    const tabs: FormTabs = props.tabs;

    if (tabs && Object.keys(tabs).length > 1) {
      topMenu = <div className="top-menu-wrapper">
        <div>
          {Object.keys(tabs).map((tabUid: string) => {
            if (tabs[tabUid].position != 'right') {
              return <RenderTopMenuButton tabUid={tabUid}></RenderTopMenuButton>;
            }
          })}
        </div>
        <div>
          {Object.keys(tabs).map((tabUid: string) => {
            if (tabs[tabUid].position == 'right') {
              return <RenderTopMenuButton tabUid={tabUid}></RenderTopMenuButton>;
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

    const inputs = description.inputs;

    return <div className={cssClassNamePrefix + "-top-menu shadow-lg"}>
      <div className='flex'>
        {topMenuWithDynamicMenu}
      </div>
    </div>;
  };

  const renderDefaultTimeline = (timelineConfig: any): React.JSX.Element => {
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

  const renderDefaultTab = (tab: string): React.JSX.Element => {
    if (props.tabs && props.tabs[tab]) {
      return props.tabs[tab].content();
    }

    return <>{Object.keys(description?.inputs ?? {}).map((field: string) => {
      return <Input field={field} />
    })}</>;

  };

  const renderDefaultContent = (): React.JSX.Element => {
    if (props.children) return props.children;
    else return <div className={cssClassNamePrefix + "-body " + getContentClassName()}>
      <RenderTab tab={activeTabUid}></RenderTab>
      <RenderPrintPreviewUi></RenderPrintPreviewUi>
    </div>;
  };

  const renderDefaultPrintPreviewUi = (): React.JSX.Element => {
    return <PrintPreviewUi></PrintPreviewUi>;
  };

  const renderDefaultHeaderExtraButtons = (): React.JSX.Element => {
    const headerExtraButtons = FormCustomizer.getFormHeaderExtraButtons(props.componentName);
    if (headerExtraButtons && headerExtraButtons.length > 0) {
      return <div className={cssClassNamePrefix + "-header-buttons"}>{headerExtraButtons.map((button: any, key: any) => {
        return <button
          key={key}
          className='btn btn-small btn-primary-outline'
          onClick={() => { button.onClick(this); }}
        >
          <span className='text'>{button.title}</span>
        </button>;
      })}</div>;
    } else {
      return null;
    }
  };

  const renderDefaultFooterExtraButtons = (): React.JSX.Element => {
    const footerExtraButtons = FormCustomizer.getFormFooterExtraButtons(props.componentName);
    if (footerExtraButtons && footerExtraButtons.length > 0) {
      return <div className={cssClassNamePrefix + "-footer-buttons"}>{footerExtraButtons.map((button: any, key: any) => {
        return <button
          key={key}
          className='btn btn-primary'
          onClick={() => { button.onClick(this); }}
        >
          {button.icon == '' ? null : <span className='icon'><i className={button.icon}></i></span>}
          <span className='text'>{button.title}</span>
        </button>;
      })}</div>;
    } else {
      return null;
    }
  };

  const renderDefaultSaveButton = (): React.JSX.Element => {
    return <SaveButton></SaveButton>;
  };

  const renderDefaultCopyButton = (): React.JSX.Element => {
    return <>
      {updatingRecord && description?.ui?.showCopyButton && permissions.canCreate ? <button
        onClick={() => copyRecord()}
        className={"btn btn-white"}
      >
        <span className="icon"><i className="fas fa-copy"></i></span>
        <span className="text"> {description?.ui?.copyButtonText ?? T.translate("Copy", 'Hubleto\\Erp\\Loader', 'Components\\Form')}</span>
      </button> : null}
    </>;
  };

  const renderDefaultDeleteButton = (): React.JSX.Element => {
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
            T.translate("Confirm delete", 'Hubleto\\Erp\\Loader', 'Components\\Form')
            : description?.ui?.deleteButtonText ?? T.translate("Delete", 'Hubleto\\Erp\\Loader', 'Components\\Form')
          }
        </span>
      </button> : null}
    </>;
  };

  const renderDefaultPrevRecordButton = (): React.JSX.Element => {
    return (
      <button
        onClick={() => { openPrevRecord(); }}
        className={"btn btn-transparent" + (prevId ? "" : " btn-disabled")}
      >
        <span className="icon">
          <i className="fas fa-angle-left"></i>
        </span>
        {/* <span className="shortcut">Ctrl+Shift+PgUp</span> */}
      </button>
    );
  };

  const renderDefaultNextRecordButton = (): React.JSX.Element => {
    return (
      <button
        onClick={() => { openNextRecord() }}
        className={"btn btn-transparent" + (nextId ? "" : " btn-disabled")}
      >
        <span className="icon">
          <i className="fas fa-angle-right"></i>
        </span>
        {/* <span className="shortcut">Ctrl+Shift+PgDn</span> */}
      </button>
    );
  };

  const renderDefaultFullscreenButton = (): React.JSX.Element => {
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

  const renderDefaultCloseButton = (): React.JSX.Element => {
    return <CloseButton></CloseButton>;
  };

  const renderDefaultPrintPreviewUiButton = (): React.JSX.Element => {
    return <PrintPreviewUiButton></PrintPreviewUiButton>;
  };

  const renderDefaultHeader = (): React.JSX.Element => {
    return <div className={cssClassNamePrefix + "-header " + (isActive ? "active" : "") + " " + description?.ui?.headerClassName}>
      <div className={cssClassNamePrefix + "-header-left"}><RenderHeaderLeft /></div>
      <div className={cssClassNamePrefix + "-header-title"}><RenderTitle /></div>
      <div className={cssClassNamePrefix + "-header-right"}><RenderHeaderRight /></div>
    </div>
    ;
  };

  const renderDefaultHeaderLeft = (): React.JSX.Element => {
    return <div className='flex gap-2 items-center'>
      <div className='flex flex-col gap-2'>
        <div className='flex gap-2'>
          <RenderSaveButton></RenderSaveButton>
          <RenderPrintPreviewUiButton></RenderPrintPreviewUiButton>
        </div>
      </div>
    </div>;
  };

  const renderDefaultHeaderRight = (): React.JSX.Element => {
    return modal ? <>
      <RenderFullscreenButton />
      <RenderCloseButton />
    </> : null;
  };

  const renderDefaultFooter = (): React.JSX.Element => {
    const inputs = description.inputs;

    return <div className={cssClassNamePrefix + "-footer"}>
      <div className='w-full flex justify-between flex-col md:flex-row'>
        <div className="flex gap-2 items-center dark:text-white">
          <div><RenderPrevRecordButton /></div>
          <div><RenderNextRecordButton /></div>
          {getRecordFormUrl() ? <>
            <a
              className='btn btn-white'
              title={T.translate('Open in new tab', 'Hubleto\\Erp\\Loader', 'Components\\FormExtended')}
              href={globalThis.hubleto.config.projectUrl + '/' + getRecordFormUrl()}
              target='_blank'
            >
              <span className='icon'><i className='fas fa-external-link'></i></span>
              <span className='text'>{T.translate('Open in new tab')}</span>
              {/* {globalThis.hubleto.config.projectUrl + '/' + getRecordFormUrl()} */}
            </a>
            {/* <button
              className='btn btn-transparent'
              title={T.translate('Copy link to clipboard', 'Hubleto\\Erp\\Loader', 'Components\\FormExtended')}
              onClick={() => {
                navigator.clipboard.writeText(globalThis.hubleto.config.projectUrl + '/' + getRecordFormUrl());
              }}
            >
              <span className='icon'><i className='fas fa-copy'></i></span>
            </button> */}
          </> : null}
          {props.id > 0 ? <a
            className='btn btn-white'
            href={globalThis.hubleto.config.projectUrl + '/ai-assistant?model=' + model + '&id=' + props.id}
            target='_blank'
          >
            <span className='icon'><i className='fas fa-wand-magic-sparkles'></i></span>
            <span className='text'>{T.translate('Help with AI')}</span>
          </a> : null}
          {/* {recordChanged ? <div className='block'><i className='fas fa-pencil'></i></div> : null} */}
        </div>
        <div className='flex gap-2 items-center'>
          {inputs && inputs.date_created ? <Input field='date_created' renderOnlyInputField customInputProps={{readonly: true}} /> : null}
          {inputs && inputs.id_created_by ? <Input field='id_created_by' renderOnlyInputField customInputProps={{readonly: true}} /> : null}
          {inputs && inputs.date_updated ? <Input field='date_updated' renderOnlyInputField customInputProps={{readonly: true}} /> : null}
          {inputs && inputs.id_updated_by ? <Input field='id_updated_by' renderOnlyInputField customInputProps={{readonly: true}} /> : null}
        </div>
        {props.junctionModel ?
          <div className='badge flex gap-2'>
            <div><i className='fas fa-link'></i></div>
            <div>{props.junctionTitle}</div>
            <div>#{props.junctionSourceRecordId}<br/></div>
          </div>
        : null}
        <div className='flex gap-2'>
          <RenderCopyButton />
          <RenderDeleteButton />
        </div>
      </div>
    </div>;
  };

  const renderDefaultTitle = (): React.JSX.Element => {
    const inputs = description.inputs;
    if (description?.ui?.title) {
      return <div>
        <h2>{description?.ui?.title}</h2>
        <div className='flex gap-2'>
          {inputs && inputs.color ? <Input field='color' readonly={false} renderOnlyInputField /> : null}
          {description?.ui?.subTitle ? <small>{description?.ui?.subTitle}</small> : null}
        </div>
      </div>;
    } else if (props.title) {
      let fields = [];

      if (props.title.fields) fields = props.title.fields;
      else if (props.title.field) fields = [props.title.field];

      const h2 = fields.map((field) => {
        const fieldValue: string = useRecordField(field, '');
        return fieldValue == ''
          ? <span className='opacity-20 italic'>[empty]</span>
          : <span>{fieldValue}</span>
        ;
      });

      return <div>
        {props.title.main ? <h2>{props.title.main}</h2> : null}
        {h2 ? <h2 className='flex gap-2'>{h2}</h2> : null}
        <div className='flex gap-2'>
          {inputs && inputs.color ? <Input field='color' readonly={false} renderOnlyInputField /> : null}
          <small>{props.title.sub}</small>
        </div>
      </div>;
    } else {
      return <div>
        <h2>{updatingRecord
          ? T.translate('Record', 'Hubleto\\Erp\\Loader', 'Components\\Form') + ' #' + (props.id ?? '-')
          : T.translate('New record', 'Hubleto\\Erp\\Loader', 'Components\\Form')
        }</h2>
      </div>;
    }
  };

  const renderDefaultWarningsOrErrors = (): React.JSX.Element => {
    let warningsOrErrors: Array<React.JSX.Element> = [];

    if (recordDeleted) {
      warningsOrErrors.push(
        <div className="alert alert-danger m-1">
          Record has been deleted.
        </div>
      );
    }

    return <>
      {warningsOrErrors.map((item) => item)}
      <RenderSaveErrorMessage />
    </>;
  };

  const renderDefaultSaveErrorMessage = (): React.JSX.Element => {
    return saveError && saveError.message
      ? <div className='text-white bg-red-300 p-2 whitespace-pre-line'>{saveError.message}</div>
      : null
    ;
  };






  const myself: FormMeta = {
    uid: props.uid,
    readonly, model,
    originalRecord, invalidInputs,
    creatingRecord, updatingRecord,
    permissions, recordChanged, savedSuccessfully,
    saveRecord, closeForm, loadRecord,
    id,
    getTitleAsText, setShowPreviewUi, changeRecord,
    showPreviewUi, description,
    changeField, setReadonly, recordStore, getRecord,
    activeTabUid,

    renderDefaultTopMenuButton,
    renderDefaultTopMenu,
    renderDefaultTimeline,
    renderDefaultTab,
    renderDefaultContent,
    renderDefaultPrintPreviewUi,
    renderDefaultHeaderExtraButtons,
    renderDefaultFooterExtraButtons,
    renderDefaultSaveButton,
    renderDefaultCopyButton,
    renderDefaultDeleteButton,
    renderDefaultPrevRecordButton,
    renderDefaultNextRecordButton,
    renderDefaultFullscreenButton,
    renderDefaultCloseButton,
    renderDefaultPrintPreviewUiButton,
    renderDefaultHeader,
    renderDefaultHeaderLeft,
    renderDefaultHeaderRight,
    renderDefaultFooter,
    renderDefaultTitle,
    renderDefaultWarningsOrErrors,
    renderDefaultSaveErrorMessage,
  }









  let finalContent = null;

  if (loadRecordError) {
    finalContent = <>
      <div className="alert alert-danger m-4">Unable to load record. Check your permissions or contact administrator.</div>
      <div className="m-4"><code>{loadRecordError.message}</code></div>
    </>
  } else {
    try {
      finalContent = (isInitialized ? <>
        {showHeader ? <> <RenderHeader /> <RenderHeaderExtraButtons /> </> : null}
        <RenderWarningsOrErrors />
        <RenderTopMenu />
        <RenderTopInputs />
        <RenderContent />
        {showFooter ? <> <RenderFooterExtraButtons /> <RenderFooter /> </> : null}
      </> : <div className="p-8 m-auto">
        <Spinner>{T.translate('Loading record, please wait.')}</Spinner>
      </div>);
    } catch(e) {
      console.error('Failed to render form.');
      console.error(e);
      finalContent = <div className="alert alert-danger">Failed to render form. Check console for error log.</div>
    }
  }

  return (
    <FormRecordStoreContext.Provider value={recordStore}>
      <FormMetaContext.Provider value={myself}>
        {finalContent}
      </FormMetaContext.Provider>
    </FormRecordStoreContext.Provider>
  );
};

export default Form;
