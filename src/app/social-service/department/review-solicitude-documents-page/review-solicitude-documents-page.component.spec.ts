import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReviewSolicitudeDocumentsPageComponent } from './review-solicitude-documents-page.component';

describe('ReviewSolicitudeDocumentsPageComponent', () => {
  let component: ReviewSolicitudeDocumentsPageComponent;
  let fixture: ComponentFixture<ReviewSolicitudeDocumentsPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReviewSolicitudeDocumentsPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReviewSolicitudeDocumentsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
