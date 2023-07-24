const { literal } = require('sequelize');

module.exports = {


  friendlyName: 'Get customer by id',


  description: '',


  inputs: {

    id: {
      type: 'number',
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
    id,
  }, exits) {

    let customer = await Customer.findOne({
      attributes: [
        'id',
        'fullName',
        'phoneNo',
        'address',
      ],
      where: {
        id,
      },
    })
      .catch((err) => {
        return exits.serverError(err);
      });

    return exits.success({
      data: customer
    });

  }


};
