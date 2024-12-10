module.exports = {
  friendlyName: 'Delete payment',

  description: 'Delete a customer payment and update associated financial statement.',

  inputs: {
    id: {
      type: 'number',
      required: true,
    },
  },

  exits: {
    success: {
      statusCode: 200,
    },
    notFound: {
      responseType: 'notFound',
    },
    invalidValidation: {
      responseType: 'invalidValidation',
    },
    serverError: {
      responseType: 'serverError',
    },
  },

  fn: async function (inputs, exits) {
    // Start a transaction
    const transaction = await SequelizeConnections['mysqlServer'].transaction();

    try {
      // Find the CustomerPayment record
      const customerPayment = await CustomerPayment.findOne({
        where: { id: inputs.id },
      });

      if (!customerPayment) {
        return exits.notFound({ message: 'CustomerPayment not found.' });
      }

      // Check if the payment is associated with a financial statement
      if (customerPayment.financialStatementId) {
        const financialStatement = await FinancialStatement.findOne({
          where: { id: customerPayment.financialStatementId },
        });

        if (!financialStatement) {
          throw new Error('Associated FinancialStatement not found.');
        }

        // Update the financial statement by subtracting the payment amount
        await financialStatement.update(
          {
            totalCustomerPayment:
              +financialStatement.totalCustomerPayment -
              +customerPayment.paidAmount,
            totalLeftAmount:
              +financialStatement.totalLeftAmount +
              +customerPayment.paidAmount,
          },
          { transaction }
        );
      }

      // Delete the CustomerPayment record
      await CustomerPayment.destroy({
        where: { id: inputs.id },
        transaction,
      });

      // Commit the transaction
      await transaction.commit();

      // Return success response
      return exits.success({
        message: 'CustomerPayment deleted successfully and financial statement updated.',
      });
    } catch (err) {
      // Rollback the transaction on error
      console.error('Error:', err.message);
      await transaction.rollback();
      return exits.serverError({
        message: 'Failed to delete customer payment or update financial statement.',
        error: err.message,
      });
    }
  },
};
