"use strict";
import { APIGatewayProxyHandlerV2, APIGatewayProxyEventV2 } from 'aws-lambda'
import { AppError } from '../utils/AppError';
import * as AWS from 'aws-sdk'

const TASKS_TABLE = process.env.TASKS_TABLE;

const dynamoDbClient = new AWS.DynamoDB.DocumentClient();

export const getMemberTasks: APIGatewayProxyHandlerV2 = async (event: APIGatewayProxyEventV2) => {
	try {

		if (!event.pathParameters) {
			throw new AppError("bad request", 400)
		}

		const { memberId } = event.pathParameters;

		return {
			statusCode: 200,
			body: JSON.stringify(
				{
					tasks: [{ name: "List all todos", memberId }],
					input: event
				}
			),
		};
	} catch (error) {
		return {
			statusCode: error.status || 500,
			body: JSON.stringify(
				{
					message: error.message,
				}
			),
		};
	}
};
