import { TitulationModule } from './titulation.module';

describe('TitulationModule', () => {
  let titulationModule: TitulationModule;

  beforeEach(() => {
    titulationModule = new TitulationModule();
  });

  it('should create an instance', () => {
    expect(titulationModule).toBeTruthy();
  });
});
