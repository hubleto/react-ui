declare global { var hubleto: any; }

import React, { Component, ChangeEvent, createRef } from 'react';

// 
import { setUrlParam, deleteUrlParam } from "../../core/Helper";
import { ModalProps } from "./Modal";
import ErrorBoundary from "./ErrorBoundary";
import ModalForm from "./ModalForm";
import Form, { FormEndpoint, FormProps, FormState } from "./Form";
import TranslatedComponent from "./TranslatedComponent";
import Spinner from "./Spinner";

import { InputFactory } from "../../core/InputFactory";
import { dateToEUFormat, datetimeToEUFormat } from "./Inputs/DateTime";
import { deepObjectMerge } from "../../core/Helper";
import request from "../../core/Request";

export interface TableEndpoint {
  describeTable: string,
  loadTableData: string,
  saveRecord: string,
  deleteRecord: string,
}

export interface TableOrderBy {
  field: string,
  direction?: string | null
}

export interface TableColumns {
  [key: string]: any;
}

export interface TableInputs {
  [key: string]: any;
}

export type TableSelectionMode = '' | 'single' | 'multiple' | undefined | null;

export interface TablePermissions {
  canCreate?: boolean,
  canRead?: boolean,
  canUpdate?: boolean,
  canDelete?: boolean,
}

export interface TableUi {
  title?: string,
  subTitle?: string,
  addButtonText?: string,
  showHeader?: boolean,
  showFooter?: boolean,
  showFilter?: boolean,
  showSidebarFilter?: boolean,
  showHeaderTitle?: boolean,
  showNoDataAddButton?: boolean,
  showMoreActionsButton?: boolean,
  showAddButton?: boolean,
  showFulltextSearch?: boolean,
  showColumnSearch?: boolean,
  showAsPlainTable?: boolean,
  showInsertRow?: boolean,
  emptyMessage?: any,
  filters?: any,
  customFilters?: any,
  moreActions?: any,
  dataView?: any,
  orderBy?: TableOrderBy,
  selectionMode?: TableSelectionMode,
}

export interface TableDescription {
  columns: TableColumns,
  inputs: TableInputs,
  permissions?: TablePermissions,
  ui?: TableUi,
}

export interface ExternalCallbacks {
  openForm?: string,
  onAddClick?: string,
  onRowClick?: string,
  onSaveRecord?: string,
  onDeleteRecord?: string,
}

interface InvalidInput {
  name: string,
  id: number,
}

export interface TableProps {
  uid: string,
  description?: TableDescription,
  descriptionSource?: 'props' | 'request' | 'both',
  recordId?: any,
  recordDefaultValues?: any,
  formEndpoint?: FormEndpoint,
  formModal?: ModalProps,
  formProps?: FormProps,
  formActiveTabUid?: any,
  formReactComponent?: string,
  formCustomProps?: any,
  endpoint?: TableEndpoint,
  customEndpointParams?: any,
  model: string,
  // parentRecordId?: any,
  parentForm?: Form<FormProps, FormState>,
  // parentFormModel?: string,
  tag?: string,
  context?: string,
  where?: Array<any>,
  params?: any,
  externalCallbacks?: ExternalCallbacks,
  itemsPerPage: number,
  inlineEditingEnabled?: boolean,
  isInlineEditing?: boolean,
  isUsedAsInput?: boolean,
  selectionMode?: TableSelectionMode,
  selection?: Array<any>,
  onChange?: (table: Table<TableProps, TableState>) => void,
  onRowClick?: (table: Table<TableProps, TableState>, row: any) => void,
  onSaveRecord?: (table: Table<TableProps, TableState>) => void,
  onDeleteRecord?: (table: Table<TableProps, TableState>) => void,
  onDeleteSelectionChange?: (table: Table<TableProps, TableState>) => void,
  onSelectionChange?: (table: Table<TableProps, TableState>) => void,
  onAfterLoadData?: (table: Table<TableProps, TableState>) => void,
  data?: TableData,
  async?: boolean,
  readonly?: boolean,
  closeFormAfterSave?: boolean,
  className?: string,
  fulltextSearch?: string,
  columnSearch?: any,
  filters?: any,
  view?: string,
  invalidInputs?: Array<InvalidInput>,
  crudController?: string,
}

// Laravel pagination
interface TableData {
  current_page?: number,
  records: Array<any>,
  first_page_url?: string,
  from?: number,
  last_page_url?: string,
  last_page?: number,
  links?: Array<any>,
  next_page_url?: string|null,
  path?: string,
  per_page?: number,
  prev_page_url?: string|null,
  to?: number,
  total?: number,
  tree?: any,
}

export interface TableState {
  endpoint: TableEndpoint,
  description?: TableDescription,
  loadingData: boolean,
  data?: TableData | null,
  filterBy?: any,
  recordId?: any,
  recordDefaultValues?: any,
  recordSaveAfterOpen?: boolean,
  recordPrevId?: any,
  recordNextId?: any,
  activeRowId?: any,
  formEndpoint?: FormEndpoint,
  formProps?: FormProps,
  formActiveTabUid?: string,
  page: number,
  itemsPerPage: number,
  fulltextSearch?: string,
  columnSearch?: any,
  inlineEditingEnabled: boolean,
  isInlineEditing: boolean,
  isUsedAsInput: boolean,
  selection: Array<any>,
  async: boolean,
  readonly: boolean,
  customEndpointParams: any,
  filters: any,
  sidebarFilterHidden: boolean,
  invalidInputs: Array<InvalidInput>,
  tableUpdateIteration: number,
  myRootUrl: string,
  editMode: string,
  crudController?: string,
  rowToInsert: any,
}

export default class Table<P, S> extends TranslatedComponent<TableProps, TableState> {
  static defaultProps = {
    itemsPerPage: 35,
    descriptionSource: 'both',
    model: '',
  }

  props: TableProps = null;
  state: TableState = null;

  model: string;
  refFulltextSearchInput: any = null;
  refForm: any = null;
  refFormModal: any = null;

  dt = createRef();

  constructor(props: TableProps) {
    super(props);

    this.props = props;

    globalThis.hubleto.reactElements[this.props.uid] = this;

    const lang = globalThis.hubleto.language;

    this.refFulltextSearchInput = React.createRef();
    this.refForm = React.createRef();
    this.refFormModal = React.createRef();

    this.model = this.props.model ?? '';

    this.state = this.getStateFromProps(this.props);
  }

  getStateFromProps(props: TableProps): TableState {
    let state: any = {
      endpoint: props.endpoint ? props.endpoint : (globalThis.hubleto.config.defaultTableEndpoint ?? {
        describeTable: 'api/table/describe',
        loadTableData: 'api/record/load-table-data',
        saveRecord: 'api/record/save',
        deleteRecord: 'api/record/delete',
      }),
      recordId: props.recordId,
      activeRowId: props.recordId,
      formEndpoint: props.formEndpoint ? props.formEndpoint : (globalThis.hubleto.config.defaultFormEndpoint ?? null),
      formProps: {
        model: this.model,
        uid: props.uid,
      },
      formActiveTabUid: 'default',
      loadingData: false,
      page: 1,
      itemsPerPage: props.itemsPerPage,
      inlineEditingEnabled: props.inlineEditingEnabled ? props.inlineEditingEnabled : false,
      isInlineEditing: props.isInlineEditing ? props.isInlineEditing : false,
      isUsedAsInput: props.isUsedAsInput ? props.isUsedAsInput : false,
      selection: props.selection ?? [],
      async: props.async ?? true,
      readonly: props.readonly ?? false,
      customEndpointParams: props.customEndpointParams ?? {},
      fulltextSearch: props.fulltextSearch ?? '',
      columnSearch: props.columnSearch ?? {},
      filters: props.filters ?? {},
      sidebarFilterHidden: false,
      invalidInputs: props.invalidInputs ?? [],
      tableUpdateIteration: 0,
      editMode: '',
      myRootUrl: window.location.protocol + "//" + window.location.host + window.location.pathname,
      crudController: props.crudController ?? '',
    };

    if (props.description) state.description = props.description;
    if (props.data) state.data = props.data;

    return state;
  }

