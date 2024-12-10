const { Op } = require("sequelize");

module.exports = {


  friendlyName: 'Get financial statement',


  description: '',


  inputs: {

    page: {
      type: 'number',
      defaultsTo: 1,
      min: 1,
    },

    limit: {
      type: 'number',
      defaultsTo: 1000000,
      min: 1,
    },

    search: {
      type: 'string',
      defaultsTo: '',
    },

    column: {
      type: 'string',
      defaultsTo: '',
    },

    direction: {
      type: 'string',
      defaultsTo: '',
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
    page, limit, search, column, direction
  }, exits) {

    search = search.trim() || '';
    let orderTerm = [];

    const financialStatementSearch = {
      '$customer.full_name$': {
        [Op.substring]: search,
      },
    };

    if (column && direction) {
      if (column.indexOf('customer') !== -1) {
        orderTerm = [[
          { model: Customer, as: 'customer' },
          column.substr(column.indexOf('.') + 1), direction.toUpperCase()
        ]];
      } else {
        orderTerm = [[column, direction.toUpperCase()]];
      }
    }

    const financialStatementCount = await FinancialStatement.count({
      where: financialStatementSearch,
      include: [
        {
          model: Customer,
          as: 'customer',
          attributes: ['id', 'fullName', 'commission'],
          required: true,
        },
      ],
    }).catch((err) => {
      console.log(err);
      return exits.serverError(err);
    });

    const financialStatementList = await FinancialStatement.findAll({
      where: financialStatementSearch,
      include: [
        {
          model: Customer,
          as: 'customer',
          attributes: ['id', 'fullName', 'commission'],
          required: true,
        },
      ],
      offset: limit * (page - 1),
      limit: limit,
    })
      .catch((err) => {
        console.log(err);
        return exits.serverError(err);
      });

    return exits.success({
      totalCounts: financialStatementCount,
      data: financialStatementList,
    });

  },

};
