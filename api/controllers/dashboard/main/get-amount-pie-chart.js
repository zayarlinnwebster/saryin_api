const { Op, literal } = require('sequelize');

module.exports = {


  friendlyName: 'Get amount pie chart',


  description: '',


  inputs: {

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
    fromDate, toDate
  }, exits) {
    let labels = [];
    let data = [];

    const customerList = await Customer.findAll({
      attributes: [
        'id',
        'commission',
        [literal('(SELECT SUM(`InvoiceDetail`.`total_price`) FROM `invoice` AS `Invoice` INNER JOIN `invoice_detail` as `InvoiceDetail` ON `Invoice`.`id` = `InvoiceDetail`.`invoice_id` WHERE `Invoice`.`customer_id` = `Customer`.`id` AND (DATE(`Invoice`.`invoice_date`) >= \'' + fromDate + '\' AND DATE(`Invoice`.`invoice_date`) <= \'' + toDate + '\'))'), 'totalInvoiceAmount'],
      ],
      subQuery: false,
    });

    const totalCommissionAmount = customerList.reduce(
      (accumulator, customer) => accumulator + (Number(customer.dataValues.totalInvoiceAmount) * Number(customer.commission) / 100),
      0
    );

    labels.push('ကော်မရှင်');
    data.push(Math.round(totalCommissionAmount) || 0);

    const customerTotalPayment = await CustomerPayment.sum('paidAmount', {
      where: {
        paymentDate: {
          [Op.between]: [fromDate, toDate]
        }
      }
    })
      .catch((err) => {
        console.log(err);
        return exits.serverError(err);
      });

    labels.push('ကုန်သည် လွှဲငွေ');
    data.push(customerTotalPayment || 0);

    const vendorTotalPayment = await VendorPayment.sum('paidAmount', {
      where: {
        paymentDate: {
          [Op.between]: [fromDate, toDate]
        }
      }
    })
      .catch((err) => {
        console.log(err);
        return exits.serverError(err);
      });

    labels.push('ပွဲရုံ သွင်းငွေ');
    data.push(vendorTotalPayment || 0);

    return exits.success({ labels, data });
  }

};
