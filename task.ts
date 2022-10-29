"use strict";

module.exports.getAllTasks = async (event) => {
  return {
    statusCode: 404,
    body: JSON.stringify(
      {
        tasks: [{name: "List all todos"}]
      },
      null,
      2
    ),
  };
};
