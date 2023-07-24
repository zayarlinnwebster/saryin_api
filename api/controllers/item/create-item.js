module.exports = {


  friendlyName: 'Create item',


  description: '',


  inputs: {

    itemName: {
      type: 'string',
      required: true,
    },

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
    }

  },


  fn: async function (inputs, exits) {

    const createdItem = await Item.create(inputs)
      .catch((err) => {
        console.log(err);
        return exits.invalidValidation(err);
      });

    if (createdItem instanceof Item) {
      return exits.success({
        message: 'Item created successfully.',
      });
    }

  }


};
