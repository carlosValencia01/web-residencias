import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AcademicDegreeApplicationPageComponent } from './academic-degree-application-page.component';

describe('AcademicDegreeApplicationPageComponent', () => {
  let component: AcademicDegreeApplicationPageComponent;
  let fixture: ComponentFixture<AcademicDegreeApplicationPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AcademicDegreeApplicationPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AcademicDegreeApplicationPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
