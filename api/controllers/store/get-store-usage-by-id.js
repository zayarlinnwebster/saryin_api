const { Op } = require('sequelize');

module.exports = {


  friendlyName: 'Get store usage by id',


  description: '',


  inputs: {


    id: {
      type: 'number',
      required: true,
    },

    search: {
      type: 'string',
      defaultsTo: '',
    },

    fromDate: {
      type: 'ref',
      required: true,
    },

    toDate: {
      type: 'ref',
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
    id, search, fromDate, toDate
  }, exits) {
    search = search.trim() || '';

    const totalQtyIn = await StockItem.sum('StockItem.qty', {
      where: {
        [Op.or]: [
          {
            '$customer.full_name$': {
              [Op.substring]: search,
            },
          },
          {
            '$item.item_name$': {
              [Op.substring]: search,
            },
          },
        ],
        storedDate: {
          [Op.between]: [fromDate, toDate]
        },
        storeId: id,
      },
      include: [
        {
          model: Item,
          as: 'item',
          attributes: [],
          required: true,
        },
        {
          model: Customer,
          as: 'customer',
          attributes: [],
          required: true,
        },
      ]
    }).catch((err) => {
      console.log(err);
      return exits.serverError(err);
    });

    const totalQtyOut = await StockItemOut.sum('StockItemOut.qty', {
      where: {
        outDate: {
          [Op.between]: [fromDate, toDate]
        },
      },
      include: [
        {
          model: StockItem,
          as: 'stockItem',
          attributes: [],
          required: true,
          where: {
            storeId: id
          },
          include: [
            {
              model: Item,
              as: 'item',
              attributes: [],
              required: true,
              where: {
                itemName: {
                  [Op.substring]: search,
                },
              },
            },
            {
              model: Customer,
              as: 'customer',
              attributes: [],
              required: true,
              where: {
                fullName: {
                  [Op.substring]: search,
                },
              },
            },
          ]
        },
      ]
    }).catch((err) => {
      console.log(err);
      return exits.serverError(err);
    });

    const totalWeightIn = await StockItem.sum('StockItem.weight', {
      where: {
        [Op.or]: [
          {
            '$customer.full_name$': {
              [Op.substring]: search,
            },
          },
          {
            '$item.item_name$': {
              [Op.substring]: search,
            },
          },
        ],
        storedDate: {
          [Op.between]: [fromDate, toDate]
        },
        storeId: id,
      },
      include: [
        {
          model: Item,
          as: 'item',
          attributes: [],
          required: true,
        },
        {
          model: Customer,
          as: 'customer',
          attributes: [],
          required: true,
        },
      ]
    }).catch((err) => {
      console.log(err);
      return exits.serverError(err);
    });

    const totalWeightOut = await StockItemOut.sum('StockItemOut.weight', {
      where: {
        outDate: {
          [Op.between]: [fromDate, toDate]
        },
      },
      include: [
        {
          model: StockItem,
          as: 'stockItem',
          attributes: [],
          required: true,
          where: {
            storeId: id
          },
          include: [
            {
              model: Item,
              as: 'item',
              attributes: [],
              required: true,
              where: {
                itemName: {
                  [Op.substring]: search,
                },
              },
            },
            {
              model: Customer,
              as: 'customer',
              attributes: [],
              required: true,
              where: {
                fullName: {
                  [Op.substring]: search,
                },
              },
            },
          ]
        },
      ]
    }).catch((err) => {
      console.log(err);
      return exits.serverError(err);
    });

    return exits.success({
      totalQtyOut,
      totalQtyIn,
      totalWeightIn,
      totalWeightOut
    });


  }


};
