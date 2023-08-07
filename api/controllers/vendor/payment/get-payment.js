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

    const vendorPaymentSearch = {
      [Op.and]: [
        {
          paymentDate: {
            [Op.between]: [fromDate, toDate]
          },
        },
      ],
      [Op.or]: [
        {
          '$vendor.vendor_name$': {
            [Op.substring]: search,
          },
        },
      ],
    };

    if (column && direction) {
      if (column.indexOf('vendor') !== -1) {
        orderTerm = [[{ model: Vendor, as: 'vendor' }, column.substr(column.indexOf('.') + 1), direction.toUpperCase()]];
      } else {
        orderTerm = [[column, direction.toUpperCase()]];
      }
    }

    const vendorPaymentCount = await VendorPayment.count({
      where: vendorPaymentSearch,
      offset: limit * (page - 1),
      limit: limit,
      include: [
        {
          model: Vendor,
          as: 'vendor',
          attributes: ['id', 'vendorName'],
        },
      ],
    }).catch((err) => {
      console.log(err);
      return exits.serverError(err);
    });

    const vendorPaymentList = await VendorPayment.findAll({
      attributes: [
        'id',
        'vendorId',
        'paidBy',
        'paidAmount',
        'transactionNo',
        'paymentDate',
        [literal('(SELECT SUM(`VendorPayment`.`paid_amount`) FROM `vendor_payment` AS `VendorPayment` WHERE `VendorPayment`.`vendor_id` = `vendor`.`id` AND (DATE(`payment_date`) >= \'' + fromDate + '\' AND DATE(`payment_date`) <= \'' + toDate + '\'))'), 'totalPaidAmount'],
        [literal('(SELECT SUM(`InvoiceDetail`.`total_price`) FROM `invoice` AS `Invoice` INNER JOIN `invoice_detail` as `InvoiceDetail` ON `Invoice`.`id` = `InvoiceDetail`.`invoice_id` WHERE `InvoiceDetail`.`vendor_id` = `vendor`.`id` AND (DATE(`Invoice`.`invoice_date`) >= \'' + fromDate + '\' AND DATE(`Invoice`.`invoice_date`) <= \'' + toDate + '\'))'), 'totalInvoiceAmount'],
      ],
      where: vendorPaymentSearch,
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
      ],
    }).catch((err) => {
      console.log(err);
      return exits.serverError(err);
    });

    const totalPaidAmount = vendorPaymentList.reduce(
      (accumulator, currentValue) => accumulator + Number(currentValue.paidAmount), 0);

    return exits.success({
      totalCounts: vendorPaymentCount,
      data: vendorPaymentList,
      totalAmount: {
        totalPaidAmount
      },
    });

  },

};

