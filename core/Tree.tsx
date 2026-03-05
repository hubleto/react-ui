import React, { Component, ChangeEvent, createRef } from 'react';

import { setUrlParam } from "./Helper";
import ErrorBoundary from "./ErrorBoundary";
import { ModalProps } from "./Modal";
import ModalForm from "./ModalForm";
import Form, { FormEndpoint, FormProps, FormState } from "./Form";
import Notification from "./Notification";
import TranslatedComponent from "./TranslatedComponent";

import { ProgressBar } from 'primereact/progressbar';

import { deepObjectMerge } from "./Helper";
import request from "./Request";

export interface TreeEndpoint {
  describeTree: string,
  loadTreeData: string,
}

export interface TreeOrderBy {
  field: string,
  direction?: string | null
}

export interface TreeUi {
  orderBy?: TreeOrderBy,
  showFulltextSearch?: boolean,
}

export interface TreeDescription {
  ui?: TreeUi,
}

export interface TreeProps {
  uid: string,
  description?: TreeDescription,
  descriptionSource?: 'props' | 'request' | 'both',
  recordId?: any,
  formEndpoint?: FormEndpoint,
  formModal?: ModalProps,
  formProps?: FormProps,
  formReactComponent?: string,
  formCustomProps?: any,
  endpoint?: TreeEndpoint,
  customEndpointParams?: any,
  model: string,
  parentForm?: Form<FormProps, FormState>,
  tag?: string,
  onChange?: (table: Tree<TreeProps, TreeState>) => void,
  onAfterLoadData?: (table: Tree<TreeProps, TreeState>) => void,
  data?: TreeData,
  readonly?: boolean,
  closeFormAfterSave?: boolean,
  fulltextSearch?: string,
}

// Laravel pagination
interface TreeData {
  nodes?: any,
}

export interface TreeState {
  endpoint: TreeEndpoint,
  description?: TreeDescription,
  loadingData: boolean,
  data?: TreeData | null,
  recordId?: any,
  formEndpoint?: FormEndpoint,
  formProps?: FormProps,
  fulltextSearch?: string,
  customEndpointParams: any,
  myRootUrl: string,
  collapsedNodeIds: Array<number>,
}

export default class Tree<P, S> extends TranslatedComponent<TreeProps, TreeState> {
  static defaultProps = {
    descriptionSource: 'both',
  }

  props: TreeProps;
  state: TreeState;

  model: string;
  refFulltextSearchInput: any = React.createRef();
  refForm: any = React.createRef();
  refFormModal: any = React.createRef();

  constructor(props: TreeProps) {
    super(props);

    globalThis.hubleto.reactElements[this.props.uid] = this;
    this.model = this.props.model ?? '';

    this.state = this.getStateFromProps(props);
  }

  getStateFromProps(props: TreeProps): TreeState {
    let state: any = {
      endpoint: props.endpoint ? props.endpoint : (globalThis.hubleto.config.defaultTableEndpoint ?? {
        describeTree: 'api/tree/describe',
        loadTreeData: 'api/record/load-tree-data',
      }),
      recordId: props.recordId,
      formEndpoint: props.formEndpoint ? props.formEndpoint : (globalThis.hubleto.config.defaultFormEndpoint ?? null),
      formProps: {
        model: this.model,
        uid: props.uid,
      },
      loadingData: false,
      readonly: props.readonly ?? false,
      customEndpointParams: this.props.customEndpointParams ?? {},
      fulltextSearch: props.fulltextSearch ?? '',
      myRootUrl: window.location.protocol + "//" + window.location.host + window.location.pathname,
      collapsedNodeIds: [],
    };

    if (props.description) state.description = props.description;
    if (props.data) state.data = props.data;

    return state;
  }

  componentDidMount() {
    this.loadDescription(() => {;
      this.loadData();
    });
  }

  componentDidUpdate(prevProps: TreeProps) {
    if (
      (prevProps.formProps?.id != this.props.formProps?.id)
      // || (prevProps.parentRecordId != this.props.parentRecordId)
    ) {
      this.state.formProps = this.props.formProps;
      this.loadDescription();
      this.loadData();
    }

    if (
      prevProps.data != this.props.data
      || prevProps.description != this.props.description
    ) {
      this.setState(this.getStateFromProps(this.props), () => {
        this.loadDescription();
        this.loadData();
      })
    }
  }

  onAfterLoadDescription(description: any): any {
    return description;
  }

  getEndpointUrl(action: string) {
    return this.state.endpoint[action] ?? '';
  }

  getEndpointParams(): any {
    return {
      model: this.model,
      tag: this.props.tag,
      __IS_AJAX__: '1',
      ...this.props.customEndpointParams,
    }
  }

  getCsvImportEndpointParams(): any {
    return null;
  }

  reload() {
    this.setState({isInitialized: false}, () => {
      this.loadDescription(() => {
        this.loadData();
      });

    });
  }

