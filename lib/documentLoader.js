/*!
 * Copyright (c) 2018 Digital Bazaar, Inc. All rights reserved.
 */
'use strict';

// load locally embedded contexts
const contexts = require('./contexts');

const api = {};
module.exports = api;

api.extendContextLoader = documentLoader => {
  return async url => {
    const context = contexts[url];
    if(context !== undefined) {
      // console.log('context in contexts.js', context, url);
      return {
        contextUrl: null,
        documentUrl: url,
        document: context
      };
    }
    return documentLoader(url);
  };
};

/**
 * The strictDocumentLoader ensure an error is thrown
 * if no loader is specified.
 *
 * @param {url} url - The url for the document to be loaded.
 *
 * @throws {Error} Will throw if no loader is specified.
 * @returns {Function} Returns a loader that always errors.
 */
api.strictDocumentLoader = api.extendContextLoader(url => {
  throw new Error(`${url} not found.`);
});
