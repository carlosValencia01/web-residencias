import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EnglishGroupsPageComponent } from './english-groups-page.component';

describe('EnglishGroupsPageComponent', () => {
  let component: EnglishGroupsPageComponent;
  let fixture: ComponentFixture<EnglishGroupsPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EnglishGroupsPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EnglishGroupsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
