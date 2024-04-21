/**
 * Customer.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

const { TEXT, STRING, DECIMAL } = require('sequelize');

module.exports = {

  attributes: {

    fullName: {
      type: STRING(60),
      unique: {
        msg: 'fullName must be unique'
      },
      allowNull: false,
      validate: {
        notEmpty: {
          args: true,
          msg: 'fullName cannot be empty'
        },
        notNull: {
          args: true,
          msg: 'fullName must be required'
        },
        len: {
          args: [0, 60],
          msg: 'fullName must be less than 60 characters'
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

  },

  associations: function () {

    Customer.hasMany(Invoice, {
      as: 'invoices',
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

    // Customer.hasMany(ArchivedInvoice, {
    //   as: 'archivedInvoices',
    //   foreignKey: {
    //     name: 'customerId',
    //     allowNull: false,
    //     validate: {
    //       notNull: {
    //         args: true,
    //         msg: 'customerId must be required'
    //       },
    //     }
    //   },
    //   onDelete: 'RESTRICT',
    //   onUpdate: 'CASCADE',
    // });


    Customer.hasMany(CustomerPayment, {
      as: 'payments',
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

    Customer.hasMany(StockItem, {
      as: 'stockItems',
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

  },

  options: {
    tableName: 'customer',
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

