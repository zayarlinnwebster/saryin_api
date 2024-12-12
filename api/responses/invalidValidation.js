module.exports = function invalidValidation(optionalData) {
  // Get access to `req` and `res`
  const req = this.req;
  const res = this.res;

  // Define the status code to send in the response.
  const statusCodeToSet = 400;

  // Define Error Response Message List
  let errorResponse = {};

  // If no data was provided, use res.sendStatus().
  if (optionalData === undefined) {
    sails.log.info("Ran custom response: res.invalidValidation() with no data");
    return res.sendStatus(statusCodeToSet);
  }

  // Handle cases where optionalData is an Error instance
  if (_.isError(optionalData)) {
    sails.log.info(
      "Custom response `res.invalidValidation()` called with an Error:",
      optionalData
    );

    // Use error's `toJSON()` method if available, otherwise use `stack` (but don't in production).
    if (_.isFunction(optionalData.toJSON)) {
      errorResponse = optionalData.toJSON();
    } else {
      if (optionalData.errors) {
        // Map Sequelize error paths to camelCase and accumulate the error messages
        optionalData.errors.forEach((error) => {
          const path = _.camelCase(error.path);
          errorResponse[path] = errorResponse[path] || [];
          errorResponse[path].push(error.message);
        });
      } else if (optionalData.name === "SequelizeForeignKeyConstraintError") {
        // Handle specific Sequelize Foreign Key errors
        const fieldName = _.camelCase(optionalData.fields[0]);
        const tableName = _.camelCase(optionalData.table);

        if (optionalData.parent.code === "ER_NO_REFERENCED_ROW_2") {
          errorResponse[fieldName] = [`${tableName} not found`];
        } else if (optionalData.parent.code === "ER_ROW_IS_REFERENCED_2") {
          errorResponse.message = [`This ${tableName} cannot be deleted`];
        }
      } else {
        // General error handling
        errorResponse.message = optionalData.message || "Internal Server Error";
      }
    }

    // Return the error response with appropriate status code
    return res.status(statusCodeToSet).send(errorResponse);
  }

  // If optionalData is not an error, return it directly as the response body
  return res.status(statusCodeToSet).send(optionalData);
};
