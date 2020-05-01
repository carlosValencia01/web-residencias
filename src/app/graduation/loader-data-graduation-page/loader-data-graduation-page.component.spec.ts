import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LoaderDataGraduationPageComponent } from './loader-data-graduation-page.component';

describe('LoaderDataGraduationPageComponent', () => {
  let component: LoaderDataGraduationPageComponent;
  let fixture: ComponentFixture<LoaderDataGraduationPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LoaderDataGraduationPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoaderDataGraduationPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
