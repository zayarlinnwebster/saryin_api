module.exports = {


  friendlyName: 'Create store',


  description: '',


  inputs: {

    storeName: {
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
    }

  },


  exits: {

    success: {
      statusCode: 201,
    },

    invalidValidation: {
      responseType: 'invalidValidation',
    },

    serverError: {
      responseType: 'serverError',
    },

  },


  fn: async function (inputs, exits) {

    const createdStore = await Store.create(inputs).catch((err) => {
      console.log(err);
      return exits.invalidValidation(err);
    });

    if (createdStore instanceof Store) {
      return exits.success({
        message: 'Store created successfully.',
      });
    }

  },

};
