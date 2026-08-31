import { Dispatch, SetStateAction } from "react";
import { FormMeta } from "./FormInterfaces";

export interface ModalProps {
  uid?: string,
  type?: string,
  children?: any;
  title?: any;
  showHeader?: boolean;
  headerLeft?: any;
  isOpen?: boolean;
  topMenu?: any;
  isFullscreen?: boolean,
  onClose?: (modal: ModalMeta) => void,
}

export interface ModalMeta {
  uid?: string,
  stackUid?: string,
  type?: string,
  children?: any;
  title?: any;
  showHeader?: boolean;
  headerLeft?: any;
  isOpen?: boolean;
  topMenu?: any;
  isFullscreen?: boolean,
  form?: FormMeta,
  isActive?: boolean,
  setIsFullscreen?: Dispatch<SetStateAction<boolean>>,
  setIsActive?: Dispatch<SetStateAction<boolean>>,
  setForm?: Dispatch<SetStateAction<any>>,
  onClose?: () => void,
}
