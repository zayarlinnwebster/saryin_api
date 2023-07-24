const { Op, literal } = require('sequelize');

module.exports = {


  friendlyName: 'Get customer',


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

    const customerList = await Customer.findAll({
      attributes: [
        'id',
        'fullName',
        [literal('(SELECT SUM(`Invoice`.`total_amount`) FROM `invoice` AS `Invoice` WHERE `Invoice`.`customer_id` = `Customer`.`id`)'), 'totalInvoiceAmount'],
        [literal('(SELECT SUM(`CustomerPayment`.`paid_amount`) FROM `customer_payment` AS `CustomerPayment` WHERE `CustomerPayment`.`customer_id` = `Customer`.`id`)'), 'totalPaidAmount'],
      ],
      where: {
        [Op.or]: [
          {
            fullName: {
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
      data: customerList,
    });
  }


};
