import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogStudentInitDateComponent } from './dialog-student-init-date.component';

describe('DialogStudentInitDateComponent', () => {
  let component: DialogStudentInitDateComponent;
  let fixture: ComponentFixture<DialogStudentInitDateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DialogStudentInitDateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogStudentInitDateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
