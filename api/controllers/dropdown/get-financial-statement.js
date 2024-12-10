module.exports = {


  friendlyName: 'Get financial statement',


  description: '',


  inputs: {

    customerId: {
      type: 'number',
      defaultsTo: 0,
    },

    limit: {
      type: 'number',
      defaultsTo: 150,
      min: 1,
    },

  },


  exits: {

    success: {
      statusCode: 200,
    },

    serverError: {
      responseType: 'serverError',
    },

  },


  fn: async function ({
    customerId,
    limit
  }, exits) {
    const financialStatementList = await FinancialStatement.findAll({
      attributes: ['id', 'financialStartDate', 'financialEndDate', 'remark'],
      where: customerId ? { customerId } : {},
      limit: limit,
    }).catch((err) => {
      console.log(err);
      return exits.serverError(err);
    });

    // Add `financialPeriod` field by looping over the results
    const processedFinancialStatements = financialStatementList.map((statement) => ({
      ...statement.toJSON(),
      financialPeriod: `${statement.financialStartDate} မှ ${statement.financialEndDate} ထိ`,
    }));

    return exits.success({
      data: processedFinancialStatements,
    });
  }


};
