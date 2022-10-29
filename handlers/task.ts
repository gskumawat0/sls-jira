"use strict";
import { APIGatewayProxyHandlerV2, APIGatewayProxyEventV2 } from 'aws-lambda'
import { AppError } from '../utils/AppError';
import { DynamoDB } from 'aws-sdk';
import { v4 as uuid } from 'uuid';
import { DateTime, Settings } from 'luxon';

const TASKS_TABLE = process.env.TASKS_TABLE as string;
let dynamoDbClient;

if (process.env.NODE_ENV === 'production') {
  dynamoDbClient = new DynamoDB.DocumentClient();
} else {
  dynamoDbClient = new DynamoDB.DocumentClient({
    region: 'localhost',
    endpoint: process.env.LOCAL_DYNAMODB_URL
  });

}

// set default timezone
Settings.defaultZone = "America/New_York";


// TODO: 
// 1. add title validations
// 2. add status validations 
// 3. add authentications
// 4. add middleware for roles authorization

export const createTask: APIGatewayProxyHandlerV2 = async (event: APIGatewayProxyEventV2) => {
  try {

    if (!event.body) {
      throw new AppError("bad request", 400)
    }

    const data = JSON.parse(event.body);
    const id = uuid();

    // TODO: add createdBy from auth context if available
    const createItem = {
      ...data,
      id,
      createdAt: DateTime.now().toISO(),
      status: "DRAFT"
    }


    const updateParams = {
      TableName: TASKS_TABLE,
      Item: createItem
    };

    await dynamoDbClient.put(updateParams).promise();
    return {
      statusCode: 200,
      body: JSON.stringify(
        {
          task: createItem,
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

export const updateTask: APIGatewayProxyHandlerV2 = async (event: APIGatewayProxyEventV2) => {
  try {

    if (!event.body || !event.pathParameters) {
      throw new AppError("bad request", 400)
    }

    const data = JSON.parse(event.body);
    const { taskId } = event.pathParameters;

    if (!taskId) {
      throw new AppError("taskId is required", 400)
    }

    const updateParams = {
      TableName: TASKS_TABLE,
      Key: {
        id: taskId
      },
      UpdateExpression: "SET title = :title, description = :description",
      ConditionExpression: "status <> CLOSED",
      ExpressionAttributeValues: {
        ":title": data.title,
        ":description": data.description
      },
      ReturnValues: "ALL_NEW",
    }

    const { Attributes: updatedTask } = await dynamoDbClient.update(updateParams).promise();

    return {
      statusCode: 200,
      body: JSON.stringify(
        {
          task: updatedTask,
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

export const getTask: APIGatewayProxyHandlerV2 = async (event: APIGatewayProxyEventV2) => {
  try {

    if (!event.pathParameters) {
      throw new AppError("bad request", 400)
    }

    const { taskId } = event.pathParameters;

    if (!taskId) {
      throw new AppError("taskId is required", 400)
    }

    const getParams = {
      TableName: TASKS_TABLE,
      Key: {
        id: taskId,
      },
    }
    const { Item: task } = await dynamoDbClient.get(getParams).promise();

    if (!task) {
      throw new AppError("Item not found", 404)
    }

    return {
      statusCode: 200,
      body: JSON.stringify(
        {
          task
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

export const deleteTask: APIGatewayProxyHandlerV2 = async (event: APIGatewayProxyEventV2) => {
  try {

    if (!event.pathParameters) {
      throw new AppError("bad request", 400)
    }

    const { taskId } = event.pathParameters;

    if (!taskId) {
      throw new AppError("taskId is required", 400)
    }

    const deleteParams = {
      TableName: TASKS_TABLE,
      Key: {
        id: taskId,
      },
    }

    const { Attributes: deletedTask } = await dynamoDbClient.delete(deleteParams).promise();


    return {
      statusCode: 200,
      body: JSON.stringify(
        {
          task: deletedTask,
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

export const assignTask: APIGatewayProxyHandlerV2 = async (event: APIGatewayProxyEventV2) => {
  try {

    if (!event.pathParameters) {
      throw new AppError("bad request", 400)
    }

    const { taskId, memberId } = event.pathParameters;

    if (!taskId) {
      throw new AppError("taskId is required", 400)
    }

    if (!memberId) {
      throw new AppError("memberId is required", 400)
    }

    const updateParams = {
      TableName: TASKS_TABLE,
      Key: {
        id: taskId
      },
      UpdateExpression: "SET assignedTo = :memberId, dateAssigned= :dateAssigned, #status= :status",
      ConditionExpression: "#status = :draft",
      ExpressionAttributeNames: {
        "#status": "status",
      },
      ExpressionAttributeValues: {
        ":memberId": memberId,
        ":dateAssigned": DateTime.now(),
        ":status": "ASSIGNED",
        ":draft": "DRAFT"
      },
      ReturnValues: "ALL_NEW",
    }

    const { Attributes: updatedTask } = await dynamoDbClient.update(updateParams).promise();

    return {
      statusCode: 200,
      body: JSON.stringify(
        {
          task: updatedTask
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


export const acceptTask: APIGatewayProxyHandlerV2 = async (event: APIGatewayProxyEventV2) => {
  try {

    if (!event.pathParameters) {
      throw new AppError("bad request", 400)
    }

    const { taskId } = event.pathParameters;

    if (!taskId) {
      throw new AppError("taskId is required", 400)
    }

    const updateParams = {
      TableName: TASKS_TABLE,
      Key: {
        id: taskId
      },
      UpdateExpression: "SET #status= :status",
      ConditionExpression: "#status = :assigned",
      ExpressionAttributeNames: {
        "#status": "status",
      },
      ExpressionAttributeValues: {
        ":status": "IN_PROGRESS",
        ":assigned": "ASSIGNED"
      },
      ReturnValues: "ALL_NEW",
    }

    const { Attributes: updatedTask } = await dynamoDbClient.update(updateParams).promise();

    return {
      statusCode: 200,
      body: JSON.stringify(
        {
          task: updatedTask
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

export const completeTask: APIGatewayProxyHandlerV2 = async (event: APIGatewayProxyEventV2) => {
  try {

    if (!event.pathParameters) {
      throw new AppError("bad request", 400)
    }

    const { taskId } = event.pathParameters;

    if (!taskId) {
      throw new AppError("taskId is required", 400)
    }

    const updateParams = {
      TableName: TASKS_TABLE,
      Key: {
        id: taskId
      },
      UpdateExpression: "SET #status = :status, dateCompleted= :dateCompleted",
      ConditionExpression: "#status = :inProgress",
      ExpressionAttributeNames: {
        "#status": "status",
      },
      ExpressionAttributeValues: {
        ":status": "COMPLETED",
        ":dateCompleted": DateTime.now(),
        ":inProgress": "IN_PROGRESS"
      },
      ReturnValues: "ALL_NEW",
    }

    const { Attributes: updatedTask } = await dynamoDbClient.update(updateParams).promise();

    return {
      statusCode: 200,
      body: JSON.stringify(
        {
          task: updatedTask
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


export const closeTask: APIGatewayProxyHandlerV2 = async (event: APIGatewayProxyEventV2) => {
  try {

    if (!event.pathParameters) {
      throw new AppError("bad request", 400)
    }

    const { taskId } = event.pathParameters;

    if (!taskId) {
      throw new AppError("taskId is required", 400)
    }

    const updateParams = {
      TableName: TASKS_TABLE,
      Key: {
        id: taskId
      },
      UpdateExpression: "SET #status = :status, dateClosed = :dateClosed",
      ConditionExpression: "#status = :completed",
      ExpressionAttributeNames: {
        "#status": "status"
      },
      ExpressionAttributeValues: {
        ":status": "CLOSED",
        ":dateClosed": DateTime.now(),
        ":complete": "COMPLETE"
      },
      ReturnValues: "ALL_NEW",
    }

    const { Attributes: updatedTask } = await dynamoDbClient.update(updateParams).promise();

    return {
      statusCode: 200,
      body: JSON.stringify(
        {
          task: updatedTask
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
