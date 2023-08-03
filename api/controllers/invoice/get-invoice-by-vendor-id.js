const { Op } = require('sequelize');

module.exports = {


  friendlyName: 'Get invoice by vendor id',


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

    const invoiceSearch = {
      invoiceDate: {
        [Op.between]: [fromDate, toDate]
      },
      vendorId: id
    };

    if (column && direction && column !== 'paymentDate') {
      if (column.indexOf('customer') !== -1) {
        orderTerm = [[{ model: Customer, as: 'customer' }, column.substr(column.indexOf('.') + 1), direction.toUpperCase()]];
      } else {
        orderTerm = [[column, direction.toUpperCase()]];
      }
    }

    const invoiceCount = await Invoice.count({
      where: invoiceSearch,
      offset: limit * (page - 1),
      limit: limit,
      include: [
        {
          model: Vendor,
          as: 'vendor',
          attributes: ['id', 'vendorName'],
          required: true,
        },
        {
          model: InvoiceDetail,
          as: 'invoiceDetails',
          include: [
            {
              model: Customer,
              as: 'customer',
              attributes: ['id', 'fullName', 'commission'],
              required: true,
            },
            {
              model: Item,
              as: 'item',
              attributes: ['id', 'itemName']
            }
          ]
        }
      ],
    }).catch((err) => {
      console.log(err);
      return exits.serverError(err);
    });

    const invoiceList = await Invoice.findAll({
      attributes: [
        'id',
        'invoiceNo',
        'invoiceDate',
        'totalItemAmount',
        'laborFee',
        'generalFee',
        'totalAmount',
        'vendorId',
      ],
      where: invoiceSearch,
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
        {
          model: InvoiceDetail,
          as: 'invoiceDetails',
          required: true,
          include: [
            {
              model: Customer,
              as: 'customer',
              attributes: ['id', 'fullName', 'commission'],
              required: true,
            },
            {
              model: Item,
              as: 'item',
              attributes: ['id', 'itemName']
            }
          ]
        }
      ],
    }).catch((err) => {
      console.log(err);
      return exits.serverError(err);
    });

    return exits.success({
      totalCounts: invoiceCount,
      data: invoiceList,
    });

  },

};

