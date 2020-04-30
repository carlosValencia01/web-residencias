import { InscriptionsModule } from './inscriptions.module';

describe('InscriptionsModule', () => {
  let inscriptionsModule: InscriptionsModule;

  beforeEach(() => {
    inscriptionsModule = new InscriptionsModule();
  });

  it('should create an instance', () => {
    expect(inscriptionsModule).toBeTruthy();
  });
});
