const { Op } = require('sequelize');

module.exports = {


  friendlyName: 'Get invoice detail',


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

    const invoiceDetailSearch = {
      [Op.and]: [
        {
          '$invoice.invoice_date$': {
            [Op.between]: [fromDate, toDate]
          },
        }],
      [Op.or]: [
        {
          '$invoice.customer.full_name$': {
            [Op.substring]: search,
          },
        },
        {
          '$vendor.vendor_name$': {
            [Op.substring]: search,
          },
        },
        {
          '$item.item_name$': {
            [Op.substring]: search,
          },
        },
      ],
    };

    if (column && direction) {
      if (column.indexOf('vendor') !== -1) {
        orderTerm = [[
          { model: Vendor, as: 'vendor' },
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
      } else if (column.indexOf('customer') !== -1) {
        orderTerm = [[
          { model: Invoice, as: 'invoice' },
          { model: Customer, as: 'customer' },
          column.substr(column.indexOf('.') + 1), direction.toUpperCase()
        ]];
      } else {
        orderTerm = [[column, direction.toUpperCase()]];
      }
    }

    const invoiceDetailCount = await InvoiceDetail.count({
      where: invoiceDetailSearch,
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
          model: Invoice,
          as: 'invoice',
          required: true,
          include: [
            {
              model: Customer,
              as: 'customer',
              attributes: ['id', 'fullName', 'commission'],
              required: true,
            },
          ]
        },
        {
          model: Item,
          as: 'item',
          attributes: ['id', 'itemName'],
          required: true,
        }
      ]
    }).catch((err) => {
      console.log(err);
      return exits.serverError(err);
    });

    const invoiceDetailList = await InvoiceDetail.findAll({
      where: invoiceDetailSearch,
      offset: limit * (page - 1),
      limit: limit,
      order: orderTerm,
      subQuery: false,
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
          include: [
            {
              model: Customer,
              as: 'customer',
              attributes: ['id', 'fullName', 'commission'],
              required: true,
            },
          ]
        },
        {
          model: Item,
          as: 'item',
          attributes: ['id', 'itemName'],
          required: true,
        }
      ],
    }).catch((err) => {
      console.log(err);
      return exits.serverError(err);
    });

    const totalInvoiceDetailAmount = invoiceDetailList.reduce(
      (accumulator, currentValue) => accumulator + Number(currentValue.totalPrice), 0);

    const totalGeneralAmount = invoiceDetailList.reduce(
      (accumulator, currentValue) => accumulator + Number(currentValue.generalFee), 0);

    const totalLaborAmount = invoiceDetailList.reduce(
      (accumulator, currentValue) => accumulator + Number(currentValue.laborFee), 0);

    return exits.success({
      totalCounts: invoiceDetailCount,
      data: invoiceDetailList,
      totalAmount: {
        totalInvoiceDetailAmount,
        totalGeneralAmount,
        totalLaborAmount
      }
    });

  },

};

