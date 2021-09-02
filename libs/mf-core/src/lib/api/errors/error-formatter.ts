import { DefaultError } from './type';

export function formatError(error: DefaultError): string {
  return typeof error === 'string'
    ? error
    : error.message;
}

export function wrapError(error: DefaultError): Error {
  return typeof error === 'string'
      ? new Error(error)
      : error;
}