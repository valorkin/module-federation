import * as bus from 'framebus';
import { RpcProvider } from 'worker-rpc';

const rpcChannel = 'mf-rpc-action';

export const rpcProvider = new RpcProvider(
  (message) => {
    bus.emit(rpcChannel, {data: message});
  }
);

bus.on(rpcChannel, (event) => {
  rpcProvider.dispatch(event);
});