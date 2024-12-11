const { Op } = require('sequelize');
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

  fn: async function ({ fromDate, toDate }, exits) {
    const data = [];

    // Fetching invoice data from the database
    const invoiceList = await Invoice.findAll({
      attributes: [
        'invoiceDate',
        'totalAmount',
      ],
      where: {
        invoiceDate: {
          [Op.between]: [fromDate, toDate],
        },
      },
      group: ['Invoice.id'],
    }).catch((err) => {
      console.log(err);
      return exits.serverError(err);
    });

    // Grouping the invoice data by date
    const groupedData = invoiceList.reduce((acc, invoice) => {
      const { invoiceDate, totalAmount } = invoice;

      // Format the invoice date to 'Jan 01' format using moment
      const formattedDate = moment(invoiceDate).format('MMM DD');

      acc[formattedDate] = (acc[formattedDate] || 0) + Number(totalAmount);
      return acc;
    }, {});

    // Pushing the formatted data for the chart
    data.push({
      name: 'နယ်ပို့စာရင်း',
      data: Object.values(groupedData),
    });

    // Labels will now be the formatted dates
    let labels = Object.keys(groupedData);

    // Returning the formatted labels and data
    return exits.success({ labels, data });
  },
};
