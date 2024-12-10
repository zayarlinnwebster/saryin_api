module.exports = {
  friendlyName: 'Update payment',

  description: 'Update a customer payment and handle financial statement recalculations if changed.',

  inputs: {
    id: {
      type: 'number',
      required: true,
    },
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
      // Find the existing CustomerPayment record
      const customerPayment = await CustomerPayment.findOne({
        where: { id: inputs.id },
      });

      if (!customerPayment) {
        return exits.notFound({ message: 'CustomerPayment not found.' });
      }

      const amountDifference = +inputs.paidAmount - +customerPayment.paidAmount;

      // Handle financialStatementId changes
      if (customerPayment.financialStatementId !== inputs.financialStatementId) {
        if (customerPayment.financialStatementId) {
          // Adjust the old financial statement
          const oldFinancialStatement = await FinancialStatement.findOne({
            where: { id: customerPayment.financialStatementId },
          });

          if (oldFinancialStatement) {
            await oldFinancialStatement.update(
              {
                totalCustomerPayment:
                  +oldFinancialStatement.totalCustomerPayment -
                  +customerPayment.paidAmount,
                totalLeftAmount:
                  +oldFinancialStatement.totalLeftAmount +
                  +customerPayment.paidAmount,
              },
              { transaction }
            );
          }
        }

        if (inputs.financialStatementId) {
          // Adjust the new financial statement
          const newFinancialStatement = await FinancialStatement.findOne({
            where: { id: inputs.financialStatementId },
          });

          if (!newFinancialStatement) {
            throw new Error('New FinancialStatement not found');
          }

          await newFinancialStatement.update(
            {
              totalCustomerPayment:
                +newFinancialStatement.totalCustomerPayment +
                +inputs.paidAmount,
              totalLeftAmount:
                +newFinancialStatement.totalLeftAmount - +inputs.paidAmount,
            },
            { transaction }
          );
        }
      } else if (inputs.financialStatementId) {
        // If financialStatementId is unchanged, update the same financial statement
        const financialStatement = await FinancialStatement.findOne({
          where: { id: inputs.financialStatementId },
        });

        if (!financialStatement) {
          throw new Error('FinancialStatement not found');
        }

        await financialStatement.update(
          {
            totalCustomerPayment:
              +financialStatement.totalCustomerPayment + amountDifference,
            totalLeftAmount:
              +financialStatement.totalLeftAmount - amountDifference,
          },
          { transaction }
        );
      }

      // Determine isArchived status
      const isArchived = inputs.financialStatementId ? 1 : 0;

      // Update the CustomerPayment record
      const updatedCustomerPayment = await customerPayment.update(
        {
          paymentDate: inputs.paymentDate,
          paidAmount: inputs.paidAmount,
          paidBy: inputs.paidBy,
          transactionNo: inputs.transactionNo,
          customerId: inputs.customerId,
          commission: inputs.commission,
          financialStatementId: inputs.financialStatementId,
          isArchived: isArchived,
        },
        { transaction }
      );

      // Commit the transaction
      await transaction.commit();

      // Return success response
      return exits.success({
        message: 'Customer payment updated successfully, and FinancialStatement recalculated.',
        data: updatedCustomerPayment,
      });
    } catch (err) {
      // Rollback the transaction on error
      console.error('Error:', err.message);
      await transaction.rollback();
      return exits.serverError({
        message: 'Failed to update customer payment or adjust financial statements.',
        error: err.message,
      });
    }
  },
};
