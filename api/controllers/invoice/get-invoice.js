const { Op } = require('sequelize');

module.exports = {


  friendlyName: 'Get invoice',


  description: '',


  inputs: {

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
    page, limit, search, fromDate, toDate, column, direction
  }, exits) {

    search = search.trim() || '';
    let orderTerm = [];

    const invoiceSearch = {
      [Op.and]: [
        {
          invoiceDate: {
            [Op.between]: [fromDate, toDate]
          },
        }],
      [Op.or]: [
        {
          '$customer.full_name$': {
            [Op.substring]: search,
          },
        },
      ],
    };

    if (column && direction) {
      if (column.indexOf('customer') !== -1) {
        orderTerm = [[
          { model: Customer, as: 'customer' },
          column.substr(column.indexOf('.') + 1), direction.toUpperCase()
        ]];
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
          model: Customer,
          as: 'customer',
          attributes: ['id', 'fullName', 'commission'],
          required: true,
        },
        {
          model: InvoiceDetail,
          as: 'invoiceDetails',
          include: [
            {
              model: Item,
              as: 'item',
              attributes: ['id', 'itemName'],
            },
            {
              model: Vendor,
              as: 'vendor',
              attributes: ['id', 'vendorName'],
            },
          ]
        }
      ],
    }).catch((err) => {
      console.log(err);
      return exits.serverError(err);
    });

    const invoiceList = await Invoice.findAll({
      where: invoiceSearch,
      offset: limit * (page - 1),
      limit: limit,
      order: orderTerm,
      subQuery: false,
      include: [
        {
          model: Customer,
          as: 'customer',
          attributes: ['id', 'fullName', 'commission'],
          required: true,
        },
        {
          model: InvoiceDetail,
          as: 'invoiceDetails',
          include: [
            {
              model: Item,
              as: 'item',
              attributes: ['id', 'itemName']
            },
            {
              model: Vendor,
              as: 'vendor',
              attributes: ['id', 'vendorName'],
            },
          ]
        }
      ],
    }).catch((err) => {
      console.log(err);
      return exits.serverError(err);
    });

    const totalInvoiceAmount = invoiceList.reduce(
      (accumulator, currentValue) => accumulator + Number(currentValue.totalAmount), 0);

    return exits.success({
      totalCounts: invoiceCount,
      data: invoiceList,
      totalAmount: {
        totalInvoiceAmount,
      }
    });

  },

};


