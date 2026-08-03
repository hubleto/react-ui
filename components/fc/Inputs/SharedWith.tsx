import React, { useState } from 'react'
import Input, { InputProps, InputMetaContext } from '../Input'
import LookupInput, { LookupInputProps } from './Lookup'
import ModalSimple from '../../cc/ModalSimple';
import request from '@hubleto/react-ui/core/Request';
import Translator from '@hubleto/react-ui/core/Translator';
import { FormRecordStoreContext, useRecordField } from '../FormRecordStore';
import { FormMetaContext } from '../Form';

interface SharedWithInputProps extends LookupInputProps {
  model?: string
  endpoint?: string,
  customEndpointParams?: any,
  urlAdd?: string,
  uiStyle?: 'default' | 'select' | 'buttons';
}

const translate = new Translator(
  'Hubleto\\ReactUi',
  'Components\\Inputs\\SharedWith'
).translate;


const InputComponent = (props: SharedWithInputProps) => {
  const input = React.useContext(InputMetaContext);
  const form = React.useContext(FormMetaContext);
  const R = React.useContext(FormRecordStoreContext);

  let valuesPerUser = input.value;

  const [showModal, setShowModal] = useState(false);

  try {
    valuesPerUser = JSON.parse(input.value);
  } catch (ex) {
    valuesPerUser = {};
  }
  // console.log(valuesPerUser);

  if (!valuesPerUser) valuesPerUser = {};

  Object.keys(valuesPerUser).map((idUser: any) => {
    if (valuesPerUser[idUser] != 'read' && valuesPerUser[idUser] != 'modify') {
      delete valuesPerUser[idUser];
    }
  })

  return <>
    <button
      className="btn btn-transparent"
      onClick={() => { setShowModal(true) }}
    >
      <span className="icon"><i className="fas fa-share-nodes"></i></span>
      {Object.keys(valuesPerUser).length == 0 ? null 
        : Object.keys(valuesPerUser).length == 1 ?
          Object.keys(valuesPerUser).map((idUser: any) => {

          let user = input.data[idUser] ?? null;
          return (user ? <span className="text flex gap-4 text-xs">
            {/* {valuesPerUser[idUser] == 'read' ? <i className='text-xs fas fa-eye pl-2'></i> : null}
            {valuesPerUser[idUser] == 'modify' ? <i className='text-xs fas fa-pencil pl-2'></i> : null} */}
            {user.nick ??
              (Array.from(user.first_name ?? '')[0]).toString()
              + (Array.from(user.last_name ?? '')[0]).toString()
            }
          </span> : null);
          })
        : <span className="text">Shared with {Object.keys(valuesPerUser).length}</span>
      }
    </button>
    {showModal ?
      <ModalSimple
        uid='projects_table_discussions_modal'
        isOpen={true}
        type='right'
        showHeader={true}
        title={<>
          <h2>{translate('Share', 'Hubleto\\Erp\\Loader', 'Components\\Inputs\\SharedWith')}</h2>
        </>}
        onClose={(modal: ModalSimple) => { setShowModal(false); }}
      >
        <table ref={input.refInput} className="table-default dense"><tbody>
          {Object.keys(input.data).map((key: any) => {
            const user = input.data[key] ?? null;
            const userId = user.id ?? 0;
            const value = valuesPerUser[userId] ?? '';
            return <tr>
              <td>{user.first_name} {user.last_name}</td>
              <td>
                {user.photo ?
                  <img
                    src={globalThis.hubleto.config.uploadUrl + '/' + user.photo}
                    className='max-w-4 max-h-4 rounded-xl'
                  />
                : null}
              </td>
              <td>{user.email}</td>
              <td>
                <div className='btn-group'>
                  <button
                    className={'btn ' + (value == '' ? 'btn-primary' : 'btn-transparent')}
                    onClick={(event) => {
                      let newValue = valuesPerUser;
                      delete newValue[userId];
                      console.log(newValue);
                      input.changeValue(JSON.stringify(newValue));
                    }}
                  >
                    <span className='text text-nowrap'>Do not share</span>
                  </button>
                  <button
                    className={'btn ' + (value == 'read' ? 'btn-primary' : 'btn-transparent')}
                    onClick={(event) => {
                      let newValue = valuesPerUser;
                      newValue[userId] = 'read';
                      console.log(newValue);
                      input.changeValue(JSON.stringify(newValue));
                    }}
                  >
                    <span className='icon'><i className='fas fa-eye'></i></span>
                  </button>
                  <button
                    className={'btn ' + (value == 'modify' ? 'btn-primary' : 'btn-transparent')}
                    onClick={(event) => {
                      let newValue = valuesPerUser;
                      newValue[userId] = 'modify';
                      console.log(newValue);
                      input.changeValue(JSON.stringify(newValue));
                    }}
                  >
                    <span className='icon'><i className='fas fa-pencil'></i></span>
                  </button>
                </div>
              </td>
            </tr>;
          })}
        </tbody></table>
        <div className='flex gap-2 items-center mt-4'>
          <button
            className='btn btn-add btn-large'
            onClick={() => {
              input.changeValue(JSON.stringify(valuesPerUser));
              setShowModal(false);
            }}
          >
            <span className='icon'><i className='fas fa-check'></i></span>
            <span className='text'>{translate('Share', 'Hubleto\\Erp\\Loader', 'Components\\Inputs\\SharedWith')}</span>
          </button>
          <div className='badge badge-info'>Sharing overrides default ownership permissions.</div>
        </div>
      </ModalSimple>
    : null}
  </>;
}

const SharedWith = (props: SharedWithInputProps) => {
  return <Input
    {...props}
    inputClassName='shared-with'
    onInit={(input: any) => {
      if (globalThis.hubleto.users) {
        input.setData(globalThis.hubleto.users)
        input.setIsInitialized(true);
      } else {
        request.post(
          'api/get-users',
          {},
          {},
          (data: any) => {
            input.setIsInitialized(true);
            input.setData(data);
          }
        );
      }
    }}
    valueComponent={<InputComponent />}
    inputComponent={<InputComponent />}
  />

}

export default SharedWith;
