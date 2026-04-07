import React, { Component } from "react";
import Form, { FormDescription, FormProps, FormState } from "@hubleto/react-ui/core/Form";
import request from '@hubleto/react-ui/core/Request';
import App from '@hubleto/react-ui/core/App';
import UserSelect from '@hubleto/react-ui/core/Inputs/UserSelect';
import HtmlFrame from "@hubleto/react-ui/core/HtmlFrame";

//@ts-ignore
import ErpWorkflowSelector from '@hubleto/react-ui/ext/ErpWorkflowSelector';
import moment from "moment";

export interface FormExtendedProps extends FormProps {
  icon?: string,
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
}
export interface FormExtendedState extends FormState {
  icon?: string,
  showOwnerManagerSelector?: boolean,
  htmlPreview?: any,
}

export default class FormExtended<P, S> extends Form<FormExtendedProps,FormExtendedState> {
  static defaultProps: any = {
    ...Form.defaultProps
  };

  props: FormExtendedProps;
  state: FormExtendedState;

  parentApp: string|App;

  constructor(props: FormExtendedProps) {
    super(props);

    this.state = this.getStateFromProps(props);
  }

  getParentApp(): App
  {
    if (typeof this.parentApp == 'string') return globalThis.hubleto.getApp(this.parentApp);
    else return this.parentApp;
  }

  getTabsLeft() {
    return [];
  }

  getCustomTabs()
  {
    const customTabs = this.getParentApp()?.getCustomFormTabs() ?? [];
    return customTabs;
  }

  getTabsRight() {
    let tabs = [];
    if (this.props.renderPreviewUi) {
      tabs.push({ uid: 'preview', icon: 'fas fa-print', cssClass: 'btn-violet', position: 'right' });
    }

    return tabs;
  }

  getTabs() {
    return [
      ...this.getTabsLeft(),
      ...this.getCustomTabs(),
      ...this.getTabsRight(),
    ];
  }

  getStateFromProps(props: FormProps) {
    return {
      ...super.getStateFromProps(props),
      isInlineEditing: true,
      icon: this.props.icon,
      tabs: this.getTabs(),
    }
  }

  getTitleAsText() {
    return this.props.model.split('/').pop() + ' ' + this.state.record.id;
  }

  updatePreview(idTemplate: number) {
    request.post(
      'documents/api/get-preview-html',
      {
        model: this.props.model,
        recordId: this.state.record.id,
        idTemplate: idTemplate,
      },
      {},
      (result: any) => {
        this.setState({htmlPreview: result.html});
      }
    );
  }

  showPreviewVars() {
    request.post(
      'documents/api/get-preview-vars',
      {
        model: this.props.model,
        recordId: this.state.record.id,
      },
      {},
      (vars: any) => {
        this.setState({htmlPreview: '<pre>' + JSON.stringify(vars.vars, null, 2) + '</pre>'});
      }
    );
  }

  generatePdf() {
    request.post(
      'documents/api/generate-pdf',
      {
        model: this.props.model,
        recordId: this.state.record.id,
        documentName: this.getTitleAsText(),
      },
      {},
      (result: any) => {
        // if (result.idDocument) {
        //   window.open(globalThis.hubleto.config.projectUrl + '/documents/' + result.idDocument);
        // }
        // this.reload();
        if (result && result.pdfFile) {
          this.updateRecord({
            idDocument: result.idDocument,
            pdf: result.pdfFile,
          });
        }
      }
    );
  }

  onTabChange() {
    super.onTabChange();

    const tabUid = this.state.activeTabUid;
    switch (tabUid) {
      case 'preview':
        this.updatePreview(this.state.record.id_template);
      break;
    }
  }
  onAfterSaveRecord(saveResponse, customSaveOptions?: any) {
    super.onAfterSaveRecord(saveResponse, customSaveOptions);
    if (
      this.props.junctionSaveEndpoint
      && this.props.junctionModel
      && this.props.junctionSourceColumn
      && this.props.junctionDestinationColumn
      && this.props.junctionSourceRecordId
    ) {
      request.post(
        this.props.junctionSaveEndpoint,
        {
          junctionModel: this.props.junctionModel,
          junctionSourceColumn: this.props.junctionSourceColumn,
          junctionDestinationColumn: this.props.junctionDestinationColumn,
          junctionSourceRecordId: this.props.junctionSourceRecordId,
          junctionDestinationRecordId: saveResponse.savedRecord['id'],
        },
        {},
        (data: any) => { /* */ }
      );
    }
  }

