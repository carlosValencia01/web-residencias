import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CardEmployeePageComponent } from './card-employee-page.component';

describe('CardEmployeePageComponent', () => {
  let component: CardEmployeePageComponent;
  let fixture: ComponentFixture<CardEmployeePageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CardEmployeePageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CardEmployeePageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
