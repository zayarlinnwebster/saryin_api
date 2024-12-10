module.exports = {
  friendlyName: 'Create customer payment',

  description: 'Create a customer payment and update related financial statements.',

  inputs: {
    paymentDate: {
      type: 'ref',
      required: true,
    },
    paidAmount: {
      type: 'number',
      required: true,
    },
    paidBy: {
      type: 'string',
      required: true,
    },
    transactionNo: {
      type: 'string',
      allowNull: true,
    },
    customerId: {
      type: 'number',
      required: true,
    },
    commission: {
      type: 'number',
      required: true,
    },
    financialStatementId: {
      type: 'number',
      allowNull: true,
    },
  },

  exits: {
    success: {
      statusCode: 201,
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
      // Flag to archive
      let isArchived = 0;

      if (inputs.financialStatementId) {
        // Fetch the financial statement
        const financialStatement = await FinancialStatement.findOne({
          where: { id: inputs.financialStatementId },
        });

        if (!financialStatement) {
          throw new Error('FinancialStatement not found');
        }

        // Update the financial statement
        await financialStatement.update(
          {
            totalCustomerPayment:
              +financialStatement.totalCustomerPayment + +inputs.paidAmount,
            totalLeftAmount:
              +financialStatement.totalLeftAmount - +inputs.paidAmount,
          },
          { transaction }
        );

        // Set isArchived to 1 since financialStatementId exists
        isArchived = 1;
      }

      // Add the isArchived field to inputs
      const customerPaymentData = {
        ...inputs,
        isArchived,
      };

      // Create the customer payment
      const createdCustomerPayment = await CustomerPayment.create(customerPaymentData, {
        transaction,
      });

      // Commit the transaction
      await transaction.commit();

      // Success response
      return exits.success({
        message: 'Customer payment created successfully, and FinancialStatement updated.',
        data: createdCustomerPayment,
      });
    } catch (err) {
      // Rollback the transaction on error
      console.error('Error:', err.message);
      await transaction.rollback();
      return exits.serverError({
        message: 'Failed to create customer payment or update financial statement.',
        error: err.message,
      });
    }
  },
};