  renderHeaderLeft(): null|JSX.Element {
    return <>
      <div className='flex gap-2 items-center'>
        <div className='hidden md:block'>{this.state.icon ? <i className={this.state.icon + ' text-3xl text-primary/20 m-2'}></i> : null}</div>
        <div className='flex flex-col gap-2'>
          <div className='flex'>{super.renderHeaderLeft()}</div>
        </div>
      </div>
    </>;
  }

  renderFooter(): null|JSX.Element {
    return <>
      {this.state.record.id > 0 ? <a
        className='btn btn-primary-outline'
        href={globalThis.hubleto.config.projectUrl + '/ai-assistant?model=' + this.props.model + '&id=' + this.state.record.id}
        target='_blank'
      >
        <span className='icon'><i className='fas fa-wand-magic-sparkles'></i></span>
      </a> : null}
      <div className='w-full flex justify-between flex-col md:flex-row'>
        <div className="flex gap-2 items-center dark:text-white">
          <div>#{this.state.record.id}</div>
          <div>{this.renderPrevRecordButton()}</div>
          <div>{this.renderNextRecordButton()}</div>
          {this.state.recordChanged ? <div className='badge badge-small badge-warning block '>{this.translate('unsaved changes', 'Hubleto\\Erp\\Loader', 'Components\\FormExtended')}</div> : null}
        </div>
        <div className='flex gap-2 items-center'>
          {this.getRecordFormUrl() ? <>
            <a
              className='text-sm text-gray-500 text-nowrap'
              title={this.translate('Open in new tab', 'Hubleto\\Erp\\Loader', 'Components\\FormExtended')}
              href={globalThis.hubleto.config.projectUrl + '/' + this.getRecordFormUrl()}
              target='_blank'
            >
              {globalThis.hubleto.config.projectUrl + '/' + this.getRecordFormUrl()}
            </a>
            <button
              className='btn btn-transparent'
              title={this.translate('Copy link to clipboard', 'Hubleto\\Erp\\Loader', 'Components\\FormExtended')}
              onClick={() => {
                navigator.clipboard.writeText(globalThis.hubleto.config.projectUrl + '/' + this.getRecordFormUrl());
              }}
            >
              <span className='icon'><i className='fas fa-copy'></i></span>
            </button>
          </> : null}
          {this.state.description && this.state.description.inputs && this.state.description.inputs.shared_with
            ? this.input('shared_with')
            : null
          }
        </div>
        {this.props.junctionModel ?
          <div className='badge flex gap-2'>
            <div><i className='fas fa-link'></i></div>
            {/* <div>{this.props.junctionModel.substring(this.props.junctionModel.lastIndexOf('/') + 1)}</div> */}
            <div>{this.props.junctionTitle}</div>
            <div>#{this.props.junctionSourceRecordId}<br/></div>
          </div>
        : null}
        <div className='flex gap-2'>
          {this.renderCopyButton()}
          {this.renderDeleteButton()}
        </div>
      </div>
    </>;
  }

  renderWorkflowUi() {
    return (this.state.id <= 0 ? null : <div className='flex grow p-2 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800'>
      <div className='flex-2'>
        <ErpWorkflowSelector
          parentForm={this}
          readonly={this.state.record.id_manager && this.state.record.id_manager != globalThis.hubleto.idUser}
        ></ErpWorkflowSelector>
      </div>
      {/* [{this.state.record.id_manager}, {globalThis.hubleto.idUser}] */}
      {this.state.description && this.state.description.inputs && this.state.description.inputs.is_closed
        ? <div className='text-right'>{this.inputWrapper('is_closed', {wrapperCssClass: 'flex gap-2'})}</div>
        : null
      }
    </div>);
  }

