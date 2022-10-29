"use strict";
import { APIGatewayProxyHandlerV2, APIGatewayProxyEventV2 } from 'aws-lambda'
import { AppError } from '../utils/AppError';

export const createTask: APIGatewayProxyHandlerV2 = async (event: APIGatewayProxyEventV2) => {
  try {

    if (!event.body) {
      throw new AppError("bad request", 400)
    }

    const data = JSON.parse(event.body);

    return {
      statusCode: 200,
      body: JSON.stringify(
        {
          task: data
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

    return {
      statusCode: 200,
      body: JSON.stringify(
        {
          task: data
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

    return {
      statusCode: 200,
      body: JSON.stringify(
        {
          task: [{ id: taskId }]
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

    return {
      statusCode: 200,
      body: JSON.stringify(
        {
          task: { id: taskId }
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

    return {
      statusCode: 200,
      body: JSON.stringify(
        {
          task: { id: taskId, memberId }
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

    return {
      statusCode: 200,
      body: JSON.stringify(
        {
          task: { id: taskId, }
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

    return {
      statusCode: 200,
      body: JSON.stringify(
        {
          task: { id: taskId }
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

    return {
      statusCode: 200,
      body: JSON.stringify(
        {
          task: { id: taskId }
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
