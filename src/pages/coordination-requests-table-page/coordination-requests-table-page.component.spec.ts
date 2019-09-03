import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CoordinationRequestsTablePageComponent } from './coordination-requests-table-page.component';

describe('CoordinationRequestsTablePageComponent', () => {
  let component: CoordinationRequestsTablePageComponent;
  let fixture: ComponentFixture<CoordinationRequestsTablePageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CoordinationRequestsTablePageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CoordinationRequestsTablePageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
