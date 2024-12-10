/**
 * Customer/CustomerPayment.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

const { STRING, ENUM, DECIMAL, NOW, DATEONLY, BOOLEAN } = require('sequelize');

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

    isArchived: {
      type: BOOLEAN,
      defaultValue: false,
    },

  },

  associations: function () {

    CustomerPayment.belongsTo(Customer, {
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

    CustomerPayment.belongsTo(FinancialStatement, {
      as: 'financialStatement',
      foreignKey: {
        name: 'financialStatementId',
        allowNull: true,
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
    });

  },

  options: {
    tableName: 'customer_payment',
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

