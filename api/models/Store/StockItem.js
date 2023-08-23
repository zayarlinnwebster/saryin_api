/**
 * Store/StockItem.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

const { DATEONLY, NOW, INTEGER, DECIMAL } = require('sequelize');

module.exports = {

  attributes: {

    storedDate: {
      type: DATEONLY,
      defaultValue: NOW
    },

    unitPrice: {
      type: DECIMAL(19, 2).UNSIGNED,
      allowNull: false,
      validate: {
        notEmpty: {
          args: true,
          msg: 'unitPrice cannot be empty'
        },
        notNull: {
          args: true,
          msg: 'unitPrice must be required'
        },
        min: {
          args: [0],
          msg: 'unitPrice must be greater than or equal to 0',
        },
      }
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
      type: DECIMAL(19, 2).UNSIGNED,
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

    totalPrice: {
      type: DECIMAL(19, 2).UNSIGNED,
      allowNull: false,
      validate: {
        notEmpty: {
          args: true,
          msg: 'totalPrice cannot be empty'
        },
        notNull: {
          args: true,
          msg: 'totalPrice must be required'
        },
        min: {
          args: [0],
          msg: 'totalPrice must be greater than or equal to 0',
        },
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

