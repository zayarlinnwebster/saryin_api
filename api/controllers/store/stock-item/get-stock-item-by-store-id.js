const { literal, Op } = require('sequelize');

module.exports = {


  friendlyName: 'Get stock item by store id',


  description: '',


  inputs: {

    id: {
      type: 'number',
      required: true,
    },

    page: {
      type: 'number',
      defaultsTo: 1,
      min: 1,
    },

    limit: {
      type: 'number',
      defaultsTo: 1000000,
      min: 1,
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


  fn: async function ({
    id, page, limit, search, fromDate, toDate, column, direction
  }, exits) {

    search = search.trim() || '';
    let orderTerm = [];

    const stockItemSearch = {
      [Op.and]: [
        {
          storedDate: {
            [Op.between]: [fromDate, toDate]
          },
        },
        {
          storeId: id
        }
      ],
      [Op.or]: [
        {
          '$item.item_name$': {
            [Op.substring]: search,
          },
        },
        {
          '$customer.full_name$': {
            [Op.substring]: search,
          },
        },
      ],
    };

    if (column && direction) {
      if (column.indexOf('item') !== -1) {
        orderTerm = [[{ model: Item, as: 'item' }, column.substr(column.indexOf('.') + 1), direction.toUpperCase()]];
      } else if (column.indexOf('customer') !== -1) {
        orderTerm = [[{ model: Customer, as: 'customer' }, column.substr(column.indexOf('.') + 1), direction.toUpperCase()]];
      } else {
        orderTerm = [[column, direction.toUpperCase()]];
      }
    }

    console.log(orderTerm);

    const stockItemCount = await StockItem.count({
      where: stockItemSearch,
      include: [
        {
          model: Item,
          as: 'item',
          attributes: ['id', 'itemName'],
          required: true,
        },
        {
          model: Customer,
          as: 'customer',
          attributes: ['id', 'fullName', 'commission'],
          required: true,
        },
        {
          model: Store,
          as: 'store',
          attributes: ['id', 'storeName'],
          required: true,
        },
      ],
    }).catch((err) => {
      console.log(err);
      return exits.serverError(err);
    });

    const stockItemList = await StockItem.findAll({
      attributes: [
        'id',
        'storedDate',
        'unitPrice',
        'qty',
        'weight',
        'itemId',
        'storeId',
        'customerId',
        'totalPrice',
        [literal('(SELECT SUM(`StockItemOut`.`qty`) FROM `stock_item_out` as `StockItemOut` WHERE `StockItemOut`.`stock_item_id` = `StockItem`.`id`)'), 'totalQtyOut'],
        [literal('(SELECT SUM(`StockItemOut`.`weight`) FROM `stock_item_out` as `StockItemOut` WHERE `StockItemOut`.`stock_item_id` = `StockItem`.`id`)'), 'totalWeightOut']
      ],
      where: stockItemSearch,
      offset: limit * (page - 1),
      limit: limit,
      subQuery: false,
      include: [
        {
          model: Item,
          as: 'item',
          attributes: ['id', 'itemName'],
          required: true,
        },
        {
          model: Customer,
          as: 'customer',
          attributes: ['id', 'fullName', 'commission'],
          required: true,
        },
        {
          model: Store,
          as: 'store',
          attributes: ['id', 'storeName'],
          required: true,
        },
        {
          model: StockItemOut,
          as: 'outItems',
          required: false,
        }
      ],
      order: orderTerm
    }).catch((err) => {
      console.log(err);
      return exits.serverError(err);
    });

    return exits.success({
      totalCounts: stockItemCount,
      data: stockItemList,
    });

  },

};

