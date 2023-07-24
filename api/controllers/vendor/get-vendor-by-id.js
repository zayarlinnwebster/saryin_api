module.exports = {


  friendlyName: 'Get vendor by id',


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

    serverError: {
      responseType: 'serverError',
    },

  },


  fn: async function ({
    id
  }, exits) {

    let vendor = await Vendor.findOne({
      where: {
        id,
      }
    })
      .catch((err) => {
        return exits.serverError(err);
      });

    return exits.success({
      data: vendor
    });

  }


};
