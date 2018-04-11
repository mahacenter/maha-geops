'use strict'

function buildDom() {
  return {
    selectMission: $('#selectMission'), 
    selectProject: $('#selectProject'),
    selectTpl: $('#select-template'),
    selectYear: $('#selectYear'),
    donutCtnr: $('#donut-container'),
    rowChartCtnr: $('#row-chart-container'),
    restrictionsCtnr: $('#restrictions-container'),
    restrictionsTableTpl: $('#restrictions-table-template'),
    yearErrorP: $('#year-error'),
    infoControl: $('#info-control'),
    infoDetails: $('#info-details'),
    infoDetailsTpl: $('#info-details-template'),
    rowChart: $('#row-chart')
  }
}

function buildWebMapping(dom) {
  var vectorSource = new ol.source.Vector({});
  var vectorLayer = new ol.layer.Vector({ source: vectorSource });

  var info = new ol.control.Control({
    element: dom.infoControl[0]
  });

  var hover = new ol.interaction.Select({
    condition: ol.events.condition.pointerMove,
    layers: [vectorLayer],
    hitTolerance: 0
  });

  var click = new ol.interaction.Select({
    condition: ol.events.condition.singleClick,
    layers: [vectorLayer],
    hitTolerance: 0
  });

  var map = Geops.geoUtils.getDefaultMap({ target: 'map-container' });
  var view = map.getView();

  map.addLayer(vectorLayer);
  map.addControl(info);
  map.addInteraction(hover);
  map.addInteraction(click);
  view.setMinZoom(1);

  return {
    vectorSource: vectorSource,
    vectorLayer: vectorLayer,
    hover: hover,
    click: click,
    view: view,
    map: map
  }
}

function makeGapChart(gaps, bars, dom) {
  var width = dom.rowChartCtnr.width();
  var ndx = crossfilter(gaps);
  var nameDimension = ndx.dimension(function(d) { return d.mission + ' - ' + d.gap.toLocaleString('de-DE') + '%'; });
  var group = nameDimension.group().reduceSum(function(d) { return d.gap; });

  bars
    .width(width)
    .height(800)
    .margins({top: 12, right: 12, bottom: 30, left: 8})
    .dimension(nameDimension)
    .group(group)
    .title(function(d) { return ''; })
    .ordering(function(d) { return -d.value; })
    .elasticX(true)
    .xAxis().ticks(4).tickFormat(function(v) { return v.toLocaleString('de-DE') + '%'; });

  dom.rowChartCtnr[0].style.height = '800px';

  bars.addFilterHandler(function(filters, filter) {
    filters.length = 0;
    filters[0] = filter;
    return filters;
  });

  bars.render();  
}

function renderGaps(missions, selectedMission, changeSelect, bars, dom) {

  var gaps = missions
    .map(function(m) { return { mission: m.mission, gap: m.gap }; })
    .filter(function(g) { return g.gap !== undefined; });

  function redrawChart(g, b, mission) {
    var find = g.find(function(gap) { return gap.mission.toUpperCase() === mission.toUpperCase(); });
    var filter = find === undefined ? 'allGrey' : find.mission + ' - ' + find.gap.toLocaleString('de-DE') + '%';

    b.filterAll();
    if(selectedMission !== 'all') { b.filter(filter); }
    b.redrawGroup();
  }

  if(dom.rowChartCtnr[0].clientHeight === 0) {
    makeGapChart(gaps, bars, dom);
    return;
  };

  if(dom.rowChartCtnr[0].clientHeight > 0 && changeSelect) {
    redrawChart(gaps, bars, selectedMission);
  }
}

function findProjectsForMission(missions, mission) {
  return missions.find(function(m) { return m.mission === mission; }).projects;
}

function renderSelects(missions, selectedMission, selectedProject, changeSelect, dom) {
  var selectTpl = dom.selectTpl.html();
  var projects = selectedMission === 'all' ? [] : findProjectsForMission(missions, selectedMission);

  if(changeSelect) {
    dom.selectMission.html(_.template(selectTpl, {
      options: missions.map(function(m) { return m.mission; }),
      all: 'Select mission',
      selected: selectedMission
    }));

    dom.selectProject.html(_.template(selectTpl, {
      options: projects.map(function(p) { return p.code + ' - ' + p.type + ' / ' + p.location; }),
      all: 'Select project',
      selected: selectedProject
    }));

    dom.selectProject.prop('disabled', (selectedMission === 'all'));
  }
}

