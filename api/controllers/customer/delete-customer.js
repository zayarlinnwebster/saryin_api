module.exports = {


  friendlyName: 'Delete customer',


  description: '',


  inputs: {

    id: {
      type: 'number',
      required: true,
    }

  },


  exits: {

    success: {
      statusCode: 200,
    },

    invalid: {
      responseType: 'badRequest',
    },

    invalidValidation: {
      responseType: 'invalidValidation',
    },

    serverError: {
      responseType: 'serverError',
    }

  },


  fn: async function (inputs, exits) {

    const isDestroy = await Customer.destroy({
      where: {
        id: inputs.id,
      }
    })
      .catch((err) => {
        return exits.invalidValidation(err);
      });

    if (isDestroy) {
      return exits.success({
        message: 'Customer deleted successfully'
      });
    } else {
      return exits.invalid({
        message: 'Customer not found'
      });
    }

  }


};
