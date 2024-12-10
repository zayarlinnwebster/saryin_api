const { Op } = require("sequelize");

module.exports = {
  friendlyName: 'Create financial statement',

  description: 'Creates a financial statement and populates invoice and payment lists, then archives invoices and payments.',

  inputs: {
    financialStartDate: {
      type: 'string',
      required: true,
      description: 'The start date of the financial period.',
    },

    financialEndDate: {
      type: 'string',
      required: true,
      description: 'The end date of the financial period.',
    },

    remark: {
      type: 'string',
      allowNull: true,
      description: 'Optional remark for the financial statement.',
    },

    customerId: {
      type: 'number',
      required: true,
      description: 'The ID of the associated customer.',
    },

    totalCustomerPayment: {
      type: 'number',
      required: true,
      description: 'The total payment amount by the customer.',
    },

    totalCustomerInvoice: {
      type: 'number',
      required: true,
      description: 'The total invoice amount for the customer.',
    },

    totalStockInvoice: {
      type: 'number',
      required: true,
      description: 'The total stock invoice amount.',
    },

    totalItemCount: {
      type: 'number',
      required: true,
      description: 'The total number of items in the financial statement.',
    },

    totalBillClearedAmount: {
      type: 'number',
      required: true,
      description: 'The total bill cleared amount for the financial period.',
    },

    totalLeftAmount: {
      type: 'number',
      required: true,
      description: 'The total left amount after customer payments.',
    },

    totalCommission: {
      type: 'number',
      required: true,
      description: 'The total commission amount for the financial period.',
    },
  },

  exits: {
    success: {
      statusCode: 201,
      description: 'Financial statement created successfully with invoice and payment data.',
    },

    invalidValidation: {
      responseType: 'invalidValidation',
      description: 'Validation error occurred.',
    },

    serverError: {
      responseType: 'serverError',
      description: 'An unexpected server error occurred.',
    },
  },

  fn: async function (inputs, exits) {
    const transaction = await SequelizeConnections['mysqlServer'].transaction();

    try {
      // Step 0: Check for existing financial statement in the given date range
      const existingStatement = await FinancialStatement.findOne({
        where: {
          [Op.or]: [
            {
              financialStartDate: {
                [Op.lte]: inputs.financialEndDate,
              },
              financialEndDate: {
                [Op.gte]: inputs.financialStartDate,
              },
            },
          ],
          customerId: inputs.customerId,
        },
      });

      if (existingStatement) {
        console.log(existingStatement);

        // Rollback the transaction if already started
        await transaction.rollback();
        return exits.invalidValidation('ဤရက်စွဲအကွာအဝေးအတွက် နှစ်ချုပ်စာရင်းတစ်ခုရှိပြီးသားဖြစ်ပါသည်။');
      }

      // Step 1: Create financial statement
      const financialStatement = await FinancialStatement.create(
        {
          financialStartDate: inputs.financialStartDate,
          financialEndDate: inputs.financialEndDate,
          remark: inputs.remark,
          customerId: inputs.customerId,
          totalCustomerPayment: inputs.totalCustomerPayment,
          totalCustomerInvoice: inputs.totalCustomerInvoice,
          totalStockInvoice: inputs.totalStockInvoice,
          totalBillClearedAmount: inputs.totalBillClearedAmount,
          totalItemCount: inputs.totalItemCount,
          totalLeftAmount: inputs.totalLeftAmount,
          totalCommission: inputs.totalCommission,
        },
        { transaction }
      );

      const financialStatementId = financialStatement.id;

      // Step 2: Retrieve invoices within the date range
      const invoices = await Invoice.findAll({
        where: {
          invoiceDate: {
            [Op.between]: [inputs.financialStartDate, inputs.financialEndDate],
          },
          isArchived: 0,
          customerId: inputs.customerId,
        },
      });

      // Step 3: Retrieve payments within the date range
      const payments = await CustomerPayment.findAll({
        where: {
          paymentDate: {
            [Op.between]: [inputs.financialStartDate, inputs.financialEndDate],
          },
          isArchived: 0,
          customerId: inputs.customerId,
        },
      });

      await Invoice.update(
        {
          isArchived: 1,
          financialStatementId,
        },
        {
          where: {
            id: {
              [Op.in]: invoices.map((invoice) => invoice.id),
            },
          },
          transaction,
        }
      );

      await CustomerPayment.update(
        {
          isArchived: 1,
          financialStatementId,
        },
        {
          where: {
            id: {
              [Op.in]: payments.map((payment) => payment.id),
            },
          },
          transaction,
        }
      );

      // Step 7: Commit the transaction
      await transaction.commit();

      return exits.success({
        message: 'Financial statement created successfully.',
        financialStatement,
        invoiceCount: invoices.length,
        paymentCount: payments.length,
      });
    } catch (err) {
      // Rollback transaction on error
      await transaction.rollback();

      // Handle validation errors
      if (err.name === 'SequelizeValidationError') {
        return exits.invalidValidation(err);
      }

      // Handle general errors
      return exits.serverError(err);
    }
  },
};
