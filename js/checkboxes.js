'use strict';

var Geops = Geops || {};
Geops.UI = Geops.UI || {};

(function(){

  Geops.UI.Checkboxes = function($el, template) {
    this.$el = $el;
    this.template = template;
    this.items = [];
  };

  Geops.UI.Checkboxes.prototype.render = function(items) {
    this.items = items;
    this.$el.html(_.template(this.template, {items: this.items}));
  }
}());