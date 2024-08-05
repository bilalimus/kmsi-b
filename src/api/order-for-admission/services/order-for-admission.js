'use strict';

/**
 * order-for-admission service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::order-for-admission.order-for-admission');
