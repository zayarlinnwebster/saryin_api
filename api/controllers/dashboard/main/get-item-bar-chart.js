const { Op, fn, col } = require('sequelize');

module.exports = {


  friendlyName: 'Get item bar chart',


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
    search = search.trim() || '';

    const invoiceDetailSearch = {
      [Op.and]: [
        {
          '$invoiceDetails.invoice.invoice_date$': {
            [Op.between]: [fromDate, toDate]
          },
        }
      ],
      [Op.or]: [
        {
          itemName: {
            [Op.substring]: search,
          },
        },
      ],
    };

    const itemList = await Item.findAll({
      attributes: [
        'itemName',
        [fn('sum', col('invoiceDetails.qty')), 'totalQty']
      ],
      where: invoiceDetailSearch,
      include: [
        {
          model: InvoiceDetail,
          as: 'invoiceDetails',
          duplicating: false,
          attributes: [],
          include: {
            model: Invoice,
            as: 'invoice',
            attributes: [],
            required: false,
          }
        }
      ],
      group: ['Item.id'],
      order: [['totalQty', 'DESC']]
    }).catch((err) => {
      console.log(err);
      return exits.serverError(err);
    });

    const labels = itemList.map(item => item.itemName);
    const data = itemList.map(item => item.dataValues.totalQty);

    return exits.success({ labels, data });

  }


};