  componentDidMount() {
    if (this.state?.async) {
      this.loadTableDescription(() => {;
        this.loadData();
      });
    }
  }

  componentDidUpdate(prevProps: TableProps) {
    if (
      (prevProps.formProps?.id != this.props.formProps?.id)
      // || (prevProps.parentRecordId != this.props.parentRecordId)
    ) {
      this.state.formProps = this.props.formProps;
      if (this.state.async) {
        this.loadTableDescription();
        this.loadData();
      }
    }

    if (
      prevProps.data != this.props.data
      || prevProps.description != this.props.description
    ) {
      this.setState(this.getStateFromProps(this.props), () => {
        if (this.state.async) {
          this.loadTableDescription();
          this.loadData();
        }
      })
    }

    if (prevProps.invalidInputs !== this.props.invalidInputs) {
      this.setState({ invalidInputs: this.props.invalidInputs ?? [], tableUpdateIteration: this.state.tableUpdateIteration + 1 });
    }
  }

  onAfterLoadTableDescription(description: any): any {
    return description;
  }

  // getEndpointUrl(): string {
  //   return this.state.endpoint;
  // }

  getEndpointUrl(action: string) {
    return this.state.endpoint[action as keyof TableEndpoint] ?? '';
  }

  getEndpointParams(): any {
    let filters = this.state.filters;

    if (this.state.description?.ui?.filters) {
      Object.keys(this.state.description.ui.filters).map((filterName) => {
        const filter = this.state.description?.ui?.filters[filterName];
        if (!filters[filterName] && (filter.default ?? null) !== null) {
          filters[filterName] = filter.default;
        }
      });
    }

    return {

      filterBy: this.state.filterBy,
      model: this.model,
      crudController: this.state.crudController,
      orderBy: this.state.description?.ui?.orderBy ?? { field: 'id', direction: 'desc' },
      page: this.state.page ?? 0,
      itemsPerPage: this.state.itemsPerPage ?? 35,
      fulltextSearch: this.state.fulltextSearch,
      columnSearch: this.state.columnSearch,
      tag: this.props.tag,
      context: this.props.context,
      where: this.props.where,

      filters: this.state.filters,
      // parentRecordId: this.props.parentRecordId ? this.props.parentRecordId : 0,
      // parentFormModel: this.props.parentFormModel ? this.props.parentFormModel : '',
      dataView: this.state.description?.ui?.dataView,
      view: this.props.view,
      __IS_AJAX__: '1',
      ...this.props.customEndpointParams,
    }
  }

  getCsvImportEndpointParams(): any {
    return null;
  }

  getSelectionMode(): TableSelectionMode {
    return this.props.selectionMode ?? this.state.description?.ui?.selectionMode ?? '';
  }

  getRecordsToDisplay(): any {
    const showInsertRow = this.state.description?.ui?.showInsertRow;

    let records = this.state.data?.records ?? [];

    if (showInsertRow) {
      records = records.filter((record) => !record._isInsertRow_);
      records.push({
        _isInsertRow_: true,
        ...(this.state.rowToInsert ?? {})
      });
    }

    return records;
  }

  getTableProps(): Object {
    const sortOrders = {asc: 1, desc: -1};
    const totalRecords = this.state.data?.total ?? 0;
    const showColumnSearch = this.state.description?.ui?.showColumnSearch;
    const selectionMode = this.getSelectionMode();

    let records = this.getRecordsToDisplay();

    let tableProps: any = {

      resizableColumns: true,
      showGridlines: true,

      // Dusan 19.11.2025: sposobovalo to konzolovu chybu, docasne zakomentovane
      // invalidInputs: this.props.invalidInputs,
      key: this.state.tableUpdateIteration,
      ref: this.dt,
      // value: records,
      dataKey: "id",
      first: (this.state.page - 1) * this.state.itemsPerPage,
      paginator: totalRecords > this.state.itemsPerPage,
      lazy: true,
      editMode: this.state.editMode,
      rows: this.state.itemsPerPage,
      filterDisplay: (showColumnSearch ? 'row' : null),
      totalRecords: totalRecords,
      rowsPerPageOptions: [5, 15, 30, 50, 100, 200, 300, 500, 750, 1000, 1500, 2000],
      paginatorTemplate: "FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown",
      currentPageReportTemplate: "{first}-{last} / {totalRecords}",
      // onRowClick: (data: any) => this.onRowClick(data.data),
      // onRowSelect: (event: any) => this.onRowSelect(event),
      // onRowUnselect: (event: any) => this.onRowUnselect(event),
      sortOrder: sortOrders[(this.state.description?.ui?.orderBy?.direction ?? 'desc') as keyof typeof sortOrders],
      sortField: this.state.description?.ui?.orderBy?.field ?? 'id',
      rowClassName: (rowData: any) => this.rowClassName(rowData),
      stripedRows: true,
      emptyMessage: this.props.description?.ui?.emptyMessage || <>
        <div className="p-2">{this.translate('No data.', 'Hubleto\\Erp\\Loader', 'Components\\Table')}</div>
      </>,
      selectAll: true,
      selection: this.state.selection,
      selectionMode: selectionMode == 'single' ? 'radiobutton' : (selectionMode == 'multiple' ? 'checkbox' : null),
      onSelectionChange: (event: any) => {
        this.setState(
          {selection: event.value} as TableState,
          () => { this.onSelectionChange(); }
        )
      },
      footer: () => {
        let hiddenRecordsCount = 0;
        let footer = [];

        if (this.state.data?.records) {
          this.state.data?.records.map((item, index) => {
            if (item._PERMISSIONS && !item._PERMISSIONS[1]) hiddenRecordsCount++;
          });
        }

        if (hiddenRecordsCount > 0) {
          footer.push(<div className='badge badge-warning'>⚠ {hiddenRecordsCount} {this.translate('records were hidden based on your permissions.', 'Hubleto\\Erp\\Loader', 'Components\\Table')}</div>);
        }

        if (this.state.description?.ui?.showFooter) footer.push(this.renderFooter());

        return footer;
      }
    };

    

    return tableProps;
  }

  reload() {
    this.setState({isInitialized: false}, () => {
      this.loadTableDescription(() => {
        this.loadData();
      });

    });
  }

  loadTableDescription(successCallback?: (params: any) => void) {

    if (this.props.descriptionSource == 'props') return;

    request.get(
      this.getEndpointUrl('describeTable'),
      this.getEndpointParams(),
      (description: any) => {
        try {

          if (this.props.description && this.props.descriptionSource == 'both') description = deepObjectMerge(description, this.props.description);

          description = this.onAfterLoadTableDescription(description);

          this.setState({description: description}, () => {
            if (successCallback) successCallback(description);
          });
        } catch (err: any) {
          alert(err.message);
        }
      }
    );
  }

  loadData() {
    if (this.props.data) {
      this.setState({data: this.props.data});
    } else {
      this.setState({loadingData: true}, () => {
        request.get(
          this.getEndpointUrl('loadTableData'),
          {
            ...this.getEndpointParams(),
          },
          (data: any) => {
            this.setState({
              loadingData: false,
              data: data,
            }, () => {
              if (this.props.onAfterLoadData) {
                this.props.onAfterLoadData(this);
              }
            });
          }
        );
      });
    }
  }

