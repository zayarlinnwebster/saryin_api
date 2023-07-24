const { Op, fn, col } = require('sequelize');
const moment = require('moment');

module.exports = {


  friendlyName: 'Get amount line chart',


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
    const data = [];

    const invoiceList = await Invoice.findAll({
      attributes: [
        'invoiceDate',
        [fn('sum', col('total_amount')), 'invoiceTotalAmount'],
        [fn('sum', col('commission_fee')), 'invoiceTotalCommissionFee'],
      ],
      where: {
        invoiceDate: {
          [Op.between]: [fromDate, toDate]
        }
      },
      group: ['Invoice.id']
    })
      .catch((err) => {
        console.log(err);
        return exits.serverError(err);
      });

    data.push({
      name: 'နယ်ပို့ငွေ',
      data: invoiceList.map(invoice => Number(invoice.dataValues.invoiceTotalAmount))
    });

    data.push({
      name: 'ကော်မရှင်',
      data: invoiceList.map(invoice => Number(invoice.dataValues.invoiceTotalCommissionFee))
    });

    const labels = invoiceList.map(invoice => moment(invoice.invoiceDate).format('DD MMM'));

    return exits.success({ labels, data });

  }


};
