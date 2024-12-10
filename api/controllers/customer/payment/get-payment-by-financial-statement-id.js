const { Op } = require("sequelize");

module.exports = {


  friendlyName: 'Get payment by financial statement id',


  description: '',


  inputs: {

    id: {
      type: 'number',
      required: true,
    },

    page: {
      type: 'number',
      defaultsTo: 1,
      min: 1,
    },

    limit: {
      type: 'number',
      defaultsTo: 1000000,
      min: 1,
    },

    search: {
      type: 'string',
      defaultsTo: '',
    },

    column: {
      type: 'string',
      defaultsTo: '',
    },

    direction: {
      type: 'string',
      defaultsTo: '',
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
    id, page, limit, search, column, direction
  }, exits) {

    search = search.trim() || '';
    let orderTerm = [];
    const paymentSearch = {
      financialStatementId: id,
    };

    if (column && direction && column !== 'invoiceDate') {
      orderTerm = [[column, direction.toUpperCase()]];
    }

    const customerPaymentCount = await CustomerPayment.count({
      where: paymentSearch,
    }).catch((err) => {
      console.log(err);
      return exits.serverError(err);
    });

    const customerPaymentList = await CustomerPayment.findAll({
      attributes: [
        'id',
        'customerId',
        'paidBy',
        'paidAmount',
        'transactionNo',
        'paymentDate',
      ],
      where: paymentSearch,
      offset: limit * (page - 1),
      limit: limit,
      subQuery: false,
      order: orderTerm,
    }).catch((err) => {
      console.log(err);
      return exits.serverError(err);
    });

    const totalAmount = customerPaymentList.reduce(
      (accumulator, currentValue) => accumulator + Number(currentValue.paidAmount), 0);

    return exits.success({
      totalCounts: customerPaymentCount,
      data: customerPaymentList,
      totalAmount
    });

  },

};
