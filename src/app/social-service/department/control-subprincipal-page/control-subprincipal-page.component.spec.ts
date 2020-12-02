import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ControlSubprincipalPageComponent } from './control-subprincipal-page.component';

describe('ControlSubprincipalPageComponent', () => {
  let component: ControlSubprincipalPageComponent;
  let fixture: ComponentFixture<ControlSubprincipalPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ControlSubprincipalPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ControlSubprincipalPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
