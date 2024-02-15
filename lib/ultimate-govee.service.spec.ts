import { Test, TestingModule } from '@nestjs/testing';
import { UltimateGoveeService } from './ultimate-govee.service';

describe('UltimateGoveeService', () => {
  let service: UltimateGoveeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UltimateGoveeService],
    }).compile();

    service = module.get<UltimateGoveeService>(UltimateGoveeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
