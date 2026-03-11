import React, { Component } from "react";
import Form, { FormDescription, FormProps, FormState } from "@hubleto/react-ui/core/Form";
import request from '@hubleto/react-ui/core/Request';
import App from '@hubleto/react-ui/core/App';
import UserSelect from '@hubleto/react-ui/core/Inputs/UserSelect';

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
  timeline?: Array<any>,
}
export interface FormExtendedState extends FormState {
  icon?: string,
  showOwnerManagerSelector?: boolean,
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

  getStateFromProps(props: FormProps) {
    return {
      ...super.getStateFromProps(props),
      isInlineEditing: true,
      icon: this.props.icon,
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

  getCustomTabs()
  {
    const customTabs = this.getParentApp()?.getCustomFormTabs() ?? [];
    return customTabs;
  }

  renderHeaderLeft(): null|JSX.Element {
    return <>
      <div className='flex gap-2 items-center'>
        <div>{this.state.icon ? <i className={this.state.icon + ' text-3xl text-primary/20 m-2'}></i> : null}</div>
        <div className='flex flex-col gap-2'>
          <div className='flex'>{super.renderHeaderLeft()}</div>
        </div>
      </div>
    </>;
  }

  renderFooter(): null|JSX.Element {
    return <>
      <div className='w-full flex justify-between'>
        <div className="flex gap-2 items-center dark:text-white">
          <div>#{this.state.record.id}</div>
          <div>{this.renderPrevRecordButton()}</div>
          <div>{this.renderNextRecordButton()}</div>
          {this.state.recordChanged ? <div className='badge badge-small badge-warning block '>{this.translate('unsaved changes')}</div> : null}
        </div>
        <div className='flex gap-2 items-center'>
          {this.getRecordFormUrl() ? <>
            <a
              className='text-sm text-gray-500 text-nowrap'
              title='Open in new tab'
              href={globalThis.hubleto.config.projectUrl + '/' + this.getRecordFormUrl()}
              target='_blank'
            >
              {globalThis.hubleto.config.projectUrl + '/' + this.getRecordFormUrl()}
            </a>
            <button
              className='btn btn-transparent'
              title='Copy link to clipboard'
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
          readonly={this.state.record.id_manager == globalThis.hubleto.idUser}
        ></ErpWorkflowSelector>
      </div>
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

  // renderContent(): null|JSX.Element {
  //   const R = this.state.record;
  //   let content = super.renderContent();

  //   if (timeline) {
  //     return <div className='flex gap-2'>
  //       <div className='grow'>{content}</div>
  //       <div className='shrink p-2 flex flex-col items-center gap-2 max-w-48'>{timeline}</div>
  //     </div>
  //   } else {
  //     return content;
  //   }

  // }


}
