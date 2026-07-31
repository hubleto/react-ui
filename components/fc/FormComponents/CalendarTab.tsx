import React, { useState } from 'react';
import request from "../../../core/Request";
import moment from 'moment';
import Calendar from './Calendar';
import ModalForm from '@hubleto/react-ui/components/cc/ModalForm';
import Form from '../Form';
import { FormRecord } from '../FormInterfaces';
import Translator from "../../../core/Translator";

export interface CalendarTabProps {
  parentForm: any,
  showIdActivity: number,
  activityTime: string,
  activityDate: string,
  activitySubject: string,
  activityAllDay: boolean,

  renderActivityForm: (calendarTab: any) => React.JSX.Element,
}

export interface CalendarTabContext extends CalendarTabProps {
  setShowIdActivity: React.Dispatch<number>,
}

const CalendarTab = React.memo((props: CalendarTabProps) => {

  const translate = new Translator(
    'Hubleto\\ReactUi',
    'Components\\CalendarTab'
  ).translate;
  
  const parentForm = props.parentForm;
  const R: FormRecord = parentForm.record;

  const [showIdActivity, setShowIdActivity] = useState(props.showIdActivity ?? 0);
  const [activityTime, setActivityTime] = useState(props.activityTime ?? '');
  const [activityDate, setActivityDate] = useState(props.activityDate ?? '');
  const [activitySubject, setActivitySubject] = useState(props.activitySubject ?? '');
  const [activityAllDay, setActivityAllDay] = useState(props.activityAllDay ?? false);

  const refLogActivityInput = React.createRef<HTMLInputElement>();
  const refActivityForm = React.createRef<typeof Form>();

  const logCompletedActivity = (): void => {
    request.get(
      'leads/api/log-activity',
      {
        idLead: parentForm.record.id,
        activity: refLogActivityInput.current.value,
      },
      (result: any) => {
        parentForm.loadRecord();
        refLogActivityInput.current.value = '';
      }
    );
  }

  const scheduleActivity = (): void => {
    setShowIdActivity(-1);
    setActivityDate(moment().add(1, 'week').format('YYYY-MM-DD'));
    setActivityTime(moment().add(1, 'week').format('H:00:00'));
    setActivitySubject(refLogActivityInput.current.value);
    setActivityAllDay(false);
  }

  const tmpCalendarSmall = <Calendar
    onCreateCallback={() => parentForm.loadRecord()}
    readonly={R.is_closed}
    initialView='dayGridMonth'
    headerToolbar={{ start: 'title', center: '', end: 'prev,today,next' }}
    eventsEndpoint={globalThis.hubleto.config.projectUrl + '/calendar/api/get-calendar-events?calendar=leads&idLead=' + R.id}
    onDateClick={(date: any, time: any, info: any) => {
      setActivityDate(date);
      setActivityTime(time);
      setActivityAllDay(false);
      setShowIdActivity(-1);
    }}
    onEventClick={(info: any) => {
      setShowIdActivity(parseInt(info.event.id));
      info.jsEvent.preventDefault();
    }}
  ></Calendar>;

  const recentActivitiesAndCalendar = <div className='card card-body flex flex-col gap-2'>
    <div>
      {tmpCalendarSmall}
    </div>
    <div>
      <div className="hubleto component input"><div className="input-element w-full flex gap-2">
        <input
          className="w-full bg-blue-50 border border-blue-800 p-1 text-blue-800 placeholder-blue-300"
          placeholder={translate('Type recent activity here')}
          ref={refLogActivityInput}
          onKeyUp={(event: any) => {
            if (event.keyCode == 13) {
              if (event.shiftKey) {
                scheduleActivity();
              } else {
                logCompletedActivity();
              }
            }
          }}
          onChange={(e) => {
            refLogActivityInput.current.value = e.target.value;
          }}
        />
      </div></div>
      <div className='mt-2'>
        <button onClick={() => {logCompletedActivity()}} className="btn btn-blue-outline btn-small w-full">
          <span className="icon"><i className="fas fa-check"></i></span>
          <span className="text">{translate('Log completed activity')}</span>
          <span className="shortcut">{translate('Enter')}</span>
        </button>
        <button onClick={() => {scheduleActivity()}} className="btn btn-small w-full btn-blue-outline">
          <span className="icon"><i className="fas fa-clock"></i></span>
          <span className="text">{translate('Schedule activity')}</span>
          <span className="shortcut">{translate('Shift+Enter')}</span>
        </button>
      </div>
      {parentForm.renderDivider(translate('Most recent activities'))}
      {R.ACTIVITIES ? <div className="list">{R.ACTIVITIES.reverse().slice(0, 7).map((item: any, index: string) => {
        return <>
          <button key={index} className={"btn btn-small btn-transparent btn-list-item " + (item.completed ? "bg-green-50" : "bg-red-50")}
            onClick={() => setShowIdActivity(item.id)}
          >
            <span className="icon">{item.date_start} {item.time_start}<br/>@{item['_LOOKUP[id_owner]']}</span>
            <span className="text">
              {item.subject}
              {item.completed ? null : <div className="text-red-800">{translate('Not completed yet')}</div>}
            </span>
          </button>
        </>
      })}</div> : null}
    </div>
  </div>;

  const tmpCalendarLarge = <Calendar
    onCreateCallback={() => parentForm.loadRecord()}
    readonly={R.is_closed}
    initialView='timeGridWeek'
    views={"timeGridDay,timeGridWeek,dayGridMonth,listYear"}
    eventsEndpoint={globalThis.hubleto.config.projectUrl + '/calendar/api/get-calendar-events?calendar=leads&idLead=' + R.id}
    onDateClick={(date: any, time: any, info: any) => {
      setActivityDate(date);
      setActivityTime(time);
      setActivityAllDay(false);
      setShowIdActivity(-1);
    }}
    onEventClick={(info: any) => {
      setShowIdActivity(parseInt(info.event.id));
      info.jsEvent.preventDefault();
    }}
  ></Calendar>;

  const _this: CalendarTabContext = {
    parentForm,
    showIdActivity,
    activityTime,
    activityDate,
    activitySubject,
    activityAllDay,
    renderActivityForm: props.renderActivityForm,
    setShowIdActivity,
  }

  return <>
    <div className='flex gap-2 mt-2'>
      <div className='flex-2 w-2/3'>
        {tmpCalendarLarge}
      </div>
      <div className='flex-1 w-1/3'>
        {parentForm.id > 0 ? recentActivitiesAndCalendar : null}
      </div>
    </div>
    {showIdActivity == 0 ? null : <>
      <ModalForm
        form={refActivityForm}
        uid='activity_form'
        isOpen={true}
        type='right'
      >{props.renderActivityForm(_this)}</ModalForm>
    </>}
  </>;



}, () => true);

export default CalendarTab;