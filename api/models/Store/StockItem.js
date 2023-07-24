/**
 * Store/StockItem.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

const { DATEONLY, NOW, INTEGER, STRING } = require('sequelize');

module.exports = {

  attributes: {

    storedDate: {
      type: DATEONLY,
      defaultValue: NOW
    },

    qty: {
      type: INTEGER,
      allowNull: false,
      validate: {
        notEmpty: {
          args: true,
          msg: 'qty cannot be empty'
        },
        notNull: {
          args: true,
          msg: 'qty must be required'
        },
        min: {
          args: [1],
          msg: 'qty must be greater than or equal to 1',
        },
      }
    },

    weight: {
      type: STRING(30),
      allowNull: false,
      validate: {
        notEmpty: {
          args: true,
          msg: 'weight cannot be empty'
        },
        notNull: {
          args: true,
          msg: 'weight must be required'
        }
      }
    },

  },

  associations: function () {

    StockItem.belongsTo(Item, {
      as: 'item',
      foreignKey: {
        name: 'itemId',
        allowNull: false,
        validate: {
          notNull: {
            args: true,
            msg: 'itemId must be required'
          },
        }
      },
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE',
    });

    StockItem.belongsTo(Customer, {
      as: 'customer',
      foreignKey: {
        name: 'customerId',
        allowNull: false,
        validate: {
          notNull: {
            args: true,
            msg: 'customerId must be required'
          },
        }
      },
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE',
    });

    StockItem.belongsTo(Store, {
      as: 'store',
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

    StockItem.hasMany(StockItemOut, {
      as: 'outItems',
      foreignKey: {
        name: 'stockItemId',
        allowNull: false,
        validate: {
          notNull: {
            args: true,
            msg: 'stockItemId must be required'
          },
        }
      },
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE',
    });

  },

  options: {
    tableName: 'stock_item',
    charset: 'utf8',
    collate: 'utf8_general_ci',
    underscored: true,
    timestamps: true,
    classMethods: {},
    instanceMethods: {},
    hooks: {},
    scopes: {},
  }

};

