import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ListGraduatesPageComponent } from './list-graduates-page.component';

describe('ListGraduatesPageComponent', () => {
  let component: ListGraduatesPageComponent;
  let fixture: ComponentFixture<ListGraduatesPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ListGraduatesPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ListGraduatesPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
