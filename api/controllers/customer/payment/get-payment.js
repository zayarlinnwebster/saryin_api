const { Op, literal } = require('sequelize');

module.exports = {


  friendlyName: 'Get payment',


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

    const customerPaymentSearch = {
      [Op.and]: [
        {
          paymentDate: {
            [Op.between]: [fromDate, toDate]
          },
        },
      ],
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
        orderTerm = [[{ model: Customer, as: 'customer' }, column.substr(column.indexOf('.') + 1), direction.toUpperCase()]];
      } else {
        orderTerm = [[column, direction.toUpperCase()]];
      }
    }

    const customerPaymentCount = await CustomerPayment.count({
      where: customerPaymentSearch,
      include: [
        {
          model: Customer,
          as: 'customer',
          attributes: ['id', 'fullName', 'commission'],
        },
      ],
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
        // eslint-disable-next-line quotes
        [literal("(SELECT SUM(`CustomerPayment`.`paid_amount`) FROM `customer_payment` AS `CustomerPayment` WHERE `CustomerPayment`.`customer_id` = `customer`.`id` AND (DATE(`payment_date`) >= '" + fromDate + "' AND DATE(`payment_date`) <= '" + toDate + "'))"), 'totalPaidAmount'],
        // eslint-disable-next-line quotes
        [literal("(SELECT SUM(`InvoiceDetail`.`total_price`) FROM `invoice` AS `Invoice` INNER JOIN `invoice_detail` as `InvoiceDetail` ON `Invoice`.`id` = `InvoiceDetail`.`invoice_id` WHERE `Invoice`.`customer_id` = `customer`.`id` AND (DATE(`Invoice`.`invoice_date`) >= '" + fromDate + "' AND DATE(`Invoice`.`invoice_date`) <= '" + toDate + "'))"), 'totalInvoiceAmount'],
      ],
      where: customerPaymentSearch,
      offset: limit * (page - 1),
      limit: limit,
      subQuery: false,
      order: orderTerm,
      include: [
        {
          model: Customer,
          as: 'customer',
          attributes: ['id', 'fullName', 'commission'],
        },
      ],
    }).catch((err) => {
      console.log(err);
      return exits.serverError(err);
    });

    const totalPaidAmount = customerPaymentList.reduce(
      (accumulator, currentValue) => accumulator + Number(currentValue.paidAmount), 0);

    return exits.success({
      totalCounts: customerPaymentCount,
      data: customerPaymentList,
      totalAmount: {
        totalPaidAmount
      },
    });

  },

};

