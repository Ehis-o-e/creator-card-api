const { throwAppError, ERROR_CODE } = require('@app-core/errors');
const { appLogger } = require('@app-core/logger');
const validator = require('@app-core/validator');
const { CreatorCardMessages } = require('../../messages');
const CreatorCard = require('../../repository/creator-card/index');

// Spec for Creating Creator-Card
const createCreatorCardSpec = `root {
    title string<trim|minLength:3|maxLength:100>
    description? string<trim|maxLength:500>
    slug? string<trim|minLength:5|maxLength:50>
    creator_reference string<length:20>
    links[]? {
        title string<trim|minLength:1|maxLength:100>
        url string<trim|maxLength:200>
    }
    service_rates? {
        currency string(NGN|USD|GBP|GHS)
        rates[] {
            name string<trim|minLength:3|maxLength:100>
            description? string<trim|maxLength:250>
            amount number<min:1>
        }
    }
    status  string(draft|published)
    access_type? string(public|private)
    access_code? string<length:6>

}`;

// Parse the spec outside the service function
const parsedCreateSpec = validator.parse(createCreatorCardSpec);

// Helper function
// Generate Slug name from creator card title
function generateSlug(title) {
  return title
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9\-_]/g, '');
}

// Generate suffic to add to create card title
function slugSuffix() {
  return Math.random().toString(36).slice(2, 8);
}

// Generate unique slug name
async function generateUniqueSlug(baseSlug) {
  const existingSlug = await CreatorCard.findOne({
    query: { slug: baseSlug },
    deleted: null,
  });

  if (!existingSlug) {
    return baseSlug;
  }

  return generateUniqueSlug(`${baseSlug}-${slugSuffix()}`);
}

// Service function
async function createCreatorCard(serviceData, options = {}) {
  // Validate incoming data
  const data = validator.validate(serviceData, parsedCreateSpec);

  let result;

  try {
    // check for access_code condition
    // if private, access_code should be given
    if (data.access_type === 'private' && !data.access_code) {
      throwAppError(CreatorCardMessages.ACCESS_CODE_REQUIRED, 'AC01');
    }

    // if public, access code should not be given
    if ((data.access_type === 'public' || !data.access_type) && data.access_code) {
      throwAppError(CreatorCardMessages.ACCESS_CODE_NOT_ALLOWED, 'AC05');
    }

    // check the if the url under the link start with https:// or http://
    if (data.links?.length) {
      const invalidLink = data.links.some(
        (link) => !link.url.startsWith('http://') && !link.url.startsWith('https://')
      );

      if (invalidLink) {
        throwAppError('Link URL must start with http:// or https://', ERROR_CODE.INVLDREQ);
      }
    }

    // Rate must be an integer with no decimals
    if (data.service_rates?.rates?.length) {
      const invalidRate = data.service_rates.rates.some(
        (rate) => !Number.isInteger(rate.amount) || rate.amount < 1
      );

      if (invalidRate) {
        throwAppError('Rate must be a positive integer', ERROR_CODE.INVLDREQ);
      }
    }

    // Slug handling
    const userSlug = data.slug?.trim();

    if (userSlug) {
      // check if it exist in the database
      const existingSlug = await CreatorCard.findOne({
        query: {
          slug: userSlug,
          deleted: null,
        },
      });

      if (existingSlug) {
        throwAppError(CreatorCardMessages.SLUG_TAKEN, 'SL02');
      }

      // if it doesn't exist
      data.slug = userSlug;
    } else {
      // if slug not inputted, autogenerate from the title
      let baseSlug = generateSlug(data.title);

      // if slug is below 5 character after cleaning
      if (baseSlug.length < 5) {
        baseSlug = `${baseSlug}-${slugSuffix()}`;
      }
      // if the slug is above 5
      data.slug = await generateUniqueSlug(baseSlug);
    }

    // set the default values if null or undefined
    data.access_type = data.access_type ?? 'public';
    data.access_code = data.access_code ?? null;

    // save to database
    const card = await CreatorCard.create(data, options);
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
      deleted: card.deleted,
    };
  } catch (error) {
    appLogger.errorX(error, 'create-creator-card-error');
    throw error;
  }
  return result;
}

module.exports = createCreatorCard;
