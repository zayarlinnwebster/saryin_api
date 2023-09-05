const { Op } = require('sequelize');

module.exports = {


  friendlyName: 'Get customer usage by id',


  description: '',


  inputs: {


    id: {
      type: 'number',
      required: true,
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
    id, search, fromDate, toDate
  }, exits) {
    search = search.trim() || '';

    const totalCustomerPayment = await CustomerPayment.sum('paidAmount', {
      where: {
        paymentDate: {
          [Op.between]: [fromDate, toDate]
        },
        customerId: id,
      }
    }).catch((err) => {
      console.log(err);
      return exits.serverError(err);
    });

    const totalCustomerInvoice = await InvoiceDetail.sum('totalPrice', {
      where: {
        [Op.or]: [
          {
            '$vendor.vendor_name$': {
              [Op.substring]: search,
            },
          },
        ],
        [Op.and]: [
          {
            '$invoice.invoice_date$': {
              [Op.between]: [fromDate, toDate]
            },
          },
          {
            '$invoice.customer_id$': id
          }
        ],
      },
      include: [
        {
          model: Invoice,
          as: 'invoice',
          attributes: [],
          required: true,
        },
        {
          model: Vendor,
          as: 'vendor',
          attributes: [],
          required: true,
        }
      ]
    }).catch((err) => {
      console.log(err);
      return exits.serverError(err);
    });

    return exits.success({
      totalCustomerInvoice,
      totalCustomerPayment,
    });


  }


};
