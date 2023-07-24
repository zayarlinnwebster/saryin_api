/**
 * Item.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

const { STRING } = require('sequelize');

module.exports = {

  attributes: {

    itemName: {
      type: STRING(50),
      unique: {
        msg: 'itemName must be unique'
      },
      allowNull: false,
      validate: {
        notEmpty: {
          args: true,
          msg: 'itemName cannot be empty'
        },
        notNull: {
          args: true,
          msg: 'itemName must be required'
        },
        len: {
          args: [0, 50],
          msg: 'itemName must be less than 50 characters'
        }
      }
    },

  },

  associations: function () {

    Item.hasMany(InvoiceDetail, {
      as: 'invoiceDetails',
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

    Item.hasMany(StockItem, {
      as: 'stockItems',
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

  },

  options: {
    tableName: 'item',
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

