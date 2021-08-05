import { DefaultError } from './type';

export function formatError(error: DefaultError): string {
  return typeof error === 'string'
    ? error
    : error.message;
}