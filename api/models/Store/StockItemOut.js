/**
 * Store/StockItemOut.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

const { DATEONLY, NOW, INTEGER, DECIMAL } = require('sequelize');

module.exports = {

  attributes: {

    outDate: {
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

    commission: {
      type: DECIMAL(5, 2).UNSIGNED,
      allowNull: false,
      validate: {
        notEmpty: {
          args: true,
          msg: 'commission cannot be empty'
        },
        notNull: {
          args: true,
          msg: 'commission must be required'
        },
        min: {
          args: [0],
          msg: 'commission must be greater than or equal to 0',
        },
        max: {
          args: [100],
          msg: 'commission must be less than or equal to 100',
        },
      }
    },

    commissionFee: {
      type: DECIMAL(19, 2).UNSIGNED,
      allowNull: true,
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

    StockItemOut.belongsTo(StockItem, {
      as: 'stockItem',
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
    tableName: 'stock_item_out',
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

