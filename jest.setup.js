// jest.setup.js
import fc from 'fast-check';

fc.configureGlobal({
    numRuns: 10,
    interruptAfterTimeLimit: 4000, // Default timeout in Jest 5000ms
    markInterruptAsFailure: true, // When set to true, timeout during initial cases (1) will be marked as an error
    // When set to false, timeout during initial cases (1) will not be considered as a failure
});
