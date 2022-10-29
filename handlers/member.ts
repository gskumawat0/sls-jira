'use strict';
import { APIGatewayProxyHandlerV2, APIGatewayProxyEventV2 } from 'aws-lambda';
import { AppError } from '../utils/AppError';
import { v4 as uuid } from 'uuid';
import { DateTime, Settings } from 'luxon';
import { initDB } from '../utils/initDB';

const TASKS_TABLE = process.env.TASKS_TABLE as string;
const MEMBERS_TABLE = process.env.MEMBERS_TABLE as string;

// set default timezone
Settings.defaultZone = 'America/New_York';

let dynamoDbClient = initDB();

export const getAllMembers: APIGatewayProxyHandlerV2 = async () => {
    try {
        const getParams = {
            TableName: MEMBERS_TABLE
        };

        const { Items: members } = await dynamoDbClient.scan(getParams).promise();

        return {
            statusCode: 200,
            body: JSON.stringify({
                members
            })
        };
    } catch (error) {
        return {
            statusCode: error.status || 500,
            body: JSON.stringify({
                message: error.message
            })
        };
    }
};

export const createMember: APIGatewayProxyHandlerV2 = async (event: APIGatewayProxyEventV2) => {
    try {
        if (!event.body) {
            throw new AppError('bad request', 400);
        }

        const data = JSON.parse(event.body);
        const id = uuid();

        const createItem = {
            ...data,
            id,
            createdAt: DateTime.now().toISO()
        };

        const updateParams = {
            TableName: MEMBERS_TABLE,
            Item: createItem
        };

        await dynamoDbClient.put(updateParams).promise();
        return {
            statusCode: 200,
            body: JSON.stringify({
                member: createItem
            })
        };
    } catch (error) {
        return {
            statusCode: error.status || 500,
            body: JSON.stringify({
                message: error.message
            })
        };
    }
};

export const getMemberTasks: APIGatewayProxyHandlerV2 = async (event: APIGatewayProxyEventV2) => {
    try {
        if (!event.pathParameters) {
            throw new AppError('bad request', 400);
        }

        const { memberId } = event.pathParameters;

        if (!memberId) {
            throw new AppError('taskId is required', 400);
        }

        const getParams = {
            TableName: TASKS_TABLE,
            FilterExpression: 'assignedTo = :memberId',
            // ExpressionAttributeNames: { "#assignedTo": "assignedTo" },
            ExpressionAttributeValues: {
                ':memberId': memberId
            }
        };

        const { Items: tasks } = await dynamoDbClient.scan(getParams).promise();

        return {
            statusCode: 200,
            body: JSON.stringify({
                tasks
            })
        };
    } catch (error) {
        return {
            statusCode: error.status || 500,
            body: JSON.stringify({
                message: error.message
            })
        };
    }
};
