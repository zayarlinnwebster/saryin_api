module.exports = {


  friendlyName: 'Update password',


  description: '',


  inputs: {

    id: {
      type: 'number',
      required: true,
    },

    oldPassword: {
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
    },

    invalid: {
      responseType: 'badRequest',
    },

    unauthorized: {
      statusCode: 401,
    },


  },


  fn: async function (inputs, exits) {

    const user = await User.scope('withPassword').findOne({
      where: {
        id: inputs.id
      },
    }).catch((err) => {
      return exits.invalid(err);
    });

    if (!user) {
      return exits.unauthorized({
        message: 'အသုံးပြုသူအမည် မှားယွင်းနေပါသည်။',
      });
    } else if (!user.isActive) {
      return exits.unauthorized({
        message: 'အသုံးပြုသူအကောင့်ကို ပိတ်ထားသည်။',
      });
    }

    const isValidate = await user.validatePassword(inputs.oldPassword);

    if (!isValidate) {
      return exits.unauthorized({
        message: 'လျှို့ဝှက်နံပါတ် မှားယွင်းနေပါသည်။'
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
