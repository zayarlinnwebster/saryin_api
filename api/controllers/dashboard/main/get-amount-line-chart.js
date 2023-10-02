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
      name: 'နယ်ပို့စာရင်း',
      data: invoiceList.map(invoice => Number(invoice.dataValues.invoiceTotalAmount))
    });

    let labels = [];

    for (let invoice of invoiceList) {
      if (labels.indexOf(moment(invoice.invoiceDate).format('DD MMM'))) {

      }
    }

    return exits.success({ labels, data });

  }


};
