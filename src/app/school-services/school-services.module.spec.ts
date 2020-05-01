import { SchoolServicesModule } from './school-services.module';

describe('SchoolServicesModule', () => {
  let schoolServicesModule: SchoolServicesModule;

  beforeEach(() => {
    schoolServicesModule = new SchoolServicesModule();
  });

  it('should create an instance', () => {
    expect(schoolServicesModule).toBeTruthy();
  });
});
