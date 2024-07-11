'use strict';

/**
 * contragent service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::contragent.contragent');
