import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PositionsHistoryComponent } from './positions-history.component';

describe('PositionsHistoryComponent', () => {
  let component: PositionsHistoryComponent;
  let fixture: ComponentFixture<PositionsHistoryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PositionsHistoryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PositionsHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
