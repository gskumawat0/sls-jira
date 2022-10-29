"use strict";

module.exports.getUserTasks = async (event) => {
	const { userId } = event.pathParameters;

	return {
		statusCode: 404,
		body: JSON.stringify(
			{
				tasks: [{ name: "List all todos", userId }],
				input: event
			},
			null,
			2
		),
	};
};
