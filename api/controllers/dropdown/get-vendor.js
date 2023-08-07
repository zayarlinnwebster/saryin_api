const { Op, literal } = require('sequelize');

module.exports = {


  friendlyName: 'Get vendor',


  description: '',


  inputs: {

    search: {
      type: 'string',
      defaultsTo: '',
    },

    limit: {
      type: 'number',
      defaultsTo: 150,
      min: 1,
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
    search,
    limit
  }, exits) {
    search = search.trim() || '';

    const vendorList = await Vendor.findAll({
      attributes: [
        'id',
        'vendorName',
        [literal('(SELECT SUM(`InvoiceDetail`.`total_price`) FROM `invoice` AS `Invoice` INNER JOIN `invoice_detail` as `InvoiceDetail` ON `Invoice`.`id` = `InvoiceDetail`.`invoice_id` WHERE `InvoiceDetail`.`vendor_id` = `Vendor`.`id`)'), 'totalInvoiceAmount'],
        [literal('(SELECT SUM(`VendorPayment`.`paid_amount`) FROM `vendor_payment` AS `VendorPayment` WHERE `VendorPayment`.`vendor_id` = `Vendor`.`id`)'), 'totalPaidAmount'],
      ],
      where: {
        [Op.or]: [
          {
            vendorName: {
              [Op.startsWith]: search
            }
          }
        ]
      },
      limit: limit,
      subQuery: false,
    }).catch((err) => {
      console.log(err);
      return exits.serverError(err);
    });

    return exits.success({
      data: vendorList,
    });
  }


};
