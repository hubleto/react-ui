import React, { useState } from 'react'
import Input, { InputProps, InputMeta, InputMetaContext } from '../Input'
import Flatpickr from "react-flatpickr";
import moment, { Moment } from "moment";
import Translator from "../../../core/Translator";

export interface DateTimeInputProps extends InputProps {
  type?: 'date' | 'time' | 'datetime',
  showReadable?: boolean,
  hideSeconds?: boolean,
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

const getValues = (props: any, value: string) => {
  let year = '';
  let month = '';
  let day = '';
  let hour = '';
  let minute = '';
  let second = '';

  let parsedDate = moment();

  switch (props.type) {
    case 'datetime':
    case 'date':
      parsedDate = moment(value ?? '2000-01-01 00:00:00');
    break;
    case 'time':
      parsedDate = moment('2000-01-01 ' + (value ?? '00:00:00'));
    break;
  }

  year = parsedDate.format('yyyy');
  month = parsedDate.format('MM');
  day = parsedDate.format('DD');
  hour = parsedDate.format('HH');
  minute = parsedDate.format('mm');
  second = parsedDate.format('ss');

  if (
    year == 'Invalid date'
    || month == 'Invalid date'
    || day == 'Invalid date'
  ) {
    year = moment().format('yyyy');
    month = moment().format('MM');
    day = moment().format('DD');
  }
  if (
    hour == 'Invalid date'
    || minute == 'Invalid date'
    || second == 'Invalid date'
  ) {
    hour = moment().format('HH');
    minute = moment().format('mm');
    second = moment().format('ss');
  }
  
  return { year, month, day, hour, minute, second };
}

const setValue = (input: any, props: any, year: any, month: any, day: any, hour: any, minute: any, second: any) => {
  const dateStr = year + '-' + month + '-' + day;
  const date = moment(dateStr);

  let newValue = '';

  if (props.hideSeconds) second = '00';

  switch (props.type) {
    case 'date':
      if (year == '' || month == '' || day == '') newValue = moment().format('yyyy-MM-DD');
      else if (date.isValid()) newValue = dateStr;
      else newValue = moment(year + '-' + month + '-01').format('yyyy-MM-DD');
    break;
    case 'time':
      if (hour == '' || minute == '' || second == '') newValue = '00:00:00';
      else newValue = moment('2000-01-01 ' + hour + ':' + minute + ':' + second).format('HH:mm:ss');
    break;
    case 'datetime':
      if (
        year == '' || month == '' || day == ''
        || hour == '' || minute == '' || second == ''
      ) {
        newValue = moment().format('yyyy-MM-DD');
      } else if (date.isValid()) {
        newValue = dateStr + ' 00:00:00';
      } else {
        newValue = moment(year + '-' + month + '-01').format('yyyy-MM-DD') + ' ' + hour + ':' + minute + ':' + second;
      }
    break;
  }

  input.changeValue(newValue);

};

const ValueComponent = (props: DateTimeInputProps): React.JSX.Element => {
  const input = React.useContext(InputMetaContext);

  let value = input.value;
  let valueFormatted = input.value;

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
  </div>;
}

const DateInput = (props: DateTimeInputProps): React.JSX.Element => {
  const input = React.useContext(InputMetaContext);
  const daysInMonth = moment(input.value, "YYYY-MM").daysInMonth() ?? 30;
  const { year, month, day, hour, minute, second } = getValues(props, input.value);

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
      onChange={(e) => setValue(input, props, year, e.currentTarget.value, day, hour, minute, second)}
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
      max={isNaN(daysInMonth) ? 30 : daysInMonth}
      className='w-12 border-none'
      value={day}
      onChange={(e) => setValue(input, props, year, month, e.currentTarget.value, hour, minute, second)}
      disabled={input.readonly}
      placeholder='Day'
    />
    <input
      type='number'
      value={year}
      className='w-16 border-none'
      onChange={(e) => setValue(input, props, e.currentTarget.value, month, day, hour, minute, second)}
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
  </div>;
}

const TimeInput = (props: DateTimeInputProps): React.JSX.Element => {
  const input = React.useContext(InputMetaContext);
  const { year, month, day, hour, minute, second } = getValues(props, input.value);

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
      onClick={() => input.changeValue(moment().format('HH:mm'))}
      title='Now'
    >
      <span className="icon"><i className="fas fa-clock"></i></span>
    </button>}
    <input
      type='number'
      min='1'
      max='24'
      className='w-12 border-none'
      value={hour}
      onChange={(e) => setValue(input, props, year, month, day, e.currentTarget.value, minute, second)}
      disabled={input.readonly}
      placeholder='Hour'
    />
    <input
      type='number'
      min='1'
      max='60'
      value={minute}
      className='w-16 border-none'
      onChange={(e) => setValue(input, props, year, month, day, hour, e.currentTarget.value, second)}
      disabled={input.readonly}
      placeholder='Minute'
    />
    {props.hideSeconds ? null :
      <input
        type='number'
        min='1'
        max='60'
        value={second}
        className='w-16 border-none'
        onChange={(e) => setValue(input, props, year, month, day, hour, minute, e.currentTarget.value)}
        disabled={input.readonly}
        placeholder='Second'
      />
}
    {input.readonly ? null : <button
      className="btn btn-small btn-transparent"
      onClick={() => input.changeValue('')}
      title='Clear'
    >
      <span className="icon"><i className="fas fa-times"></i></span>
    </button>}
  </div>;
}

const InputComponent = (props: DateTimeInputProps): React.JSX.Element => {
  switch (props.type) {
    case 'datetime':
      return <div className='flex-dyn'>
        <DateInput {...props}></DateInput>
        <TimeInput {...props}></TimeInput>
      </div>;
    break;
    case 'date':
      return <>
        <DateInput {...props}></DateInput>
      </>;
    break;
    case 'time':
      return <>
        <TimeInput {...props}></TimeInput>
      </>;
    break;
  }
}

const DateTimeInput = (props: DateTimeInputProps) => {
  return <Input
    inputClassName={props.type ?? 'date'}
    isInitialized={true}
    renderValueComponent={(input: InputMeta) => <ValueComponent {...props} />}
    renderInputComponent={(input: InputMeta) => <InputComponent {...props} />}
    {...props}
  />;
};

export default DateTimeInput;
