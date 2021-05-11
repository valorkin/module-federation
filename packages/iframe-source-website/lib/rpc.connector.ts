// todo: move to app-shell
import * as bus from 'framebus';
import {RpcProvider} from 'worker-rpc';

const rpcChannel = 'rpc-action';
export const rpcProvider = new RpcProvider(
  (message) => bus.emit(rpcChannel, {...message})
);
bus.on(rpcChannel, (event) => rpcProvider.dispatch(event));
