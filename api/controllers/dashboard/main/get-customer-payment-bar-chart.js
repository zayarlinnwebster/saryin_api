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

    const customerSearch = {
      [Op.and]: [
        {
          '$invoiceDetails.invoice.invoice_date$': {
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
        [literal('(SELECT SUM(`InvoiceDetail`.`total_price`) FROM `invoice` AS `Invoice` INNER JOIN `invoice_detail` as `InvoiceDetail` ON `Invoice`.`id` = `InvoiceDetail`.`invoice_id` WHERE `InvoiceDetail`.`customer_id` = `Customer`.`id`)'), 'totalInvoiceAmount'],
        [literal('(SELECT SUM(`CustomerPayment`.`paid_amount`) FROM `customer_payment` AS `CustomerPayment` WHERE `CustomerPayment`.`customer_id` = `Customer`.`id`)'), 'totalPaidAmount'],
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
          model: InvoiceDetail,
          as: 'invoiceDetails',
          required: true,
          attributes: [],
          include: {
            model: Invoice,
            as: 'invoice',
            attributes: [],
          }
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
