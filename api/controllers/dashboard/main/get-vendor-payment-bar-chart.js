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

    const vendorSearch = {
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
          vendorName: {
            [Op.substring]: search,
          },
        },
      ],
    };

    const vendorList = await Vendor.findAll({
      attributes: [
        'vendorName',
        [literal('(SELECT SUM(`VendorPayment`.`paid_amount`) FROM `vendor_payment` AS `VendorPayment` WHERE `VendorPayment`.`vendor_id` = `Vendor`.`id`)'), 'totalPaidAmount'],
        [literal('(SELECT SUM(`Invoice`.`total_amount`) FROM `invoice` AS `Invoice` WHERE `Invoice`.`vendor_id` = `Vendor`.`id`)'), 'totalInvoiceAmount'],],
      where: vendorSearch,
      include: [
        {
          model: VendorPayment,
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
      group: ['Vendor.id'],
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
