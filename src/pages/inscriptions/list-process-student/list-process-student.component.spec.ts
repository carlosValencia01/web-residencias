import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ListProcessStudentComponent } from './list-process-student.component';

describe('ListProcessStudentComponent', () => {
  let component: ListProcessStudentComponent;
  let fixture: ComponentFixture<ListProcessStudentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ListProcessStudentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ListProcessStudentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
