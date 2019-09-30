import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ObservationsComponentComponent } from './observations-component.component';

describe('ObservationsComponentComponent', () => {
  let component: ObservationsComponentComponent;
  let fixture: ComponentFixture<ObservationsComponentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ObservationsComponentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ObservationsComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
