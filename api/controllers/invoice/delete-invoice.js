module.exports = {
  friendlyName: "Delete Invoice",

  description: "Deletes an invoice by its ID.",

  inputs: {
    id: {
      type: "number",
      required: true,
      description: "The ID of the invoice to delete.",
    },
  },

  exits: {
    success: {
      statusCode: 200,
      description: "Invoice deleted successfully.",
    },
    invalid: {
      responseType: "badRequest",
      description: "Invalid request due to missing or incorrect data.",
    },
    invalidValidation: {
      responseType: "invalidValidation",
      description: "Validation error occurred.",
    },
    notFound: {
      responseType: "notFound",
      description: "No invoice found with the specified ID.",
    },
    serverError: {
      responseType: "serverError",
      description: "A server error occurred.",
    },
  },

  fn: async function (inputs, exits) {
    try {
      // Attempt to delete the invoice
      const deletedCount = await Invoice.destroy({
        where: { id: inputs.id },
      });

      // Check if the invoice was found and deleted
      if (deletedCount === 0) {
        return exits.notFound({
          message: "Invoice not found with the given ID.",
        });
      }

      // Respond with success if deletion was successful
      return exits.success({
        message: "Invoice deleted successfully.",
      });
    } catch (err) {
      // Log and handle unexpected server errors
      sails.log.error("Error deleting invoice:", err);
      return exits.invalidValidation(err);
    }
  },
};
