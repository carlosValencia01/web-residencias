import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReviewInformationModalComponent } from './review-information-modal.component';

describe('ReviewInformationModalComponent', () => {
  let component: ReviewInformationModalComponent;
  let fixture: ComponentFixture<ReviewInformationModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReviewInformationModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReviewInformationModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
