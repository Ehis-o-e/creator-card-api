const { appLogger } = require('@app-core/logger');
const validator = require('@app-core/validator');
const { throwAppError, ERROR_CODE } = require('@app-core/errors');
const { CreatorCardMessages } = require('../../messages');
const CreatorCard = require('../../repository/creator-card/index');

// specs required for retrieving data
const getCreatorCardspec = `root {
  slug string<trim|minLength:5|maxLength:50>
  access_code? string<trim>
}`;

const parsedGetSpecs = validator.parse(getCreatorCardspec);

async function getCreatorCard(serviceData, option = {}) {
  // validate incoming date
  const data = validator.validate(serviceData, parsedGetSpecs);

  let result;

  try {
    // find card and exclude those that are soft-delete record
    const card = await CreatorCard.findOne({
      query: {
        slug: data.slug,
        deleted: null,
      },
    });

    if (!card) {
      throwAppError(CreatorCardMessages.NOT_FOUND, 'NF01');
    }

    // draft should not be retrieve
    if (card.status === 'draft') {
      throwAppError(CreatorCardMessages.DRAFT_NOT_FOUND, 'NF02');
    }

    // for private, check access code
    if (card.access_type === 'private') {
      // Check if there is an access cide
      if (!data.access_code) {
        throwAppError(CreatorCardMessages.ACCESS_CODE_REQUIRED, ERROR_CODE.AUTHERR);
      }
      // Check if the access code is correct
      if (data.access_code !== card.access_code) {
        throwAppError(CreatorCardMessages.INVALID_ACCESS_CODE, ERROR_CODE.AUTHERR);
      }
    }

    result = {
      id: card._id,
      title: card.title,
      description: card.description ?? null,
      slug: card.slug,
      creator_reference: card.creator_reference,
      links: card.links ?? [],
      service_rates: card.service_rates ?? null,
      status: card.status,
      access_type: card.access_type,
      created: card.created,
      updated: card.updated,
      deleted: card.deleted,
    };
  } catch (error) {
    appLogger.errorX(error, 'get-creator-card-error');
    throw error;
  }
  return result;
}

module.exports = getCreatorCard;
