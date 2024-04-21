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
        'totalAmount',
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

    const groupedData = invoiceList.reduce((acc, invoice) => {
      const { invoiceDate, totalAmount } = invoice;
      acc[invoiceDate] = (acc[invoiceDate] || 0) + Number(totalAmount);
      return acc;
    }, {});

    data.push({
      name: 'နယ်ပို့စာရင်း',
      data: Object.values(groupedData)
    });

    let labels = Object.keys(groupedData);

    return exits.success({ labels, data });

  }


};
