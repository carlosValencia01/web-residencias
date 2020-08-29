import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BossMessageComponent } from './boss-message.component';

describe('BossMessageComponent', () => {
  let component: BossMessageComponent;
  let fixture: ComponentFixture<BossMessageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BossMessageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BossMessageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
