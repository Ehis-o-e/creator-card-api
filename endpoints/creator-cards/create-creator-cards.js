const { createHandler } = require('@app-core/server');
const { appLogger } = require('@app-core/logger');
const createCreatorCard = require('../../services/creator-cards/create-creator-cards');

module.exports = createHandler({
  path: '/creator-cards',
  method: 'post',
  async onResponseEnd(rc, rs) {
    appLogger.info({ requestContext: rc, response: rs }, 'create-creator-card-request-completed');
  },

  async handler(rc, helpers) {
    const payload = { ...rc.body };

    const data = await createCreatorCard(payload);

    return {
      status: helpers.http_statuses.HTTP_200_OK,
      message: 'Creator Card Created Successfully.',
      data,
    };
  },
});
