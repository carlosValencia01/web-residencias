import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AcademicDegreeApplicationFormComponent } from './academic-degree-application-form.component';

describe('AcademicDegreeApplicationFormComponent', () => {
  let component: AcademicDegreeApplicationFormComponent;
  let fixture: ComponentFixture<AcademicDegreeApplicationFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AcademicDegreeApplicationFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AcademicDegreeApplicationFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
