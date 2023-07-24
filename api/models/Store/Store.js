/**
 * Store.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

const { STRING, TEXT } = require('sequelize');

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
    classMethods: {},
    instanceMethods: {},
    hooks: {},
    scopes: {},
  }

};

