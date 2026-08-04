import React, { useState } from "react";
import FormInput from "./Input";
import { useRecordField } from "../FormRecordStore";

const OwnerManagerUi = (props: any) => {
  const idOwner: number = useRecordField('id_owner');
  const owner = globalThis.hubleto.users ? globalThis.hubleto.users[idOwner] : null;
  const idManager: number = useRecordField('id_manager');
  const manager = globalThis.hubleto.users ? globalThis.hubleto.users[idManager] : null;

  const [showOwnerManagerSelector, setShowOwnerManagerSelector] = useState(false);

  return <div className='p-2 flex flex-col'>
    <div className='btn-group border-primary'>
      <div className='btn btn-transparent' onClick={() => { setShowOwnerManagerSelector(!showOwnerManagerSelector) }}>
        <span className="text flex gap-2">{owner ? <>
          {/* <span className='text-xs text-gray-500'>Owner</span> */}
          {owner.photo ?
            <img
              src={globalThis.hubleto.config.uploadUrl + '/' + owner.photo}
              className='max-w-4 max-h-4 rounded-xl'
            />
          : null}
          <span className='text-xs text-primary'>{
            owner.nick ? owner.nick :
              (Array.from(owner.first_name ?? '')[0]).toString()
              + (Array.from(owner.last_name ?? '')[0]).toString()
              + (owner.id == globalThis.hubleto.idUser ? ' (you) ' : '')
          }</span>
        </> : '-'}</span>
      </div>
      <div className='btn btn-transparent' onClick={() => { setShowOwnerManagerSelector(!showOwnerManagerSelector) }}>
        <span className="text flex gap-2">{manager ? <>
          {manager.photo ?
            <img
              src={globalThis.hubleto.config.uploadUrl + '/' + manager.photo}
              className='max-w-4 max-h-4 rounded-xl'
            />
          : null}
          <span className='text-xs text-primary'>{
            manager.nick ? manager.nick :
              (Array.from(manager.first_name ?? '')[0]).toString()
              + (Array.from(manager.last_name ?? '')[0]).toString()
              + (manager.id == globalThis.hubleto.idUser ? ' (you) ' : '')
          }</span>
        </> : '-'}</span>
      </div>
    </div>
    {showOwnerManagerSelector ? <div
      className='relative w-0 h-0'
      style={{zIndex: 99999999999}}
    >
      <div
        className='mt-2 shadow min-w-64 border border-primary bg-white rounded'
      >
        <FormInput name='id_owner' />
        <FormInput name='id_manager' />
      </div>
    </div> : null}
  </div>;
}

export default OwnerManagerUi;