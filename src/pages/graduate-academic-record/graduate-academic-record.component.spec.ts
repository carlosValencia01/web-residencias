import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GraduateAcademicRecordComponent } from './graduate-academic-record.component';

describe('GraduateAcademicRecordComponent', () => {
  let component: GraduateAcademicRecordComponent;
  let fixture: ComponentFixture<GraduateAcademicRecordComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GraduateAcademicRecordComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GraduateAcademicRecordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