  getFormProps(): FormProps {
    let description = this.props.formProps?.description ?? {};
    if (this.state.recordDefaultValues) {
      description.defaultValues = description.defaultValues ?? {};
      description.defaultValues = { ...description.defaultValues, ...this.state.recordDefaultValues };
    }
    return {
      // isInitialized: false,
      ref: this.refForm,
      modal: this.refFormModal,
      parentTable: this,
      uid: this.props.uid + '_form',
      model: this.model,
      tag: this.props.tag,
      activeTabUid: this.props.formActiveTabUid,
      context: this.props.context,
      id: this.state.recordId ?? null,
      prevId: this.state?.recordPrevId ?? 0,
      nextId: this.state?.recordNextId ?? 0,
      endpoint: this.state.formEndpoint,
      // defaultValues: this.state.recordDefaultValues,
      saveRecordWhenInitialized: this.state.recordSaveAfterOpen,
      showInModal: true,
      description: description,
      ...this.props.formCustomProps ?? {},
      customEndpointParams: this.state.customEndpointParams ?? {},
      onClose: () => {
       this.closeForm();
      },
      onSaveCallback: (form: Form<FormProps, FormState>, saveResponse: any) => {
        this.reload();
        if (this.props.closeFormAfterSave ?? false) {
          this.closeForm();
        } else if (saveResponse && saveResponse.savedRecord.id) {
          this.openForm(saveResponse.savedRecord.id);
        }
      },
      // onCopyCallback: (form: Form<FormProps, FormState>, saveResponse: any) => {
      //   this.loadData();
      //   this.openForm(saveResponse.savedRecord.id);
      // },
      onDeleteCallback: () => {
        this.loadData();
        this.setState({ recordId: null });
      },
    }
  }

  getFormModalProps(): any {
    return {
      ref: this.refFormModal,
      uid: this.props.uid + '_form',
      type: this.state.recordId == -1 ? 'centered' : 'right',
      hideHeader: true,
      isOpen: this.state.recordId !== null,
      form: this.refForm,
      onClose: () => {
        this.closeForm();
      },
      ...this.props.formModal
    }
  }

  cellClassName(columnName: string, column: any, rowData: any) {
    let cellClassName = 'table-cell-content ' + (column.cssClass ?? '');

    if (column.tableCssClass) {
      cellClassName += ' ' + column.tableCssClass;
    }

    if (column.enumValues) {
      cellClassName += ' badge ' + (column.enumCssClasses ? (column.enumCssClasses[rowData[columnName]] ?? '') : '');
    } else {
      cellClassName += ' column-' + column.type;
    }

    if (column.textAlign == 'right') cellClassName += ' text-right float-right';
    else if (column.textAlign == 'center') cellClassName += ' text-center m-auto';
    else cellClassName += ' text-left';

    if (column.colorScale) {
      const min: number = this.getMinColumnValue(columnName);
      const max: number = this.getMaxColumnValue(columnName);
      const val: number = Number(rowData[columnName] ?? 0);
      const step: number = (max - min) / 5;
      const colorIndex = Math.min(5, Math.floor((val - min) / step) + 1);

      cellClassName += ' ' + column.colorScale + '---step-' + colorIndex;
    }

    return cellClassName;
  }

  cellCssStyle(columnName: string, column: any, rowData: any) {
    return column.cssStyle ?? {};
  }

  getMinColumnValue(columnName: string): number {
    let min: number = 0;
    let assigned: boolean = false;
    if (this.state.data?.records) {
      for (let i in this.state.data.records) {
        let val = Number(this.state.data.records[i][columnName] ?? 0);
        if (!assigned || val < min) min = val;
        assigned = true;
      }
    }
    return min;
  }

  getMaxColumnValue(columnName: string): number {
    let max: number = 0;
    let assigned: boolean = false;
    if (this.state.data?.records) {
      for (let i in this.state.data.records) {
        let val = Number(this.state.data.records[i][columnName] ?? 0);
        if (!assigned || val > max) max = val;
        assigned = true;
      }
    }
    return max;
  }

  rowClassName(rowData: any): string {
    let cssClasses: any = [];

    if (rowData._PERMISSIONS && !rowData._PERMISSIONS[1]) cssClasses.push('hidden-record');
    if (rowData.id === this.state.activeRowId) cssClasses.push('highlighted');
    if (rowData._isInsertRow_) cssClasses.push('insert-row');

    return cssClasses.join(' ');
  }

  showAddButton(): boolean {
    if (
      !this.state.readonly
      && this.state.description?.ui?.showHeader
      && this.state.description?.ui?.showAddButton
      && this.state.description?.permissions?.canCreate
    ) {
      return true;
    } else {
      return false;
    }
  }

  renderAddButton(forEmptyMessage?: boolean): React.JSX.Element {
    return (
      <button
        key="add-btn"
        className={"btn " + (forEmptyMessage ? "btn-white btn-small" : "btn-add")}
        onClick={() => this.onAddClick()}
      >
        <span className="icon"><i className="fas fa-plus"/></span>
        {this.state.description?.ui?.addButtonText ? <span className="text text-nowrap">{this.state.description?.ui?.addButtonText}</span> : null}
      </button>
    );
  }

  showMoreActionsButton(): boolean {
    if (this.state?.description?.ui?.showMoreActionsButton) {
      return true;
    } else {
      return false;
    }
  }

  renderMoreActionsButton(): React.JSX.Element {
    let moreActions = {
      showHideFilter: {
        title: this.translate('Show/Hide filter', 'Hubleto\\Erp\\Loader', 'Components\\Table'),
        icon: 'fas fa-filter',
        type: 'onclick',
        onClick: () => {
          this.setState({sidebarFilterHidden: !this.state.sidebarFilterHidden});
        }
      },
      showAsPlainTable: {
        title: (this.state?.description?.ui?.showAsPlainTable ? 
          this.translate('Show as standard table', 'Hubleto\\Erp\\Loader', 'Components\\Table') 
          : this.translate('Show as plain table', 'Hubleto\\Erp\\Loader', 'Components\\Table')),
        icon: 'fas fa-table',
        type: 'onclick',
        onClick: () => {
          let description: any = this.state?.description ?? {};
          if (!description.ui) description.ui = {};
          description.ui.showAsPlainTable = !description.ui.showAsPlainTable;
          this.setState({description: description});
        }
      },
      ...(this.state?.description?.ui?.moreActions ?? [])
    };

    if (!this.state.readonly) {
      moreActions['toggleEditMode'] = {
        title: (this.state?.editMode == 'cell' ?
          this.translate('Disable edit mode', 'Hubleto\\Erp\\Loader', 'Components\\Table') 
          : this.translate('Enable edit mode', 'Hubleto\\Erp\\Loader', 'Components\\Table')),
        icon: 'fas fa-pencil',
        type: 'onclick',
        onClick: () => {
          this.setState({editMode: this.state.editMode == 'cell' ? '' : 'cell'});
        }
      };
    }

    return <button
      className="btn btn-dropdown btn-transparent"
      key="more-actions-btn"
    >
      <span className="icon"><i className="fas fa-ellipsis-vertical"></i></span>
      {/* <span className="text text-nowrap">{this.translate('More options', 'Hubleto\\Erp\\Loader', 'Components\\Table')}</span> */}
      <span className="menu">
        <div className="btn-list text-nowrap">
          {Object.keys(moreActions).map((key, index) => {
            const action = moreActions[key];
            const type = action.type ?? '';

            if (type == 'onclick') {
              return <div
                key={index}
                className="btn btn-transparent btn-list-item"
                onClick={() => { action.onClick(); }}
              >
                <span className="icon"><i className={action.icon ?? 'fas fa-grip-lines'}></i></span>
                <span className="text">{action.title}</span>
              </div>;
            }

            if (type == 'link') {
              return <a key={index} className="btn btn-transparent btn-list-item" href={action.href}>
                <span className="icon"><i className={action.icon ?? 'fas fa-grip-lines'}></i></span>
                <span className="text">{action.title}</span>
              </a>;
            }

            if (type == 'stateChange') {
              return <div
                key={index}
                className="btn btn-transparent btn-list-item"
                onClick={() => {
                  let newState: any = this.state;
                  newState[action.state] = action.value;
                  this.setState(newState);
                }}
              >
                <span className="icon"><i className={action.icon ?? 'fas fa-grip-lines'}></i></span>
                <span className="text">{action.title}</span>
              </div>;
            }
          })}
        </div>
      </span>
    </button>;
  }

