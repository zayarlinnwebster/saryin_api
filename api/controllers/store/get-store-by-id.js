module.exports = {


  friendlyName: 'Get store by id',


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

    let store = await Store.findOne({
      attributes: [
        'id',
        'storeName',
      ],
      where: {
        id,
      },
    })
      .catch((err) => {
        return exits.serverError(err);
      });

    return exits.success({
      data: store
    });

  }


};
