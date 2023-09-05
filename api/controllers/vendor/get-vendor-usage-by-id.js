const { Op } = require('sequelize');

module.exports = {


  friendlyName: 'Get vendor usage by id',


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

    const totalVendorPayment = await VendorPayment.sum('paidAmount', {
      where: {
        paymentDate: {
          [Op.between]: [fromDate, toDate]
        },
        vendorId: id,
      }
    }).catch((err) => {
      console.log(err);
      return exits.serverError(err);
    });

    const totalVendorInvoice = await InvoiceDetail.sum('totalPrice', {
      where: {
        [Op.or]: [
          {
            '$invoice.customer.full_name$': {
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
            vendorId: id
          }
        ],
      },
      include: {
        model: Invoice,
        as: 'invoice',
        attributes: [],
        required: true,
        include: {
          model: Customer,
          as: 'customer',
          attributes: [],
          required: true,
        }
      },
    }).catch((err) => {
      console.log(err);
      return exits.serverError(err);
    });

    const totalBillClearedVendorInvoice = await InvoiceDetail.sum('totalPrice', {
      where: {
        [Op.or]: [
          {
            '$invoice.customer.full_name$': {
              [Op.substring]: search,
            },
          },
        ],
        '$invoice.invoice_date$': {
          [Op.between]: [fromDate, toDate]
        },
        vendorId: id,
        isBillCleared: true,
      },
      include: {
        model: Invoice,
        as: 'invoice',
        attributes: [],
        required: true,
        include: {
          model: Customer,
          as: 'customer',
          attributes: [],
          required: true,
        }
      },
    }).catch((err) => {
      console.log(err);
      return exits.serverError(err);
    });

    return exits.success({
      totalVendorInvoice,
      totalBillClearedVendorInvoice,
      totalVendorPayment,
    });


  }


};
