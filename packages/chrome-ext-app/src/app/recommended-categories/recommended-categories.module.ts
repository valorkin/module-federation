import { NgModule } from '@angular/core';
import { LayoutPanelModule } from '@fundamental-ngx/core';
import { AppShellModule } from '@fundamental-ngx/app-shell';

import { RecommendedCategoriesComponent } from './recommended-categories.component';

@NgModule({
  imports: [
    LayoutPanelModule,
    AppShellModule
  ],
  declarations: [RecommendedCategoriesComponent],
  exports: [RecommendedCategoriesComponent]
})
export class RecommendedCategoriesModule {
}

export { RecommendedCategoriesComponent };
