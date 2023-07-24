/**
 * Vendor.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

const { TEXT, STRING } = require('sequelize');

module.exports = {

  attributes: {

    vendorName: {
      type: STRING(60),
      unique: {
        msg: 'vendorName must be unique'
      },
      allowNull: false,
      validate: {
        notEmpty: {
          args: true,
          msg: 'vendorName cannot be empty'
        },
        notNull: {
          args: true,
          msg: 'vendorName must be required'
        },
        len: {
          args: [0, 60],
          msg: 'vendorName must be less than 60 characters'
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

    Vendor.hasMany(Invoice, {
      as: 'invoices',
      foreignKey: {
        name: 'vendorId',
        allowNull: false,
        validate: {
          notNull: {
            args: true,
            msg: 'vendorId must be required'
          },
        }
      },
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE',
    });

    Vendor.hasMany(VendorPayment, {
      as: 'payments',
      foreignKey: {
        name: 'vendorId',
        allowNull: false,
        validate: {
          notNull: {
            args: true,
            msg: 'vendorId must be required'
          },
        }
      },
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE',
    });

  },

  options: {
    tableName: 'vendor',
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

