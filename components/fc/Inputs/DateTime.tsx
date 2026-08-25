import React, { useState } from 'react'
import Input, { InputProps, InputMeta, InputMetaContext } from '../Input'
import Flatpickr from "react-flatpickr";
import moment, { Moment } from "moment";
import Translator from "../../../core/Translator";

export interface DateTimeInputProps extends InputProps {
  type?: 'date' | 'time' | 'datetime',
  showReadable?: boolean,
}

export const dateToEUFormat = (dateString: string): string => {
  if (!dateString || dateString.length != 10) {
    return '';
  } else {
    let d = new Date(dateString);

    return ('0' + d.getDate()).slice(-2) + "."
      + ('0' + (d.getMonth() + 1)).slice(-2)
      + "." + d.getFullYear()
      ;
  }
}

export const datetimeToEUFormat = (dateString: string): string => {
  let d = new Date(dateString);

  return ('0' + d.getDate()).slice(-2) + "."
    + ('0' + (d.getMonth() + 1)).slice(-2)
    + "." + d.getFullYear()
    + " " + ('0' + d.getHours()).slice(-2)
    + ":" + ('0' + d.getMinutes()).slice(-2)
    + ":" + ('0' + d.getSeconds()).slice(-2)
  ;
}

const T = new Translator('Hubleto\\ReactUi', 'Components\\Inputs\\DateTime');

const renderReadableInfo = (value: any) => {
  let days = moment(value).diff(moment(), 'days');
  let info = (
    days < -365 ? "(more than a year ago)" :
    days < -30*6 ? "(more than 6 months ago)" :
    days < -30*3 ? "(more than 3 months ago)" :
    days < -30 ? "(more than a month ago)" :
    days < -14 ? "(more than 2 weeks ago)" :
    days < -7 ? "(more than a week ago)" :
    days < -1 ? "(" + (-days) + " days ago)" :
    days == -1 ? "(yesterday)" :
    days == 0 ? "(today)" :
    days == 1 ? "(tomorrow)" :
    days > 365 ? "(in a year)" :
    days > 30*6 ? "(in 6-12 months)" :
    days > 30*3 ? "(in 3-6 months)" :
    days > 30 ? "(in 1-3 months)" :
    days > 14 ? "(in 2-4 weeks)" :
    days > 7 ? "(in 1-2 weeks)" :
    days > 1 ? "(in " + days + " days)" :
    ""
  );

  return (info == '' ? null : <div className="text-blue-400">{info}</div>);
}

const ValueComponent = (props: DateTimeInputProps): React.JSX.Element => {
  const input = React.useContext(InputMetaContext);

  let value = props.value;
  let valueFormatted = props.value;

  switch (props.type) {
    case 'datetime':
      valueFormatted = moment(value).format('DD.MM.YYYY H:mm:s');
    break;
    case 'date':
      valueFormatted = moment(value).format('DD.MM.YYYY');
    break;
  }

  return <div className='flex'>
    <div className="flex gap-2 items-center">
      {valueFormatted}
    </div>
    {props.showReadable ? <div className="text-xs">{renderReadableInfo(value)}</div> : null}
  </div>;
}

const InputComponent = (props: DateTimeInputProps): React.JSX.Element => {
  const input = React.useContext(InputMetaContext);

  const setDate = (year: any, month: any, day: any) => {
    const dateStr = year + '-' + month + '-' + day;
    const date = moment(dateStr);

    if (year == '' || month == '' || day == '') input.changeValue(moment().format('yyyy-MM-DD'));
    else if (date.isValid()) input.changeValue(dateStr);
    else input.changeValue(moment(year + '-' + month + '-01').format('yyyy-MM-DD'));
  };

  const readableInfo = (props.showReadable ? renderReadableInfo(props.value) : null);
  const year = moment(props.value).format('yyyy');
  const month = moment(props.value).format('MM');
  const day = moment(props.value).format('DD');
  const daysInMonth = moment(props.value, "YYYY-MM").daysInMonth();

  return <div 
    className={
      "flex gap-1"
      + " " + (input.invalid ? 'is-invalid' : '')
      + " " + (input.cssClass ?? "")
      + " " + (input.readonly ? "bg-muted" : "")
    }
  >
    {input.readonly ? null : <button
      className="btn btn-small btn-transparent"
      onClick={() => input.changeValue(moment().format('yyyy-MM-DD'))}
      title='Today'
    >
      <span className="icon"><i className="fas fa-calendar-day"></i></span>
    </button>}
    <select
      value={month}
      className='w-16 border-none'
      onChange={(e) => setDate(year, e.currentTarget.value, day)}
      disabled={input.readonly}
    >
      <option value='01'>Jan</option>
      <option value='02'>Feb</option>
      <option value='03'>Mar</option>
      <option value='04'>Apr</option>
      <option value='05'>May</option>
      <option value='06'>Jun</option>
      <option value='07'>Jul</option>
      <option value='08'>Aug</option>
      <option value='09'>Sep</option>
      <option value='10'>Oct</option>
      <option value='11'>Nov</option>
      <option value='12'>Dec</option>
    </select>
    <input
      type='number'
      min='1'
      max={daysInMonth}
      className='w-12 border-none'
      value={day}
      onChange={(e) => setDate(year, month, e.currentTarget.value)}
      disabled={input.readonly}
      placeholder='Day'
    />
    <input
      type='number'
      value={year}
      className='w-16 border-none'
      onChange={(e) => setDate(e.currentTarget.value, month, day)}
      disabled={input.readonly}
      placeholder='Year'
    />
    {input.readonly ? null : <button
      className="btn btn-small btn-transparent"
      onClick={() => input.changeValue('')}
      title='Clear'
    >
      <span className="icon"><i className="fas fa-times"></i></span>
    </button>}
    {readableInfo ? <div className="text-xs">{readableInfo}</div> : null}
  </div>;
}

const DateTimeInput = React.memo((props: DateTimeInputProps) => {

  const [type, setType] = useState('');

  return <Input
    inputClassName={props.type ?? 'date'}
    isInitialized={true}
    changeValue={(input: any, newValue: any): void => {
      if (newValue === null) {
        newValue = '';
      } else if (newValue != '') {
        switch (type) {
          case 'datetime':
            newValue = moment(newValue).format('YYYY-MM-DD H:mm:s');
          break;
          case 'date':
            newValue = moment(newValue).format('YYYY-MM-DD');
          break;
          case 'time':
            newValue = moment(newValue).format('HH:mm');
          break;
        }
      }

      input.setValue(newValue);
    }}
    renderValueComponent={(input: InputMeta) => <ValueComponent {...props} />}
    renderInputComponent={(input: InputMeta) => <InputComponent {...props} />}
    {...props}
  />;
}, () => true);

export default DateTimeInput;
