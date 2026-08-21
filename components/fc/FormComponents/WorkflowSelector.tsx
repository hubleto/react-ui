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
    console.log('onWorkflowStepChange', newIdWorkflowStep, step);
    if (readonly) return;
    console.log('here');

    setIdWorkflowStep(newIdWorkflowStep);

    form.changeRecord({id_workflow_step: newIdWorkflowStep});

    if (props.onAfterWorkflowStepChange) {
      props.onAfterWorkflowStepChange(newIdWorkflowStep, step);
    }
  }

 
  if (!isInitialized) return <div className='p-1'><Spinner size="xs" /></div>;

  const historyForCurrentWorkflow = history.filter((item) => item.id_workflow == idWorkflow);
  const steps = workflows ? workflows[idWorkflow]?.STEPS : null;
  const currentStep = steps ? steps.filter((step) => step.id == idWorkflowStep)[0] ?? null : null;

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
      {/* <button className='btn btn-list-item btn-transparent btn-dropdown'>
        <span className='icon'><i className='fas fa-timeline'></i></span>
        <span className='menu w-60'>
          <div className='list'>

            {steps && steps.length > 0 ? <>
              {steps.map((s, i) => {
                let stepBtnClass = "btn-light";
                if (stepBtnClass == "btn-primary") stepBtnClass = "btn-transparent";
                else if (s.id == idWorkflowStep) stepBtnClass = "btn-primary";

                return <div
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
                </div>;
              })}
            </>: null}

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
      </button> */}
      <div
        style={{
          borderTop: '1.1em solid transparent',
          borderBottom: '1.1em solid transparent',
          borderLeft: '1.1em solid ' + (currentStep?.color ?? '#aaaaaa'),
        }}
      >
      </div>
      <button
        // onClick={() => onWorkflowStepChange(currentStep.id, currentStep)}
        className="btn btn-white btn-dropdown"
        style={{border: '1px solid ' + (currentStep?.color ?? '#aaaaaa'),}}
      >
        <span
          className='icon'
          style={{color: (currentStep?.color ?? 'black')}}
        >
          <i className='fas fa-timeline'></i>
        </span>
        <span
          className='text'
          style={{color: (currentStep?.color ?? 'black')}}
        >
          {currentStep?.name ?? 'Select workflow step'}
        </span>
        <span className='menu w-60'>
          <div className='list'>

            {steps && steps.length > 0 ? <>
              {steps.map((s, i) => {
                let stepBtnClass = "btn-white";
                if (stepBtnClass == "btn-primary") stepBtnClass = "btn-transparent";
                else if (s.id == idWorkflowStep) stepBtnClass = "btn-primary";

                return <div
                  key={i}
                  onClick={() => onWorkflowStepChange(s.id, s)}
                  className={`btn btn-list-item btn-small ${stepBtnClass}`}
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
                </div>;
              })}
            </>: null}

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
      {/* <div className='flex flex-row items-center'>
        {steps && steps.length > 0 ? <>
          {steps.map((s, i) => {
            const isCurrent = s.id == idWorkflowStep;

            let stepBtnClass = "btn-light";
            if (stepBtnClass == "btn-primary") stepBtnClass = "btn-transparent";
            else if (s.id == idWorkflowStep) stepBtnClass = "btn-primary";

            return <div
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
                {isCurrent ? s.name : '...'}
              </div>
            </div>;
          })}
        </>: null}
      </div> */}
    </div>}
  </div>);

};

export default WorkflowSelector;