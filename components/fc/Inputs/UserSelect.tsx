import React, { useEffect, useRef } from 'react'
import Input, { InputProps, InputMeta, InputMetaContext } from '../Input';
import request from '../../../core/Request';

interface UserSelectInputProps extends InputProps {
  model?: string
  endpoint?: string,
  customEndpointParams?: any,
  urlAdd?: string,
  uiStyle?: 'default' | 'select' | 'buttons';
}

const ValueComponent = (props: InputProps) => <InputComponent />;
const InputComponent = (props: InputProps) => {
  const input = React.useContext(InputMetaContext);

  return <div className='flex flex-wrap gap-2 items-center'>
    <div ref={input.refInput} className="btn-group gap-1 flex-wrap">
      {Object.keys(input.data).map((key: any) => {
        const user = input.data[key] ?? null;
        const userId = user.id ?? 0;
        return <button
          key={key}
          className={
            "btn " + (input.readonly && input.value != userId ? "btn-disabled" : "")
            + " " + (input.value == userId ? "btn-primary" : "btn-transparent")
          }
          onClick={() => {
            input.changeValue((input.value == userId ? null : userId));
          }}
        >
          <span className="text flex gap-2">
            {user.photo ?
              <img
                src={globalThis.hubleto.config.uploadUrl + '/' + user.photo}
                className='max-w-4 max-h-4 rounded-xl'
              />
            : null}
            <span className='text-xs'>{
              (Array.from(user.first_name ?? '')[0]).toString()
              + (Array.from(user.last_name ?? '')[0]).toString()
            }</span>
          </span>
          <span className="hover min-w-48">
            <div className='flex flex-col gap-2'>
              <div className='grow'>
                {user.photo ?
                  <img
                    src={globalThis.hubleto.config.uploadUrl + '/' + user.photo}
                    className='max-w-12 max-h-12 rounded-xl'
                  />
                : <div className='bg-gray-200 rounded-xl w-12 h-12 flex items-center justify-center'>
                  <i className='fas fa-user'></i>
                </div>}
              </div>
              <div>
                <div className='text-primary'>{user.email}</div>
                <div className='font-bold'>{user.position}</div>
                <div>{user.first_name ?? ''} {user.last_name ?? ''} </div>
              </div>
            </div>
            {user.TEAMS.map((team: any, key: any) => {
              return <div
                key={key}
                className='badge flex gap-2 items-center py-1'
                style={{borderLeft: '0.5em solid ' + team.color}}
              >
                <i className='fas fa-users'></i>
                {team.name}
              </div>;
            })}
          </span>
        </button>;
      })}
    </div>
  </div>;
}

const UserSelectInput = (props: UserSelectInputProps) => {

  return <Input
    inputClassName='user-select'
    onInit={(input: any) => {
      let usersFromCache = globalThis.hubleto.users;
      if (usersFromCache) {
        input.setIsInitialized(true);
        input.setData(usersFromCache);
      } else {
        request.post(
          'api/get-users',
          {},
          {},
          (data: any) => {
            input.setIsInitialized(true);
            input.setData(data);
            globalThis.hubleto.users = data;
          }
        );
      }
    }}
    renderValueComponent={(input: InputMeta) => <ValueComponent {...props} />}
    renderInputComponent={(input: InputMeta) => <InputComponent {...props} />}
    {...props}
  />;
}

export default UserSelectInput;