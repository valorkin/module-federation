import { Component, OnInit, Optional, Inject } from '@angular/core';
import { REMOTE_BASE_URL } from '@fundamental-ngx/app-shell';
@Component({
  selector: 'app-recommended-categories',
  templateUrl: './recommended-categories.component.html',
  styleUrls: ['./recommended-categories.component.scss']
})
export class RecommendedCategoriesComponent implements OnInit {
  dynamicImgSrc: string;
  dynamicImgSize = 'w320';

  constructor(
    @Optional()
    @Inject(REMOTE_BASE_URL)
    public baseUrl: string
  ) {}

  ngOnInit(): void {
    this.dynamicImgSrc = `assets/nature-${this.dynamicImgSize}.jpg`;
  }
}
