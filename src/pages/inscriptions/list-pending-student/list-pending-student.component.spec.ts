import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ListPendingStudentComponent } from './list-pending-student.component';

describe('ListPendingStudentComponent', () => {
  let component: ListPendingStudentComponent;
  let fixture: ComponentFixture<ListPendingStudentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ListPendingStudentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ListPendingStudentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
