const { createHandler } = require('@app-core/server');
const { appLogger } = require('@app-core/logger');
const deleteCreatorCard = require('../../services/creator-cards/delete-creator-cards');

module.exports = createHandler({
  path: '/creator-cards/:slug',
  method: 'delete',
  async onResponseEnd(rc, rs) {
    appLogger.info({ requestContext: rc, response: rs }, 'delete-creator-card-request-completed');
  },
  async handler(rc, helpers) {
    const payload = {
      slug: rc.params.slug,
      ...rc.body,
    };

    const data = await deleteCreatorCard(payload);

    return {
      status: helpers.http_statuses.HTTP_200_OK,
      message: 'Creator Card Deleted Successfully.',
      data,
    };
  },
});
