import { Injectable } from '@angular/core';

/**
 *
 */
@Injectable({
  providedIn: 'root'
})
export class ContainersWindowCrossDomainObserver {
  /**
   * Listens global events from the window
   */
  public on(action: string, fn: Function) {
    window.addEventListener(action, (event: CustomEvent) => {
        fn(event.detail);
      },
      false
    );
  }

  /**
   * Emits an event to an iframe or Window Popup object
   */
  public dispatch(action: string, payload: any) {
    window.postMessage({ action, payload }, "*");
  }
}
