const { Op, literal } = require('sequelize');

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

    const customerList = await Customer.findAll({
      attributes: [
        'fullName',
        [literal('(SELECT SUM(`InvoiceDetail`.`total_price`) FROM `invoice` AS `Invoice` INNER JOIN `invoice_detail` as `InvoiceDetail` ON `Invoice`.`id` = `InvoiceDetail`.`invoice_id` WHERE `Invoice`.`customer_id` = `Customer`.`id` AND (DATE(`Invoice`.`invoice_date`) >= \'' + fromDate + '\' AND DATE(`Invoice`.`invoice_date`) <= \'' + toDate + '\'))'), 'totalInvoiceAmount'],
        [literal('(SELECT SUM(`CustomerPayment`.`paid_amount`) FROM `customer_payment` AS `CustomerPayment` WHERE `CustomerPayment`.`customer_id` = `Customer`.`id` AND (DATE(`payment_date`) >= \'' + fromDate + '\' AND DATE(`payment_date`) <= \'' + toDate + '\'))'), 'totalPaidAmount'],
      ],
      where: {
        [Op.or]: [
          {
            fullName: {
              [Op.substring]: search,
            },
          },
        ],
      },
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
