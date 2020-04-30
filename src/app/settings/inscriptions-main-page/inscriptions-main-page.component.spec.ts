import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InscriptionsMainPageComponent } from './inscriptions-main-page.component';

describe('InscriptionsMainPageComponent', () => {
  let component: InscriptionsMainPageComponent;
  let fixture: ComponentFixture<InscriptionsMainPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InscriptionsMainPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InscriptionsMainPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
