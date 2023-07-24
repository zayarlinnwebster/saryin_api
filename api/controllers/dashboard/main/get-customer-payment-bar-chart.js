const { Op, fn, col } = require('sequelize');

module.exports = {


  friendlyName: 'Get customer payment bar chart',


  description: '',


  inputs: {

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
    search, fromDate, toDate
  }, exits) {
    const data = [];
    search = search.trim() || '';

    const customerSearch = {
      [Op.and]: [
        {
          '$invoices.invoice_date$': {
            [Op.between]: [fromDate, toDate]
          },
        },
        {
          '$payments.payment_date$': {
            [Op.between]: [fromDate, toDate]
          },
        }
      ],
      [Op.or]: [
        {
          fullName: {
            [Op.substring]: search,
          },
        },
      ],
    };

    const customerList = await Customer.findAll({
      attributes: [
        'fullName',
        [fn('sum', col('payments.paid_amount')), 'totalPaidAmount'],
        [fn('sum', col('invoices.total_amount')), 'totalInvoiceAmount']
      ],
      where: customerSearch,
      include: [
        {
          model: CustomerPayment,
          as: 'payments',
          duplicating: false,
          attributes: [],
        },
        {
          model: Invoice,
          as: 'invoices',
          duplicating: false,
          attributes: [],
        }
      ],
      group: ['Customer.id'],
      order: [['totalInvoiceAmount', 'DESC']]
    }).catch((err) => {
      console.log(err);
      return exits.serverError(err);
    });

    const labels = customerList.map(customer => customer.fullName);
    data.push({
      name: 'နယ်ပို့ငွေ',
      data: customerList.map(customer => customer.dataValues.totalInvoiceAmount)
    });

    data.push({
      name: 'လွှဲငွေ',
      data: customerList.map(customer => customer.dataValues.totalPaidAmount)
    });

    return exits.success({ labels, data });

  }


};
