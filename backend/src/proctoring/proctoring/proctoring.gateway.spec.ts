import { Test, TestingModule } from '@nestjs/testing';
import { ProctoringGateway } from './proctoring.gateway';

describe('ProctoringGateway', () => {
  let gateway: ProctoringGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProctoringGateway],
    }).compile();

    gateway = module.get<ProctoringGateway>(ProctoringGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
