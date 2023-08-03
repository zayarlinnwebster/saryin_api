/**
 * Invoice.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

const { DATEONLY, NOW, DECIMAL, STRING } = require('sequelize');

module.exports = {

  attributes: {

    invoiceNo: {
      type: STRING(20),
      unique: {
        msg: 'invoiceNo must be unique',
      },
      allowNull: false,
      validate: {
        notEmpty: {
          args: true,
          msg: 'invoiceNo cannot be empty'
        },
        notNull: {
          args: true,
          msg: 'invoiceNo must be required'
        },
        len: {
          args: [0, 20],
          msg: 'invoiceNo must be less than 20 characters'
        }
      }
    },

    invoiceDate: {
      type: DATEONLY,
      defaultValue: NOW
    },

    totalItemAmount: {
      type: DECIMAL(19, 2).UNSIGNED,
      allowNull: false,
      validate: {
        notEmpty: {
          args: true,
          msg: 'totalItemAmount cannot be empty'
        },
        notNull: {
          args: true,
          msg: 'totalItemAmount must be required'
        },
        min: {
          args: [0],
          msg: 'totalItemAmount must be greater than or equal to 0',
        },
      }
    },

    laborFee: {
      type: DECIMAL(19, 2).UNSIGNED,
      allowNull: false,
      validate: {
        notEmpty: {
          args: true,
          msg: 'laborFee cannot be empty'
        },
        notNull: {
          args: true,
          msg: 'laborFee must be required'
        },
        min: {
          args: [0],
          msg: 'laborFee must be greater than or equal to 0',
        },
      }
    },

    generalFee: {
      type: DECIMAL(19, 2).UNSIGNED,
      allowNull: false,
      validate: {
        notEmpty: {
          args: true,
          msg: 'generalFee cannot be empty'
        },
        notNull: {
          args: true,
          msg: 'generalFee must be required'
        },
        min: {
          args: [0],
          msg: 'generalFee must be greater than or equal to 0',
        },
      }
    },

    totalAmount: {
      type: DECIMAL(19, 2).UNSIGNED,
      allowNull: false,
      validate: {
        notEmpty: {
          args: true,
          msg: 'totalAmount cannot be empty'
        },
        notNull: {
          args: true,
          msg: 'totalAmount must be required'
        },
        min: {
          args: [0],
          msg: 'totalAmount must be greater than or equal to 0',
        },
      }
    },

  },

  associations: function () {

    Invoice.belongsTo(Vendor, {
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

    Invoice.hasMany(InvoiceDetail, {
      as: 'invoiceDetails',
      foreignKey: {
        name: 'invoiceId',
        allowNull: false,
        validate: {
          notNull: {
            args: true,
            msg: 'invoiceId must be required'
          },
        }
      },
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE',
    });

  },

  options: {
    tableName: 'invoice',
    charset: 'utf8',
    collate: 'utf8_general_ci',
    underscored: true,
    timestamps: true,
    classMethods: {
      generateInvoiceNo: async () => {
        // Find the last invoice number from the database
        const lastInvoice = await Invoice.findOne({
          order: [['createdAt', 'DESC']],
          attributes: ['invoiceNo'],
        })
          .catch((err) => {
            throw new Error(err);
          });

        let lastNumber = 0;

        if (lastInvoice) {
          const lastInvoiceNumber = lastInvoice.invoiceNo;
          // Extract the numeric part of the last invoice number and parse it to an integer
          lastNumber = parseInt(lastInvoiceNumber.split('-')[1]);
        }

        // Increment the last number by 1
        const newNumber = lastNumber + 1;

        // Format the new invoice number with the desired prefix and leading zeros
        const formattedNumber = `SRN-${String(newNumber).padStart(6, '0')}`;

        return formattedNumber;
      }
    },
    instanceMethods: {},
    hooks: {},
    scopes: {},
  }

};