  renderHeaderButtons(): Array<React.JSX.Element> {
    let buttons: Array<React.JSX.Element> = [];
    if (this.showAddButton()) buttons.push(this.renderAddButton());
    if (this.showMoreActionsButton()) buttons.push(this.renderMoreActionsButton());

    // if (this.state?.description?.ui?.filters) {
    //   buttons.push(
    //     <button
    //       className="btn btn-transparent hidden md:block"
    //       key="filters-btn"
    //       onClick={() => this.setState({sidebarFilterHidden: !this.state.sidebarFilterHidden})}
    //     >
    //       <span className="icon"><i className="fas fa-filter"></i></span>
    //       <span className="text">{this.translate('Show/Hide filter', 'Hubleto\\Erp\\Loader', 'Components\\Table')}</span>
    //     </button>
    //   );
    // }
    return buttons;
  }

  renderHeaderLeft(): Array<React.JSX.Element> {
    if (this.state.description?.ui?.showHeader) {
      return [
        ...this.renderHeaderButtons(),
        this.renderFulltextSearch(),
      ];
    } else {
      return [];
    }
  }

  renderHeaderTitle(): React.JSX.Element {
    return this.state.description?.ui?.title ? <>{this.state.description?.ui?.title}</> : <></>;
  }

  renderFulltextSearch(): React.JSX.Element {
    if (this.state.description?.ui?.showFulltextSearch) {
      return <div className="table-header-search" key="fulltext-search">
        <input
          ref={this.refFulltextSearchInput}
          className={"table-header-search " + (this.state.fulltextSearch == "" ? "" : "active")}
          type="search"
          placeholder={this.translate('Search...', 'Hubleto\\Erp\\Loader', 'Components\\Table')}
          value={this.state.fulltextSearch}
          onKeyUp={(event: any) => {
            if (event.keyCode == 13) {
              this.loadData();
              if (!this.props.parentForm) {
                if (this.state.fulltextSearch == '') {
                  deleteUrlParam('q');
                } else {
                  setUrlParam('q', this.state.fulltextSearch);
                }
              }
            }
          }}
          onChange={(event: ChangeEvent<HTMLInputElement>) => this.onFulltextSearchChange(event.target.value)}
        />
        <button
          className="btn btn-transparent"
          onClick={() => this.loadData()}
        >
          <span className="icon"><i className="fas fa-magnifying-glass"></i></span>
        </button>
      </div>;
    } else {
      return <></>;
    }
  }

  renderHeaderRight(): Array<React.JSX.Element> {
    let elements: Array<React.JSX.Element> = [];
    // elements.push(this.renderFulltextSearch());
    return elements;
  }

  renderHeader(): React.JSX.Element {
    const left = this.renderHeaderLeft();
    const right = this.renderHeaderRight();

    return <>
      <div className="table-header">
        {left.length == 0 ? null :
          <div className="table-header-left">
            {left.map((item: any, index: any) => {
              return item;
            })}
          </div>
        }

        {this.state.description?.ui?.showHeaderTitle ?
          <div className="table-header-title">
            {this.renderHeaderTitle()}
          </div>
          : null
        }

        {right.length == 0 ? null :
          <div className="table-header-right">
            {right.map((item: any, index: any) => {
              return <div key={'header-right-' + index}>{item}</div>;
            })}
          </div>
        }
      </div>
    </>
  }

  renderFilter(): React.JSX.Element {
    return <></>;
  }

  renderSidebarFilter(): null|React.JSX.Element {
    return null;
  }

  renderFooter(): React.JSX.Element {
    return <></>;
  }

  deleteRecordById(id: number): void {
    let i: any = 0;
    for (i in this.state.data?.records) {
      if (this.state.data?.records[i].id == id) {
        this.state.data?.records.splice(i, 1);
      }
    }
  }

  findRecordById(id: number): any {
    let data: any = {};
    let i: any;

    for (i in this.state.data?.records) {
      if (this.state.data?.records[i].id == id) {
        data = this.state.data.records[i];
      }
    }

    return data;
  }

  deleteRecord() {
    if (this.props.externalCallbacks && this.props.externalCallbacks.onDeleteRecord) {
      window[this.props.externalCallbacks.onDeleteRecord as keyof typeof window](this);
    } if (this.props.onDeleteRecord) {
      this.props.onDeleteRecord(this);
    } else {

      let recordToDelete: any = null;
      let indexRecordToDelete: any = 0;
      let i: any;

      for (i in this.state.data?.records) {
        if (this.state.data?.records[i]._toBeDeleted_) {
          recordToDelete = this.state.data?.records[i];
          indexRecordToDelete = i;
          break;
        }
      }

      // this.findRecordById(this.state.idsToDelete[0]);

      if (recordToDelete) {
        request.get(
          this.getEndpointUrl('deleteRecord'),
          {
            ...this.getEndpointParams(),
            id: recordToDelete.id ?? 0,
            hash: recordToDelete._idHash_ ?? '',
          },
          (response: any) => {
            let data = this.state.data;
            if (data) delete data.records[indexRecordToDelete]._toBeDeleted_;
            this.setState({data: data}, () => {
              this.loadData();
            });
          },
          (err: any) => {
            const message = err?.data?.message;
            if (message) globalThis.hubleto.showDialogWarning(message);
            let data = this.state.data;
            if (data && data.records[indexRecordToDelete]) delete data.records[indexRecordToDelete]._toBeDeleted_;
            this.setState({data: data});
          }
        );
      }
    }
  }

  renderDeleteConfirmModal(): React.JSX.Element {
    let hasRecordsToDelete: boolean = false;
    let i: any;

    for (i in this.state.data?.records) {
      if (this.state.data?.records[i]._toBeDeleted_) {
        hasRecordsToDelete = true;
        break;
      }
    }

    if (hasRecordsToDelete) {
      return globalThis.hubleto.showDialogConfirm(
        this.translate('Are you sure you want to delete this record?', 'Hubleto\\Erp\\Loader', 'Components\\Table'),
        {
          headerClassName: 'dialog-danger-header',
          contentClassName: 'dialog-danger-content',
          header: this.translate('Delete record', 'Hubleto\\Erp\\Loader', 'Components\\Table'),
          yesText: this.translate('Delete', 'Hubleto\\Erp\\Loader', 'Components\\Table'),
          yesButtonClass: 'btn-danger',
          onYes: () => { this.deleteRecord(); },
          noText: this.translate('Cancel', 'Hubleto\\Erp\\Loader', 'Components\\Table'),
          onNo: () => {
            if (this.state.data) {
              let newData: TableData = this.state.data;
              for (let i in newData.records) delete newData.records[i]._toBeDeleted_;
              this.setState({data: newData});
            }
          },
          onHide: () => {
            if (this.state.data) {
              let newData: TableData = this.state.data;
              for (let i in newData.records) delete newData.records[i]._toBeDeleted_;
              this.setState({data: newData});
            }
          },
        }
      );
    } else {
      return <></>;
    }
  }

  renderFormModal(): React.JSX.Element {
    if (this.state.recordId) {
      return <ModalForm {...this.getFormModalProps()}>{this.renderForm()}</ModalForm>;
    } else {
      return <></>;
    }
  }

  renderForm(): React.JSX.Element {
    if (this.props.formReactComponent) {
      return globalThis.hubleto.renderReactElement(this.props.formReactComponent, this.getFormProps()) ?? <></>;
    } else {
      return <Form {...this.getFormProps()} />;
    }
  }

