const { Op, literal } = require('sequelize');

module.exports = {


  friendlyName: 'Get vendor payment bar chart',


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

    const vendorList = await Vendor.findAll({
      attributes: [
        'vendorName',
        [literal('(SELECT SUM(`VendorPayment`.`paid_amount`) FROM `vendor_payment` AS `VendorPayment` WHERE `VendorPayment`.`vendor_id` = `Vendor`.`id` AND (DATE(`payment_date`) >= \'' + fromDate + '\' AND DATE(`payment_date`) <= \'' + toDate + '\'))'), 'totalPaidAmount'],
        [literal('(SELECT SUM(`InvoiceDetail`.`total_price`) FROM `invoice` AS `Invoice` INNER JOIN `invoice_detail` as `InvoiceDetail` ON `Invoice`.`id` = `InvoiceDetail`.`invoice_id` WHERE `InvoiceDetail`.`vendor_id` = `Vendor`.`id` AND (DATE(`Invoice`.`invoice_date`) >= \'' + fromDate + '\' AND DATE(`Invoice`.`invoice_date`) <= \'' + toDate + '\'))'), 'totalInvoiceAmount'],
      ],
      where: {
        [Op.or]: [
          {
            vendorName: {
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

    const labels = vendorList.map(vendor => vendor.vendorName);
    data.push({
      name: 'နယ်ပို့ငွေ',
      data: vendorList.map(vendor => vendor.dataValues.totalInvoiceAmount)
    });

    data.push({
      name: 'သွင်းငွေ',
      data: vendorList.map(vendor => vendor.dataValues.totalPaidAmount)
    });

    return exits.success({ labels, data });

  }


};