  renderOwnerManagerUi() {
    const idOwner = this.state.record.id_owner;
    const owner = globalThis.hubleto.users ? globalThis.hubleto.users[idOwner] : null;
    const idManager = this.state.record.id_manager;
    const manager = globalThis.hubleto.users ? globalThis.hubleto.users[idManager] : null;

    return <div className='p-2 flex flex-col'>
      <div className='btn-group flex-col'>
        <div className='btn btn-transparent' onClick={() => { this.setState({showOwnerManagerSelector: !this.state.showOwnerManagerSelector})}}>
          <span className="text flex gap-2">{owner ? <>
            <span className='text-xs text-gray-500'>Owner</span>
            {owner.photo ?
              <img
                src={globalThis.hubleto.config.uploadUrl + '/' + owner.photo}
                className='max-w-4 max-h-4 rounded-xl'
              />
            : null}
            <span className='text-xs'>{
              (Array.from(owner.first_name ?? '')[0]).toString()
              + (Array.from(owner.last_name ?? '')[0]).toString()
              + (owner.id == globalThis.hubleto.idUser ? ' (you) ' : '')
            }</span>
          </> : '-'}</span>
        </div>
        <div className='btn btn-transparent' onClick={() => { this.setState({showOwnerManagerSelector: !this.state.showOwnerManagerSelector})}}>
          <span className="text flex gap-2">{manager ? <>
            <span className='text-xs text-gray-500'>Manager</span>
            {manager.photo ?
              <img
                src={globalThis.hubleto.config.uploadUrl + '/' + manager.photo}
                className='max-w-4 max-h-4 rounded-xl'
              />
            : null}
            <span className='text-xs'>{
              (Array.from(manager.first_name ?? '')[0]).toString()
              + (Array.from(manager.last_name ?? '')[0]).toString()
              + (manager.id == globalThis.hubleto.idUser ? ' (you) ' : '')
            }</span>
          </> : '-'}</span>
        </div>
      </div>
      {this.state.showOwnerManagerSelector ? <div
        className='relative w-0 h-0'
        style={{zIndex: 99999999999}}
      >
        <div
          className='mt-2 shadow min-w-64 border border-primary bg-white rounded'
        >
          {this.inputWrapper('id_owner')}
          {this.inputWrapper('id_manager')}
        </div>
      </div> : null}
    </div>;
  }

  renderTopMenu(): null|JSX.Element {
    const topMenu = super.renderTopMenu();
    const dynamicMenu = globalThis.hubleto.injectDynamicContent(
      this.constructor.name + ':TopMenu',
      {form: this}
    );

    let topMenuWithDynamicMenu = null;
    if (topMenu != null || dynamicMenu != null) {
      topMenuWithDynamicMenu = <>{topMenu} {dynamicMenu}</>;
    }

    let workflowUi = null;

    if (this.props.renderWorkflowUi) {
      workflowUi = this.renderWorkflowUi();
    }

    let ownerManagerUi = null;

    if (this.props.renderOwnerManagerUi) {
      ownerManagerUi = this.renderOwnerManagerUi();
    }

    return <div className='flex flex-col'>
      {topMenuWithDynamicMenu}
      <div className='flex justify-between'>
        {ownerManagerUi}
        {workflowUi}
      </div>
    </div>
  }

  renderTimeline(timelineConfig: any): null|JSX.Element {
    let timeline = null;
    let timelinePointsUnsorted = {};

    timelineConfig.map((aboutEntry, key) => {
      const entries = aboutEntry.data(this) ?? [];
      
      entries.map((entry, key) => {
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
      .reduce((obj, key) => {
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

  renderTab(tabUid: string) {
    const R = this.state.record;

    switch (tabUid) {
      case 'preview':
        return <div className='flex gap-2 h-full'>
          <div className='flex-1 w-72 flex flex-col gap-2'>
            <div className='grow'>
              {this.inputWrapper('id_template', {
                uiStyle: 'buttons-vertical',
                onChange: (input: any) => {
                  this.updatePreview(input.state.value);
                }
              })}
            </div>
            {this.inputWrapper('id_document', {readonly: true})}
          </div>
          <div className='flex-3 flex flex-col'>
            <div className='flex gap-2 align-center justify-end'>
              <div>
                {this.input('pdf', {readonly: true})}
              </div>
              <div className='flex gap-2'>
                <button
                  className='btn btn-transparent mb-4'
                  onClick={() => {
                    this.generatePdf();
                  }}
                >
                  <span className='icon'><i className='fas fa-download'></i></span>
                  <span className='text'>{this.translate('Export to PDF')}</span>
                </button>
                <button
                  className='btn btn-transparent mb-4'
                  onClick={() => {
                    const iframe = window.frames[this.props.uid + '_preview'];
                    const origDocumentTitle = document.title;

                    document.title += this.getTitleAsText();

                    iframe.contentWindow.focus();
                    iframe.contentWindow.print();

                    document.title = origDocumentTitle;
                  }}
                >
                  <span className='icon'><i className='fas fa-print'></i></span>
                  <span className='text'>{this.translate('Print')}</span>
                </button>
              </div>
            </div>
            <div className='w-full h-full card mt-2'>
              <div className="card-body">
                <HtmlFrame
                  className='w-full h-full'
                  iframeId={this.props.uid + '_preview'}
                  content={this.state.htmlPreview}
                />
              </div>
              <div className='card-footer'>
                <a
                  href='#'
                  onClick={() => {
                    this.showPreviewVars();
                  }}
                >{this.translate('Show variables available in template')}</a>
              </div>
            </div>
          </div>
        </div>;
      break;

      default:
        return super.renderTab(tabUid);
      break;
    }
  }

}