function toDisplay(missions, selectedMission, projectCode) {
  return selectedMission === 'all' ? missions : projectCode === 'all' ? 
    findProjectsForMission(missions, selectedMission) :
    findProjectsForMission(missions, selectedMission).filter(function(p) { return p.code === projectCode });
}

function renderFeatures(locations, level, webMapping) {
  var features = Geops.geoUtils.locationsToPointFeatures(locations, level);
  var minZoom = level === Geops.LEVELS.MISSION ? 4 : 8;
  
  webMapping.vectorSource.clear();
  webMapping.vectorSource.addFeatures(features);

  var extent = level === Geops.LEVELS.MISSION ? 
    ol.proj.transformExtent(locations[0].countryExtent, 'EPSG:4326', 'EPSG:3857') : 
    webMapping.vectorSource.getExtent();
  
  if(level === Geops.LEVELS.WORLD) {
    webMapping.view.fit(extent, {duration: 1000, maxZoom: 11, padding: [50, 20, 5, 20]});
    return;
  }

  if(webMapping.view.getZoom() === 1) {
    webMapping.view.fit(extent, {duration: 1000, maxZoom: 11, padding: [50, 20, 5, 20]});
    return;
  }

  webMapping.view.flyTo(extent, [50, 50, 50, 50], webMapping.map.getSize(), minZoom, 11);
}

function renderSelectedFeatures(selectedFeature, level, filterStaff, webMapping, dom) {
  var fSL = filterStaff.length;
  var selStyle = fSL === 0 || fSL === 2 ? Geops.styles.selCamenbert : filterStaff[0] === 'National HR' ? Geops.styles.selNSFilter : Geops.styles.selISFilter;
  var infoDetailsTpl = dom.infoDetailsTpl.html();
  var props = selectedFeature.getProperties();
  
  selectedFeature.setStyle(selStyle);
  dom.infoDetails.html(_.template(infoDetailsTpl, { 
    type: level !== Geops.LEVELS.WORLD ? 'project' : 'mission',
    name: level !== Geops.LEVELS.WORLD ? props.name : props.mission,
    NS: props.NS,
    IS: props.IS
  }));
  dom.infoControl.show();
}

function renderWebMap(changeSelect, filterStaff, selectedFeature, locations, level, webMapping, dom) {
  var fSL = filterStaff.length;
  var style = fSL === 0 || fSL === 2 ? Geops.styles.camenbert : filterStaff[0] === 'National HR' ? Geops.styles.NSFilter : Geops.styles.ISFilter;
  
  if(selectedFeature !== undefined) {
    renderSelectedFeatures(selectedFeature, level, filterStaff, webMapping, dom);  
  } else {
    dom.infoControl.hide();
    webMapping.vectorSource.getFeatures().forEach(function(f) { f.setStyle(null); }); 
  }
  
  if(changeSelect) {
    renderFeatures(locations, level, webMapping);
  }

  webMapping.click.getFeatures().clear();
  webMapping.vectorLayer.setStyle(style);
}

function makeDonut(missions, selectedMission, selectedProject, dom, donut) {
  var code = selectedProject !== 'all' ? selectedProject.split(' - ')[0] : 'all';
  var toDonut = toDisplay(missions, selectedMission, code);

  var totalStaff = toDonut.reduce(function(acc, curr) {
    var NS = { type: 'NS', nb: curr.NS };
    var IS = { type: 'IS', nb: curr.IS };
    acc.push(NS); 
    acc.push(IS);
    return acc;
  }, []);

  var ndx = crossfilter(totalStaff);
  var dimension = ndx.dimension(function(d) { return d.type === 'NS' ? 'National HR' : 'International HR'; });
  var group = dimension.group().reduceSum(function(d) { return d.nb });
  var width = dom.donutCtnr.width();
  var total = group.all().reduce(function(acc, curr) {
    return acc + curr.value;
  }, 0);

  dom.donutCtnr[0].style.height = (width + 30) + 'px';

  donut
    .width(width - 10)
    .height(width + 30)
    .externalRadiusPadding(4)
    .innerRadius((width - 10) / 5)
    .ordinalColors(['rgba(119, 153, 204, 0.7)', 'rgba(255, 187, 68, 0.7)'])
    .dimension(dimension)
    .group(group)
    .title(function(d) {
      return d.key + ': ' + Math.round(d.value).toLocaleString('de-DE');
    });

  donut.cy((width / 2));  

  donut.legend(dc.legend().legendText(function(d) {
      return d.name + ' - ' + Math.round((d.data / total) * 100) + ' %';
    })
    .x(0)
    .y(width)
    .itemHeight(13)
    .gap(5));  

  donut.render();
}

