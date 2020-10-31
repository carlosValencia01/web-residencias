import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EnglishPeriodListPageComponent } from './english-period-list-page.component';

describe('EnglishPeriodListPageComponent', () => {
  let component: EnglishPeriodListPageComponent;
  let fixture: ComponentFixture<EnglishPeriodListPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EnglishPeriodListPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EnglishPeriodListPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
