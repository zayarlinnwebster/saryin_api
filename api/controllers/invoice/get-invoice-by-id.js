module.exports = {


  friendlyName: 'Get invoice by id',


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


  fn: async function ({ id }, exits) {

    const invoice = await Invoice.findOne({
      where: {
        id
      },
      include: [
        {
          model: Customer,
          as: 'customer',
          attributes: ['id', 'fullName', 'commission'],
          required: true,
        },
        {
          model: InvoiceDetail,
          as: 'invoiceDetails',
          include: [
            {
              model: Item,
              as: 'item',
              attributes: ['id', 'itemName'],
            },
            {
              model: Vendor,
              as: 'vendor',
              attributes: ['id', 'vendorName'],
            },
            {
              model: StockItem,
              as: 'stockItem',
              attributes: ['storedDate', 'storeId']
            }
          ]
        }
      ]
    })
      .catch((err) => {
        console.log(err);
        return exits.serverError(err);
      });

    return exits.success({
      data: invoice,
    });

  }


};
