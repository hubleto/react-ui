import React, { Component } from 'react'
import Table, { TableProps, TableState } from '@hubleto/react-ui/core/Table';
import HubletoForm, { HubletoFormProps, HubletoFormState } from './HubletoForm';
import HubletoTableExportCsvForm from './HubletoTableExportCsvForm';
import HubletoTableImportCsvForm from './HubletoTableImportCsvForm';
import { getUrlParam } from '@hubleto/react-ui/core/Helper';
import ModalForm from "@hubleto/react-ui/core/ModalForm";
import HubletoTableColumnsCustomize from './HubletoTableColumnsCustomize';

export interface HubletoTableProps extends TableProps {
  junctionTitle?: string,
  junctionModel?: string,
  junctionSourceColumn?: string,
  junctionDestinationColumn?: string,
  junctionSourceRecordId?: number,
  junctionSaveEndpoint?: string,
}

export interface HubletoTableState extends TableState {
  showExportCsvScreen: boolean,
  showImportCsvScreen: boolean,
  showColumnConfigScreen: boolean,
}

export default class HubletoTable<P, S> extends Table<HubletoTableProps, HubletoTableState> {
  static defaultProps = {
    ...Table.defaultProps,
    formUseModalSimple: true,
  }

  props: HubletoTableProps;
  state: HubletoTableState;

  getStateFromProps(props: HubletoTableProps) {
    return {
      ...super.getStateFromProps(props),
      showExportCsvScreen: false,
      showImportCsvScreen: false,
      showColumnConfigScreen: false,
    };
  }

  getEndpointParams(): any {
    return {
      ...super.getEndpointParams(),
      junctionTitle: this.props.junctionTitle,
      junctionModel: this.props.junctionModel,
      junctionSourceColumn: this.props.junctionSourceColumn,
      junctionDestinationColumn: this.props.junctionDestinationColumn,
      junctionSourceRecordId: this.props.junctionSourceRecordId,
      junctionSaveEndpoint: this.props.junctionSaveEndpoint ?? 'api/record/save-junction',
    }
  }

  getFormProps(): any {
    return {
      ...super.getFormProps(),
      junctionTitle: this.props.junctionTitle,
      junctionModel: this.props.junctionModel,
      junctionSourceColumn: this.props.junctionSourceColumn,
      junctionDestinationColumn: this.props.junctionDestinationColumn,
      junctionSourceRecordId: this.props.junctionSourceRecordId,
      junctionSaveEndpoint: this.props.junctionSaveEndpoint ?? 'api/record/save-junction',
    }
  }

  getFormModalProps() {
    if (getUrlParam('recordId') > 0) {
      return {
        ...super.getFormModalProps(),
        type: 'right'
      }
    } else return {...super.getFormModalProps()}
  }

  renderSidebarFilter(): null|JSX.Element {
    if (this.state?.description?.ui?.filters && ! this.state.sidebarFilterHidden) {
      return <div className="flex flex-col gap-2 text-nowrap h-full">
        {Object.keys(this.state.description.ui.filters).map((filterName) => {
          const filter = this.state.description.ui.filters[filterName];
          const filterValue = this.state.filters[filterName] ?? (filter.default ?? null);

          return <div key={filterName}>
            <div className='bg-primary/10 p-1 text-sm'>{filter.title}</div>
            <div className="list">
              {Object.keys(filter.options).map((key: any) => {
                return <button
                  key={key}
                  className={"btn btn-small btn-list-item " + (filterValue == key ? "btn-primary" : "btn-transparent")}
                  style={{borderLeft: (filter.colors && filter.colors[key] ? '0.5em solid ' + filter.colors[key] : null)}}
                  onClick={() => {
                    let filters = this.state.filters ?? {};

                    if (filter.type == 'multipleSelectButtons') {
                      if (filterValue) {
                        if (filterValue.includes(key)) {
                          filters[filterName] = [];
                          for (let i in filterValue) {
                            if (filterValue[i] != key) filters[filterName].push(filterValue[i]);
                          }
                        } else {
                          filters[filterName] = filterValue;
                          filters[filterName].push(key);
                        }
                      } else {
                        filters[filterName] = [ key ];
                      }
                    } else {
                      filters[filterName] = key;
                    }

                    this.setState({recordId: 0, filters: filters}, () => this.loadData());
                  }}
                >
                  {filter.type == 'multipleSelectButtons' ?
                    <span className="icon"><input type="checkbox" checked={filterValue && filterValue.includes(key)}></input></span>
                  : null}
                  <span className="text">{filter.options[key]}</span>
                </button>;
              })}
            </div>
          </div>;
        })}
      </div>;
    } else {
      return null;
    }
  }

  renderForm(): JSX.Element {
    let formProps: HubletoFormProps = this.getFormProps();
    return <HubletoForm {...formProps}/>;
  }

  renderContent(): JSX.Element {
    return <>
      {super.renderContent()}
      {this.state.showExportCsvScreen ?
        <ModalForm
          uid={this.props.uid + '_export_csv_modal'}
          isOpen={true}
          type='centered large'
        >
          <HubletoTableExportCsvForm
            model={this.props.model}
            parentTable={this}
            showInModal={true}
            showInModalSimple={true}
            onClose={() => { this.setState({showExportCsvScreen: false}); }}
          ></HubletoTableExportCsvForm>
        </ModalForm>
      : null}
      {this.state.showImportCsvScreen ?
        <ModalForm
          uid={this.props.uid + '_import_csv_modal'}
          isOpen={true}
          type='centered large'
        >
          <HubletoTableImportCsvForm
            model={this.props.model}
            parentTable={this}
            showInModal={true}
            showInModalSimple={true}
            onClose={() => { this.setState({showImportCsvScreen: false}); }}
          ></HubletoTableImportCsvForm>
        </ModalForm>
      : null}
      {this.state.showColumnConfigScreen ?
        <ModalForm
          uid={this.props.uid + '_columns_config_modal'}
          isOpen={true}
          type='right'
          title='Customize Columns'
        >
          <HubletoTableColumnsCustomize
            parentTable={this}
            tableTag={this.props.tag}
            tableModel={this.model}
            onClose={() => this.setState({showColumnConfigScreen: false})}
          ></HubletoTableColumnsCustomize>
        </ModalForm>
      : null}
    </>;
  }
}