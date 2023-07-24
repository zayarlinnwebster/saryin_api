/**
 * Route Mappings
 * (sails.config.routes)
 *
 * Your routes tell Sails what to do each time it receives a request.
 *
 * For more information on configuring custom routes, check out:
 * https://sailsjs.com/anatomy/config/routes-js
 */

module.exports.routes = {
  // User
  'POST /api/v1/user/login': {
    action: 'user/login-user'
  },
  'POST /api/v1/user/': {
    action: 'user/create-user'
  },
  'PUT /api/v1/user/:id': {
    action: 'user/update-user'
  },
  'GET /api/v1/user/': {
    action: 'user/get-user'
  },
  'PATCH /api/v1/user/:id/status': {
    action: 'user/update-status'
  },
  'PATCH /api/v1/user/:id/password': {
    action: 'user/update-password'
  },

  // Dashboard
  'GET /api/v1/dashboard/main/item': {
    action: 'dashboard/main/get-item-bar-chart'
  },
  'GET /api/v1/dashboard/main/total': {
    action: 'dashboard/main/get-amount-pie-chart'
  },
  'GET /api/v1/dashboard/main/amount': {
    action: 'dashboard/main/get-amount-line-chart'
  },
  'GET /api/v1/dashboard/main/customer-payment': {
    action: 'dashboard/main/get-customer-payment-bar-chart'
  },
  'GET /api/v1/dashboard/main/vendor-payment': {
    action: 'dashboard/main/get-vendor-payment-bar-chart'
  },

  // Dropdown
  'GET /api/v1/dropdown/item': {
    action: 'dropdown/get-item'
  },
  'GET /api/v1/dropdown/store': {
    action: 'dropdown/get-store'
  },
  'GET /api/v1/dropdown/customer': {
    action: 'dropdown/get-customer'
  },
  'GET /api/v1/dropdown/vendor': {
    action: 'dropdown/get-vendor'
  },

  // Item Routes
  'POST /api/v1/item/': {
    action: 'item/create-item',
  },
  'GET /api/v1/item/': {
    action: 'item/get-item',
  },
  'PUT /api/v1/item/:id': {
    action: 'item/update-item',
  },
  'DELETE /api/v1/item/:id': {
    action: 'item/delete-item',
  },

  // Store Routes
  'POST /api/v1/store/': {
    action: 'store/create-store',
  },
  'GET /api/v1/store/': {
    action: 'store/get-store',
  },
  'GET /api/v1/store/:id': {
    action: 'store/get-store-by-id',
  },
  'PUT /api/v1/store/:id': {
    action: 'store/update-store',
  },
  'DELETE /api/v1/store/:id': {
    action: 'store/delete-store',
  },
  'GET /api/v1/store/:id/stock-item/': {
    action: 'store/stock-item/get-stock-item-by-store-id'
  },
  'GET /api/v1/store/:id/usage': {
    action: 'store/get-store-usage-by-id'
  },

  // Stock Item Routes
  'POST /api/v1/store/stock-item/': {
    action: 'store/stock-item/create-stock-item'
  },
  'DELETE /api/v1/store/stock-item/:id': {
    action: 'store/stock-item/delete-stock-item'
  },
  'PUT /api/v1/store/stock-item/:id': {
    action: 'store/stock-item/update-stock-item'
  },
  'GET /api/v1/store/stock-item/': {
    action: 'store/stock-item/get-stock-item'
  },

  // Stock Item Out Routes
  'POST /api/v1/store/stock-item-out/': {
    action: 'store/stock-item-out/create-stock-item-out'
  },
  'DELETE /api/v1/store/stock-item-out/:id': {
    action: 'store/stock-item-out/delete-stock-item-out'
  },
  'PUT /api/v1/store/stock-item-out/:id': {
    action: 'store/stock-item-out/update-stock-item-out'
  },
  'GET /api/v1/store/stock-item-out/': {
    action: 'store/stock-item-out/get-stock-item-out'
  },

  // Customer Routes
  'POST /api/v1/customer/': {
    action: 'customer/create-customer',
  },
  'GET /api/v1/customer/': {
    action: 'customer/get-customer',
  },
  'PUT /api/v1/customer/:id': {
    action: 'customer/update-customer',
  },
  'DELETE /api/v1/customer/:id': {
    action: 'customer/delete-customer',
  },
  'GET /api/v1/customer/:id': {
    action: 'customer/get-customer-by-id'
  },
  'GET /api/v1/customer/:id/invoice': {
    action: 'invoice/get-invoice-by-customer-id'
  },
  'GET /api/v1/customer/:id/payment': {
    action: 'customer/payment/get-payment-by-customer-id'
  },

  // Vendor Routes
  'POST /api/v1/vendor/': {
    action: 'vendor/create-vendor',
  },
  'GET /api/v1/vendor/': {
    action: 'vendor/get-vendor',
  },
  'GET /api/v1/vendor/:id': {
    action: 'vendor/get-vendor-by-id'
  },
  'PUT /api/v1/vendor/:id': {
    action: 'vendor/update-vendor',
  },
  'DELETE /api/v1/vendor/:id': {
    action: 'vendor/delete-vendor',
  },
  'GET /api/v1/vendor/:id/invoice': {
    action: 'invoice/get-invoice-by-vendor-id'
  },
  'GET /api/v1/vendor/:id/payment': {
    action: 'vendor/payment/get-payment-by-vendor-id'
  },
  'GET /api/v1/vendor/:id/usage': {
    action: 'vendor/get-vendor-usage-by-id'
  },

  // Customer Routes
  'POST /api/v1/invoice/': {
    action: 'invoice/create-invoice',
  },
  'GET /api/v1/invoice/': {
    action: 'invoice/get-invoice',
  },
  'PUT /api/v1/invoice/:id': {
    action: 'invoice/update-invoice',
  },
  'DELETE /api/v1/invoice/:id': {
    action: 'invoice/delete-invoice',
  },
  'GET /api/v1/customer/:id/usage': {
    action: 'customer/get-customer-usage-by-id'
  },

  //Customer Payment Routes
  'POST /api/v1/customer/payment/': {
    action: 'customer/payment/create-payment'
  },
  'GET /api/v1/customer/payment/': {
    action: 'customer/payment/get-payment'
  },
  'PUT /api/v1/customer/payment/:id': {
    action: 'customer/payment/update-payment'
  },
  'DELETE /api/v1/customer/payment/:id': {
    action: 'customer/payment/delete-payment'
  },

  //Vendor Payment Routes
  'POST /api/v1/vendor/payment/': {
    action: 'vendor/payment/create-payment'
  },
  'GET /api/v1/vendor/payment/': {
    action: 'vendor/payment/get-payment'
  },
  'PUT /api/v1/vendor/payment/:id': {
    action: 'vendor/payment/update-payment'
  },
  'DELETE /api/v1/vendor/payment/:id': {
    action: 'vendor/payment/delete-payment'
  },
};
