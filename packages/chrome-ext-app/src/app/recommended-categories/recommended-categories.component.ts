import { Component, Optional, Inject } from '@angular/core';
import { REMOTE_BASE_URL } from '@fundamental-ngx/app-shell';

@Component({
  selector: 'app-recommended-categories',
  templateUrl: './recommended-categories.component.html'
})
export class RecommendedCategoriesComponent {
  constructor(
    @Optional()
    @Inject(REMOTE_BASE_URL)
    public baseUrl: string
  ) {}
}
