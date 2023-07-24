/**
 * invalidValidation.js
 *
 * A custom response.
 *
 * Example usage:
 * ```
 *     return res.invalidValidation();
 *     // -or-
 *     return res.invalidValidation(optionalData);
 * ```
 *
 * Or with actions2:
 * ```
 *     exits: {
 *       somethingHappened: {
 *         responseType: 'invalidValidation'
 *       }
 *     }
 * ```
 *
 * ```
 *     throw 'somethingHappened';
 *     // -or-
 *     throw { somethingHappened: optionalData }
 * ```
 */

module.exports = function invalidValidation(optionalData) {
  // Get access to `req` and `res`
  // eslint-disable-next-line no-unused-vars
  var req = this.req;
  var res = this.res;

  // Define the status code to send in the response.
  var statusCodeToSet = 400;

  // Define Error Response Message List
  var errorResponse = {};
  // If no data was provided, use res.sendStatus().
  if (optionalData === undefined) {
    sails.log.info('Ran custom response: res.invalidValidation()');
    return res.sendStatus(statusCodeToSet);
  }
  // Else if the provided data is an Error instance, if it has
  // a toJSON() function, then always run it and use it as the
  // response body to send.  Otherwise, send down its `.stack`,
  // except in production use res.sendStatus().
  else if (_.isError(optionalData)) {
    sails.log.info(
      'Custom response `res.invalidValidation()` called with an Error:',
      optionalData
    );
    // If the error doesn't have a custom .toJSON(), use its `stack` instead--
    // otherwise res.json() would turn it into an empty dictionary.
    // (If this is production, don't send a response body at all.)
    if (!_.isFunction(optionalData.toJSON)) {
      if (optionalData.errors) {
        optionalData.errors.forEach((error) => {
          if (errorResponse[_.camelCase(error.path)]) {
            errorResponse[_.camelCase(error.path)].push(error.message);
          } else {
            errorResponse[_.camelCase(error.path)] = [error.message];
          }
        });
      } else if (optionalData.name === 'SequelizeForeignKeyConstraintError') {
        let fieldName = _.camelCase(optionalData.fields[0]);
        let tableName = _.camelCase(optionalData.table);

        if (optionalData.parent.code === 'ER_NO_REFERENCED_ROW_2') {
          errorResponse[fieldName] = [tableName + ' is not found'];
        } else if (optionalData.parent.code === 'ER_ROW_IS_REFERENCED_2') {
          errorResponse.message = [`This ${tableName} cannot be deleted`];
        }
      } else if (optionalData.message) {
        errorResponse.message = optionalData.message;
      } else {
        errorResponse.message = 'Internal Server Error';
      }

      return res.status(statusCodeToSet).send(errorResponse);
    }
  }
  // Set status code and send response data.
  else {
    return res.status(statusCodeToSet).send(optionalData);
  }
};
