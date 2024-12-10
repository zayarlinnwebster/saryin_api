const { Op } = require("sequelize");

module.exports = {
  friendlyName: 'Delete financial statement',

  description: 'Deletes a financial statement by updating isArchived to false and removing related records.',

  inputs: {
    id: {
      type: 'number',
      required: true,
      description: 'The ID of the financial statement to delete.',
    },
  },

  exits: {
    success: {
      statusCode: 200,
      description: 'Financial statement deleted successfully.',
    },

    invalid: {
      responseType: 'badRequest',
      description: 'Financial statement not found or invalid.',
    },

    serverError: {
      responseType: 'serverError',
      description: 'An unexpected error occurred.',
    },
  },

  fn: async function (inputs, exits) {
    const transaction = await SequelizeConnections['mysqlServer'].transaction(); // Start transaction

    try {
      const exists = await FinancialStatement.count({ where: { id: inputs.id } });

      if (!exists) {
        await transaction.rollback();
        return exits.invalid({ message: 'Financial Statement not found' });
      }


      // Step 1: Retrieve associated financial payment list
      const financialPaymentList = await CustomerPayment.findAll({
        attributes: ['id'],
        where: { financialStatementId: inputs.id },
        transaction,
      });

      const customerPaymentIdList = financialPaymentList.map(financialPayment => financialPayment.id);

      // Step 2: Update CustomerPayment's isArchived to 0
      if (customerPaymentIdList.length) {
        await CustomerPayment.update(
          {
            isArchived: 0,
          },
          {
            where: { id: { [Op.in]: customerPaymentIdList } },
            transaction,
          }
        );
      }

      // Step 3: Retrieve associated financial invoice list
      const financialInvoiceList = await Invoice.findAll({
        attributes: ['id'],
        where: { financialStatementId: inputs.id },
        transaction,
      });

      const invoiceIdList = financialInvoiceList.map(financialInvoice => financialInvoice.id);

      // Step 4: Update Invoice's isArchived to 0
      if (invoiceIdList.length) {
        await Invoice.update(
          {
            isArchived: 0,
          },
          {
            where: { id: { [Op.in]: invoiceIdList } },
            transaction,
          }
        );
      }

      // Step 5: Delete the financial statement
      await FinancialStatement.destroy({
        where: { id: inputs.id },
        transaction,
      });

      // Step 6: Commit transaction
      await transaction.commit();
      return exits.success({
        message: 'Financial Statement deleted successfully',
      });

    } catch (error) {
      console.error(error);
      await transaction.rollback(); // Rollback transaction on error
      return exits.serverError({
        message: 'An error occurred while deleting the financial statement.',
        error,
      });
    }
  },
};
