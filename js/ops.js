'use strict';

function buildWebMapping() {
  var vectorSource = new ol.source.Vector({});
  var vectorLayer = new ol.layer.Vector({ source: vectorSource, style: Geops.styles.projectType });
  var map = Geops.geoUtils.getDefaultMap({ target: 'map-container' });
  map.addLayer(vectorLayer);
  return {
    vectorSource: vectorSource,
    vectorLayer: vectorLayer,
    view: map.getView(),
    map: map
  }
}

function applyFilterToLocations(locations, filters) {
  return locations
    .filter(function(l) {return filters.type.indexOf(l.getProperties().type) >= 0; })
    .filter(function(l) {return filters.context.indexOf(l.getProperties().context) >= 0; })
    .filter(function(l) {return filters.popType.indexOf(l.getProperties().popType) >= 0; });
}

function render(webMapping, UI, state) {

  console.log(state);

  var features = applyFilterToLocations(state.locations, state.filters);

  webMapping.vectorSource.clear();
  webMapping.vectorSource.addFeatures(features);  

  if(UI.typeCheckboxes.items.length === 0) {
    var typeItems = state.filters.type.map(function(t) { return { label: t, value: t }; });
    var contextItems = state.filters.context.map(function(c) { return { label: Geops.CONTEXTS[c], value: c.toString() }; });
    var popTypeItems = state.filters.popType
      .map(function(p) { return { label: Geops.POPULATION_TYPES[p], value: p.toString() }; })
      .filter(function(item) { return item.label !== undefined; });

    UI.typeCheckboxes.render(typeItems);
    UI.contextCheckboxes.render(contextItems);
    UI.popTypeCheckboxes.render(popTypeItems);
  }
}

function applyFilter(elm, type) {
  return Rx.Observable.fromEvent(elm, 'click')
    .pluck('target')
    .filter(function(t) { return t.tagName.toUpperCase() === 'INPUT'; })
    .map(function(t) { return { value: t.value, checked: t.checked, filter: type }; })
    .map(function(param) {
      return function(state) {
        if(param.checked) {
          state.filters[param.filter].push(param.value);
        } else {
          var index = state.filters[param.filter].indexOf(param.value);
          state.filters[param.filter].splice(index, 1);
        }
        return state;
      }
    });  
}

function main() {
  var webMapping = buildWebMapping();

  var filterType = $('#filter-type');
  var filterContext = $('#filter-context');
  var filterPopType = $('#filter-pop-type');

  var UI = {};
  UI.typeCheckboxes = new Geops.UI.Checkboxes(filterType, $('#checkboxes-template').html());
  UI.contextCheckboxes = new Geops.UI.Checkboxes(filterContext, $('#checkboxes-template').html());
  UI.popTypeCheckboxes = new Geops.UI.Checkboxes(filterPopType, $('#checkboxes-template').html());

  var data$ = Rx.Observable.just(Geops.data);
  var projects$ = data$.map(Geops.geoUtils.getProjects);
  var initFilters$ = projects$.map(Geops.reducers.initFilters);

  var filterByType$ = applyFilter(filterType, 'type');
  var filterByContext$ = applyFilter(filterContext, 'context');
  var filterByPopType$ = applyFilter(filterPopType, 'popType');
  
  var state$ = Rx.Observable.merge(initFilters$, filterByType$, filterByContext$, filterByPopType$)
    .scan(function(acc, curr) { return curr(acc); }, {});
    
  state$.subscribe(render.bind(this, webMapping, UI));
}

main();
