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
  type?: string,
  children?: any;
  title?: any;
  showHeader?: boolean;
  headerLeft?: any;
  isOpen?: boolean;
  topMenu?: any;
  isFullscreen?: boolean,
}
