import React, { JSX, useState } from 'react';
import request from "../../../core/Request";
import moment from 'moment';
import Calendar from './Calendar';
import ModalForm from '@hubleto/react-ui/components/cc/ModalForm';
import Translator from "../../../core/Translator";
import Form, { FormMetaContext } from "../Form";
import { useRecordField } from "../FormRecordStore";
import Divider from './Divider';

export interface CalendarTabProps {
  showIdActivity?: number,
  renderActivityForm: (calendarTab: any) => React.JSX.Element,
  children?: JSX.Element,
}

export const CalendarTabContext = React.createContext<{
  showIdActivity,
  activityTime,
  activityDate,
  activitySubject,
  activityAllDay,
  setShowIdActivity,
}>(null);


const ActivityFormRenderer = (p: { renderer: any, calendarTab: any }): React.JSX.Element => p.renderer(p.calendarTab);

const CalendarTab = React.memo((props: CalendarTabProps) => {
  const form = React.useContext(FormMetaContext);

  // const R = useRecord();
  const id = useRecordField('id');
  const isClosed: boolean = useRecordField('is_closed');
  const ACTIVITIES: Array<object> = useRecordField('ACTIVITIES');

  const translate = new Translator(
    'Hubleto\\ReactUi',
    'Components\\CalendarTab'
  ).translate;
  
  const [showIdActivity, setShowIdActivity] = useState(props.showIdActivity ?? 0);
  const [activityTime, setActivityTime] = useState('');
  const [activityDate, setActivityDate] = useState('');
  const [activitySubject, setActivitySubject] = useState('');
  const [activityAllDay, setActivityAllDay] = useState(false);

  const refLogActivityInput = React.createRef<HTMLInputElement>();
  const refActivityForm = React.createRef<typeof Form>();

  const logCompletedActivity = (): void => {
    request.get(
      'leads/api/log-activity',
      {
        idLead: id,
        activity: refLogActivityInput.current.value,
      },
      (result: any) => {
        form.loadRecord();
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
    onCreateCallback={() => form.loadRecord()}
    readonly={isClosed}
    initialView='dayGridMonth'
    headerToolbar={{ start: 'title', center: '', end: 'prev,today,next' }}
    eventsEndpoint={globalThis.hubleto.config.projectUrl + '/calendar/api/get-calendar-events?calendar=leads&idLead=' + id}
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
      <Divider>{translate('Most recent activities')}</Divider>
      {ACTIVITIES ? <div className="list">{ACTIVITIES.reverse().slice(0, 7).map((item: any, index: any) => {
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
    onCreateCallback={() => form.loadRecord()}
    readonly={isClosed}
    initialView='timeGridWeek'
    views={"timeGridDay,timeGridWeek,dayGridMonth,listYear"}
    eventsEndpoint={globalThis.hubleto.config.projectUrl + '/calendar/api/get-calendar-events?calendar=leads&idLead=' + id}
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

  const _this: any = {
    form,
    showIdActivity,
    activityTime,
    activityDate,
    activitySubject,
    activityAllDay,
    renderActivityForm: props.renderActivityForm,
    setShowIdActivity,
  }

  return <CalendarTabContext.Provider value={{
    showIdActivity,
    activityTime,
    activityDate,
    activitySubject,
    activityAllDay,
    setShowIdActivity,
  }}>
    <div className='flex gap-2 mt-2'>
      <div className='flex-2 w-2/3'>
        {tmpCalendarLarge}
      </div>
      <div className='flex-1 w-1/3'>
        {form.id > 0 ? recentActivitiesAndCalendar : null}
      </div>
    </div>
    {showIdActivity == 0 ? null : <>
      <ModalForm
        form={refActivityForm}
        uid='activity_form'
        isOpen={true}
        type='right'
      ><ActivityFormRenderer renderer={props.renderActivityForm} calendarTab={_this} /></ModalForm>
    </>}
  </CalendarTabContext.Provider>;



}, () => true);

export default CalendarTab;