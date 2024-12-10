module.exports = {


  friendlyName: 'Get financial statement by id',


  description: '',


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

    serverError: {
      responseType: 'serverError',
    },

  },


  fn: async function ({
    id,
  }, exits) {

    let financialStatement = await FinancialStatement.findOne({
      where: {
        id,
      },
      include: [
        {
          model: Customer,
          as: 'customer',
          required: true,
        }
      ]
    })
      .catch((err) => {
        return exits.serverError(err);
      });

    return exits.success({
      data: financialStatement
    });

  }


};
