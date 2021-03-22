import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  template: `
    <alert type="info">
      <strong>Heads up!</strong> This alert needs your attention, but it's not super important.
    </alert>
    <fds-plugin-launcher iframeUri="http://example.com/"></fds-plugin-launcher>
  `
})
export class AppComponent {
}
