"use strict";

module.exports.healthCheck = async (event) => {
  return {
    statusCode: 200,
    body: JSON.stringify(
      {
        message: "we're live",
      },
      null,
      2
    ),
  };
};


module.exports.test = async (event) => {
  return {
    statusCode: 200,
    body: JSON.stringify(
      {
        input: event
      },
      null,
      2
    ),
  };
};
