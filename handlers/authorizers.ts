const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET as string;

interface IAuthResponse {
	principalId: string;
	policyDocument?: any;
	context?: any;
}

const allowedRoleAccess = {
	ADMIN: ['ADMIN'],
	MANAGER: ['ADMIN', 'MANAGER'],
	MEMBER: ['ADMIN', 'MANAGER', 'MEMBER']
}

// Policy helper function
const generatePolicy = (principalId, effect, resource, userData) => {
	const authResponse: IAuthResponse = {
		principalId
	};

	if (effect && resource) {
		const policyDocument = {
			Version: '2012-10-17',
			Statement: [
				{
					Action: 'execute-api:Invoke',
					Effect: effect,
					Resource: resource,
				},
			],
		};
		authResponse.policyDocument = policyDocument;
		authResponse.context = {
			user: userData,
		};
	}
	return authResponse;
};


const authorizeWithRole = (event, context, cb, role) => {
	const bearerToken = event.headers.authorization

	if (!bearerToken) {
		return cb(new Error('please signin.'));
	}

	const token = bearerToken.split('Bearer ')[1];

	let decodedData = jwt.verify(token, JWT_SECRET);

	if (!decodedData.data.id) {
		return cb(new Error('please signin again'));
	}

	if (!allowedRoleAccess[role].includes(decodedData.data.role)) {
		return cb(new Error('bad request'));
	}

	const policyDocument = generatePolicy(decodedData.data.id, 'Allow', event.routeArn, JSON.stringify(decodedData.data))

	// for more safety, we can search user in our db
	return cb(null, policyDocument);
}

export const JiraAdminAuthorizer = (event, context, cb) => {
	return authorizeWithRole(event, context, cb, "ADMIN");
}

export const JiraManagerAuthorizer = (event, context, cb) => {
	return authorizeWithRole(event, context, cb, "MANAGER");
}

export const JiraMemberAuthorizer = (event, context, cb) => {
	return authorizeWithRole(event, context, cb, "MEMBER");
}