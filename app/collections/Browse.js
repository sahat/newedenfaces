define(['underscore', 'jquery', 'backbone', 'PageableCollection',
  'models/Character'], function (_, $, Backbone, PageableCollection, CharacterModel) {

  var BrowseCollection = Backbone.PageableCollection.extend({
    model: CharacterModel,
    url: "/api/browse",
    state: {
      firstPage: 1,
      currentPage: 2,
      totalRecords: 6700
    },
    queryParams: {
      currentPage: "currentPage",
      pageSize: "page_size"
    }
  });

  return BrowseCollection;
});
