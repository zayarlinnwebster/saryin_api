module.exports = {


  friendlyName: 'Create invoice',


  description: '',


  inputs: {

    invoiceDate: {
      type: 'ref',
      required: true,
    },

    totalItemAmount: {
      type: 'number',
      required: true,
    },

    laborFee: {
      type: 'number',
      required: true,
    },

    generalFee: {
      type: 'number',
      required: true,
    },

    totalAmount: {
      type: 'number',
      required: true,
    },

    vendorId: {
      type: 'number',
      required: true,
    },

    invoiceDetails: {
      type: 'ref',
      required: true,
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
    }

  },


  fn: async function (inputs, exits) {

    const createdInvoice = await Invoice.create({
      ...inputs,
      invoiceNo: await Invoice.generateInvoiceNo(),
    }, {
      include: {
        model: InvoiceDetail,
        as: 'invoiceDetails'
      }
    })
      .catch((err) => {
        console.log(err);
        return exits.invalidValidation(err);
      });

    if (createdInvoice instanceof Invoice) {
      return exits.success({
        message: 'Invoice created successfully.',
      });
    }

  }


};
