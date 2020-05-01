import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ActNotificacionComponent } from './act-notificacion.component';

describe('ActNotificacionComponent', () => {
  let component: ActNotificacionComponent;
  let fixture: ComponentFixture<ActNotificacionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ActNotificacionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ActNotificacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
