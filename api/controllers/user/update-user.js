module.exports = {


  friendlyName: 'Update user',


  description: '',


  inputs: {

    id: {
      type: 'number',
      required: true,
    },

    username: {
      type: 'string',
      required: true,
    },

    password: {
      type: 'string',
      required: true,
      custom: (value) => {
        // • be a string
        // • be at least 6 characters long
        // • contain at least one letter
        return _.isString(value) && value.length >= 6 && value.match(/[a-z]/i);
      },
    },

    confirmPassword: {
      type: 'string',
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
      },
      individualHooks: true,
    })
      .catch((err) => {
        return exits.invalidValidation(err);
      });

    return exits.success({
      message: 'User updated successfully',
    });


  }


};
