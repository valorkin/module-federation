import {Routes} from '@angular/router';
import { ItemPageComponent } from './item-page/item-page.module';
import { YourFavoritesComponent } from './your-favorites/your-favorites.module';

export const appRoutes: Routes = [
  {
    path: 'item-detail',
    component: ItemPageComponent,
  },
  {
    path: '',
    component: YourFavoritesComponent,
  },
  {
    path: '**',
    redirectTo: ''
  }
];
