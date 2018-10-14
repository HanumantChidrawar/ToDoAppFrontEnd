import { ModesModule } from './modes.module';

describe('ModesModule', () => {
  let modesModule: ModesModule;

  beforeEach(() => {
    modesModule = new ModesModule();
  });

  it('should create an instance', () => {
    expect(modesModule).toBeTruthy();
  });
});