  loadDescription(successCallback?: (params: any) => void) {

    if (this.props.descriptionSource == 'props') return;

    request.get(
      this.getEndpointUrl('describeTree'),
      this.getEndpointParams(),
      (description: any) => {
        try {

          if (this.props.description && this.props.descriptionSource == 'both') description = deepObjectMerge(description, this.props.description);

          description = this.onAfterLoadDescription(description);

          this.setState({description: description}, () => {
            if (successCallback) successCallback(description);
          });
        } catch (err) {
          Notification.error(err.message);
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
          this.getEndpointUrl('loadTreeData'),
          {
            ...this.getEndpointParams(),
            model: this.model,
            orderBy: this.state.description?.ui?.orderBy ?? { field: 'id', direction: 'asc' },
            fulltextSearch: this.state.fulltextSearch,
            tag: this.props.tag,
            __IS_AJAX__: '1',
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
    return {
      // isInitialized: false,
      ref: this.refForm,
      modal: this.refFormModal,
      parentTable: this,
      uid: this.props.uid + '_form',
      model: this.model,
      tag: this.props.tag,
      id: this.state.recordId ?? null,
      endpoint: this.state.formEndpoint,
      showInModal: true,
      description: this.props.formProps?.description,
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
      onCopyCallback: (form: Form<FormProps, FormState>, saveResponse: any) => {
        this.loadData();
        this.openForm(saveResponse.savedRecord.id);
      },
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

  renderFulltextSearch(): JSX.Element {
    if (this.state.description?.ui?.showFulltextSearch) {
      return <div className="table-header-search">
        <input
          ref={this.refFulltextSearchInput}
          className={"table-header-search " + (this.state.fulltextSearch == "" ? "" : "active")}
          type="search"
          placeholder={this.translate('Search...', 'Hubleto\\Erp\\Loader', 'Components\\Table')}
          value={this.state.fulltextSearch}
          onKeyUp={(event: any) => {
            if (event.keyCode == 13) {
              this.loadData();
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

  renderFormModal(): JSX.Element {
    if (this.state.recordId) {
      return <ModalForm {...this.getFormModalProps()}>{this.renderForm()}</ModalForm>;
    } else {
      return <></>;
    }
  }

  renderForm(): JSX.Element {
    if (this.props.formReactComponent) {
      return globalThis.hubleto.renderReactElement(this.props.formReactComponent, this.getFormProps()) ?? <></>;
    } else {
      return <Form {...this.getFormProps()} />;
    }
  }

  /*
   * Render tree node
   */
  renderNode(data: any, options: any) {
    return <div>{JSON.stringify(data)}</div>;
  }

  renderTree(nodes: any = null, idParent: number = 0, level: number = 0): JSX.Element {
    if (nodes === null) {
      nodes = this.state.data.nodes;
    }
    if (nodes.length && nodes.length > 0) {
      return <div className='list'>
        {nodes.map((node, index) => {
          const hasChildren = node.CHILDREN && node.CHILDREN.length > 0;
          const isExpanded = !this.state.collapsedNodeIds.includes(node.id);
          return <div className='list-item'>
            <div className='flex gap-2 justify-between'>
              {hasChildren ?
                <div>
                  <button
                    className='btn btn-transparent btn-list-item w-full'
                    onClick={() => {
                      let collapsedNodeIds = this.state.collapsedNodeIds;
                      if (collapsedNodeIds.includes(node.id)) {
                        for (let i in collapsedNodeIds) {
                          if (collapsedNodeIds[i] == node.id) {
                            delete collapsedNodeIds[i];
                          }
                        }
                      } else {
                        collapsedNodeIds.push(node.id);
                      }
                      this.setState({collapsedNodeIds: collapsedNodeIds});
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
                    this.openForm(node.id);
                  }}
                >
                  <span className='text'>{node.title}</span>
                </button>
              </div>
            </div>
            {hasChildren && isExpanded ?
              <div className='m-4'>
                {this.renderTree(node.CHILDREN, node.id, level + 1)}
                <button
                  className='btn btn-transparent btn-list-item w-full'
                  onClick={() => {
                    this.openForm(-1);
                  }}
                >
                  <span className='icon'><i className='fas fa-plus'></i></span>
                  <span className='text'>{this.translate('Add new')}</span>
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

  renderContent(): JSX.Element {

    return <>
      {this.renderFormModal()}

      <div
        id={"hubleto-table-" + this.props.uid}
        className={
          "hubleto component tree" + (this.state.loadingData ? " loading" : "")
        }
      >
        {this.renderTree()}
      </div>
    </>;
  }

  render() {
    try {
      globalThis.hubleto.setTranslationContext(this.translationContext);

      if (!this.state.data) {
        return <ProgressBar mode="indeterminate" style={{ height: '8px' }}></ProgressBar>;
      }

      const fallback: any = <div className="alert alert-danger">Failed to render table. Check console for error log.</div>

      return <ErrorBoundary fallback={fallback}>{this.renderContent()}</ErrorBoundary>;
    } catch(e) {
      console.error('Failed to render table.');
      console.error(e);
      return <div className="alert alert-danger">Failed to render table. Check console for error log.</div>
    }
  }

  setRecordFormUrl(id: number) {
    const urlParams = new URLSearchParams(window.location.search);
    if (!this.props.parentForm) urlParams.set('recordId', id.toString());
    window.history.pushState({}, "", '?' + urlParams.toString());
  }

  openForm(id: any) {
    if (!this.props.parentForm) {
      this.setRecordFormUrl(id);
    }

    this.setState({ recordId: null }, () => {
      this.setState({
        recordId: id,
        activeRowId: id,
      });
    });
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

    this.setState({ recordId: null });
  }

  onAddClick() {
    this.openForm(-1);
  }

  onRowClick(row: any) {
    if (row._PERMISSIONS && !row._PERMISSIONS[1]) return; // cannot read

    this.openForm(row.id ?? 0);
  }

  onFulltextSearchChange(fulltextSearch: string) {
    this.setState({
      fulltextSearch: fulltextSearch
    });
  }

}
