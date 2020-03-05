import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ImssPageComponent } from './imss-page.component';

describe('ImssPageComponent', () => {
  let component: ImssPageComponent;
  let fixture: ComponentFixture<ImssPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ImssPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ImssPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