  /*
   * Render body of table cell
   */
  renderCell(columnName: string, column: any, data: any, options: any) {
    const columnValue: any = data[columnName]; // this.getColumnValue(columnName, column, data);
    const enumValues = column.enumValues;

    const lastIndexOfBackslash = this.props.model.lastIndexOf('/');
    const rawModelName = this.props.model.substring(lastIndexOfBackslash + 1);
    const modelInputName = rawModelName + '.' + columnName;

    const inputProps = {
      uid: this.props.uid + '_' + columnName,
      inputName: columnName,
      value: columnValue,
      showInlineEditingButtons: false,
      invalid: Array.isArray(this.state.invalidInputs) ? this.state.invalidInputs.some((v: any) => String(v.name).toLowerCase() === String(modelInputName).toLowerCase() && v.id === (data.id ?? -1)) : false,
      isInlineEditing: this.props.isInlineEditing,
      description: (this.state.description && this.state.description.inputs ? this.state.description?.inputs[columnName] : null),
    };

    const cellProps = {
      columnName: columnName,
      column: column,
      data: data,
      options: options,
    };
    const rowIndex = options.rowIndex;

    let cellContent = enumValues ? enumValues[columnValue] : columnValue;

    if (typeof column.cellRenderer == 'function') {
      return column.cellRenderer(this, data, options);
    } else if (typeof column.tableCellRenderer === 'string' && column.tableCellRenderer !== '') {
      return globalThis.hubleto.renderReactElement(column.tableCellRenderer, cellProps) ?? <></>;
    } else if (data._isInsertRow_) {
      let rowToInsert = this.state.rowToInsert ?? {};

      return InputFactory({
        uid: this.props.uid + '_insertRow_' + columnName,
        inputName: columnName,
        showInlineEditingButtons: false,
        isInlineEditing: true,
        value: rowToInsert[columnName] ?? null,
        description: (this.state.description && this.state.description.inputs ? this.state.description?.inputs[columnName] : null),
        onChange: (input: any, value: any) => {
          let rowToInsert: any = this.state.rowToInsert ?? {};
          rowToInsert[columnName] = value;
          this.setState({rowToInsert: rowToInsert});
        }
      });

    } else {

      let cellValueElement: React.JSX.Element|null = null;

      if (cellContent === null) {
        switch (column.type) {
          case 'lookup':
            cellValueElement =
              <span className='badge badge-small text-slate-300 p-1'>
                N/A
              </span>
            ;
          break;
          default:
            cellValueElement = null;
          break;
        }
      } else {
        switch (column.type) {
          case 'int':
            if (column.showExponential) cellContent = cellContent.toExponential();
            cellValueElement = <>
              {cellContent}
              {columnValue && column.unit ? ' ' + column.unit : ''}
            </>;
          break;
          case 'decimal':
            if (column.showExponential) cellContent = cellContent.toExponential();
            cellValueElement = <>
              {cellContent ? Number(cellContent).toFixed(column.decimals ?? 2) : null}
              {columnValue && column.unit ? ' ' + column.unit : ''}
            </>;
          break;
          case 'currency':
            cellValueElement = <span className={columnValue < 0 ? 'text-red-800' : 'text-green-800'}>
              {cellContent ? globalThis.hubleto.currencyFormat(cellContent, column.decimals ?? 2) : null}
              {columnValue && column.unit ? ' ' + column.unit : ''}
            </span>;
          break;
          case 'color':
            cellValueElement = <div
              style={{ width: '20px', height: '20px', background: cellContent }}
              className="rounded"
            />;
          break;
          case 'image':
            if (!cellContent) cellValueElement = <i className="fas fa-image" style={{color: '#e3e6f0'}}></i>
            else {
              cellValueElement = <img
                style={{ width: '30px', height: '30px' }}
                src={globalThis.hubleto.config.uploadUrl + "/" + cellContent}
                className="rounded"
              />;
            }
          break;
          case 'file':
            if (!cellContent) cellValueElement = <i className="fas fa-image" style={{color: '#e3e6f0'}}></i>
            else {
              cellValueElement = <a
                href={globalThis.hubleto.config.uploadUrl + "/" + cellContent}
                target='_blank'
                onClick={(e) => { e.stopPropagation(); }}
                className='btn btn-primary-outline btn-small'
              >
                <span className='icon'><i className='fa-solid fa-up-right-from-square'></i></span>
                <span className='text'>{cellContent}</span>
              </a>;
            }
          break;
          case 'lookup':
            let className = data['_LOOKUP_CLASS[' + columnName + ']'];
            let color = data['_LOOKUP_COLOR[' + columnName + ']'];

            let style: any = {};

            if (color) {
              style['borderLeft'] = '0.5em solid ' + color;
              style['marginLeft'] = '0.5em';
              style['paddingLeft'] = '0.5em';
            }
            cellValueElement =
              <span className={className} style={style}>
                {data['_LOOKUP[' + columnName + ']'] ?? ''}
              </span>
            ;
          break;
          case 'enum':
            const enumValues = column.enumValues;
            if (enumValues) cellValueElement = enumValues[cellContent];
          break;
          case 'boolean':
            if (cellContent) cellValueElement = <span className="text-green-600" style={{fontSize: '1.2em'}}>✓</span>
            else cellValueElement = <span className="text-red-600" style={{fontSize: '1.2em'}}>✕</span>
          break;
          case 'date':
            cellValueElement = <span className='text-stone-700'>
              {/* <i className='fas fa-calendar mr-2 text-gray-300'></i> */}
              {cellContent == '0000-00-00' ? '' : dateToEUFormat(cellContent)}
            </span>;
          break;
          case 'datetime':
            const date = cellContent?.slice(0, 10) ?? "N/A";
            const time = cellContent?.slice(11) ?? "N/A";

            cellValueElement = <div className='flex gap-1'>
              <span className='text-stone-700'>{dateToEUFormat(date)}</span>
              <span className='text-stone-400'>{time}</span>
              {/* <div>
                <i className='fas fa-calendar mr-2 text-gray-300'></i>
                <span>{dateToEUFormat(date)}</span>
              </div>
              <div>
                <i className='fas fa-clock mr-2 text-gray-300'></i>
                <span>{time}</span>
              </div> */}
            </div>;
          break;
          case 'tags':
            cellValueElement = <>
              {cellContent.map((item: any) => {
                if (!column.dataKey) return <></>;
                return <span className="badge badge-info mx-1" key={item.id}>{item[column.dataKey]}</span>;
              })}
            </>
          break;
          case 'json':
            let columnValueParsed = null;

            try {
              columnValueParsed = JSON.parse(columnValue);
            } catch (ex) {
              columnValueParsed = null;
            }

            if (columnValueParsed === null) {
              cellValueElement = null;
            } else if (Array.isArray(columnValueParsed)) {
              cellValueElement = <>{columnValueParsed.map((item, index) => {
                return <div key={index} className='badge block text-xs'>{JSON.stringify(item)}</div>
              })}</>;
            } else {
              cellValueElement = <>{Object.keys(columnValueParsed).map((key, index) => {
                return <div key={index} className='badge block text-xs'>{key}: {columnValueParsed[key].toString()}</div>
              })}</>;
            }
          break;
          default:
            cellValueElement = <>
              {typeof cellContent == 'object' ? JSON.stringify(cellContent) : cellContent}
              {columnValue && column.unit ? ' ' + column.unit : ''}
            </>;
          break;
        }

        if (cellValueElement === <></>) {
          cellValueElement = cellContent;
        }
      }

      if (options.renderEditor) {
        return <>
          {cellValueElement}
          <div className='absolute w-full top-0 left-0'>{InputFactory({
            ...inputProps,
            onChange: (input: any, value: any) => {
              if (this.state.data) {
                let data: TableData = this.state.data;
                data.records[rowIndex][columnName] = value;
                this.setState({data: data});
                if (this.props.onChange) {
                  this.props.onChange(this);
                }
              }
            }
          })}</div>
        </>;
      } else {
        return cellValueElement;
      }
    }
  }

  renderInsertButton(data: any, options: any) {
    return <button
      className="btn btn-add-outline"
      onClick={(e) => {
        e.preventDefault();
        this.openForm(-1, data, true);
        this.setState({rowToInsert: {}});
      }}
    >
      <span className="icon"><i className="fas fa-plus"></i></span>
    </button>;
  }

