/* eslint-disable node/no-unpublished-require */
const path = require('path');

const useMockModel = parseInt(process.env.USE_MOCK_MODEL, 10);

let modelReference;

if (useMockModel) {
  // eslint-disable-next-line global-require, import/no-dynamic-require
  modelReference = require(path.join(process.cwd(), 'mock-models'));
} else {
  // eslint-disable-next-line global-require, import/no-dynamic-require
  modelReference = require(path.join(process.cwd(), 'models'));
}

/**
 * Retrieves a model based on the provided model name.
 * @template {keyof typeof import('@app/models')} T
 * @param {T | (typeof import('@app/models'))[T]} modelOrName - The name of the model to retrieve or the model itself.
 * @returns {typeof import('@app/models')[T]} The requested model.
 * @throws {Error} If no model name is provided.
 */
function getModel(modelOrName) {
  if (typeof modelOrName === 'string') {
    const model = modelReference[modelOrName];

    if (!model) {
      throw new Error(`Model not found for name: ${modelOrName}`);
    }

    return model;
  }

  return modelOrName;
}

module.exports = getModel;
