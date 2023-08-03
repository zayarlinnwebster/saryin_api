const { Op, literal } = require('sequelize');

module.exports = {


  friendlyName: 'Get payment by customer id',


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
      paymentDate: {
        [Op.between]: [fromDate, toDate]
      },
      customerId: id
    };

    if (column && direction && column !== 'invoiceDate' && column !== 'vendor.vendorName') {
      orderTerm = [[column, direction.toUpperCase()]];
    }

    const customerPaymentCount = await CustomerPayment.count({
      where: paymentSearch,
      offset: limit * (page - 1),
      limit: limit,
    }).catch((err) => {
      console.log(err);
      return exits.serverError(err);
    });

    const customerPaymentList = await CustomerPayment.findAll({
      attributes: [
        'id',
        'customerId',
        'paidBy',
        'paidAmount',
        'transactionNo',
        'paymentDate',
        [literal('(SELECT SUM(`CustomerPayment`.`paid_amount`) FROM `customer_payment` AS `CustomerPayment` WHERE `CustomerPayment`.`customer_id` = `customer`.`id` AND (DATE(`payment_date`) >= \'' + fromDate + '\' AND DATE(`payment_date`) <= \'' + toDate + '\'))'), 'totalPaidAmount'],
        // eslint-disable-next-line quotes
        [literal("(SELECT SUM(`InvoiceDetail`.`total_price`) FROM `invoice` AS `Invoice` INNER JOIN `invoice_detail` as `InvoiceDetail` ON `Invoice`.`id` = `InvoiceDetail`.`invoice_id` WHERE `InvoiceDetail`.`customer_id` = `customer`.`id` AND (DATE(`Invoice`.`invoice_date`) >= '" + fromDate + "' AND DATE(`Invoice`.`invoice_date`) <= '" + toDate + "'))"), 'totalInvoiceAmount'],
      ],
      where: paymentSearch,
      offset: limit * (page - 1),
      limit: limit,
      subQuery: false,
      order: orderTerm,
      include: [
        {
          model: Customer,
          as: 'customer',
          attributes: ['id', 'fullName', 'commission'],
          required: true,
        },
      ],
    }).catch((err) => {
      console.log(err);
      return exits.serverError(err);
    });

    return exits.success({
      totalCounts: customerPaymentCount,
      data: customerPaymentList,
    });

  },

};

