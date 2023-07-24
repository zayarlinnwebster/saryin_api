/**
 * Store/StockItemOut.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

const { DATEONLY, NOW, INTEGER } = require('sequelize');

module.exports = {

  attributes: {

    outDate: {
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

