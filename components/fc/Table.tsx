declare global { var hubleto: any; }

import React, { ChangeEvent, useState, useEffect } from 'react';

import * as uuid from 'uuid';
import { setUrlParam, deleteUrlParam } from "../../core/Helper";
import ErrorBoundary from "../cc/ErrorBoundary";
import Modal from "./Modal";
import Form from "./Form";
import { FormProps } from './FormInterfaces';
import Spinner from "./Spinner";
import Translator from '../../core/Translator';

import { InputFactory } from "../../core/InputFactory";
import { dateToEUFormat, datetimeToEUFormat } from "./Inputs/DateTime";
import { deepObjectMerge } from "../../core/Helper";
import request from "../../core/Request";
import { TableData, TableDescription, TableEndpoint, TableMeta, TableOrderBy, TableProps, TableSelectionMode } from './TableInterfaces';
import TableExtendedExportCsvForm from '../cc/TableExtendedExportCsvForm';
import TableExtendedImportCsvForm from '../cc/TableExtendedImportCsvForm';
import TableExtendedColumnsCustomize from '../cc/TableExtendedColumnsCustomize';

export const TableMetaContext = React.createContext<TableMeta>(null);

const T = new Translator('Hubleto\\ReactUi', 'Components\\Table');

const Table = (props: TableProps) => {

  const myRootUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;

  const refFulltextSearchInput = React.createRef();
  const refForm = React.createRef();
  const refFormModal = React.createRef();
  const refExportCsvModal = React.createRef();
  const refImportCsvModal = React.createRef();
  const refColumnConfigModal = React.createRef();
  const refExportCsvForm = React.createRef();
  const refImportCsvForm = React.createRef();
  const refColumnsConfigScreen = React.createRef();

  //////////////////////////////////
  // getDefault*()
  //////////////////////////////////

  const getDefaultEndpointUrl = (action: string): string => {
    return endpoint[action as keyof TableEndpoint] ?? '';
  }

  const getDefaultEndpointParams = (): any => {
    if (description?.ui?.filters) {
      Object.keys(description.ui.filters).map((filterName) => {
        const filter = description?.ui?.filters[filterName];
        if (!filters[filterName] && (filter.default ?? null) !== null) {
          filters[filterName] = filter.default;
        }
      });
    }

    return {

      filterBy: filterBy,
      model: model,
      crudController: crudController,
      orderBy: description?.ui?.orderBy ?? { field: 'id', direction: 'desc' },
      page: page ?? 0,
      itemsPerPage: itemsPerPage ?? 35,
      fulltextSearch: fulltextSearch,
      columnSearch: columnSearch,
      tag: tag,
      context: props.context,
      where: props.where,

      filters: filters,
      dataView: description?.ui?.dataView,
      view: view,
      __IS_AJAX__: '1',
      
      junctionTitle: props.junctionTitle,
      junctionModel: props.junctionModel,
      junctionSourceColumn: props.junctionSourceColumn,
      junctionDestinationColumn: props.junctionDestinationColumn,
      junctionSourceRecordId: props.junctionSourceRecordId,
      junctionSaveEndpoint: props.junctionSaveEndpoint ?? 'api/record/save-junction',

      ...props.endpointParams,
    }
  }

  const getDefaultCsvImportEndpointParams = (): any => {
    return {
      model: model,
      defaultCsvImportValues: props.formDefaultValues,
    };
  }

  const getDefaultSelectionMode = (): TableSelectionMode => {
    return props.selectionMode ?? description?.ui?.selectionMode ?? '';
  }

  const getDefaultRecordsToDisplay = (): any => {
    const showInsertRow = description?.ui?.showInsertRow;

    let records = data?.records ?? [];

    if (showInsertRow) {
      records = records.filter((record) => !record._isInsertRow_);
      records.push({
        _isInsertRow_: true,
        ...(rowToInsert ?? {})
      });
    }

    return records;
  }

  const getDefaultFormProps = (): FormProps => {
    let description = props.formProps?.description ?? {};
    if (!description.defaultValues) description.defaultValues = {};
    if (formDefaultValues) {
      description.defaultValues = { ...description.defaultValues, ...formDefaultValues };
    }
    return {
      // isInitialized: false,
      ref: refForm,
      modal: refFormModal,
      parentTable: this,
      uid: uid + '_form',
      model: model,
      tag: tag,
      activeTabUid: formActiveTabUid,
      context: context,
      id: recordId,
      prevId: recordPrevId,
      nextId: recordNextId,
      endpoint: formEndpoint,
      saveRecordWhenInitialized: recordSaveAfterOpen,
      showInModal: true,
      description: description,

      junctionTitle: props.junctionTitle,
      junctionModel: props.junctionModel,
      junctionSourceColumn: props.junctionSourceColumn,
      junctionDestinationColumn: props.junctionDestinationColumn,
      junctionSourceRecordId: props.junctionSourceRecordId,
      junctionSaveEndpoint: props.junctionSaveEndpoint ?? 'api/record/save-junction',

      onClose: () => {
       closeForm();
      },
      onAfterSaveRecord: (form: any, saveResponse: any) => {
        loadData();
        if (props.closeFormAfterSave ?? false) {
          closeForm();
        } else if (saveResponse && saveResponse.savedRecord.id) {
          openForm(saveResponse.savedRecord.id);
        }
      },
      onDeleteCallback: () => {
        loadData();
        setRecordId(null);
      },

      ...props.formCustomProps ?? {},
    }
  }

  const getDefaultFormModalProps = (): any => {
    return {
      ref: refFormModal,
      uid: uid + '_form',
      type: recordId == -1 ? 'centered' : 'right',
      hideHeader: true,
      isOpen: recordId !== null,
      form: refForm,
      onClose: () => {
        closeForm();
      },
      ...props.formModalProps
    }
  }

  const getDefaultCellClassName = (columnName: string, column: any, rowData: any) => {
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
      const min: number = getMinColumnValue(columnName);
      const max: number = getMaxColumnValue(columnName);
      const val: number = Number(rowData[columnName] ?? 0);
      const step: number = (max - min) / 5;
      const colorIndex = Math.min(5, Math.floor((val - min) / step) + 1);

      cellClassName += ' ' + column.colorScale + '---step-' + colorIndex;
    }

    return cellClassName;
  }

  const getDefaultCellCssStyle = (columnName: string, column: any, rowData: any) => {
    return column.cssStyle ?? {};
  }

  const getDefaultMinColumnValue = (columnName: string): number => {
    let min: number = 0;
    let assigned: boolean = false;
    if (data?.records) {
      for (let i in data.records) {
        let val = Number(data.records[i][columnName] ?? 0);
        if (!assigned || val < min) min = val;
        assigned = true;
      }
    }
    return min;
  }

  const getDefaultMaxColumnValue = (columnName: string): number => {
    let max: number = 0;
    let assigned: boolean = false;
    if (data?.records) {
      for (let i in data.records) {
        let val = Number(data.records[i][columnName] ?? 0);
        if (!assigned || val > max) max = val;
        assigned = true;
      }
    }
    return max;
  }

  const getDefaultRowClassName = (rowData: any): string => {
    let cssClasses: any = [];

    if (rowData._PERMISSIONS && !rowData._PERMISSIONS[1]) cssClasses.push('hidden-record');
    if (rowData.id === activeRowId) cssClasses.push('highlighted');
    if (rowData._isInsertRow_) cssClasses.push('insert-row');

    return cssClasses.join(' ');
  }

  //////////////////////////////////
  // get*()
  //////////////////////////////////

  const getEndpointUrl = (action: string): string => {
    if (props.getEndpointUrl) props.getEndpointUrl(myself, action);
    return getDefaultEndpointUrl(action);
  }

  const getEndpointParams = (): any => {
    if (props.getEndpointParams) return props.getEndpointParams(myself);
    else return getDefaultEndpointParams();
  }

  const getCsvImportEndpointParams = (): any => {
    if (props.getCsvImportEndpointParams) return props.getCsvImportEndpointParams(myself);
    else return getDefaultCsvImportEndpointParams();
  }

  const getSelectionMode = (): TableSelectionMode => {
    if (props.getSelectionMode) return props.getSelectionMode(myself);
    else return getDefaultSelectionMode();
  }

  const getRecordsToDisplay = (): any => {
    if (props.getRecordsToDisplay) return props.getRecordsToDisplay(myself);
    else return getDefaultRecordsToDisplay();
  }

  const getFormProps = (): FormProps => {
    if (props.getFormProps) return props.getFormProps(myself);
    else return getDefaultFormProps();
  }

  const getFormModalProps = (): any => {
    if (props.getFormModalProps) return props.getFormModalProps(myself);
    else return getDefaultFormModalProps();
  }

  const getCellClassName = (columnName: string, column: any, rowData: any) => {
    if (props.getCellClassName) return props.getCellClassName(myself, columnName, column, rowData);
    else return getDefaultCellClassName(columnName, column, rowData);
  }

  const getCellCssStyle = (columnName: string, column: any, rowData: any) => {
    if (props.getCellCssStyle) return props.getCellCssStyle(myself, columnName, column, rowData);
    else return getDefaultCellCssStyle(columnName, column, rowData);
  }

  const getMinColumnValue = (columnName: string): number => {
    if (props.getMinColumnValue) return props.getMinColumnValue(myself, columnName);
    else return getDefaultMinColumnValue(columnName);
  }

  const getMaxColumnValue = (columnName: string): number => {
    if (props.getMaxColumnValue) return props.getMaxColumnValue(myself, columnName);
    else return getDefaultMaxColumnValue(columnName);
  }

  const getRowClassName = (rowData: any): string => {
    if (props.getRowClassName) return props.getRowClassName(myself, rowData);
    else return getDefaultRowClassName(rowData);
  }

  const getColumns = (): any => {
    let columns: any = {}
    const selectionMode = getSelectionMode();

    if (selectionMode) {
      columns['__selection'] = {
        key: '__selection',
        onClick: null,
      }
    }

    Object.keys(description?.columns ?? {}).map((columnName: string) => {
      const column: any = description?.columns[columnName] ?? {};

      const columnSearchValue = columnSearch[columnName] ?? null;
      const showColumnSearch = description?.ui?.showColumnSearch;

      let columnSearchInput: any = null;
      let columnSearchValuePrettyfied: any = null;
      let alignHeader: 'left' | 'right' | 'center' = 'left';

      if (column.textAlign == 'right') alignHeader = 'right';
      if (column.textAlign == 'center') alignHeader = 'center';

      if (showColumnSearch) {
        switch (column.type) {
          default:
            columnSearchInput = <input
              className='w-full'
              onKeyUp={(event: any) => {
                if (event.keyCode == 13) {
                  columnSearchAddNew(columnName, event.currentTarget.value);
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
                        columnSearchDelete(columnName, index);
                      }}
                    >
                      <span className='text'>{item}</span>
                    </button>
                  </>;
                })}
              </div>
              {columnSearch[columnName].length > 2 ?
                <div>
                  <button
                    className='btn btn-small btn-transparent'
                    onClick={() => {
                      let newColumnSearch = columnSearch;
                      let glue = newColumnSearch[columnName][0];
                      newColumnSearch[columnName][0] = (glue == 'OR' ? 'AND' : 'OR');
                      setColumnSearch(newColumnSearch);
                      loadData();
                    }}
                  >
                    <span className='icon'><i className='fas fa-align-justify'></i></span>
                    <span className='text'>{columnSearch[columnName][0]}</span>
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
                  getCellClassName(columnName, column, data)
                  + (data._toBeDeleted_ ? ' to-be-deleted' : '')
                }
                style={getCellCssStyle(columnName, column, data)}
                title={cellText}
              >
                {renderCell(columnName, column, data, options)}
                <div className='cell-buttons'>
                  {cellDetailUrl ?
                    <button
                      className='btn btn-small btn-primary-outline'
                      title={T.translate('Open in new tab')}
                      onClick={(e) => {
                        globalThis.window.open(globalThis.hubleto.config.projectUrl + '/' + cellDetailUrl)
                        e.stopPropagation();
                      }}
                    ><span className='icon'><i className='fas fa-arrow-up-right-from-square'></i></span></button>
                  : null}
                  <button
                    className='btn btn-small btn-primary-outline'
                    title={T.translate('Copy cell content to clipboard')}
                    onClick={(e) => {
                      navigator.clipboard.writeText(cellText);
                      e.stopPropagation();
                    }}
                  ><span className='icon'><i className='fas fa-copy'></i></span></button>
                  {editMode == '' || column.readonly || column.type == 'virtual' ? null :
                    <button
                      className="btn btn-small btn-primary-outline"
                      title={T.translate('Edit')}
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

          setIsInlineEditing(true);

          return <div
            key={'column-' + columnName}
            className={
              getCellClassName(columnName, column, data)
              + (data._toBeDeleted_ ? ' to-be-deleted' : '')
            }
            style={getCellCssStyle(columnName, column, data)}
            title={cellText}
          >
            {renderCell(columnName, column, data, {rowIndex: options.rowIndex, renderEditor: true})}
          </div>;
        },
        onClick: (record: any) => onRowClick(record),
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
      body: (row: any, options: any) => renderActionsColumn(row),
      onClick: null,
      style: { width: 'auto' },
    };

    return columns;
  }

  //////////////////////////////////
  // states and setters
  //////////////////////////////////

  const [endpoint, setEndpoint] = useState(props.endpoint ?? (globalThis.hubleto.config.defaultTableEndpoint ?? {
    describeTable: 'api/table/describe',
    loadTableData: 'api/record/load-table-data',
    saveRecord: 'api/record/save',
    deleteRecord: 'api/record/delete',
  }));
  const [activeRowId, setActiveRowId] = useState(props.recordId ?? null);
  const [async, setAsync] = useState(props.async ?? true);
  const [columnSearch, setColumnSearch] = useState(props.columnSearch ?? {});
  const [crudController, setCrudController] = useState(props.crudController ?? '');
  const [context, setContext] = useState(props.context ?? '');
  const [data, setData] = useState(props.data ?? null);
  const [description, setDescription] = useState(props.description ?? {} as TableDescription);
  const [descriptionSource, setDescriptionSource] = useState(props.descriptionSource ?? 'both');
  const [editMode, setEditMode] = useState('');
  const [filterBy, setFilterBy] = useState(null);
  const [filters, setFilters] = useState(props.filters ?? {});
  const [formActiveTabUid, setFormActiveTabUid] = useState(props.formActiveTabUid ?? 'default');
  const [formEndpoint, setFormEndpoint] = useState(props.formEndpoint ?? (globalThis.hubleto.config.defaultFormEndpoint ?? null));
  const [formProps, setFormProps] = useState(props.formProps ?? {
    model: props.model,
    uid: props.uid + '_form',
  });
  const [fulltextSearch, setFulltextSearch] = useState(props.fulltextSearch ?? '');
  const [inlineEditingEnabled, setInlineEditingEnabled] = useState(props.inlineEditingEnabled ?? false);
  const [invalidInputs, setInvalidInputs] = useState(props.invalidInputs ?? []);
  const [isInlineEditing, setIsInlineEditing] = useState(props.isInlineEditing ?? false);
  const [isUsedAsInput, setIsUsedAsInput] = useState(props.isUsedAsInput ?? false);
  const [itemsPerPage, setItemsPerPage] = useState(props.itemsPerPage ?? 35);
  const [loadingData, setLoadingData] = useState(false);
  const [model, setModel] = useState(props.model ?? '');
  const [page, setPage] = useState(props.page ?? 1);
  const [readonly, setReadonly] = useState(props.readonly ?? false);
  const [formDefaultValues, setFormDefaultValues] = useState(props.formDefaultValues ?? null);
  const [recordId, setRecordId] = useState(props.recordId ?? 0);
  const [recordNextId, setRecordNextId] = useState(0);
  const [recordPrevId, setRecordPrevId] = useState(0);
  const [recordSaveAfterOpen, setRecordSaveAfterOpen] = useState(false);
  const [rowToInsert, setRowToInsert] = useState(null);
  const [selection, setSelection] = useState(props.selection ?? []);
  const [sidebarFilterHidden, setSidebarFilterHidden] = useState(false);
  const [tableUpdateIteration, setTableUpdateIteration] = useState(0);
  const [tag, setTag] = useState(props.tag ?? '');
  const [uid, setUid] = useState(props.uid ?? '_table_' + uuid.v4().replace('-', '_'));
  const [view, setView] = useState(props.view ?? '');
  const [showExportCsvScreen, setShowExportCsvScreen] = useState(false);
  const [showImportCsvScreen, setShowImportCsvScreen] = useState(false);
  const [showColumnConfigScreen, setShowColumnConfigScreen] = useState(false);
  const [collapsedNodeIds, setCollapsedNodeIds] = useState([]);

  //////////////////////////////////
  // useEffect*()
  //////////////////////////////////

  useEffect(() => { globalThis.hubleto.reactElements[uid] = myself; }, [uid]);
  useEffect(() => {
    loadDescription();
    loadData();
  }, []);

  //////////////////////////////////
  // record*()
  //////////////////////////////////

  const deleteRecordById = (id: number): TableData => {
    let newData: TableData = data;
    let i: any = 0;
    for (i in newData?.records) {
      if (newData?.records[i].id == id) {
        newData?.records.splice(i, 1);
      }
    }
    return newData;
  }

  const findRecordById = (id: number): any => {
    let data: any = {};
    let i: any;

    for (i in data?.records) {
      if (data?.records[i].id == id) {
        data = data.records[i];
      }
    }

    return data;
  }

  const deleteRecord = () => {
    let recordToDelete: any = null;
    let indexRecordToDelete: any = 0;
    let i: any;

    for (i in data?.records) {
      if (data?.records[i]._toBeDeleted_) {
        recordToDelete = data?.records[i];
        indexRecordToDelete = i;
        break;
      }
    }

    if (!data?.records) return;

    data.records.map((record: any, index: any) => {
      if (!record._toBeDeleted_) return;

      request.get(
        getEndpointUrl('deleteRecord'),
        {
          ...getEndpointParams(),
          id: record.id ?? 0,
          hash: record._idHash_ ?? '',
        },
        (response: any) => {
          loadData();
        },
        (err: any) => {
          const message = err?.data?.message;
          if (message) globalThis.hubleto.showDialogWarning(message);
        }
      );
    });
  }

  //////////////////////////////////
  // load*()
  //////////////////////////////////

  const loadDescription = (): void => {
    if (descriptionSource == 'props') return;
    request.get(
      getEndpointUrl('describeTable'),
      getEndpointParams(),
      (loadedDescription: any) => {
        if (descriptionSource == 'both') {
          loadedDescription = deepObjectMerge(loadedDescription, description);
        }

        setDescription(loadedDescription);
        if (props.onAfterLoadDescription) props.onAfterLoadDescription(myself);
      }
    );
  }

  const loadData = (): void => {
    if (props.data) {
      setData(props.data);
    } else {
      setLoadingData(true);

      request.get(
        getEndpointUrl('loadTableData'),
        {
          ...getEndpointParams(),
        },
        (data: any) => {
          setLoadingData(false);
          setData(data);
          if (props.onAfterLoadData) props.onAfterLoadData(myself);
        }
      );
    }
  }


  //////////////////////////////////
  // form*()
  //////////////////////////////////

  const setRecordFormUrl = (id: number) => {
    const urlParams = new URLSearchParams(window.location.search);
    if (!props.parentForm && !props.formUrlSlug) {
      urlParams.set('recordId', id.toString());
      window.history.pushState({}, "", '?' + urlParams.toString());
    } else {
      window.history.pushState({}, "", globalThis.hubleto.config.projectUrl + '/' + props.formUrlSlug + '/' + (id > 0 ? id : 'add'));
    }
  }

  const openForm = (id: any, defaultValues?: any, saveAfterOpen?: boolean) => {
    let prevId: any = null;
    let nextId: any = null;
    let prevRow: any = {};
    let saveNextId: boolean = false;
    let i: any;

    let canRead = description?.permissions?.canRead;

    if (!canRead) return;

    for (i in data?.records) {
      const row = data?.records[i];
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

    if (!props.parentForm) {
      setRecordFormUrl(id);
    }

    setIsInlineEditing(false);
    setRecordId(id);
    setFormDefaultValues(defaultValues);
    setRecordPrevId(prevId);
    setRecordNextId(nextId);
    setRecordSaveAfterOpen(saveAfterOpen);
    setActiveRowId(id);
  }

  const closeForm = () => {
    const urlParams = new URLSearchParams(window.location.search);
    urlParams.delete('recordId');
    urlParams.delete('recordTitle');

    if (Array.from(urlParams).length == 0) {
      window.history.pushState({}, '', myRootUrl);
    } else {
      window.history.pushState({}, '', myRootUrl + '?' + urlParams.toString());
    }

    setRecordId(null);
    setIsInlineEditing(false);
  }

  //////////////////////////////////
  // on*()
  //////////////////////////////////

  const onAddClick = (): void => {
    if (props.onAddClick) return props.onAddClick(myself);
    openForm(-1);
  }

  const onRowClick = (row: any): void => {
    console.log('onrowclick', row);
    if (row._PERMISSIONS && !row._PERMISSIONS[1]) return; // cannot read
    if (isInlineEditing) return; // doing nothing when inline editing
    if (row._isInsertRow_) return;

    if (props.onRowClick) return props.onRowClick(myself, row);

    openForm(row.id ?? 0);
  }

  const onPaginationChange = (page: number, itemsPerPage: number) => {
    if (props.onPaginationChange) return props.onPaginationChange(myself, page, itemsPerPage);

    setPage(page);
    setItemsPerPage(itemsPerPage);
    loadData();
  }

  const onFilterChange = (filterBy: any) => {
    if (props.onFilterChange) return props.onFilterChange(myself, filterBy);
    setFilterBy(filterBy);
    loadData();
  }

  const onOrderByChange = (orderBy: TableOrderBy) => {
    if (props.onOrderByChange) return props.onOrderByChange(myself, orderBy);

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

    let newDescription = { ...description };
    if (newDescription.ui) newDescription.ui.orderBy = orderBy;
    setDescription(newDescription);

    if (props.data) {
      let newData = props.data;
      if (orderBy.direction == "asc") {
        newData.records.sort((a, b) => {
          const valA = getValue(a[orderBy.field]);
          const valB = getValue(b[orderBy.field]);

          if (valA < valB) return -1;
          if (valA > valB) return 1;
          return 0;
        });
      } else {
        newData.records.sort((a, b) => {
          const valA = getValue(a[orderBy.field]);
          const valB = getValue(b[orderBy.field]);

          if (valA < valB) return 1;
          if (valA > valB) return -1;
          return 0;
        });
      }
      setData(newData);
    } else {
      loadData();
    }
  }

  //////////////////////////////////
  // columnSearch*()
  //////////////////////////////////

  const columnSearchApplyNew = (newColumnSearch: any) => {
    if (!props.parentForm) {
      if (newColumnSearch.length == 0) {
        deleteUrlParam('search');
      } else {
        setUrlParam('search', newColumnSearch);
      }
    }

    setColumnSearch(newColumnSearch);
    loadData();
  }

  const columnSearchAddNew = (columnName: string, value: any) => {
    if (!value) return;

    let newColumnSearch = columnSearch;
    let newColumnSearchForColumn: any = columnSearch[columnName] ?? [];

    if (typeof newColumnSearchForColumn === 'string') {
      try {
        newColumnSearchForColumn = JSON.parse(newColumnSearchForColumn);
      } catch(ex) {
        newColumnSearchForColumn = [];
      }
    }

    if (newColumnSearchForColumn.length == 0) newColumnSearchForColumn.push('OR'); // default glue

    newColumnSearchForColumn.push(value);
    newColumnSearch[columnName] = newColumnSearchForColumn;

    columnSearchApplyNew(newColumnSearch);
  }

  const columnSearchDelete = (columnName: string, index: number) => {
    if (!columnSearch[columnName][index]) return;

    let newColumnSearch = columnSearch;
    newColumnSearch[columnName].splice(index, 1);
    if (newColumnSearch[columnName].length == 1) delete newColumnSearch[columnName];

    columnSearchApplyNew(newColumnSearch);
  }

  //////////////////////////////////
  // render*()
  //////////////////////////////////

  const renderAddButton = (): React.JSX.Element => {
    if (props.renderAddButton) return props.renderAddButton(myself);
    else return renderDefaultAddButton();
  }

  const renderMoreActionsButton = (): React.JSX.Element => {
    if (props.renderMoreActionsButton) return props.renderMoreActionsButton(myself);
    else return renderDefaultMoreActionsButton();
  }

  const renderHeaderButtons = (): React.JSX.Element => {
    if (props.renderHeaderButtons) return props.renderHeaderButtons(myself);
    else return renderDefaultHeaderButtons();
  }

  const renderFulltextSearch = (): React.JSX.Element => {
    if (props.renderFulltextSearch) return props.renderFulltextSearch(myself);
    else return renderDefaultFulltextSearch();
  }

  const renderHeaderLeft = (): React.JSX.Element => {
    if (props.renderHeaderLeft) return props.renderHeaderLeft(myself);
    else return renderDefaultHeaderLeft();
  }

  const renderTitle = (): React.JSX.Element => {
    if (props.renderTitle) return props.renderTitle(myself);
    else return renderDefaultTitle();
  }

  const renderHeaderRight = (): React.JSX.Element => {
    if (props.renderHeaderRight) return props.renderHeaderRight(myself);
    else return renderDefaultHeaderRight();
  }

  const renderHeader = (): React.JSX.Element => {
    if (props.renderHeader) return props.renderHeader(myself);
    else return renderDefaultHeader();
  }

  const renderFilter = (): React.JSX.Element => {
    if (props.renderFilter) return props.renderFilter(myself);
    else return renderDefaultFilter();
  }

  const renderSidebarFilter = (): null|React.JSX.Element => {
    if (props.renderSidebarFilter) return props.renderSidebarFilter(myself);
    else return renderDefaultSidebarFilter();
  }

  const renderFooter = (): React.JSX.Element => {
    if (props.renderFooter) return props.renderFooter(myself);
    else return renderDefaultFooter();
  }

  const renderDeleteConfirmModal = (): React.JSX.Element => {
    if (props.renderDeleteConfirmModal) return props.renderDeleteConfirmModal(myself);
    else return renderDefaultDeleteConfirmModal();
  }

  const renderFormModal = (): React.JSX.Element => {
    if (props.renderFormModal) return props.renderFormModal(myself);
    else return renderDefaultFormModal();
  }

  const renderForm = (): React.JSX.Element => {
    if (props.renderForm) return props.renderForm(myself);
    else return renderDefaultForm();
  }

  const renderCell = (columnName: string, column: any, data: any, options: any) => {
    if (props.renderCell) return props.renderCell(myself, columnName, column, data, options);
    else return renderDefaultCell(columnName, column, data, options);
  }

  const renderInsertButton = (row: any) => {
    if (props.renderInsertButton) return props.renderInsertButton(myself, row);
    else return renderDefaultInsertButton(row);
  }

  const renderDeleteButton = (row: any) => {
    if (props.renderDeleteButton) return props.renderDeleteButton(myself, row);
    else return renderDefaultDeleteButton(row);
  }

  const renderActionsColumn = (row: any) => {
    if (props.renderActionsColumn) return props.renderActionsColumn(myself, row);
    else return renderDefaultActionsColumn(row);
  }

  const renderRecordsAsTree = (nodes: any, idParent: number = 0, level: number = 0): React.JSX.Element => {
    if (props.renderRecordsAsTree) return props.renderRecordsAsTree(myself, nodes, idParent, level);
    else return renderDefaultRecordsAsTree(nodes, idParent, level);
  }

  const renderRecords = (): React.JSX.Element => {
    if (props.renderRecords) return props.renderRecords(myself);
    else return renderDefaultRecords();
  }

  const renderContent = (): React.JSX.Element => {
    if (props.renderContent) return props.renderContent(myself);
    else return renderDefaultContent();
  }

  //////////////////////////////////
  // renderDefault*()
  //////////////////////////////////

  const renderDefaultAddButton = (): React.JSX.Element => {
    return <button
      key="add-btn"
      className={"btn btn-add"}
      onClick={() => onAddClick()}
    >
      <span className="icon"><i className="fas fa-plus"/></span>
      {description?.ui?.addButtonText
        ? <span className="text text-nowrap">{description?.ui?.addButtonText}</span>
        : null
      }
    </button>;
  }

  const renderDefaultMoreActionsButton = (): React.JSX.Element => {
    let moreActions = {
      showHideFilter: {
        title: T.translate('Show/Hide filter'),
        icon: 'fas fa-filter',
        type: 'onclick',
        onClick: () => {
          setSidebarFilterHidden(!sidebarFilterHidden);
        }
      },
      showAsPlainTable: {
        title: (description?.ui?.showAsPlainTable ? 
          T.translate('Show as standard table') 
          : T.translate('Show as plain table')),
        icon: 'fas fa-table',
        type: 'onclick',
        onClick: () => {
          let newDescription: any = description ?? {};
          if (!newDescription.ui) newDescription.ui = {};
          newDescription.ui.showAsPlainTable = !newDescription.ui.showAsPlainTable;
          setDescription(newDescription);
        }
      },
      ...(description?.ui?.moreActions ?? [])
    };

    if (!readonly) {
      moreActions['toggleEditMode'] = {
        title: (editMode == 'cell' ?
          T.translate('Disable edit mode') 
          : T.translate('Enable edit mode')),
        icon: 'fas fa-pencil',
        type: 'onclick',
        onClick: () => {
          setEditMode(editMode == 'cell' ? '' : 'cell');
        }
      };
    }

    return <button
      className="btn btn-dropdown btn-transparent"
      key="more-actions-btn"
    >
      <span className="icon"><i className="fas fa-ellipsis-vertical"></i></span>
      {/* <span className="text text-nowrap">{T.translate('More options')}</span> */}
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

            // if (type == 'stateChange') {
            //   return <div
            //     key={index}
            //     className="btn btn-transparent btn-list-item"
            //     onClick={() => {
            //       let newState: any = this.state;
            //       newState[action.state] = action.value;
            //       this.setState(newState);
            //     }}
            //   >
            //     <span className="icon"><i className={action.icon ?? 'fas fa-grip-lines'}></i></span>
            //     <span className="text">{action.title}</span>
            //   </div>;
            // }
          })}
        </div>
      </span>
    </button>;
  }

  const renderDefaultHeaderButtons = (): React.JSX.Element => {
    let buttons: Array<React.JSX.Element> = [];
    let showAddButton = false;

    if (
      !readonly
      && description?.ui?.showHeader
      && description?.ui?.showAddButton
      && description?.permissions?.canCreate
    ) {
      showAddButton = true;
    }

    if (showAddButton) buttons.push(renderAddButton());

    return <>{buttons.map((button) => button)}</>;
  }

  const renderDefaultFulltextSearch = (): React.JSX.Element => {
    if (description?.ui?.showFulltextSearch) {
      return <div className="table-header-search" key="fulltext-search">
        <input
          //@ts-ignore
          ref={refFulltextSearchInput}
          className={"table-header-search " + (fulltextSearch == "" ? "" : "active")}
          type="search"
          placeholder={T.translate('Search...')}
          value={fulltextSearch}
          onKeyUp={(event: any) => {
            if (event.keyCode == 13) {
              loadData();
              if (!props.parentForm) {
                if (fulltextSearch == '') {
                  deleteUrlParam('q');
                } else {
                  setUrlParam('q', fulltextSearch);
                }
              }
            }
          }}
          onChange={(event: ChangeEvent<HTMLInputElement>) => {
            setFulltextSearch(fulltextSearch);
          }}
        />
        <button
          className="btn btn-transparent"
          onClick={() => loadData()}
        >
          <span className="icon"><i className="fas fa-magnifying-glass"></i></span>
        </button>
      </div>;
    } else {
      return <></>;
    }
  }

  const renderDefaultHeaderLeft = (): React.JSX.Element => {
    if (description?.ui?.showHeader) {
      return <>
        {renderHeaderButtons()}
        {renderFulltextSearch()}
      </>;
    } else {
      return null;
    }
  }

  const renderDefaultTitle = (): React.JSX.Element => {
    return description?.ui?.title ? <>{description?.ui?.title}</> : <></>;
  }

  const renderDefaultHeaderRight = (): React.JSX.Element => {
    let buttons: Array<React.JSX.Element> = [];
    let showMoreActionsButton = description?.ui?.showMoreActionsButton ?? false;
    if (showMoreActionsButton) buttons.push(renderMoreActionsButton());
    return <>{buttons.map((button) => button)}</>;
  }

  const renderDefaultHeader = (): React.JSX.Element => {
    return <div className="table-header flex mb-2">
      <div className="table-header-left">
        {renderHeaderLeft()}
      </div>

      {description?.ui?.showHeaderTitle ?
        <div className="table-header-title">
          {renderTitle()}
        </div>
        : null
      }

      <div className="table-header-right">
        {renderHeaderRight()}
      </div>
    </div>;
  }

  const renderDefaultFilter = (): React.JSX.Element => {
    return <></>;
  }

  const renderDefaultSidebarFilter = (): null|React.JSX.Element => {
    if (description?.ui?.filters && ! sidebarFilterHidden) {
      return <div className="flex flex-col gap-2 text-nowrap">
        {Object.keys(description.ui.filters).map((filterName) => {
          const filter = description.ui.filters[filterName];
          const filterValue = filters[filterName] ?? (filter.default ?? null);

          return <div key={filterName}>
            {filter.title
              ? <div className='bg-primary/10 p-1 text-sm dark:text-white dark:bg-slate-800'>{filter.title}</div>
              : null
            }
            <div className={"list dense" + (filter.direction == "horizontal" ? " horizontal" : "")}>
              {Object.keys(filter.options).map((key: any) => {
                return <button
                  key={key}
                  className={
                    "max-w-60 btn btn-small btn-list-item "
                    + (filterValue == key ? "btn-primary" : "btn-transparent")
                    + (filter.direction == "horizontal" ? " text-center" : "")
                  }
                  style={{borderLeft: (filter.colors && filter.colors[key] ? '0.5em solid ' + filter.colors[key] : null)}}
                  onClick={() => {
                    let newFilters = filters ?? {};

                    if (filter.type == 'multipleSelectButtons') {
                      if (filterValue) {
                        if (filterValue.includes(key)) {
                          newFilters[filterName] = [];
                          for (let i in filterValue) {
                            if (filterValue[i] != key) newFilters[filterName].push(filterValue[i]);
                          }
                        } else {
                          newFilters[filterName] = filterValue;
                          newFilters[filterName].push(key);
                        }
                      } else {
                        newFilters[filterName] = [ key ];
                      }
                    } else {
                      if (newFilters[filterName] == key) {
                        delete newFilters[filterName];
                      } else {
                        newFilters[filterName] = key;
                      }
                    }

                    if (!props.parentForm) {
                      setUrlParam('filters', newFilters);
                    }

                    setRecordId(0);
                    setFilters(newFilters);
                    loadData();
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

  const renderDefaultFooter = (): React.JSX.Element => {
    return <></>;
  }

  const renderDefaultDeleteConfirmModal = (): React.JSX.Element => {
    let hasRecordsToDelete: boolean = false;
    let i: any;

    for (i in data?.records) {
      if (data?.records[i]._toBeDeleted_) {
        hasRecordsToDelete = true;
        break;
      }
    }

    if (hasRecordsToDelete) {
      return globalThis.hubleto.showDialogConfirm(
        T.translate('Are you sure you want to delete this record?'),
        {
          headerClassName: 'dialog-danger-header',
          contentClassName: 'dialog-danger-content',
          header: T.translate('Delete record'),
          yesText: T.translate('Delete'),
          yesButtonClass: 'btn-danger',
          onYes: () => { deleteRecord(); },
          noText: T.translate('Cancel'),
          onNo: () => {
            if (data) {
              let newData: TableData = data;
              for (let i in newData.records) delete newData.records[i]._toBeDeleted_;
              setData(newData);
            }
          },
          onHide: () => {
            if (data) {
              let newData: TableData = data;
              for (let i in newData.records) delete newData.records[i]._toBeDeleted_;
              setData(newData);
            }
          },
        }
      );
    } else {
      return <></>;
    }
  }

  const renderDefaultFormModal = (): React.JSX.Element => {
    if (recordId) {
      return <Modal {...getFormModalProps()}>{renderForm()}</Modal>;
    } else {
      return <></>;
    }
  }

  const renderDefaultForm = (): React.JSX.Element => {
    if (props.formReactComponent) {
      return globalThis.hubleto.renderReactElement(props.formReactComponent, getFormProps()) ?? <></>;
    } else {
      return <Form {...getFormProps()} />;
    }
  }

  const renderDefaultCell = (columnName: string, column: any, data: any, options: any) => {
    const columnValue: any = data[columnName]; // this.getColumnValue(columnName, column, data);
    const enumValues = column.enumValues;

    const lastIndexOfBackslash = model.lastIndexOf('/');
    const rawModelName = model.substring(lastIndexOfBackslash + 1);

    const inputProps = {
      uid: uid + '_' + columnName,
      inputName: columnName,
      value: columnValue,
      showInlineEditingButtons: false,
      invalid: false,
      isInlineEditing: isInlineEditing,
      description: (description && description.inputs ? description?.inputs[columnName] : null),
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
      return InputFactory({
        uid: uid + '_insertRow_' + columnName,
        inputName: columnName,
        showInlineEditingButtons: false,
        isInlineEditing: true,
        value: rowToInsert ? (rowToInsert[columnName] ?? null) : null,
        description: (description && description.inputs ? description?.inputs[columnName] : null),
        onChange: (input: any, value: any) => {
          rowToInsert[columnName] = value;
          setRowToInsert(rowToInsert);
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
              if (data) {
                let newData: TableData = data;
                newData.records[rowIndex][columnName] = value;
                setData(newData);

                if (props.onRowEdited) return props.onRowEdited(myself, input, value);
              }
            }
          })}</div>
        </>;
      } else {
        return cellValueElement;
      }
    }
  }

  const renderDefaultInsertButton = (row: any) => {
    return <button
      className="btn btn-add-outline"
      onClick={(e) => {
        e.preventDefault();
        openForm(-1, data, true);
        setRowToInsert({});
      }}
    >
      <span className="icon"><i className="fas fa-plus"></i></span>
    </button>;
  }

  const renderDefaultDeleteButton = (row: any) => {
    return row._toBeDeleted_
      ? <button
      className="btn btn-small btn-cancel"
      onClick={(e) => {
        e.preventDefault();
        let newData = data;
        delete findRecordById(row.id)._toBeDeleted_;
        setData(newData);
      }}
    >
      <span className="icon"><i className="fas fa-times"></i></span>
    </button>
    : <button
      className="btn btn-small btn-danger"
      title={T.translate('Delete')}
      onClick={(e) => {
        e.preventDefault();

        let newData = data;

        if (row.id <= 0 || row.id == undefined) {
          newData = deleteRecordById(row.id);
        } else {
          findRecordById(row.id)._toBeDeleted_ = true;
        }

        setData(newData);
      }}
    >
      <span className="icon"><i className="fas fa-trash-alt"></i></span>
    </button>;
  }

  const renderDefaultActionsColumn = (row: any) => {
    const R = findRecordById(row.id);

    let moreActions = [];
    let canCreate = !readonly && description?.permissions?.canCreate;
    let canDelete = !readonly && description?.permissions?.canDelete;

    if (R._PERMISSIONS && !R._PERMISSIONS[1]) canCreate = false;
    if (R._PERMISSIONS && !R._PERMISSIONS[3]) canDelete = false;

    if (canCreate && row._isInsertRow_) {
      moreActions.push(renderInsertButton(row));
    } else if (canDelete) {
      moreActions.push(renderDeleteButton(row));
    }

    if (moreActions.length == 0) return null;
    else if (moreActions.length == 1) return moreActions[0];
    else return <div className='flex gap-2'>{moreActions.map((item, key) => item)}</div>;
  }

  const renderDefaultRecordsAsTree = (nodes: any, idParent: number = 0, level: number = 0): React.JSX.Element => {
    if (nodes.length && nodes.length > 0) {
      return <div className='list'>
        {nodes.map((node, index) => {
          const hasChildren = node.CHILDREN && node.CHILDREN.length > 0;
          const isExpanded = !collapsedNodeIds.includes(node.id);
          return <div className='list-item'>
            <div className='flex gap-2 justify-between'>
              {hasChildren ?
                <div>
                  <button
                    className='btn btn-transparent btn-list-item w-full'
                    onClick={() => {
                      let newCollapsedNodeIds = collapsedNodeIds;
                      if (newCollapsedNodeIds.includes(node.id)) {
                        for (let i in newCollapsedNodeIds) {
                          if (newCollapsedNodeIds[i] == node.id) {
                            delete newCollapsedNodeIds[i];
                          }
                        }
                      } else {
                        newCollapsedNodeIds.push(node.id);
                      }
                      setCollapsedNodeIds(newCollapsedNodeIds);
                    }}
                  >
                    <span className='icon'><i className={'fas fa-' + (isExpanded ? 'chevron-up' : 'chevron-down')}></i></span>
                  </button>
                </div>
              : null}
              <div className='grow'>
                <button
                  className='btn btn-transparent btn-list-item w-full'
                  onClick={() => {
                    openForm(node.id);
                  }}
                >
                  <span className='text'>{node.title}</span>
                </button>
              </div>
            </div>
            {hasChildren && isExpanded ?
              <div className='m-4'>
                {renderRecordsAsTree(node.CHILDREN, node.id, level + 1)}
                <button
                  className='btn btn-transparent btn-list-item w-full'
                  onClick={() => {
                    openForm(-1);
                  }}
                >
                  <span className='icon'><i className='fas fa-plus'></i></span>
                  <span className='text'>{T.translate('Add new')}</span>
                </button>
              </div>
            : null}
          </div>;
        })}
      </div>;
    } else {
      return <></>;
    }
  }

  const renderDefaultRecords = (): React.JSX.Element => {
    const showColumnSearch = description?.ui?.showColumnSearch ?? false;
    const showAsPlainTable = description?.ui?.showAsPlainTable ?? false;
    
    switch (description.ui?.dataView) {
      case 'tree':
        return renderRecordsAsTree(data?.tree);
      break;
      default:
        if (showAsPlainTable) {
          const columns = description?.columns ?? {};

          return <table className='table-default dense'>
            <thead>
              <tr>
                {Object.keys(columns).map((colName, columnIndex) => {
                  const column = description?.columns[colName];
                  return <th className='border-none'>{column.title}</th>;
                })}
              </tr>
            </thead>
            <tbody>
              {data?.records.map((row, rowIndex) => {
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
          const records = getRecordsToDisplay();
          const columns = getColumns();
          const columnKeys = Object.keys(columns);

          const currentPage = data?.current_page ?? 0;
          const lastPage = data?.last_page ?? 0;
          const itemsPerPage = data?.per_page ?? 0;
          const itemsFrom = data?.from ?? 0;
          const itemsTo = data?.to ?? 0;
          const itemsTotal = data?.total ?? 0;

          let previousPages: any = [];
          for (let i = Math.max(currentPage - 5, 1); i < currentPage; i++) previousPages.push(i);

          let nextPages: any = [];
          for (let i = currentPage + 1; i <= Math.min(currentPage + 5, lastPage); i++) nextPages.push(i);

          let orderBy = description?.ui?.orderBy ?? null;
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

                          onOrderByChange(newOrderBy);
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
            <div className="table-paginator justify-start bg-primary/5 p-1 mb-0">
              {currentPage > 1 ?
                <div
                  className="btn btn-white"
                  onClick={() => onPaginationChange(currentPage - 1, itemsPerPage)}
                >
                  <span className="icon"><i className="fas fa-arrow-left"></i></span>
                </div>
              : null}
              {previousPages[0] > 1 ? <>
                <div
                  className="btn btn-white"
                  onClick={() => onPaginationChange(1, itemsPerPage)}
                >
                  <span className="text">1</span>
                </div>
                <div>...</div>
              </> : null}
              {previousPages.map((page: number) => {
                return <div
                  className="btn btn-white"
                  onClick={() => onPaginationChange(page, itemsPerPage)}
                >
                  <span className="text">{page}</span>
                </div>
              })}
              <div
                className="btn btn-white"
                onClick={() => onPaginationChange(currentPage, itemsPerPage)}
              >
                <span className="text font-bold">{currentPage}</span>
                <span className="text">({itemsFrom} - {itemsTo} / {itemsTotal})</span>
              </div>
              {nextPages.map((page: number) => {
                return <div
                  className="btn btn-white"
                  onClick={() => onPaginationChange(page, itemsPerPage)}
                >
                  <span className="text">{page}</span>
                </div>
              })}
              {nextPages[nextPages.length - 1] < lastPage ? <>
                <div>...</div>
                <div
                  className="btn btn-white"
                  onClick={() => onPaginationChange(lastPage, itemsPerPage)}
                >
                  <span className="text">{lastPage}</span>
                </div>
              </> : null}
              {currentPage < lastPage ?
                <div
                  className="btn btn-white"
                  onClick={() => onPaginationChange(currentPage + 1, itemsPerPage)}
                >
                  <span className="icon"><i className="fas fa-arrow-right"></i></span>
                </div>
              : null}
              <div>
                <select
                  value={itemsPerPage}
                  onChange={(event) => {
                    onPaginationChange(currentPage, parseInt(event.currentTarget.value));
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
      break;
    }
  }

  const renderDefaultContent = (): React.JSX.Element => {
    const sidebarFilter = renderSidebarFilter();

    return <>
      {renderFormModal()}
      {isUsedAsInput ? null : renderDeleteConfirmModal()}

      <div
        id={"hubleto-table-" + uid}
        className={
          "hubleto component table"
          + (props.className ? " " + props.className : "")
          + (loadingData ? " loading" : "")
        }
      >
        {description?.ui?.showHeader ? renderHeader() : null}
        {description?.ui?.showFilter ? renderFilter() : null}

        <div className="flex gap-2 flex-col md:flex-row overflow-x max-w-[98vw]">
          {sidebarFilter && description?.ui?.showSidebarFilter && !sidebarFilterHidden ?
            <div className="table-sidebar-filter">
              {sidebarFilter}
            </div>
          : null}

          <div className="table-body grow" id={"hubleto-table-body-" + uid}>
            {renderRecords()}
            {renderFooter()}
          </div>
        </div>

      </div>

      {showExportCsvScreen ?
        <Modal
          //@ts-ignore
          ref={refExportCsvModal}
          form={refExportCsvForm}
          uid={uid + '_export_csv_modal'}
          isOpen={true}
          type='centered large'
          onClose={() => { setShowExportCsvScreen(false); }}
        >
          <TableExtendedExportCsvForm
            //@ts-ignore
            ref={refExportCsvForm}
            modal={refExportCsvModal}
            model={model}
            parentTable={this}
            onClose={() => { setShowExportCsvScreen(false); }}
          ></TableExtendedExportCsvForm>
        </Modal>
      : null}
      {showImportCsvScreen ?
        <Modal
          //@ts-ignore
          ref={refImportCsvModal}
          form={refImportCsvForm}
          uid={uid + '_import_csv_modal'}
          isOpen={true}
          type='centered large'
          onClose={() => { setShowImportCsvScreen(false); }}
        >
          <TableExtendedImportCsvForm
            //@ts-ignore
            ref={refImportCsvForm}
            modal={refImportCsvModal}
            model={model}
            parentTable={this}
            onClose={() => { setShowImportCsvScreen(false); }}
          ></TableExtendedImportCsvForm>
        </Modal>
      : null}
      {showColumnConfigScreen ?
        <Modal
          //@ts-ignore
          ref={refColumnConfigModal}
          form={refColumnsConfigScreen}
          uid={uid + '_columns_config_modal'}
          isOpen={true}
          type='right'
          title={T.translate('Customize Columns')}
          onClose={() => { setShowColumnConfigScreen(false); }}
        >
          <TableExtendedColumnsCustomize
            //@ts-ignore
            ref={refColumnsConfigScreen}
            parentTable={this}
            tableTag={tag}
            tableModel={model}
            onClose={() => { setShowColumnConfigScreen(false) }}
          ></TableExtendedColumnsCustomize>
        </Modal>
      : null}
    </>;
  }






  const myself: TableMeta = {
    props,

    endpoint, setEndpoint,
    activeRowId, setActiveRowId,
    async, setAsync,
    columnSearch, setColumnSearch,
    crudController, setCrudController,
    context, setContext,
    data, setData,
    description, setDescription,
    descriptionSource, setDescriptionSource,
    editMode, setEditMode,
    filterBy, setFilterBy,
    filters, setFilters,
    formActiveTabUid, setFormActiveTabUid,
    formEndpoint, setFormEndpoint,
    formProps, setFormProps,
    fulltextSearch, setFulltextSearch,
    inlineEditingEnabled, setInlineEditingEnabled,
    invalidInputs, setInvalidInputs,
    isInlineEditing, setIsInlineEditing,
    isUsedAsInput, setIsUsedAsInput,
    itemsPerPage, setItemsPerPage,
    loadingData, setLoadingData,
    model, setModel,
    page, setPage,
    readonly, setReadonly,
    formDefaultValues, setFormDefaultValues,
    recordId, setRecordId,
    recordNextId, setRecordNextId,
    recordPrevId, setRecordPrevId,
    recordSaveAfterOpen, setRecordSaveAfterOpen,
    rowToInsert, setRowToInsert,
    selection, setSelection,
    sidebarFilterHidden, setSidebarFilterHidden,
    tableUpdateIteration, setTableUpdateIteration,
    tag, setTag,
    uid, setUid,
    view, setView,

    loadData, loadDescription,
    openForm, closeForm,

    getDefaultEndpointParams,
    getDefaultEndpointUrl,
    getDefaultCsvImportEndpointParams,
    getDefaultSelectionMode,
    getDefaultRecordsToDisplay,
    getDefaultFormProps,
    getDefaultFormModalProps,
    getDefaultCellClassName,
    getDefaultCellCssStyle,
    getDefaultMinColumnValue,
    getDefaultMaxColumnValue,
    getDefaultRowClassName,

    renderDefaultAddButton,
    renderDefaultMoreActionsButton,
    renderDefaultHeaderButtons,
    renderDefaultHeaderLeft,
    renderDefaultFulltextSearch,
    renderDefaultTitle,
    renderDefaultHeaderRight,
    renderDefaultHeader,
    renderDefaultFilter,
    renderDefaultSidebarFilter,
    renderDefaultFooter,
    renderDefaultDeleteConfirmModal,
    renderDefaultFormModal,
    renderDefaultForm,
    renderDefaultCell,
    renderDefaultInsertButton,
    renderDefaultDeleteButton,
    renderDefaultActionsColumn,
    renderDefaultRecordsAsTree,
    renderDefaultRecords,
    renderDefaultContent,
  };

  if (!data) return <Spinner>Loading data, please wait.</Spinner>;

  return <ErrorBoundary
    fallback={<div className="alert alert-danger">Failed to render table. Check console for error log.</div>}
  >
    <TableMetaContext.Provider value={myself}>
      {renderContent()}
    </TableMetaContext.Provider>
  </ErrorBoundary>;
}

export default Table;