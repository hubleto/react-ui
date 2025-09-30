import React, { Component } from "react";
import Form, { FormDescription, FormProps, FormState } from "@hubleto/react-ui/core/Form";
import request from '@hubleto/react-ui/core/Request';
import HubletoApp from '@hubleto/react-ui/ext/HubletoApp'

export interface HubletoFormProps extends FormProps {
  junctionTitle?: string,
  junctionModel?: string,
  junctionSourceColumn?: string,
  junctionDestinationColumn?: string,
  junctionSourceRecordId?: number,
  junctionSaveEndpoint?: string,
}
export interface HubletoFormState extends FormState {}

export default class HubletoForm<P, S> extends Form<HubletoFormProps,HubletoFormState> {
  static defaultProps: any = {
    ...Form.defaultProps
  };

  props: HubletoFormProps;
  state: HubletoFormState;

  parentApp: string|HubletoApp;

  constructor(props: HubletoFormProps) {
    super(props);

    this.state = this.getStateFromProps(props);
  }

  getParentApp(): HubletoApp
  {
    if (typeof this.parentApp == 'string') return globalThis.main.getApp(this.parentApp);
    else return this.parentApp;
  }

  getStateFromProps(props: FormProps) {
    return {
      ...super.getStateFromProps(props),
      isInlineEditing: true,
    }
  }

  onAfterSaveRecord(saveResponse) {
    super.onAfterSaveRecord(saveResponse);
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

  getHeaderButtons()
  {
    return this.getParentApp()?.getFormHeaderButtons() ?? [];
  }

  renderHeaderLeft(): null|JSX.Element {
    const headerButtons = this.getHeaderButtons();
    return <div className='flex flex-col gap-2'>
      <div>{super.renderHeaderLeft()}</div>
      {headerButtons && headerButtons.length > 0 ? <div className='flex gap-2'>{headerButtons.map((button, key) => {
        return <button
          className='btn btn-small btn-primary-outline'
          onClick={() => { button.onClick(this); }}
        >
          <span className='text'>{button.title}</span>
        </button>;
      })}</div> : null}
    </div>;
  }

  renderCustomInputs(): Array<JSX.Element> {
    let customInputs: any = [];

    if (this.state?.description?.inputs) {
      Object.keys(this.state.description.inputs).map((inputName) => {
        const inputDesc = this.state.description.inputs[inputName];
        if (inputDesc.isCustom) {
          customInputs.push(this.inputWrapper(inputName));
        }
      });
    }

    return customInputs;
  }

  renderFooter(): null|JSX.Element {
    return <>
      <div className='w-full flex justify-between'>
        <div className="flex gap-2 items-center">
          <div>#{this.state.record.id}</div>
          <div>{this.renderPrevRecordButton()}</div>
          <div>{this.renderNextRecordButton()}</div>
        </div>
        <div>
          {this.getRecordFormUrl() ? <>
            <a
              className='btn btn-transparent btn-small'
              title='Open in new tab'
              href={globalThis.main.config.projectUrl + '/' + this.getRecordFormUrl()}
              target='_blank'
            >
              <span className='icon'><i className='fas fa-link'></i></span>
              <span className='text'>{globalThis.main.config.projectUrl + '/' + this.getRecordFormUrl()}</span>
            </a>
            <button
              className='btn btn-transparent btn-small'
              title='Copy link to clipboard'
              onClick={() => {
                navigator.clipboard.writeText(globalThis.main.config.projectUrl + '/' + this.getRecordFormUrl());
              }}
            >
              <span className='icon'><i className='fas fa-copy'></i></span>
            </button>
          </> : null}
        </div>
        {this.props.junctionModel ? 
          <div className='badge flex gap-2'>
            <div><i className='fas fa-link'></i></div>
            {/* <div>{this.props.junctionModel.substring(this.props.junctionModel.lastIndexOf('/') + 1)}</div> */}
            <div>{this.props.junctionTitle}</div>
            <div>#{this.props.junctionSourceRecordId}<br/></div>
          </div>
        : null}
        <div>
          {this.renderDeleteButton()}
        </div>
      </div>
    </>;
  }

  renderTopMenu(): null|JSX.Element {
    const topMenu = super.renderTopMenu();
    const dynamicMenu = globalThis.main.injectDynamicContent(
      this.constructor.name + ':TopMenu',
      {form: this}
    );

    return <>{topMenu} {dynamicMenu}</>;
  }

}
