module.exports = {


  friendlyName: 'Delete stock item',


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

    invalid: {
      responseType: 'badRequest',
    },

    invalidValidation: {
      responseType: 'invalidValidation',
    },

    serverError: {
      responseType: 'serverError',
    }

  },


  fn: async function (inputs, exits) {

    const transaction = await SequelizeConnections['mysqlServer'].transaction();

    const stockItemRecord = await StockItem.findOne({
      where: {
        id: inputs.id
      },
      transaction
    })
    .catch(async (err) => {
      await transaction.rollback();
      return exits.invalidValidation(err);
    });

    const isDestroy = await StockItem.destroy({
      where: {
        id: inputs.id,
      },
      transaction
    })
      .catch(async (err) => {
        await transaction.rollback();
        return exits.invalidValidation(err);
      });

    if (isDestroy) {
      if (stockItemRecord.invoiceDetailId) {
        await InvoiceDetail.update({
          isStoreItem: false,
        },
        {
          where: {
            id: stockItemRecord.invoiceDetailId,
          },
          transaction
        })
        .catch(async (err) => {
          await transaction.rollback();
          return exits.invalidValidation(err);
        });
      }

      await transaction.commit();

      return exits.success({
        message: 'StockItem deleted successfully'
      });
    } else {
      return exits.invalid({
        message: 'StockItem not found'
      });
    }

  }


};
