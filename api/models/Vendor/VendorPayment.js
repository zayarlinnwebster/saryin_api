/**
 * Vendor/VendorPayment.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

const { STRING, ENUM, DECIMAL, NOW, DATEONLY } = require('sequelize');

module.exports = {

  attributes: {

    paymentDate: {
      type: DATEONLY,
      defaultValue: NOW
    },

    paidAmount: {
      type: DECIMAL(19, 2).UNSIGNED,
      allowNull: false,
      validate: {
        notEmpty: {
          args: true,
          msg: 'paidAmount cannot be empty'
        },
        notNull: {
          args: true,
          msg: 'paidAmount must be required'
        },
        min: {
          args: [0],
          msg: 'paidAmount must be greater than or equal to 0',
        },
      }
    },

    paidBy: {
      type: ENUM,
      values: ['Cash', 'Banking', 'E-Wallet'],
      allowNull: false,
      validate: {
        notEmpty: {
          args: true,
          msg: 'paidBy cannot be empty'
        },
        notNull: {
          args: true,
          msg: 'paidBy must be required'
        },
        isIn: {
          args: [['Cash', 'Banking', 'E-Wallet']],
          msg: 'paidBy must be Cash, Banking or E-Wallet'
        }
      }
    },

    transactionNo: {
      type: STRING(50),
      allowNull: true,
      validate: {
        len: {
          args: [0, 65535],
          msg: 'transactionNo must be less than 50 characters'
        }
      },
    },

  },

  associations: function () {

    VendorPayment.belongsTo(Vendor, {
      as: 'vendor',
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
    tableName: 'vendor_payment',
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

