import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpedentTableComponentComponent } from './expedent-table-component.component';

describe('ExpedentTableComponentComponent', () => {
  let component: ExpedentTableComponentComponent;
  let fixture: ComponentFixture<ExpedentTableComponentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExpedentTableComponentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExpedentTableComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
