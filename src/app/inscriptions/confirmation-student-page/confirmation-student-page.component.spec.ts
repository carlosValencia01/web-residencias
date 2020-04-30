import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmationStudentPageComponent } from './confirmation-student-page.component';

describe('ConfirmationStudentPageComponent', () => {
  let component: ConfirmationStudentPageComponent;
  let fixture: ComponentFixture<ConfirmationStudentPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConfirmationStudentPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfirmationStudentPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
