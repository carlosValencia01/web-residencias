import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RegisterEmailgraduationPageComponent } from './register-emailgraduation-page.component';

describe('RegisterEmailgraduationPageComponent', () => {
  let component: RegisterEmailgraduationPageComponent;
  let fixture: ComponentFixture<RegisterEmailgraduationPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RegisterEmailgraduationPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RegisterEmailgraduationPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