  renderDeleteButton(data: any, options: any) {
    return data._toBeDeleted_
      ? <button
      className="btn btn-small btn-cancel"
      onClick={(e) => {
        e.preventDefault();
        delete this.findRecordById(data.id)._toBeDeleted_;
        this.setState({data: this.state.data}, () => {
          if (this.props.onDeleteSelectionChange) {
            this.props.onDeleteSelectionChange(this);
          }
        });
      }}
    >
      <span className="icon"><i className="fas fa-times"></i></span>
    </button>
    : <button
      className="btn btn-small btn-danger"
      title={this.translate('Delete', 'Hubleto\\Erp\\Loader', 'Components\\Table')}
      onClick={(e) => {
        e.preventDefault();

        if (data.id <= 0 || data.id == undefined) {
          this.deleteRecordById(data.id);
        } else {
          this.findRecordById(data.id)._toBeDeleted_ = true;
        }

        this.setState({data: this.state.data}, () => {
          if (this.props.onDeleteSelectionChange) {
            this.props.onDeleteSelectionChange(this);
          }
        });
      }}
    >
      <span className="icon"><i className="fas fa-trash-alt"></i></span>
    </button>;
  }

  renderActionsColumn(data: any, options: any) {
    const R = this.findRecordById(data.id);

    let moreActions = [];
    let canCreate = !this.state.readonly && this.state.description?.permissions?.canCreate;
    let canDelete = !this.state.readonly && this.state.description?.permissions?.canDelete;

    if (R._PERMISSIONS && !R._PERMISSIONS[1]) canCreate = false;
    if (R._PERMISSIONS && !R._PERMISSIONS[3]) canDelete = false;

    if (canCreate && data._isInsertRow_) {
      moreActions.push(this.renderInsertButton(data, options));
    } else if (canDelete) {
      moreActions.push(this.renderDeleteButton(data, options));
    }

    if (moreActions.length == 0) return null;
    else if (moreActions.length == 1) return moreActions[0];
    else return <div className='flex gap-2'>{moreActions.map((item, key) => item)}</div>;
  }

  applyColumnSearch(columnSearch: any) {
    if (!this.props.parentForm) {
      if (columnSearch.length == 0) {
        deleteUrlParam('search');
      } else {
        setUrlParam('search', columnSearch);
      }
    }

    this.setState({columnSearch: columnSearch}, () => {
      this.loadData();
    });
  }

  setColumnSearch(columnName: string, value: any)
  {
    let columnSearch: any = this.state.columnSearch;

    if (value === null) delete columnSearch[columnName];
    else columnSearch[columnName] = ['OR', value];

    this.applyColumnSearch(columnSearch);

  }

  addColumnSearch(columnName: string, value: any)
  {
    if (!value) return;

    let columnSearch = this.state.columnSearch;
    let columnSearchForColumn: any = this.state.columnSearch[columnName] ?? [];

    if (typeof columnSearchForColumn === 'string') {
      try {
        columnSearchForColumn = JSON.parse(columnSearchForColumn);
      } catch(ex) {
        columnSearchForColumn = [];
      }
    }

    if (columnSearchForColumn.length == 0) columnSearchForColumn.push('OR'); // default glue

    columnSearchForColumn.push(value);

    columnSearch[columnName] = columnSearchForColumn;

    this.applyColumnSearch(columnSearch);
  }

  deleteColumnSearch(columnName: string, index: number)
  {
    if (!this.state.columnSearch[columnName][index]) return;

    let columnSearch = this.state.columnSearch;
    columnSearch[columnName].splice(index, 1);
    if (columnSearch[columnName].length == 1) delete columnSearch[columnName];

    this.applyColumnSearch(columnSearch);
  }

  getColumns(): any {
    let columns: any = {}
    const selectionMode = this.getSelectionMode();

    if (selectionMode) {
      columns['__selection'] = {
        key: '__selection',
        onClick: null,
      }
    }

    Object.keys(this.state.description?.columns ?? {}).map((columnName: string) => {
      const column: any = this.state.description?.columns[columnName] ?? {};

      const columnSearchValue = this.state.columnSearch[columnName] ?? null;
      const showColumnSearch = this.state.description?.ui?.showColumnSearch;

      let columnSearchInput: any = null;
      let columnSearchValuePrettyfied: any = null;
      let alignHeader: 'left' | 'right' | 'center' = 'left';

      if (column.textAlign == 'right') alignHeader = 'right';
      if (column.textAlign == 'center') alignHeader = 'center';

      if (showColumnSearch) {
        switch (column.type) {
          // case 'date':
          //   columnSearchInput = <Flatpickr
          //     onChange={(data: Date[]) => {
          //       this.setColumnSearch(columnName, data);
          //     }}
          //     options={{mode: 'range'}}
          //   />
          // break;
          // case 'boolean':
          //   columnSearchInput = <SelectButton
          //     value={columnSearchValue}
          //     onChange={(event) => {
          //       this.setColumnSearch(columnName, event.value);
          //     }}
          //     itemTemplate={(option: any) => <button className='btn btn-transparent'>
          //       <span className='text'>{option.label}</span>
          //     </button>}
          //     options={[
          //       {label: 'Y', value: true, className: 'p-0'},
          //       {label: 'N', value: false, className: 'p-0'},
          //     ]}
          //   />
          // break;
          default:
            columnSearchInput = <input
              className='w-full'
              onKeyUp={(event: any) => {
                if (event.keyCode == 13) {
                  this.addColumnSearch(columnName, event.currentTarget.value);
                  event.currentTarget.value = '';
                }
              }}
            ></input>;
          break;
        }

        if (columnSearchValue instanceof Array) {
          columnSearchValuePrettyfied =
            <div className='flex w-full gap-2 justify-items'>
              <div className='grow'>
                {columnSearchValue.map((item, index) => {
                  if (index == 0) return null;
                  return <>
                    <button
                      className='btn btn-small btn-warning'
                      onClick={() => {
                        this.deleteColumnSearch(columnName, index);
                      }}
                    >
                      <span className='text'>{item}</span>
                    </button>
                  </>;
                })}
              </div>
              {this.state.columnSearch[columnName].length > 2 ?
                <div>
                  <button
                    className='btn btn-small btn-transparent'
                    onClick={() => {
                      let newColumnSearch = this.state.columnSearch;
                      let glue = newColumnSearch[columnName][0];
                      newColumnSearch[columnName][0] = (glue == 'OR' ? 'AND' : 'OR');
                      this.setState({columnSearch: newColumnSearch}, () => {
                        this.loadData();
                      });
                    }}
                  >
                    <span className='icon'><i className='fas fa-align-justify'></i></span>
                    <span className='text'>{this.state.columnSearch[columnName][0]}</span>
                  </button>
                </div>
              : null}
            </div>
          ;
        }
      }

      columns[columnName] = {
        key: columnName,
        field: columnName,
        header: column.title + (column.unit ? ' [' + column.unit + ']' : ''),
        showColumnSearch: showColumnSearch,
        showFilterMenu: false,
        alignHeader: alignHeader,
        filter: (data: any, options: any) => {
          return <>
            <div className="column-search input-wrapper">
              <div className="input-body"><div className="hubleto component input">
                <div className="input-element grow">
                  {columnSearchInput}
                </div>
              </div></div>
            </div>
            {columnSearchValuePrettyfied}
          </>;
        },
        body: (data: any, options: any) => {
          if (data._PERMISSIONS && !data._PERMISSIONS[1]) { // can not read
            return <div className='text-nowrap'>Hidden record</div>;
          } else {
            const cellText = data['_LOOKUP[' + columnName + ']'] ?? (data[columnName] ?? '');
            const cellDetailUrl = data['_LOOKUP_DETAIL_URL[' + columnName + ']'] ?? '';
            return (
              <div
                key={'column-' + columnName}
                className={
                  this.cellClassName(columnName, column, data)
                  + (data._toBeDeleted_ ? ' to-be-deleted' : '')
                }
                style={this.cellCssStyle(columnName, column, data)}
                title={cellText}
              >
                {this.renderCell(columnName, column, data, options)}
                <div className='cell-buttons'>
                  {cellDetailUrl ?
                    <button
                      className='btn btn-small btn-primary-outline'
                      title={this.translate('Open in new tab', 'Hubleto\\Erp\\Loader', 'Components\\Table')}
                      onClick={(e) => {
                        globalThis.window.open(globalThis.hubleto.config.projectUrl + '/' + cellDetailUrl)
                        e.stopPropagation();
                      }}
                    ><span className='icon'><i className='fas fa-arrow-up-right-from-square'></i></span></button>
                  : null}
                  <button
                    className='btn btn-small btn-primary-outline'
                    title={this.translate('Copy cell content to clipboard', 'Hubleto\\Erp\\Loader', 'Components\\Table')}
                    onClick={(e) => {
                      navigator.clipboard.writeText(cellText);
                      e.stopPropagation();
                    }}
                  ><span className='icon'><i className='fas fa-copy'></i></span></button>
                  {this.state.editMode == '' || column.readonly || column.type == 'virtual' ? null :
                    <button
                      className="btn btn-small btn-primary-outline"
                      title={this.translate('Edit', 'Hubleto\\Erp\\Loader', 'Components\\Table')}
                      onClick={(e) => {
                        // Default cell click behavior is to open the form.
                        // If prevented, the 'onClick' of DataTable will
                        // be launched, which means editing the cell
                        // when editMode = 'cell'.
                        e.preventDefault();
                      }}
                    >
                      <span className="icon"><i className="fas fa-pencil"></i></span>
                    </button>
                  }
                </div>
              </div>
            );
          }
        },
        editor: column.readonly ? null : (options: any) => {
          const data = options.rowData;
          const cellText = data['_LOOKUP[' + columnName + ']'] ?? (data[columnName] ?? '');

          this.setState({isInlineEditing: true});

          return <div
            key={'column-' + columnName}
            className={
              this.cellClassName(columnName, column, data)
              + (data._toBeDeleted_ ? ' to-be-deleted' : '')
            }
            style={this.cellCssStyle(columnName, column, data)}
            title={cellText}
          >
            {this.renderCell(columnName, column, data, {rowIndex: options.rowIndex, renderEditor: true})}
          </div>;
        },
        onClick: (record: any) => this.onRowClick(record),
        // onCellEditComplete={(e: ColumnEvent) => {
        //   request.post(
        //     this.getEndpointUrl('saveRecord'),
        //     {
        //       ...this.getEndpointParams(),
        //       id: e.newRowData.id ?? null,
        //       record: this.findRecordById(e.newRowData.id),
        //     },
        //     {},
        //     (description: any) => {
        //       this.setState({isInlineEditing: false}, () => {
        //         this.reload();
        //       });
        //     }
        //   );

        // }}
        // onCellEditCancel={(e: ColumnEvent) => {
        //   setTimeout(() => this.setState({isInlineEditing: false}), 100);
        // }}
        style: { width: 'auto' },
        sortable: true,
      };
    });

    columns['__actions'] = {
      key: '__actions',
      field: '__actions',
      header: '',
      body: (data: any, options: any) => this.renderActionsColumn(data, options),
      onClick: null,
      style: { width: 'auto' },
    };

    return columns;
  }

