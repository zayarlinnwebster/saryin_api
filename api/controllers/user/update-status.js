module.exports = {


  friendlyName: 'Update status',


  description: '',


  inputs: {

    id: {
      type: 'number',
      required: true,
    },

    isActive: {
      type: 'boolean',
      required: true,
    },

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

    const userCount = await User.count({
      where: {
        id: inputs.id,
      }
    })
      .catch((err) => {
        return exits.serverError(err);
      });

    if (userCount === 0) {
      return exits.invalid({
        message: 'User not found'
      });
    }

    await User.update(inputs, {
      where: {
        id: inputs.id,
      }
    })
      .catch((err) => {
        return exits.invalidValidation(err);
      });

    return exits.success({
      message: 'User updated successfully',
    });


  }


};
