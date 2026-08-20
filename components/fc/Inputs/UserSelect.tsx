import React, { useState } from 'react'
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
  const [showUserSelector, setShowUserSelector] = useState(false);

  const currentUser = input.data[input.value] ?? null;

  return <div
    className={"btn btn-white btn-dropdown " + (input.readonly ? "btn-disabled" : "")}
    onClick={() => {
      setShowUserSelector(!showUserSelector);
    }}
  >
    <span className='icon'>
      {currentUser.photo ?
        <img
          src={globalThis.hubleto.config.uploadUrl + '/' + currentUser.photo}
          className='max-w-4 max-h-4 rounded-xl'
        />
      : <i className='fas fa-user'></i>}
    </span>
    <span className='text'>{currentUser.email}</span>
    <div className='menu'>
      <div className='list'>
        {input.description?.title ? 
          <div className='bg-white p-2 text-primary w-full'>{input.description?.title}</div>
        : null}
        {Object.keys(input.data).map((key: any) => {
          const user = input.data[key] ?? null;
          const userId = user.id ?? 0;
          return <button
            key={key}
            className={
              "btn btn-list-item " + (input.readonly && input.value != userId ? "btn-disabled" : "")
              + " " + (input.value == userId ? "btn-primary" : "btn-transparent")
            }
            onClick={() => {
              input.changeValue((input.value == userId ? null : userId));
            }}
          >
            <span className='icon'>
              {user.photo ?
                <img
                  src={globalThis.hubleto.config.uploadUrl + '/' + user.photo}
                  className='max-w-12 max-h-12 rounded-xl'
                />
              : <i className='fas fa-user'></i>}
            </span>
            <span className="text"><div className="flex flex-col">
              <div>{user.email}</div>
              <div className="text-xs">{user.first_name} {user.last_name}</div>
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
            </div></span>
          </button>;
        })}
      </div>
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