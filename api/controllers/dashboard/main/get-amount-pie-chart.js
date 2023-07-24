const { Op } = require('sequelize');

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

    const invoiceTotalAmount = await Invoice.sum('totalAmount', {
      where: {
        invoiceDate: {
          [Op.between]: [fromDate, toDate]
        }
      }
    })
      .catch((err) => {
        console.log(err);
        return exits.serverError(err);
      });

    labels.push('နယ်ပို့');
    data.push(invoiceTotalAmount || 0);

    const commissionTotalAmount = await Invoice.sum('commissionFee', {
      where: {
        invoiceDate: {
          [Op.between]: [fromDate, toDate]
        }
      }
    })
      .catch((err) => {
        console.log(err);
        return exits.serverError(err);
      });

    labels.push('ကော်မရှင်');
    data.push(commissionTotalAmount || 0);

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

    labels.push('ကုန်သည်');
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

    labels.push('ပွဲရုံ');
    data.push(vendorTotalPayment || 0);

    return exits.success({ labels, data });
  }

};
