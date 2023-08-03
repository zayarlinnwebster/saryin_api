module.exports = {


  friendlyName: 'Update customer',


  description: '',


  inputs: {

    id: {
      type: 'number',
      required: true,
    },

    fullName: {
      type: 'string',
      required: true,
    },

    phoneNo: {
      type: 'string',
      allowNull: true,
    },

    address: {
      type: 'string',
      allowNull: true,
    },

    commission: {
      type: 'number',
      required: true,
    }

  },


  exits: {

    success: {
      statusCode: 200,
    },

    invalidValidation: {
      responseType: 'invalidValidation',
    },

    serverError: {
      responseType: 'serverError',
    }

  },


  fn: async function (inputs, exits) {

    const customerCount = await Customer.count({
      where: {
        id: inputs.id,
      }
    })
      .catch((err) => {
        return exits.serverError(err);
      });

    if (customerCount === 0) {
      return exits.invalid({
        message: 'Customer not found'
      });
    }

    await Customer.update(inputs, {
      where: {
        id: inputs.id,
      }
    })
      .catch((err) => {
        return exits.invalidValidation(err);
      });

    return exits.success({
      message: 'Customer updated successfully',
    });

  }


};
