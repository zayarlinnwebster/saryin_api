const { Op } = require('sequelize');

module.exports = {


  friendlyName: 'Get invoice by vendor id',


  description: '',


  inputs: {

    id: {
      type: 'number',
      required: true,
    },

    search: {
      type: 'string',
      allowNull: true,
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
    id, search, page, limit, fromDate, toDate, column, direction
  }, exits) {
    search = search.trim() || '';
    let orderTerm = [];

    const invoiceDetailSearch = {
      [Op.and]: [
        {
          '$invoice.invoice_date$': {
            [Op.between]: [fromDate, toDate]
          },
        },
        {
          vendorId: id
        }
      ],
      [Op.or]: [
        {
          '$invoice.customer.full_name$': {
            [Op.substring]: search,
          },
        },
      ],
    };

    if (column && direction && column !== 'paymentDate') {
      if (column.indexOf('customer') !== -1) {
        orderTerm = [[
          { model: Invoice, as: 'invoice' },
          { model: Customer, as: 'customer' },
          column.substr(column.indexOf('.') + 1), direction.toUpperCase()
        ]];
      } else if (column.indexOf('invoice') !== -1) {
        orderTerm = [[
          { model: Invoice, as: 'invoice' },
          column.substr(column.indexOf('.') + 1), direction.toUpperCase()
        ]];
      } else if (column.indexOf('item') !== -1) {
        orderTerm = [[
          { model: Item, as: 'item' },
          column.substr(column.indexOf('.') + 1), direction.toUpperCase()
        ]];
      } else {
        orderTerm = [[column, direction.toUpperCase()]];
      }
    }

    const invoiceCount = await InvoiceDetail.count({
      where: invoiceDetailSearch,
      include: [
        {
          model: Vendor,
          as: 'vendor',
          attributes: ['id', 'vendorName'],
          required: true,
        },
        {
          model: Invoice,
          as: 'invoice',
          required: true,
          attributes: ['invoiceDate'],
          include: {
            model: Customer,
            as: 'customer',
            attributes: ['id', 'fullName', 'commission'],
            required: true,
          },
        },
        {
          model: Item,
          as: 'item',
          attributes: ['id', 'itemName'],
          required: true,
        },
      ]
    }).catch((err) => {
      console.log(err);
      return exits.serverError(err);
    });

    const invoiceDetailList = await InvoiceDetail.findAll({
      where: invoiceDetailSearch,
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
          model: Invoice,
          as: 'invoice',
          required: true,
          attributes: ['invoiceDate'],
          include: {
            model: Customer,
            as: 'customer',
            attributes: ['id', 'fullName', 'commission'],
            required: true,
          },
        },
        {
          model: Item,
          as: 'item',
          attributes: ['id', 'itemName'],
          required: true,
        },
        {
          model: StockItem,
          as: 'stockItem',
          attributes: ['storedDate', 'storeId', 'marLaKar']
        }
      ]
    }).catch((err) => {
      console.log(err);
      return exits.serverError(err);
    });

    return exits.success({
      totalCounts: invoiceCount,
      data: invoiceDetailList,
    });

  },

};

