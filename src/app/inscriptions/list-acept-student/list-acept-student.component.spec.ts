import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ListAceptStudentComponent } from './list-acept-student.component';

describe('ListAceptStudentComponent', () => {
  let component: ListAceptStudentComponent;
  let fixture: ComponentFixture<ListAceptStudentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ListAceptStudentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ListAceptStudentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
