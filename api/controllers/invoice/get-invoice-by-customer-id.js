const { Op } = require('sequelize');

module.exports = {


  friendlyName: 'Get invoice by customer id',


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
    id, page, limit, search, fromDate, toDate, column, direction
  }, exits) {

    search = search.trim() || '';
    let orderTerm = [];

    const invoiceSearch = {
      [Op.and]: [
        {
          invoiceDate: {
            [Op.between]: [fromDate, toDate]
          },
        },
        {
          customerId: id
        }
      ],
      [Op.or]: [
        {
          '$vendor.vendor_name$': {
            [Op.substring]: search,
          },
        },
      ],
    };

    if (column && direction && column !== 'paymentDate') {
      if (column.indexOf('vendor') !== -1) {
        orderTerm = [[{ model: Vendor, as: 'vendor' }, column.substr(column.indexOf('.') + 1), direction.toUpperCase()]];
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
          model: Customer,
          as: 'customer',
          attributes: ['id', 'fullName'],
          required: true,
        },
        {
          model: InvoiceDetail,
          as: 'invoiceDetails',
          include: {
            model: Item,
            as: 'item',
            attributes: ['id', 'itemName']
          }
        }
      ],
    }).catch((err) => {
      console.log(err);
      return exits.serverError(err);
    });

    const invoiceList = await Invoice.findAll({
      attributes: [
        'id',
        'invoiceDate',
        'totalItemAmount',
        'laborFee',
        'generalFee',
        'commission',
        'commissionFee',
        'totalAmount',
        'vendorId',
        'customerId',
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
          model: Customer,
          as: 'customer',
          attributes: ['id', 'fullName'],
          required: true,
        },
        {
          model: InvoiceDetail,
          as: 'invoiceDetails',
          required: true,
          include: {
            model: Item,
            as: 'item',
            attributes: ['id', 'itemName']
          }
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

