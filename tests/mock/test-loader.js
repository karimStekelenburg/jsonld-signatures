/*!
 * Copyright (c) 2018 Digital Bazaar, Inc. All rights reserved.
 */
'use strict';

const {controllers, publicKeys} = require('./keys');
const mockDocuments = require('./mock-documents');

const documents = {};
for(const key in publicKeys) {
  documents[publicKeys[key].id] = publicKeys[key];
}
for(const key in controllers) {
  documents[controllers[key].id] = controllers[key];
}

for(const key in mockDocuments) {
  documents[mockDocuments[key].id] = mockDocuments[key];
}

module.exports = async url => {
  if(url in documents) {
    return {
      contextUrl: null,
      document: documents[url],
      documentUrl: url
    };
  }
  throw new Error(`Document "${url}" not found.`);
};
