import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReviewFirstDataPageComponent } from './review-first-data-page.component';

describe('ReviewFirstDataPageComponent', () => {
  let component: ReviewFirstDataPageComponent;
  let fixture: ComponentFixture<ReviewFirstDataPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReviewFirstDataPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReviewFirstDataPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
