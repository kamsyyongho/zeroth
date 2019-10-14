import { ApiResponse } from 'apisauce';
import log from '../../util/log/logger';

export type GeneralApiProblem =
  /**
   * Times up.
   */
  | { kind: 'timeout'; temporary: true }
  /**
   * Cannot connect to the server for some reason.
   */
  | { kind: 'cannot-connect'; temporary: true }
  /**
   * The server experienced a problem. Any 5xx error.
   */
  | { kind: 'server' }
  /**
   * We're not allowed because we haven't identified ourself. This is 401.
   */
  | { kind: 'unauthorized' }
  /**
   * We don't have access to perform that request. This is 403.
   */
  | { kind: 'forbidden' }
  /**
   * Unable to find that resource.  This is a 404.
   */
  | { kind: 'not-found' }
  /**
   * All other 4xx series errors.
   */
  | { kind: 'rejected' }
  /**
   * Something truly unexpected happened. Most likely can try again. This is a catch all.
   */
  | { kind: 'unknown'; temporary: true }
  /**
   * The data we received is not in the expected format.
   */
  | { kind: 'bad-data' };

export enum ProblemKind {
  /**
   * Times up.
   */
  'timeout' = 'timeout',
  /**
   * Cannot connect to the server for some reason.
   */
  'cannot-connect' = 'cannot-connect',
  /**
   * The server experienced a problem. Any 5xx error.
   */
  'server' = 'server',
  /**
   * We're not allowed because we haven't identified ourself. This is 401.
   */
  'unauthorized' = 'unauthorized',
  /**
   * We don't have access to perform that request. This is 403.
   */
  'forbidden' = 'forbidden',
  /**
   * Unable to find that resource.  This is a 404.
   */
  'not-found' = 'not-found',
  /**
   * The received data cannot be used.  This is a 409.
   * - used for checking if a phone number is available to create a new account
   */
  'conflict' = 'conflict',
  /**
   * All other 4xx series errors.
   */
  'rejected' = 'rejected',
  /**
   * Something truly unexpected happened. Most likely can try again. This is a catch all.
   */
  'unknown' = 'unknown',
  /**
   * The data we received is not in the expected format.
   */
  'bad-data' = 'bad-data'
}

/**
 * Attempts to get a common cause of problems from an api response.
 *
 * @param response The api response.
 */
export function getGeneralApiProblem(
  response: ApiResponse<unknown>
): GeneralApiProblem | null {
  log({
    file: `api-problem.ts`,
    caller: `getGeneralApiProblem`,
    value: 'API PROBLEM',
    important: true
  });
  switch (response.problem) {
    case 'CONNECTION_ERROR':
      return { kind: 'cannot-connect', temporary: true };
    case 'NETWORK_ERROR':
      return { kind: 'cannot-connect', temporary: true };
    case 'TIMEOUT_ERROR':
      return { kind: 'timeout', temporary: true };
    case 'SERVER_ERROR':
      return { kind: 'server' };
    case 'UNKNOWN_ERROR':
      return { kind: 'unknown', temporary: true };
    case 'CLIENT_ERROR':
      switch (response.status) {
        case 401:
          return { kind: 'unauthorized' };
        case 403:
          return { kind: 'forbidden' };
        case 404:
          return { kind: 'not-found' };
        default:
          return { kind: 'rejected' };
      }
    case 'CANCEL_ERROR':
      return null;
  }

  return null;
}
