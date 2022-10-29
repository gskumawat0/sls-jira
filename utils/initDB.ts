import { DynamoDB } from 'aws-sdk';

export const initDB = () => {
	let dynamoDbClient;

	if (process.env.NODE_ENV === 'production') {
		dynamoDbClient = new DynamoDB.DocumentClient();
	} else {
		dynamoDbClient = new DynamoDB.DocumentClient({
			region: 'localhost',
			endpoint: process.env.LOCAL_DYNAMODB_URL
		});
	}

	return dynamoDbClient;
}