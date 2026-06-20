const { throwAppError, ERROR_CODE } = require('@app-core/errors');
const { appLogger } = require('@app-core/logger');
const validator = require('@app-core/validator');
const { CreatorCardMessages } = require('@app/messages');
const CreatorCard = require('@app/repository/creator-card/index');

// specs required on deleting data
const deleteCreatorCardSpec = `root{
    slug string<trim|minLength:5|maxLength:50>
    creator_reference <length:20>
}`;

const parseDeleteSpec = validator.parse(deleteCreatorCardSpec);

async function deleteCreatorCard(serviceData, options = {}) {
  // validate data
  const data = validator.validate(serviceData, parseDeleteSpec);

  let result;

  try {
    // Find card except soft-deleted
    const card = await CreatorCard.findOne({
      query: {
        slug: data.slug,
        deleted: null,
      },
    });

    if (!card) {
      throwAppError(CreatorCardMessages.NOT_FOUND, 'NF01');
    }

    // soft delete if it exist
    await CreatorCard.deleteOne({
      query: { slug: data.slug },
    });

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
      access_code: card.access_code,
      created: card.created,
      updated: card.updated,
      deleted: Date.now(),
    };
  } catch (error) {
    appLogger.errorX(error, 'delete-creator-card-error');
    throw error;
  }

  return result;
}

module.exports = deleteCreatorCard;
