import { Injectable, NgZone } from '@angular/core';
import { overrideElementUrls } from '@mf/core';

@Injectable({
  providedIn: 'root'
})
export class ElementUrlsOverriderService {
  constructor(private readonly ngZone: NgZone) {}

  /**
   *
   */
  public override(element: HTMLElement, baseUrl: string) {
    this.ngZone.runOutsideAngular(() =>
      window.setTimeout(() => {
        overrideElementUrls(element, baseUrl);
      })
    );
  }
}
