'use strict';
import { APIGatewayProxyHandlerV2, APIGatewayProxyEventV2 } from 'aws-lambda';
import { v4 as uuid } from 'uuid';
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
import { AppError } from '../utils/AppError';
import { DateTime, Settings } from 'luxon';
import { initDB } from '../utils/initDB';
import { Schema, Fail, Success, validate, Validation, Validators } from 'tiny-validation'

const MEMBERS_TABLE = process.env.MEMBERS_TABLE as string;
const JWT_SECRET = process.env.JWT_SECRET as string;

// set default timezone
Settings.defaultZone = 'America/New_York';

let dynamoDbClient = initDB();

const validateSignupRequest = (data) => {
    const { isPresent, minChars, isEmail, pattern } = Validators

    const passwordRegexp = new RegExp("^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$ %^&*-]).{8,}$");
    const validRoles = ['ADMIN', 'MANAGER', 'MEMBER']

    const strongPassword = Validation(pattern(passwordRegexp, "Please enter a strong password with a combination of min 8 characters, numbers, alphabets and special characters"));

    const allowedRole = Validation((key: string, value: string) => {
        if (!validRoles.includes(value)) {
            return Fail({ [key]: [`${key} should be any one from ${validRoles.join(', ')} `] })
        }

        return Success()
    })


    const titleSchema: Schema = {
        email: [isPresent(), isEmail("Please Enter valid email")],
        password: [isPresent(), minChars(8), strongPassword],
        role: [isPresent(), allowedRole]
    }

    const result = validate(titleSchema, data);

    if (result.isFail) {
        const message = Object.values(result.x).map((el: string[]) => el.join(', ')).join(', ')
        throw new AppError(message, 400)
    }

    return true
};

export const signup: APIGatewayProxyHandlerV2 = async (event: APIGatewayProxyEventV2) => {
    try {
        if (!event.body) {
            throw new AppError('bad request', 400);
        }

        const data = JSON.parse(event.body);
        validateSignupRequest(data);

        const id = uuid();
        const salt = bcrypt.genSaltSync(10);
        const hashedPassword = bcrypt.hashSync(data.password, salt);

        const createItem = {
            ...data,
            password: hashedPassword,
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
                message: "successfully registered user account"
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

export const signin: APIGatewayProxyHandlerV2 = async (event: APIGatewayProxyEventV2) => {
    try {
        if (!event.body) {
            throw new AppError('bad request', 400);
        }

        const { email, password } = JSON.parse(event.body);

        if (!email || !password) {
            throw new AppError('email and password are required', 400)
        }

        const getParams = {
            TableName: MEMBERS_TABLE,
            Key: {
                email
            }
        }

        const { Item: member } = await dynamoDbClient.get(getParams).promise();
        if (!member) {
            throw new AppError('invalid credentials', 401);
        }

        const passwordMatched = await bcrypt.compareSync(password, member.password);

        if (!passwordMatched) {
            throw new AppError('invalid credentials', 401);
        }

        const tokenUser = {
            id: member.id,
            email: member.email,
            role: member.role
        }

        const token = jwt.sign({ data: tokenUser }, JWT_SECRET, {
            expiresIn: '30d',
        });

        return {
            statusCode: 200,
            body: JSON.stringify({
                token,
                member
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
