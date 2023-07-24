module.exports = {


  friendlyName: 'Create user',


  description: '',


  inputs: {

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
      statusCode: 201,
    },

    serverError: {
      responseType: 'serverError',
    },

    invalid: {
      responseType: 'badRequest',
    },

    invalidValidation: {
      responseType: 'invalidValidation',
    }


  },


  fn: async function (inputs, exits) {
    if (inputs.password !== inputs.confirmPassword) {
      return exits.invalid({
        message: 'Password and confirm password didn\'t match',
      });
    }

    let createdUser = await User.create(inputs, {
      individualHooks: true,
    })
      .catch((err) => {
        return exits.invalidValidation(err);
      });

    if (createdUser instanceof User) {
      return exits.success({
        message: 'User created successfully'
      });
    }

  }


};
