import React, { useState, useEffect } from "react";
import Spinner from '../Spinner';
import { FormMetaContext } from "../Form";
import { useRecordField } from "../FormRecordStore";
import request from "../../../core/Request";
import Translator from "../../../core/Translator";

interface WorkflowSelectorProps {
  onAfterWorkflowChange?: (idWorkflow: number, idWorkflowStep: number) => void,
  onAfterWorkflowStepChange?: (idWorkflowStep: number, step: any) => void,
}

const T = new Translator('Hubleto/ReactUi', 'Components/WorkflowSelector');

const WorkflowSelector = (props: WorkflowSelectorProps) => {
  const form = React.useContext(FormMetaContext);
  const id: number = useRecordField('id');

  const [idWorkflow, setIdWorkflow] = useState(useRecordField('id_workflow') ?? 0);
  const [idWorkflowStep, setIdWorkflowStep] = useState(useRecordField('id_workflow_step') ?? 0);
  const [workflows, setWorkflows] = useState(null);
  const [history, setHistory] = useState(null);
  const [changeWorkflow, setChangeWorkflow] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [readonly, setReadonly] = useState(form.readonly);

  const loadData = (onSuccess?: any): void => {

    request.post(
      'workflow/api/get-workflows',
      {
        model: form.model,
        recordId: id,
      },
      {},
      (data: any) => {
        // changeRecord({...R, WORKFLOW_HISTORY: data.history});
        form.changeRecord({WORKFLOW_HISTORY: data.history});
        setIsInitialized(true);
        setWorkflows(data.workflows);
        setHistory(data.history);
        if (onSuccess) onSuccess();
      }
    );
  }

  useEffect(() => { loadData(); }, []);

  const onWorkflowChange = (newIdWorkflow: number): void => {
    if (readonly) return;

    setIdWorkflow(newIdWorkflow);
    setIdWorkflowStep(0);
    setChangeWorkflow(false);

    form.changeRecord({id_workflow: newIdWorkflow, id_workflow_step: 0});

    if (props.onAfterWorkflowChange) {
      props.onAfterWorkflowChange(newIdWorkflow, 0);
    }
  }

  const onWorkflowStepChange = (newIdWorkflowStep: number, step: any): void => {
    if (readonly) return;

    setIdWorkflowStep(newIdWorkflowStep);

    form.changeRecord({id_workflow_step: newIdWorkflowStep});

    if (props.onAfterWorkflowStepChange) {
      props.onAfterWorkflowStepChange(newIdWorkflowStep, step);
    }
  }

 
  if (!isInitialized) return <div className='p-1'><Spinner size="xs" /></div>;

  const historyForCurrentWorkflow = history.filter((item) => item.id_workflow == idWorkflow);
  const steps = workflows ? workflows[idWorkflow]?.STEPS : null;

  return (id <= 0 ? null : <div className='flex flex-row flex-wrap p-1'>
    {changeWorkflow ? <div className='flex gap-2 items-center'>
      <div className="input-body">
        <div className="hubleto component input"><div className="inner">
          <div className="input-element"><div className="list horizontal">
            {Object.keys(workflows).map((tmpIdWorkflow: any, key: any) => {
              return <button
                key={key}
                className={"btn btn-list-item " + (tmpIdWorkflow == idWorkflow ? "btn-primary" : "btn-transparent")}
                onClick={() => { onWorkflowChange(tmpIdWorkflow); }}
              ><span className="text text-nowrap">{workflows[tmpIdWorkflow]?.name}</span></button>
            })}
          </div></div>
        </div></div>
      </div>
    </div> : <div className='flex gap-2'>
      <button className='btn btn-transparent btn-dropdown'>
        <span className='icon'><i className='fas fa-timeline'></i></span>
        <span className='menu w-60'>
          <div className='list'>
            {historyForCurrentWorkflow[0] ? <div className='btn btn-list-item btn-transparent'>
              <span className='icon'><i className='fas fa-clock'></i></span>
              <div className='text'>
                {T.translate('Last update: {{ date }} by {{ user }}')
                  .replace('{{ date }}', historyForCurrentWorkflow[0].datetime_change)
                  .replace('{{ user }}', historyForCurrentWorkflow[0].USER?.nick ?? T.translate('unknown'))
                }
              </div>
            </div> : null}                  
            {readonly ? null :
              <a href='#' className='btn btn-transparent btn-list-item' onClick={() => { setChangeWorkflow(true); }}>
                <span className='icon'><i className='fas fa-pencil'></i></span>
                <span className="text">{T.translate('Change workflow')}</span>
              </a>
            }
          </div>
        </span>
      </button>
      <div className='flex flex-row items-center'>
        {steps && steps.length > 0 ? <>
          {steps.map((s, i) => {
            let stepBtnClass = "btn-light";
            if (stepBtnClass == "btn-primary") stepBtnClass = "btn-transparent";
            else if (s.id == idWorkflowStep) stepBtnClass = "btn-primary";

            return <button
              key={i}
              onClick={() => onWorkflowStepChange(s.id, s)}
              className={`btn btn-small ${stepBtnClass} !border-none !rounded-none`}
            >
              <div
                style={{
                  borderTop: '1em solid transparent',
                  borderBottom: '1em solid transparent',
                  borderLeft: '1em solid ' + s.color
                }}
              >
              </div>
              <div className='text'>
                {s.name}
              </div>
            </button>;
          })}
        </> : (readonly ? null : <div>
          <button
            className='btn btn-transparent'
            onClick={() => { setChangeWorkflow(true); }}
          >
            <span className="text">{T.translate('Select workflow')}</span>
          </button>
        </div>)}
      </div>
    </div>}
  </div>);

};

export default WorkflowSelector;