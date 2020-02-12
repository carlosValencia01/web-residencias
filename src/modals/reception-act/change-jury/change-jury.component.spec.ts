import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChangeJuryComponent } from './change-jury.component';

describe('ChangeJuryComponent', () => {
  let component: ChangeJuryComponent;
  let fixture: ComponentFixture<ChangeJuryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChangeJuryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChangeJuryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
