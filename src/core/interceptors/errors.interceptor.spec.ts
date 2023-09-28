import { Test, TestingModule } from '@nestjs/testing';
import { ErrorsInterceptor } from './errors.interceptor';

describe('ErrorsInterceptor', () => {
    let interceptor: ErrorsInterceptor;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [ErrorsInterceptor],
        }).compile();

        interceptor = module.get<ErrorsInterceptor>(ErrorsInterceptor);
    });

    it('should be defined', () => {
        expect(interceptor).toBeDefined();
    });
});
