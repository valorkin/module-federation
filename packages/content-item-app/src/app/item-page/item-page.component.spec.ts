import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ItemPageComponent } from './item-page.component';

describe('ItemPageComponent', () => {
  let component: ItemPageComponent;
  let fixture: ComponentFixture<ItemPageComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ItemPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ItemPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
