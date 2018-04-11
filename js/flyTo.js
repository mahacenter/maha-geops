'use strict';

ol.View.prototype.flyToAnimation_ = function(center, startZoom, endZoom) {
  var duration = 3000;
  var parts = 2;
  var called = false;
  
  function callback(complete) {
    --parts;
    if (called) {
      return;
    }
    if (parts === 0 || !complete) {
      called = true;
    }
  }

  this.animate({
    center: center,
    duration: duration
  }, callback);

  this.animate({
    zoom: startZoom - 1,
    duration: duration / 2
  }, {
    zoom: endZoom,
    duration: duration / 2
  }, callback);
}

ol.View.prototype.flyTo = function(extent, padding, size, minZoom, maxZoom) {
  var newSize = [size[0] - padding[1] - padding[3], size[1] - padding[0] - padding[2]];
  var res = this.getResolutionForExtent(extent, newSize);
  var area = ol.extent.getArea(extent);
  var center = area > 1 ? ol.extent.getCenter(extent) : [extent[0], extent[1]];
  var startZoom = Math.min(minZoom, this.getZoom());
  var endZoom = area <= 1 ? maxZoom : Math.min(this.getZoomForResolution(res), maxZoom);

  this.flyToAnimation_(center, startZoom, endZoom);
}