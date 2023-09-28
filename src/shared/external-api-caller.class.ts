import { Logger } from '@nestjs/common';
import Axios from 'axios';
import { ExternalApiPayload, ExternalApiPostPayload } from './types/external-api-payload.interface';
import { ExternalApiReportPayload } from './types/external-api-report-payload.interface';

/**
 * Class responsible for external Call
 * Responsability: make get/patch/post calls to external api and log payload and responses
 */
export class ExternalApiCaller {
    constructor(private readonly externalApiName = '[EXTERNAL API]') {}

    /**
     * Generic GET Method
     * @param url url of the GET endpoint
     */
    async get<RESPONSE>(url: string, payload: ExternalApiPayload): Promise<RESPONSE> {
        const parsedUrl = this.parseUrlParameter(url, payload.params);
        const partialReport: Omit<ExternalApiReportPayload, 'status' | 'response'> = {
            externalApiName: this.externalApiName,
            method: 'GET',
            url: parsedUrl,
            params: payload.params,
            query: payload.query,
            headers: payload.headers,
        };
        try {
            const response = await Axios.get(url, {
                headers: payload.headers || {},
                params: payload.query || {},
            });
            const responseData = response.data as RESPONSE;
            Logger.log(
                this.renderReport({
                    ...partialReport,
                    status: response.status,
                    response: response.data,
                })
            );
            return responseData;
        } catch (error) {
            const report = this.renderReport({
                ...partialReport,
                status: error?.response?.status || 'INCONNU',
                response: error?.response?.data,
            });
            Logger.error(report);
            throw new Error(report);
        }
    }

    /**
     * Generic POST Method
     * @param url url of the POST endpoint
     * @param payload External APi POST payload
     */
    async post<PAYLOAD, RESPONSE extends Object>(url: string, payload: ExternalApiPostPayload<PAYLOAD>): Promise<RESPONSE> {
        const parsedUrl = this.parseUrlParameter(url, payload.params);
        const partialReport: Omit<ExternalApiReportPayload, 'status' | 'response'> = {
            externalApiName: this.externalApiName,
            method: 'POST',
            url: parsedUrl,
            data: payload.data,
            params: payload.params,
            query: payload.query,
            headers: payload.headers,
        };
        try {
            const response = await Axios.post(url, payload.data, {
                headers: payload.headers || {},
                params: payload.query || {},
            });
            const responseData = response.data as RESPONSE;
            Logger.log(
                this.renderReport({
                    ...partialReport,
                    status: response.status,
                    response: response.data,
                })
            );
            return responseData;
        } catch (error) {
            const report = this.renderReport({
                ...partialReport,
                status: error?.response?.status || 'INCONNU',
                response: error?.response?.data,
            });
            Logger.error(report);
            throw new Error(report);
        }
    }

    /**
     * Parse prebuilt template url
     * Example:
     * The url looks like this: http://base.url/:contractId/create/:requestId
     * and the url Params: {requestId: 1234, contractId: 542}
     * The result would be http://base.url/542/create/1234
     * @param url url in form of http://base.url/:requestId/create/
     * @param urlParams holds the part to be replaced
     */
    parseUrlParameter(url: string, urlParams: object): string {
        const parts = url.split('/'); // Split the URL by "/"
        const resultParts = [];

        for (const part of parts) {
            if (part.startsWith(':')) {
                const paramName = part.substring(1); // Remove the ":" prefix
                if (urlParams.hasOwnProperty(paramName)) {
                    resultParts.push(urlParams[paramName]);
                } else {
                    throw new Error(`Missing parameter value for '${paramName}'`);
                }
            } else {
                resultParts.push(part);
            }
        }

        return resultParts.join('/');
    }

    /**
     * Render stringified object if object is defined, fallback message otherwise
     * @param data object to be stringified
     * @param fallBackMessage fallback message in case of undefined object
     * @returns stringified object or fallback message
     */
    private renderObjectOrFallBackMessage(data: Object, fallBackMessage = 'Objet vide') {
        return data ? JSON.stringify(data, null, 4) : fallBackMessage;
    }

    /**
     * Render report based on report payload data including url, header, query ...
     * @param reportPayload Data used to render report
     * @returns Report in string value (will be used inside log or error)
     */
    renderReport(reportPayload: ExternalApiReportPayload): string {
        const externalApiName = this.externalApiName;
        const methodReport = `${externalApiName} used method: ${reportPayload.method}`;
        const apiCallReport = `${externalApiName} call to url: ${reportPayload.url}`;
        const responseStatus = `${externalApiName} Response status: ${reportPayload.status}`;
        const headersParams = `${externalApiName} Headers: ${this.renderObjectOrFallBackMessage(
            reportPayload.headers,
            'No headers'
        )}`;
        const queryParameters = `${externalApiName} Query param: ${this.renderObjectOrFallBackMessage(
            reportPayload.query,
            'No Query parameters'
        )}`;
        const urlParameters = `${externalApiName} Url params: ${reportPayload.url || 'No url parameters'}`;
        const data = `${externalApiName} Data: ${this.renderObjectOrFallBackMessage(reportPayload.data, 'No data sent')}`;
        const responseFromTheServer = `${externalApiName} Response: ${this.renderObjectOrFallBackMessage(
            reportPayload.response,
            'No response'
        )}`;

        return `
            ${apiCallReport}
            ${methodReport}
            ${headersParams}
            ${queryParameters}
            ${urlParameters}
            ${data}
            ${responseStatus}
            ${responseFromTheServer}
        `;
    }
}
