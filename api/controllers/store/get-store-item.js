const { fn, col, Op } = require('sequelize');

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
        'qty',
        'weight'
      ],
      where: {
        storeId: id,
        [Op.or]: {
          '$item.item_name$': {
            [Op.substring]: search,
          }
        }
      },
      include: {
        model: Item,
        as: 'item',
        attributes: ['itemName'],
      },
      order: orderTerm,
    }).catch((err) => {
      console.log(err);
      return exits.serverError(err);
    });

    const stockItemOutList = await StockItemOut.findAll({
      attributes: [
        'stockItemId',
        'qty',
        'weight'
      ],
      include: [
        {
          model: StockItem,
          as: 'stockItem',
          attributes: ['itemId'],
          required: true,
          where: {
            storeId: id,
          },
          include: {
            model: Item,
            as: 'item',
            attributes: ['itemName'],
          },
        },
      ],
    }).catch((err) => {
      console.log(err);
      return exits.serverError(err);
    });

    const stockItemMap = new Map();

    for (let inStock of stockItemList) {
      if (stockItemMap.has(inStock.itemId)) {
        const preStockItem = stockItemMap.get(inStock.itemId);

        stockItemMap.set(inStock.itemId, {
          ...preStockItem,
          totalQty: preStockItem.totalQty + parseInt(inStock.qty),
          totalWeight: preStockItem.totalWeight + parseFloat(inStock.weight),
          leftQty: preStockItem.leftQty + parseInt(inStock.qty),
          leftWeight: preStockItem.leftWeight + parseFloat(inStock.weight)
        });
      } else {
        stockItemMap.set(inStock.itemId, {
          id: inStock.itemId,
          itemName: inStock.item.itemName,
          totalQty: parseInt(inStock.qty),
          totalWeight: parseFloat(inStock.weight),
          totalOutQty: 0,
          totalOutWeight: 0,
          leftQty: parseInt(inStock.qty),
          leftWeight: parseFloat(inStock.weight)
        });
      }
    }

    for (let outStock of stockItemOutList) {
      if (stockItemMap.has(outStock.stockItem.itemId)) {
        const preStockItem = stockItemMap.get(outStock.stockItem.itemId);

        const leftQty = preStockItem.leftQty - parseInt(outStock.qty);
        const leftWeight = preStockItem.leftWeight - parseFloat(outStock.weight);

        if (leftQty === 0 && leftWeight === 0) {
          stockItemMap.delete(outStock.stockItem.itemId);
        } else {
          stockItemMap.set(outStock.stockItem.itemId, {
            ...preStockItem,
            totalOutQty: preStockItem.totalOutQty + parseInt(outStock.qty),
            totalOutWeight: preStockItem.totalOutWeight + parseFloat(outStock.weight),
            leftQty: leftQty,
            leftWeight: leftWeight
          });
        }
      }
    }

    return exits.success({
      data: [...stockItemMap.values()],
    });

  },

};
