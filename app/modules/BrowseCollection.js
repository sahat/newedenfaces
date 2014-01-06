

define(function(require, exports, module) {
  var _ = require('underscore');
  var $ = require('jquery');
  var Backbone = require('backbone');
  var PageableCollection = require('PageableCollection');
  var CharacterModel = require('modules/CharacterModel');

  var BrowseCollection = Backbone.PageableCollection.extend({
    model: CharacterModel,
    url: "/api/browse",

    // Any `state` or `queryParam` you override in a subclass will be merged with
    // the defaults in `Backbone.PageableCollection` 's prototype.
    state: {

      // You can use 0-based or 1-based indices, the default is 1-based.
      // You can set to 0-based by setting ``firstPage`` to 0.
      firstPage: 1,

      // Set this to the initial page index if different from `firstPage`. Can
      // also be 0-based or 1-based.
      currentPage: 2,

      // Required under server-mode
      totalRecords: 6623
    },

    // You can configure the mapping from a `Backbone.PageableCollection#state`
    // key to the query string parameters accepted by your server API.
    queryParams: {

      // `Backbone.PageableCollection#queryParams` converts to ruby's
      // will_paginate keys by default.
      currentPage: "currentPage",
      pageSize: "page_size"
    }
  });

  return BrowseCollection;
});
