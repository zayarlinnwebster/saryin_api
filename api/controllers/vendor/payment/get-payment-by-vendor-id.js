const { Op } = require('sequelize');

module.exports = {


  friendlyName: 'Get payment by vendor id',


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

    fromDate: {
      type: 'ref',
      required: true,
    },

    toDate: {
      type: 'ref',
      required: true,
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
    id, page, limit, fromDate, toDate, column, direction
  }, exits) {
    let orderTerm = [];

    const paymentSearch = {
      [Op.and]: [
        {
          paymentDate: {
            [Op.between]: [fromDate, toDate]
          },
        },
        {
          vendorId: id
        }
      ],
    };

    if (column && direction) {
      orderTerm = [[column, direction.toUpperCase()]];
    }

    const vendorPaymentCount = await VendorPayment.count({
      where: paymentSearch,
      offset: limit * (page - 1),
      limit: limit,
    }).catch((err) => {
      console.log(err);
      return exits.serverError(err);
    });

    const vendorPaymentList = await VendorPayment.findAll({
      attributes: [
        'id',
        'vendorId',
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
      include: [
        {
          model: Vendor,
          as: 'vendor',
          attributes: ['id', 'vendorName'],
          required: true,
        },
      ],
    }).catch((err) => {
      console.log(err);
      return exits.serverError(err);
    });

    return exits.success({
      totalCounts: vendorPaymentCount,
      data: vendorPaymentList,
    });

  },

};
