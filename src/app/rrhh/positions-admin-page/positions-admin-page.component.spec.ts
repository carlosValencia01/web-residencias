import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PositionsAdminPageComponent } from './positions-admin-page.component';

describe('PositionsAdminPageComponent', () => {
  let component: PositionsAdminPageComponent;
  let fixture: ComponentFixture<PositionsAdminPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PositionsAdminPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PositionsAdminPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
