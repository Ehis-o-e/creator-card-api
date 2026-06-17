const { ModelSchema, SchemaTypes, DatabaseModel } = require('@app-core/mongoose');

const modelName = 'creator-cards';

/**
 * @typedef {Object} ModelSchema
 * @property {String} _id
 * @property {String} title
 * @property {String} description
 * @property {String} slug
 * @property {String} creator_reference
 * @property {Array} links
 * @property {Object} service_rates
 * @property {String} status
 * @property {String} access_type
 * @property {String} access_code
 * @property {Number} created
 * @property {Number} updated
 * @property {Number} deleted
 */

const schemaConfig = {
  _id: { type: SchemaTypes.ULID },
  title: { type: SchemaTypes.String },
  description: { type: SchemaTypes.String },
  slug: { type: SchemaTypes.String, unique: true, index: true },
  creator_reference: { type: SchemaTypes.String },
  links: { type: SchemaTypes.Mixed },
  service_rates: { type: SchemaTypes.Mixed },
  status: { type: SchemaTypes.String },
  access_type: { type: SchemaTypes.String, default: 'public' },
  access_code: { type: SchemaTypes.String, default: null },
  created: { type: SchemaTypes.Number },
  updated: { type: SchemaTypes.Number },
};

const modelSchema = new ModelSchema(schemaConfig, { collection: modelName });

/** @type {ModelSchema} */
module.exports = DatabaseModel.model(modelName, modelSchema, { paranoid: true });
