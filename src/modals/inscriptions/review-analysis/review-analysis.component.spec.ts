import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReviewAnalysisComponent } from './review-analysis.component';

describe('ReviewAnalysisComponent', () => {
  let component: ReviewAnalysisComponent;
  let fixture: ComponentFixture<ReviewAnalysisComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReviewAnalysisComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReviewAnalysisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
