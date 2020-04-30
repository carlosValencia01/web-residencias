import { GraduationModule } from './graduation.module';

describe('GraduationModule', () => {
  let graduationModule: GraduationModule;

  beforeEach(() => {
    graduationModule = new GraduationModule();
  });

  it('should create an instance', () => {
    expect(graduationModule).toBeTruthy();
  });
});
