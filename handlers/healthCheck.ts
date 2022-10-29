'use strict';
import { APIGatewayProxyHandlerV2, APIGatewayProxyEventV2 } from 'aws-lambda';

export const healthCheck: APIGatewayProxyHandlerV2 = async () => {
    return {
        statusCode: 200,
        body: JSON.stringify({
            message: "we're live"
        })
    };
};

export const test = async (event: APIGatewayProxyEventV2) => {
    return {
        statusCode: 200,
        body: JSON.stringify({
            input: event
        })
    };
};
