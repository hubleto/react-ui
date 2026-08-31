import React, { useState } from 'react';
import axios, { AxiosError, AxiosResponse } from "axios";

interface ApiResponse<T> {
  data: T;
}

interface ApiError {
  message: string;
}

const RequestErrorInfo = ({ error }) => {
  const [showDebug, setShowDebug] = useState(false);
  return <>
    <div className='text-red-800'>
      {error.readableText}
    </div>
    <a type="button" className='mt-2 cursor-pointer text-xs' onClick={() => setShowDebug(!showDebug)}>
      Show error details
    </a>
    {showDebug ?
      <div className='mt-4 text-xs'>
        <div>{error.errorHash}</div>
        <div>{error.dbError}</div>
        <div>{error.dbQuery}</div>
        <div>{error.exceptionClass}</div>
        <div>{error.traceLog}</div>
      </div>
    : null}
  </>;
}

class Request {

  getProjectUrl(): string {
    if (!globalThis.hubleto.config.projectUrl) {
      console.warn('HubletoReactUi.Request: projectUrl is not set. Your AJAX requests might not work. To suppress this warning, set projectUrl to empty value.')
      console.warn('To set the value add a script tag in HTML head section and set window.configEnv.projectUrl.')
      console.warn('To suppress this warning, set may set projectUrl to an empty value.')
    };

    return globalThis.hubleto.config.projectUrl + '/';
  }

  alertOnError(responseData: any) {
    globalThis.hubleto.showDialogWarning(responseData.message);
  }

  processResponse(url: any, res: any, successCallback: any, errorCallback: any) {
    const responseData: any = res.data;

    document.body.classList.remove("app-loading");

    if (res.status == 200) {
      if (successCallback) successCallback(responseData);
    } else {
      if (errorCallback) errorCallback(responseData);

      console.error('HubletoReactUi request @ ' + url + ' failed.');
      console.error(res);

      try {
        const errorCode = responseData.code;
        const error = JSON.parse(responseData.message);

        console.log('errorCode', errorCode);
        console.log('error', error);

        switch(errorCode) {
          // case 87335:
          //   // globalThis.hubleto.showDialogWarning(globalThis.hubleto.getValidationErrorMessage(error.message));
          // break;
          case 23000:
            globalThis.hubleto.showDialogDanger(globalThis.hubleto.getDuplicateEntryErrorMessage(error.message));
          break;
          default:
            try {
              globalThis.hubleto.showDialog(
                <RequestErrorInfo error={error}></RequestErrorInfo>,
                {
                  headerClassName: 'dialog-danger-header',
                  contentClassName: 'dialog-danger-content',
                  footerClassName: 'dialog-danger-footer',
                  renderHeader: () => '🥴 Oops! Something went wrong.'
                }
              );
            } catch (ex) {
              //
            }
          break;

        }
      } catch (ex) {
        globalThis.hubleto.showDialogDanger(JSON.stringify(responseData));
      }
    }

  }

  public get<T>(
    url: string,
    queryParams: Record<string, any>,
    successCallback?: (data: ApiResponse<T>) => void,
    errorCallback?: (data: any) => void,
  ): void {
    document.body.classList.add("app-loading");
    axios.get<T, AxiosResponse<ApiResponse<T>>>(this.getProjectUrl() + url, {
      params: queryParams,
      validateStatus: () => true
    }).then(res => {
      this.processResponse(url, res, successCallback, errorCallback);
    });
  }

  public post<T>(
    url: string,
    postData: Record<string, any>,
    queryParams?: Record<string, string>|{},
    successCallback?: (data: ApiResponse<T>) => void,
    errorCallback?: (data: any) => void,
  ): void {
    document.body.classList.add("app-loading");
    axios.post<T, AxiosResponse<ApiResponse<T>>>(this.getProjectUrl() + url, postData, {
      params: queryParams,
      validateStatus: () => true
    }).then(res => {
      this.processResponse(url, res, successCallback, errorCallback);
    });
  }

  public put<T>(
    url: string,
    putData: Record<string, any>,
    queryParams?: Record<string, string>|{},
    successCallback?: (data: ApiResponse<T>) => void,
    errorCallback?: (data: any) => void,
  ): void {
    axios.put<T, AxiosResponse<ApiResponse<T>>>(this.getProjectUrl() + url, putData, {
      params: queryParams,
      validateStatus: () => true
    }).then(res => {
      this.processResponse(url, res, successCallback, errorCallback);
    });
  }

  public patch<T>(
    url: string,
    patchData: Record<string, any>,
    queryParams?: Record<string, string>|{},
    successCallback?: (data: ApiResponse<T>) => void,
    errorCallback?: (data: any) => void,
  ): void {
    axios.patch<T, AxiosResponse<ApiResponse<T>>>(this.getProjectUrl() + url, patchData, {
      params: queryParams,
      validateStatus: () => true
    }).then(res => {
      this.processResponse(url, res, successCallback, errorCallback);
    });
  }

  public delete<T>(
    url: string,
    queryParams: Record<string, any>,
    successCallback?: (data: ApiResponse<T>) => void,
    errorCallback?: (data: any) => void,
  ): void {
    axios.delete<T, AxiosResponse<ApiResponse<T>>>(this.getProjectUrl() + url, {
      params: queryParams,
      validateStatus: () => true
    }).then(res => {
      this.processResponse(url, res, successCallback, errorCallback);
    });
  }
}

const request = new Request();
export default request;
