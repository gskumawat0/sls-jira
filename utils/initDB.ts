import { DynamoDB } from 'aws-sdk';

export const initDB = () => {
    let dynamoDbClient;

    if (process.env.IS_OFFLINE) {
        dynamoDbClient = new DynamoDB.DocumentClient({
            region: 'localhost',
            endpoint: process.env.LOCAL_DYNAMODB_URL
        });
    } else {
        dynamoDbClient = new DynamoDB.DocumentClient();
    }

    return dynamoDbClient;
};
