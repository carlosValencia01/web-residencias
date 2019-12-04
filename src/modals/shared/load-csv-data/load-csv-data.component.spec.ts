import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LoadCsvDataComponent } from './load-csv-data.component';

describe('LoadCsvDataComponent', () => {
  let component: LoadCsvDataComponent;
  let fixture: ComponentFixture<LoadCsvDataComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LoadCsvDataComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoadCsvDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
