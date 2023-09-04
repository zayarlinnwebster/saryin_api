const { Op } = require('sequelize');

module.exports = {


  friendlyName: 'Update invoice',


  description: '',


  inputs: {

    id: {
      type: 'number',
      required: true,
    },

    invoiceDate: {
      type: 'ref',
      required: true,
    },

    totalAmount: {
      type: 'number',
      required: true,
    },

    customerId: {
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
    const transaction = await SequelizeConnections['mysqlServer'].transaction();

    const invoiceCount = await Invoice.count({
      where: {
        id: inputs.id,
      },
      transaction
    })
      .catch(async (err) => {
        await transaction.rollback();
        return exits.serverError(err);
      });

    if (invoiceCount === 0) {
      await transaction.rollback();

      return exits.invalid({
        message: 'Invoice not found'
      });
    }

    await Invoice.update(inputs, {
      where: {
        id: inputs.id,
      },
      transaction
    })
      .catch(async (err) => {
        await transaction.rollback();
        return exits.invalidValidation(err);
      });

    let newInvoiceDetails = [];
    let updateInvoiceDetailsId = [];

    for (let invoiceDetail of inputs.invoiceDetails) {
      if (invoiceDetail.id) {
        await InvoiceDetail.update({
          qty: invoiceDetail.qty,
          weight: invoiceDetail.weight,
          unitPrice: invoiceDetail.unitPrice,
          totalPrice: invoiceDetail.totalPrice,
          laborFee: invoiceDetail.laborFee,
          generalFee: invoiceDetail.generalFee,
          remark: invoiceDetail.remark,
          itemId: invoiceDetail.itemId,
          vendorId: invoiceDetail.vendorId,
          isBillCleared: invoiceDetail.isBillCleared,
          isStoreItem: invoiceDetail.isStoreItem,
        }, {
          where: {
            id: invoiceDetail.id
          },
          transaction
        })
          .catch(async (err) => {
            await transaction.rollback();
            return exits.invalidValidation(err);
          });

        if (invoiceDetail.isStoreItem) {
          await StockItem.update({
            storedDate: invoiceDetail.storedDate,
            qty: invoiceDetail.qty,
            weight: invoiceDetail.weight,
            unitPrice: invoiceDetail.unitPrice,
            itemId: invoiceDetail.itemId,
            customerId: inputs.customerId,
            storeId: invoiceDetail.storeId,
            totalPrice: invoiceDetail.totalPrice
          }, {
            where: {
              invoiceDetailId: invoiceDetail.id
            },
            transaction
          })
            .catch(async (err) => {
              await transaction.rollback();
              return exits.invalidValidation(err);
            });
        } else {
          await StockItem.destroy({
            where: {
              invoiceDetailId: invoiceDetail.id
            },
            transaction
          })
            .catch(async (err) => {
              await transaction.rollback();
              return exits.invalidValidation(err);
            });
        }


        updateInvoiceDetailsId.push(invoiceDetail.id);
      } else {
        newInvoiceDetails.push({
          ...invoiceDetail,
          invoiceId: inputs.id
        });
      }
    }

    await InvoiceDetail.destroy({
      where: {
        id: {
          [Op.notIn]: updateInvoiceDetailsId
        },
        invoiceId: inputs.id
      },
      transaction
    })
      .catch(async (err) => {
        await transaction.rollback();
        return exits.invalidValidation(err);
      });

    if (newInvoiceDetails.length > 0) {
      const stockItemList = [];

      for (let invoiceDetail of newInvoiceDetails) {
        const createdInvoiceDetail = await InvoiceDetail.create({
          qty: invoiceDetail.qty,
          weight: invoiceDetail.weight,
          unitPrice: invoiceDetail.unitPrice,
          totalPrice: invoiceDetail.totalPrice,
          laborFee: invoiceDetail.laborFee,
          generalFee: invoiceDetail.generalFee,
          remark: invoiceDetail.remark,
          itemId: invoiceDetail.itemId,
          vendorId: invoiceDetail.vendorId,
          isBillCleared: invoiceDetail.isBillCleared,
          isStoreItem: invoiceDetail.isStoreItem,
          invoiceId: inputs.id,
        }, { transaction })
          .catch(async (err) => {
            console.log(err);
            await transaction.rollback();
            return exits.invalidValidation(err);
          });

        if (invoiceDetail.isStoreItem) {
          stockItemList.push({
            storedDate: invoiceDetail.storedDate,
            qty: invoiceDetail.qty,
            weight: invoiceDetail.weight,
            unitPrice: invoiceDetail.unitPrice,
            itemId: invoiceDetail.itemId,
            customerId: inputs.customerId,
            storeId: invoiceDetail.storeId,
            invoiceDetailId: createdInvoiceDetail.id,
            totalPrice: invoiceDetail.totalPrice
          });
        }
      }

      await StockItem.bulkCreate(stockItemList, { transaction })
        .catch(async (err) => {
          console.log(err);
          await transaction.rollback();
          return exits.invalidValidation(err);
        });
    }

    await transaction.commit();

    return exits.success({
      message: 'Invoice updated successfully',
    });

  }


};
