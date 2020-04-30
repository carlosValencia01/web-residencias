import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ContractStudentPageComponent } from './contract-student-page.component';

describe('ContractStudentPageComponent', () => {
  let component: ContractStudentPageComponent;
  let fixture: ComponentFixture<ContractStudentPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ContractStudentPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContractStudentPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