  renderRecords(): React.JSX.Element {
    const showColumnSearch = this.state.description?.ui?.showColumnSearch ?? false;
    const showAsPlainTable = this.state.description?.ui?.showAsPlainTable ?? false;
    
    if (showAsPlainTable) {
      const columns = this.state.description?.columns ?? {};

      return <table className='table-default dense'>
        <thead>
          <tr>
            {Object.keys(columns).map((colName, columnIndex) => {
              const column = this.state.description?.columns[colName];
              return <th className='border-none'>{column.title}</th>;
            })}
          </tr>
        </thead>
        <tbody>
          {this.state.data?.records.map((row, rowIndex) => {
            return <tr key={rowIndex}>
              {Object.keys(columns).map((colName, columnIndex) => {
                const val = row['_LOOKUP[' + colName + ']'] ?? row[colName];
                return <td className='border-none'>{
                  (typeof val === 'object' && val !== null) ? val['_LOOKUP'] : val
                }</td>;
              })}
            </tr>;
          })}
        </tbody>
      </table>;
    } else {
      const records = this.getRecordsToDisplay();
      const columns = this.getColumns();
      const columnKeys = Object.keys(columns);

      const currentPage = this.state?.data?.current_page ?? 0;
      const lastPage = this.state?.data?.last_page ?? 0;
      const itemsPerPage = this.state?.data?.per_page ?? 0;
      const itemsFrom = this.state?.data?.from ?? 0;
      const itemsTo = this.state?.data?.to ?? 0;
      const itemsTotal = this.state?.data?.total ?? 0;

      let previousPages: any = [];
      for (let i = Math.max(currentPage - 5, 1); i < currentPage; i++) previousPages.push(i);

      let nextPages: any = [];
      for (let i = currentPage + 1; i <= Math.min(currentPage + 5, lastPage); i++) nextPages.push(i);

      let orderBy = this.state.description?.ui?.orderBy ?? null;
      if (!orderBy) orderBy = {field: '', direction: ''};

      return <div className="table-container">
        <table>
          <thead>
            <tr>
              {columnKeys.map((columnKey) => {
                const column = columns[columnKey];
                return <th><div>
                  <div className="title">{column.header}</div>
                  <div
                    className="btn btn-transparent btn-small"
                    onClick={() => {
                      let newOrderBy = orderBy;
                      if (newOrderBy.field == columnKey) {
                        newOrderBy.direction = (newOrderBy.direction == 'asc' ? 'desc' : 'asc');
                      } else {
                        newOrderBy = {
                          field: columnKey,
                          direction: 'asc',
                        };
                      }

                      this.onOrderByChange(newOrderBy);
                    }}
                  >
                    <span className={"icon " + (orderBy.field == columnKey ? "text-primary" : "text-gray-200")}>
                      {orderBy.field == columnKey ?
                        <i className={'fas fa-sort' + (orderBy.direction == 'desc' ? '-down' : orderBy.direction == 'asc' ? '-up' : '')}></i>
                      : <i className={'fas fa-sort'}></i>}
                    </span>
                  </div>
                </div></th>
              })}
            </tr>
            {showColumnSearch ? <tr>
              {columnKeys.map((columnKey: any) => {
                const column = columns[columnKey];
                return <th>{column.filter ? column.filter(records, {}) : null}</th>
              })}
            </tr> : null}
          </thead>
          <tbody>
            {records.map((record: any) => {
              return <tr>
                {columnKeys.map((key: any, rowIndex: number) => {
                  const column = columns[key];
                  return <td
                    onClick={() => column.onClick(record)}
                  >
                    {column.body(
                      record,
                      {
                        rowIndex: rowIndex,
                        renderEditor: false,
                      }
                    )}
                  </td>
                })}
              </tr>;
            })}
          </tbody>
        </table>
        <div className="table-paginator">
          {currentPage > 1 ?
            <div
              className="btn btn-transparent"
              onClick={() => this.onPaginationChange(currentPage - 1, itemsPerPage)}
            >
              <span className="icon"><i className="fas fa-arrow-left"></i></span>
            </div>
          : null}
          {previousPages[0] > 1 ? <>
            <div
              className="btn btn-transparent"
              onClick={() => this.onPaginationChange(1, itemsPerPage)}
            >
              <span className="text">1</span>
            </div>
            <div>...</div>
          </> : null}
          {previousPages.map((page: number) => {
            return <div
              className="btn btn-transparent"
              onClick={() => this.onPaginationChange(page, itemsPerPage)}
            >
              <span className="text">{page}</span>
            </div>
          })}
          <div
            className="btn btn-transparent"
            onClick={() => this.onPaginationChange(currentPage, itemsPerPage)}
          >
            <span className="text font-bold">{currentPage}</span>
            <span className="text">({itemsFrom} - {itemsTo} / {itemsTotal})</span>
          </div>
          {nextPages.map((page: number) => {
            return <div
              className="btn btn-transparent"
              onClick={() => this.onPaginationChange(page, itemsPerPage)}
            >
              <span className="text">{page}</span>
            </div>
          })}
          {nextPages[nextPages.length - 1] < lastPage ? <>
            <div>...</div>
            <div
              className="btn btn-transparent"
              onClick={() => this.onPaginationChange(lastPage, itemsPerPage)}
            >
              <span className="text">{lastPage}</span>
            </div>
          </> : null}
          {currentPage < lastPage ?
            <div
              className="btn btn-transparent"
              onClick={() => this.onPaginationChange(currentPage + 1, itemsPerPage)}
            >
              <span className="icon"><i className="fas fa-arrow-right"></i></span>
            </div>
          : null}
          <div>
            <select
              value={itemsPerPage}
              onChange={(event) => {
                this.onPaginationChange(currentPage, parseInt(event.currentTarget.value));
              }}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={35}>35</option>
              <option value={100}>100</option>
              <option value={300}>300</option>
              <option value={500}>500</option>
              <option value={1000}>1000</option>
            </select>
          </div>
        </div>
      </div>;
    }
  }

