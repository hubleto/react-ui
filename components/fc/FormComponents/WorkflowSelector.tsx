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

const translate = new Translator(
  'Hubleto\\ReactUi',
  'Components\\WorkflowSelector'
).translate;

const WorkflowSelector = React.memo((props: WorkflowSelectorProps) => {
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
          <div className="input-element">
            {Object.keys(workflows).map((tmpIdWorkflow: any, key: any) => {
              return <button
                key={key}
                className={"btn " + (tmpIdWorkflow == idWorkflow ? "btn-primary" : "btn-transparent")}
                onClick={() => { onWorkflowChange(tmpIdWorkflow); }}
              ><span className="text">{workflows[tmpIdWorkflow]?.name}</span></button>
            })}
          </div>
        </div></div>
      </div>
    </div> : <div className='flex gap-2 max-h-8 overflow-auto md:max-h-none'>
      <div className='flex flex-col'>
        <div className='flex items-center flex-col items-start'>
          {steps && steps.length > 0 ? <>
            <div>
              {steps.map((s, i) => {
                let stepBtnClass = "btn-light";
                if (stepBtnClass == "btn-primary") stepBtnClass = "btn-transparent";
                else if (s.id == idWorkflowStep) stepBtnClass = "btn-primary";

                return <button
                  key={i}
                  onClick={() => onWorkflowStepChange(s.id, s)}
                  className={`btn btn-small ${stepBtnClass} border-none rounded-none`}
                >
                  <div
                    className="icon p-0"
                    style={{
                      borderTop: '1em solid transparent',
                      borderBottom: '1em solid transparent',
                      borderLeft: '1em solid ' + s.color
                    }}
                  >
                  </div>
                  <div className='text p-2'>
                    {s.name}
                  </div>
                </button>;
              })}
            </div>
            <div className='text-xs text-gray-400 flex gap-2'>
              {readonly ? <i className='fas fa-lock'></i> : null}
              {historyForCurrentWorkflow[0] ? <>
                {translate('Last update: {{ date }} by {{ user }}', 'Hubleto\\Erp\\Loader', 'Components\\WorkflowSelector')
                  .replace('{{ date }}', historyForCurrentWorkflow[0].datetime_change)
                  .replace('{{ user }}', historyForCurrentWorkflow[0].USER?.nick ?? translate('unknown', 'Hubleto\\Erp\\Loader', 'Components\\WorkflowSelector'))
                }
              </> : null}                  
              {readonly ? null :
                <a href='#' onClick={() => { setChangeWorkflow(true); }}>
                  <span className="text">{translate('Change workflow', 'Hubleto\\Erp\\Loader', 'Components\\WorkflowSelector')}</span>
                </a>
              }
            </div>
          </> : (readonly ? null : <div>
            <button
              className='btn btn-primary-outline btn-small'
              onClick={() => { setChangeWorkflow(true); }}
            >
              <span className='icon'><i className='fas fa-timeline'></i></span>
              <span className="text">{translate('Change workflow', 'Hubleto\\Erp\\Loader', 'Components\\WorkflowSelector')}</span>
            </button>
          </div>)}
        </div>
      </div>
    </div>}
  </div>);

}, () => true);

// export function updateFormWorkflowByTag(form: any, tag: string, onsuccess: any) {
//   request.post(
//     'workflow/api/get-workflow-step-by-tag',
//     { idWorkflow: form.state.record.id_workflow, tag: tag },
//     {},
//     (result: any) => {
//       if (result && result.id) {
//         form.changeRecord({id_workflow_step: result.id}, () => {
//           if (onsuccess) onsuccess();
//         });
//       }
//     }
//   );
// }

export default WorkflowSelector;