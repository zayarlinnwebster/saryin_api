/**
 * Store.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

const { STRING, TEXT } = require('sequelize');
const { Op } = require('sequelize');

module.exports = {

  attributes: {

    storeName: {
      type: STRING(50),
      unique: {
        msg: 'storeName must be unique'
      },
      allowNull: false,
      validate: {
        notEmpty: {
          args: true,
          msg: 'storeName cannot be empty'
        },
        notNull: {
          args: true,
          msg: 'storeName must be required'
        },
        len: {
          args: [0, 50],
          msg: 'storeName must be less than 50 characters'
        }
      }
    },

    phoneNo: {
      type: STRING(30),
      unique: {
        msg: 'phoneNo must be unique'
      },
      allowNull: true,
      validate: {
        len: {
          args: [0, 30],
          msg: 'phoneNo must be less than 30 numbers'
        },
      }
    },

    address: {
      type: TEXT,
      allowNull: true,
      validate: {
        len: {
          args: [0, 65535],
          msg: 'address No must be less than 65,535 characters'
        }
      },
    },

  },

  associations: function () {

    Store.hasMany(StockItem, {
      as: 'stockItems',
      foreignKey: {
        name: 'storeId',
        allowNull: false,
        validate: {
          notNull: {
            args: true,
            msg: 'storeId must be required'
          },
        }
      },
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE',
    });

  },

  options: {
    tableName: 'store',
    charset: 'utf8',
    collate: 'utf8_general_ci',
    underscored: true,
    timestamps: true,
    classMethods: {
      getStoreUsage: async (id, search, fromDate, toDate) => {
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
          throw new Error(err);
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
          throw new Error(err);
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
          throw new Error(err);
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
          throw new Error(err);
        });

        const totalPriceIn = await StockItem.sum('StockItem.total_price', {
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
          throw new Error(err);
        });

        const totalPriceOut = await StockItemOut.sum('StockItemOut.total_price', {
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
          throw new Error(err);
        });

        const totalCommissionFee = await StockItemOut.sum('StockItemOut.commission_fee', {
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
          throw new Error(err);
        });

        const stockInList = await StockItem.findAll({
          attributes: ['id', 'itemId', 'qty', 'weight'],
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
              attributes: ['itemName'],
              required: true,
            },
            {
              model: Customer,
              as: 'customer',
              attributes: [],
              required: true,
            },
            {
              model: StockItemOut,
              as: 'outItems',
              atrributes: ['qty', 'weight'],
              required: false,
              where: {
                outDate: {
                  [Op.between]: [fromDate, toDate]
                },
              },
            }
          ]
        })
        .catch((err) => {
          console.log(err);
          return exits.serverError(err);
        });

        let countedItems = new Set();
        let totalItemCount = 0;

        for (let stockIn of stockInList) {
          stockIn = stockIn.dataValues;

          if (stockIn.outItems.length > 0) {
            for (let stockItemOut of stockIn.outItems) {
              stockItemOut = stockItemOut.dataValues;
              stockIn.qty = parseInt(stockIn.qty) - parseInt(stockItemOut.qty);
              stockIn.weight = parseFloat(stockIn.weight) - parseFloat(stockItemOut.weight);
            }
          }

          if ((stockIn.qty !== 0 || stockIn.weight !== 0) && !countedItems.has(stockIn.itemId)) {
            ++totalItemCount;
            countedItems.add(stockIn.itemId);
          }
        }

        return {
          totalQtyOut,
          totalQtyIn,
          totalWeightIn,
          totalWeightOut,
          totalPriceIn,
          totalPriceOut,
          totalCommissionFee,
          totalItemCount,
        };
      }
    },
    instanceMethods: {},
    hooks: {},
    scopes: {},
  }

};

