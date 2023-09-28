/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable max-lines-per-function */
import Axios from 'axios';
import { ExternalApiCaller } from './external-api-caller.class';
import { ExternalApiReportPayload } from './types/external-api-report-payload.interface';

// Mock Axios module to simulate API calls
jest.mock('axios');

describe('ExternalApiCaller', () => {
    const createMockResponse = (data, status = 200) => ({
        data,
        status,
    });

    describe('get', () => {
        it('should make a GET request and log the response', async () => {
            const mockResponseData = { message: 'Mock response' };
            jest.spyOn(Axios, 'get').mockResolvedValue(createMockResponse(mockResponseData));

            const externalApiCaller = new ExternalApiCaller();
            const response = await externalApiCaller.get('/api/endpoint', {
                params: { param1: 'value1' },
                query: { q: 'search' },
                headers: { Authorization: 'Bearer token' },
            });

            // eslint-disable-next-line @typescript-eslint/unbound-method
            expect(Axios.get).toHaveBeenCalledWith('/api/endpoint', {
                headers: { Authorization: 'Bearer token' },
                params: { q: 'search' },
            });

            expect(response).toEqual(mockResponseData);
        });
    });

    describe('post', () => {
        it('should make a POST request and log the response', async () => {
            const mockResponseData = { message: 'Mock response' };
            jest.spyOn(Axios, 'post').mockResolvedValue(createMockResponse(mockResponseData));

            const externalApiCaller = new ExternalApiCaller();
            const response = await externalApiCaller.post('/api/endpoint', {
                params: { param1: 'value1' },
                query: { q: 'search' },
                headers: { Authorization: 'Bearer token' },
                data: { key: 'value' },
            });

            expect(Axios.post).toHaveBeenCalledWith(
                '/api/endpoint',
                { key: 'value' },
                {
                    headers: { Authorization: 'Bearer token' },
                    params: { q: 'search' },
                }
            );

            expect(response).toEqual(mockResponseData);
        });

        it('should handle 500 error response from POST request', async () => {
            const mockErrorResponse = {
                response: {
                    status: 500,
                    data: { error: 'Internal server error' },
                },
            };
            jest.spyOn(Axios, 'post').mockRejectedValue(mockErrorResponse);

            const externalApiCaller = new ExternalApiCaller();

            try {
                await externalApiCaller.post('/api/endpoint', {
                    params: { param1: 'value1' },
                    data: { key: 'value' },
                });
            } catch (error) {
                expect(error.message).toContain(mockErrorResponse.response.data.error);
            }
        });
    });

    describe('parseUrlParameter', () => {
        it('should parse URL parameters correctly', () => {
            const externalApiCaller = new ExternalApiCaller();
            const url = '/api/:resource/:id';
            const urlParams = { resource: 'books', id: '123' };
            const parsedUrl = externalApiCaller.parseUrlParameter(url, urlParams);

            expect(parsedUrl).toBe('/api/books/123');
        });
    });

    describe('renderReport', () => {
        it('should render the report correctly', () => {
            const externalApiCaller = new ExternalApiCaller();
            const reportPayload: ExternalApiReportPayload = {
                externalApiName: '[EXTERNAL API]',
                method: 'POST',
                url: '/api/endpoint',
                status: 200,
                query: { q: 'search' },
                data: { key: 'value' },
            };

            const renderedReport = externalApiCaller.renderReport(reportPayload);

            expect(renderedReport).toContain('[EXTERNAL API]');
        });
    });
});