function renderDonut(missions, selectedMission, selectedProject, changeSelect, dom, donut) {
  if(changeSelect) {
    makeDonut(missions, selectedMission, selectedProject, dom, donut)
  }
}

function renderRestrictions(missions, selectedMission, dom) {
  var restrictionsTpl = dom.restrictionsTableTpl.html();
  var mission = missions.find(function(m) { return m.mission === selectedMission; });
  var restrictions = mission === undefined ? undefined : [mission.restrictions];
  dom.restrictionsCtnr.html(_.template(restrictionsTpl, {restrictions: restrictions}));  
}

function render(webMapping, dom, donut, bars, state) {
  renderSelects(state.missions, state.selectedMission, state.selectedProject, state.changeSelect, dom);
  renderWebMap(state.changeSelect, state.filterStaff, state.selectedFeature, state.locations, state.level, webMapping, dom);
  renderDonut(state.missions, state.selectedMission, state.selectedProject, state.changeSelect, dom, donut);
  renderRestrictions(state.missions, state.selectedMission, dom);
  renderGaps(state.missions, state.selectedMission, state.changeSelect, bars, dom);
}

function main() {
  var dom = buildDom(); 
  var webMapping = buildWebMapping(dom);
  var donut = dc.pieChart("#donut");
  var bars = dc.rowChart('#row-chart');

  var barsFilter$ = Rx.Observable.just(bars);

  var changeMission$ = Rx.Observable.fromEvent(dom.selectMission, 'change').pluck('target', 'value');
  var changeProject$ = Rx.Observable.fromEvent(dom.selectProject, 'change').pluck('target', 'value');

  var hoverFeature$ = Rx.Observable.fromEvent(webMapping.hover, 'select').pluck('selected');
  var clickFeature$ = Rx.Observable.fromEvent(webMapping.click, 'select').pluck('selected');

  var clickBars$ = Rx.Observable.fromEvent(dom.rowChart, 'click')
    .pluck('target').filter(function(t) { return /^path|text$/.test(t.tagName); });
  
  var data$ = Rx.Observable.just(Geops.data).map(Geops.reducers.data);  

  var filterStaff$ = Rx.Observable.combineLatest(
      Rx.Observable.fromEvent($("#donut"), 'click').filter(function(ev) { return /^path|text$/.test(ev.target.tagName); }),
      Rx.Observable.just(donut))
    .map(function(data) { return data[1].filters(); })
    .map(function(filterStaff) {
      return function(state) {
        state.filterStaff = filterStaff;
        state.changeSelect = false;
        return state;
      }
    });

  var selectOnClick$ = clickFeature$
    .map(function(selected) { return selected[0].getProperties(); })
    .map(Geops.reducers.selectOnClick);

  var selectMissionViaGap$ = Rx.Observable.combineLatest(clickBars$, barsFilter$)
    .filter(function(data) { return data[1].filters().length > 0; })
    .map(function(data) { return data[1].filters()[0].split(' - ')[0]; }) 
    .map(Geops.reducers.changeMission);

  var selectFeature$ = hoverFeature$
    .map(function(selected) { return selected[0]; })
    .map(function(feature) {
      return function(state) {
        state.selectedFeature = feature;
        state.changeSelect = false;
        return state;
      }
    });
 
  var selectedMission$ = changeMission$.map(Geops.reducers.changeMission);
  var selectedProject$ = changeProject$.map(Geops.reducers.changeProject);   

  var state$ = Rx.Observable.merge(
      data$,
      filterStaff$,
      selectFeature$,
      selectOnClick$,
      selectedMission$,
      selectedProject$,
      selectMissionViaGap$)
    .scan(function(acc, curr) {
      return curr(acc);
    }, { selectedMission: 'all', selectedProject: 'all', filterStaff: [], changeSelect: false });  

  state$.subscribe(render.bind(this, webMapping, dom, donut, bars)); 

  // display error when hover over select Year
  Rx.Observable.merge(
    Rx.Observable.fromEvent(dom.selectYear, 'mouseenter').map(true),
    Rx.Observable.fromEvent(dom.selectYear, 'mouseleave').map(false))
  .subscribe(function(show) { dom.yearErrorP[0].style.visibility = show === true ? 'visible' : 'hidden'; });

 }

main();