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

const translate = new Translator(
  'Hubleto\\ReactUi',
  'Components\\Inputs\\DateTime'
).translate;

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
      <i className="fas fa-calendar-days mr-2"></i>
      {valueFormatted}
    </div>
    {props.showReadable ? <div className="text-xs">{renderReadableInfo(value)}</div> : null}
  </div>;
}

const InputComponent = (props: DateTimeInputProps): React.JSX.Element => {
  const input = React.useContext(InputMetaContext);

  let value: any = input.value;
  let defaultPlaceholder;
  let icon = '';
  let options: any = {
    allowInput: false,
    locale: {
      weekdays: {
        shorthand: ['Ne.', 'Po.', 'Ut.', 'St.', 'Št.', 'Pi.', 'So.'],
        longhand: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
      },
      months: {
        shorthand: ['Jan', 'Feb', 'Mar', 'Apr', 'Máj', 'Jún', 'Júl', 'Aug', 'Sep', 'Okt', 'Nov', 'Dec'],
        longhand: ['Január', 'Február', 'Marec', 'Apríl', 'Máj', 'Jún', 'Júl', 'August', 'September', 'Október', 'November', 'December']
      },
      weekStart: 1
    },
    dateFormat: 'H:i',
    enableTime: true,
    noCalendar: true,
    time_24hr: true,
    minuteIncrement: 15,
  };

  switch (props.type) {
    case 'datetime':
      icon = 'fas fa-clock';
      value = datetimeToEUFormat(value);
      options = {...options, enableTime: true, showMonths: 2, dateFormat: 'd.m.Y H:i:S'};
      defaultPlaceholder = translate('Year-Month-Day Hour:Min:Sec','Hubleto\\Erp\\Loader','Components\\Inputs\\DateTime');
    break;
    case 'date':
      icon = 'fas fa-calendar';
      value = dateToEUFormat(value);
      options = {...options, showMonths: 2, weekNumbers: true, dateFormat: 'd.m.Y'};
      defaultPlaceholder = translate('Year-Month-Day','Hubleto\\Erp\\Loader','Components\\Inputs\\DateTime');
    break;
    case 'time':
      icon = 'fas fa-clock';
      options = {
        ...options,
        dateFormat: 'H:m',
        enableTime: true,
        noCalendar: true,
        time_24hr: true,
        minuteIncrement: 15,
        showMonths: 2,
      };
      defaultPlaceholder = 'Hour:Min:Sec';
    break;
  }

  const readableInfo = (props.showReadable ? renderReadableInfo(value) : null);

  return <div className="flex gap-2">
    <div className="flex gap-2 items-center">
      {/* <i className={icon}></i> */}
      <div style={{minWidth: "8em"}}>
        <input
          ref={input.refInput}
          value={value}
          onChange={(e) => {
            input.changeValue(e.currentTarget.value)
          }}
          className={
            (input.invalid ? 'is-invalid' : '')
            + " " + (input.cssClass ?? "")
            + " " + (input.readonly ? "bg-muted" : "")
          }
          placeholder={input.description?.placeholder ?? defaultPlaceholder}
          disabled={input.readonly}
        />
        {/* <Flatpickr
          ref={input.refInput}
          value={value}
          onChange={(data: Date[]) => {
            input.changeValue(data[0] ?? null)
          }}
          className={
            (input.invalid ? 'is-invalid' : '')
            + " " + (input.cssClass ?? "")
            + " " + (input.readonly ? "bg-muted" : "")
          }
          placeholder={input.description?.placeholder ?? defaultPlaceholder}
          disabled={input.readonly}
          options={options}
        /> */}
      </div>
      {readableInfo ? <div className="text-xs">{readableInfo}</div> : null}
      <div>
        {input.readonly ? null :
          <button
            className="btn btn-small btn-transparent ml-2"
            onClick={() => {
              if (!input.refInput?.current?.flatpickr) return;
              input.refInput.current.flatpickr.clear();
            }}
          >
            <span className="icon"><i className="fas fa-times"></i></span>
          </button>
        }
      </div>
    </div>
  </div>;
}

const DateTimeInput = React.memo((props: DateTimeInputProps) => {

  const [type, setType] = useState('');
  const [showReadable, setShowReadable] = useState(false);

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