  renderContent(): React.JSX.Element {
    const sidebarFilter = this.renderSidebarFilter();

    return <>
      {this.renderFormModal()}
      {this.state.isUsedAsInput ? null : this.renderDeleteConfirmModal()}

      <div
        id={"hubleto-table-" + this.props.uid}
        className={
          "hubleto component table" + (this.props.className ? " " + this.props.className : "") + (this.state.loadingData ? " loading" : "")
        }
      >
        {this.state.description?.ui?.showHeader ? this.renderHeader() : null}
        {this.state.description?.ui?.showFilter ? this.renderFilter() : null}

        <div className="flex gap-2 flex-col md:flex-row overflow-x max-w-[98vw]">
          {sidebarFilter && this.state.description?.ui?.showSidebarFilter && !this.state.sidebarFilterHidden ?
            <div className="table-sidebar-filter">
              {sidebarFilter}
              {/* {<button className="btn btn-transparent btn-small mt-2"
                  onClick={() => this.setState({sidebarFilterHidden: !this.state.sidebarFilterHidden})}
                >
                  <span className="icon"><i className="fas fa-arrow-left"></i></span>
                  <span className="text">{this.translate('Hide filter', 'Hubleto\\Erp\\Loader', 'Components\\Table')}</span>
                </button>
              } */}
            </div>
          : null}

          <div className="table-body grow" id={"hubleto-table-body-" + this.props.uid}>
            {this.renderRecords()}
          </div>
        </div>
      </div>
    </>;
  }

  render() {
    if (!this.state) return null;

    try {
      globalThis.hubleto.setTranslationContext(this.translationContext);

      if (!this.state.data) {
        return <Spinner content="Loading..." />;
      }

      const fallback: any = <div className="alert alert-danger">Failed to render table. Check console for error log.</div>

      return <ErrorBoundary fallback={fallback}>{this.renderContent()}</ErrorBoundary>;
    } catch(e) {
      console.error('Failed to render table.');
      console.error(e);
      return <div className="alert alert-danger">Failed to render table. Check console for error log.</div>
    }
  }

  onSelectionChange() {
    if (this.props.onSelectionChange) {
      this.props.onSelectionChange(this);
    }
  }

  onPaginationChangeCustom(event: any) {
    const page: number = (event.page ?? 0) + 1;
    const itemsPerPage: number = event.rows;
    this.onPaginationChange(page, itemsPerPage);
  }

  onOrderByChangeCustom(event: any) {
    let orderBy: TableOrderBy | null = null;

    // Icons in PrimeTable changing
    // 1 == ASC
    // -1 == DESC
    // null == neutral icons
    if (event.sortField == this.state.description?.ui?.orderBy?.field) {
      orderBy = {
        field: event.sortField,
        direction: event.sortOrder === 1 ? 'asc' : 'desc',
      };
    } else {
      orderBy = {
        field: event.sortField,
        direction: 'asc',
      };
    }

    this.onOrderByChange(orderBy);
  }

  setRecordFormUrl(id: number) {
    const urlParams = new URLSearchParams(window.location.search);
    if (!this.props.parentForm) urlParams.set('recordId', id.toString());
    window.history.pushState({}, "", '?' + urlParams.toString());
  }

  openForm(id: any, defaultValues?: any, saveAfterOpen?: boolean) {
    let prevId: any = null;
    let nextId: any = null;
    let prevRow: any = {};
    let saveNextId: boolean = false;
    let i: any;

    let canRead = this.state.description?.permissions?.canRead;

    if (!canRead) return;

    for (i in this.state.data?.records) {
      const row = this.state.data?.records[i];
      if (row && row.id) {
        if (saveNextId) {
          nextId = row.id;
          saveNextId = false;
        } else if (row.id == id) {
          prevId = prevRow.id ?? null;
          saveNextId = true;
        }
      }
      prevRow = row;
    }

    if (this.props.externalCallbacks && this.props.externalCallbacks.openForm) {
      window[this.props.externalCallbacks.openForm as keyof typeof window](this, id);
    } else {
      if (!this.props.parentForm) {
        this.setRecordFormUrl(id);
      }

      this.setState({ recordId: null, isInlineEditing: false }, () => {
        this.setState({
          recordId: id,
          recordDefaultValues: defaultValues,
          recordPrevId: prevId,
          recordNextId: nextId,
          recordSaveAfterOpen: saveAfterOpen,
          activeRowId: id,
        });
      });
    }
  }

  closeForm() {
    const urlParams = new URLSearchParams(window.location.search);
    urlParams.delete('recordId');
    urlParams.delete('recordTitle');

    if (Array.from(urlParams).length == 0) {
      window.history.pushState({}, '', this.state.myRootUrl);
    } else {
      window.history.pushState({}, '', this.state.myRootUrl + '?' + urlParams.toString());
    }

    this.setState({ recordId: null, isInlineEditing: false });
  }

  onAddClick() {
    if (this.props.externalCallbacks && this.props.externalCallbacks.onAddClick) {
      window[this.props.externalCallbacks.onAddClick as keyof typeof window](this);
    } else {
      this.openForm(-1);
    }
  }

  onRowClick(row: any) {
    if (row._PERMISSIONS && !row._PERMISSIONS[1]) return; // cannot read
    if (this.state.isInlineEditing) return; // doing nothing when inline editing
    if (row._isInsertRow_) return;

    if (this.props.externalCallbacks && this.props.externalCallbacks.onRowClick) {
      window[this.props.externalCallbacks.onRowClick as keyof typeof window](this, row.id ?? 0);
    } if (this.props.onRowClick) {
      this.props.onRowClick(this, row);
    } else {
      this.openForm(row.id ?? 0);
    }
  }

  onPaginationChange(page: number, itemsPerPage: number) {
    this.setState({page: page, itemsPerPage: itemsPerPage}, () => {
      this.loadData();
    });
  }

  onFilterChange(data: any) {
    this.setState({
      filterBy: data
    }, () => this.loadData());
  }

  onOrderByChange(orderBy?: TableOrderBy | null, stateParams?: any) {
    const getValue = (item: any) => {
      const val = item;
      if (typeof val === 'string' && /^\d{1,3}(\.\d{3})*(,\d+)?$/.test(val)) {
        return parseFloat(val.replace(/\./g, '').replace(',', '.'));
      }
      if (!isNaN(val)) {
        return Number(val);
      }
      return val;
    };

    if (orderBy && this.props.data) {
      let data = this.props.data;
      if (orderBy.direction == "asc") {

        data.records.sort((a, b) => {
          const valA = getValue(a[orderBy.field]);
          const valB = getValue(b[orderBy.field]);

          if (valA < valB) return -1;
          if (valA > valB) return 1;
          return 0;
        });


      } else {
        data.records.sort((a, b) => {
          const valA = getValue(a[orderBy.field]);
          const valB = getValue(b[orderBy.field]);

          if (valA < valB) return 1;
          if (valA > valB) return -1;
          return 0;
        });

      }
      this.setState({
        ...stateParams,
        orderBy: orderBy,
        data: data
      });
    } else {
      let updatedDescription = { ...this.state.description };
      if (orderBy && updatedDescription && updatedDescription.ui) {
        updatedDescription.ui.orderBy = orderBy;
      }

      this.setState({
        ...stateParams,
        description: updatedDescription,
      }, () => this.loadData());
    }
  }

  onFulltextSearchChange(fulltextSearch: string) {
    this.setState({
      fulltextSearch: fulltextSearch
    });
  }
}
