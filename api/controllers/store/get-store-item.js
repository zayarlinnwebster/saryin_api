const { fn, col, Op, literal } = require('sequelize');

module.exports = {


  friendlyName: 'Get store item',


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

    column: {
      type: 'string',
      defaultsTo: '',
    },

    direction: {
      type: 'string',
      defaultsTo: '',
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


  fn: async function ({ id, search, column, direction }, exits) {

    search = search.trim() || '';
    let orderTerm = [];

    if (column && direction) {
      if (column.indexOf('item') !== -1) {
        orderTerm = [[{ model: Item, as: 'item' }, column.substr(column.indexOf('.') + 1), direction.toUpperCase()]];
      } else {
        orderTerm = [[column, direction.toUpperCase()]];
      }
    }

    const stockItemList = await StockItem.findAll({
      attributes: [
        'itemId',
        [fn('SUM', col('qty')), 'totalQty'],
      ],
      subQuery: false,
      where: {
        storeId: id,
        [Op.or]: {
          '$item.item_name$': {
            [Op.substring]: search,
          }
        }
      },
      group: ['itemId'],
      include: {
        model: Item,
        as: 'item',
        attributes: ['id', 'itemName'],
      },
      order: orderTerm,
    }).catch((err) => {
      console.log(err);
      return exits.serverError(err);
    });

    const stockItemOutList = await StockItemOut.findAll({
      attributes: [
        'stockItemId',
        [fn('SUM', col('StockItemOut.qty')), 'totalOutQty'],
      ],
      subQuery: false,
      include: [
        {
          model: StockItem,
          as: 'stockItem',
          attributes: ['itemId'],
          required: true,
          where: {
            storeId: id,
          },
        },
      ],
      group: ['stockItemId'],
    }).catch((err) => {
      console.log(err);
      return exits.serverError(err);
    });

    // Create a map for quick access to the total out quantity for each stock item
    const stockItemOutMap = new Map();
    for (const stockItemOut of stockItemOutList) {
      if (stockItemOutMap.has(stockItemOut.stockItem.itemId)) {
        stockItemOutMap.set(stockItemOut.stockItem.itemId, Number(stockItemOutMap.get(stockItemOut.stockItem.itemId)) + Number(stockItemOut.dataValues.totalOutQty));
      } else {
        stockItemOutMap.set(stockItemOut.stockItem.itemId, stockItemOut.dataValues.totalOutQty);
      }
    }

    // Calculate the left quantity for each unique item
    const stockItemListWithLeftQty = stockItemList.map((stockItem) => {
      let leftQty = stockItem.dataValues.totalQty - (stockItemOutMap.get(stockItem.itemId) || 0);

      if (leftQty === 0) {
        return;
      }

      return ({
        id: stockItem.item.id,
        itemName: stockItem.item.itemName,
        totalQty: stockItem.dataValues.totalQty,
        totalOutQty: stockItemOutMap.get(stockItem.itemId) || 0, // If not found, set the totalOutQty to 0
        leftQty: leftQty
      });
    });

    return exits.success({
      data: stockItemListWithLeftQty,
    });

  },

};
