'use strict';

var Geops = Geops || {};

(function(){

  function buildDOM() {
    return {
      selectMission: $('#selectMission'),
      selectProject: $('#selectProject'),
      selectTpl: $('#select-template'),
      popup: $('#popup'),
      popupCloser: $('#popup-closer'),
      popupContent: $('#popup-content'),
      popupTpl: $('#popup-template'),
      detailsHook: $('#details-hook'),
      projectDetailsTpl: $('#project-details-template'),
      missionDetailsTpl: $('#mission-details-template')
    }
  }

  function buildWebMapping(dom) {
    var multiLineString = new ol.geom.MultiLineString([]);
    var vectorSource = new ol.source.Vector({});
    
    var clusterSource = new ol.source.Cluster({
      distance: 5,
      source: vectorSource
    });

//    var vectorLayer = new ol.layer.AnimatedCluster({
    var vectorLayer = new ol.layer.Vector({
      source: clusterSource,
      animationDuration: 500,
      style: Geops.styles.OCBIcon
    });

    var expandedClusterSource = new ol.source.Vector({});

    var expandedClusterLayer = new ol.layer.Vector({
      source: expandedClusterSource,
      style: Geops.styles.OCBIcon
    });

    var popup = new ol.Overlay({
      element: dom.popup[0],
      offset: [0, -37],
      autoPan: true,
      autoPanMargin: 30,
      positioning: 'center-center',
      autoPanAnimation: {
        duration: 200
      }
    });

    var clusterLinesLayer = new ol.layer.Vector({
      source: new ol.source.Vector({
        features: [
          new ol.Feature({ geometry: multiLineString })
        ]
      }),
      style: Geops.styles.expandedClusterLine,
      updateWhileAnimating: true
    });

    /*
    var hover = new ol.interaction.SelectCluster({ 
      pointRadius: 15,
      hitTolerance: 50,
      animate: true,
      condition: ol.events.condition.pointerMove,
      featureStyle: function(feature, res) {
        if(feature.get('features')) {
          return Geops.styles.OCBIcon;
        }
        return Geops.styles.clusterSelect;
      },
      
      style: function(feature, res){
        var props = feature.getProperties();
        hideClusterCache.forEach(function(cluster) { cluster.setStyle(null); });
        hideClusterCache = [];

        if(props.selectclusterfeature) {
          var cluster = vectorLayer.getClusterForFeature(props.features[0], clusterSource.getFeatures());       
          hideClusterCache.push(cluster);
          cluster.setStyle(Geops.styles.clusterSelect);
        }

        if(feature.get('features').length === 1) {
          return Geops.styles.OCBIcon;
        }

        feature.setStyle(Geops.styles.clusterSelect);
        hideClusterCache.push(feature);

        return null;
      }
    });

    hover.on('select', function(ev) {
    if(ev.selected.length === 0 && ev.deselected.length > 0) {
      hideClusterCache.forEach(function(cluster) { cluster.setStyle(null); });
      hideClusterCache = [];
    }
  })
  */

    var map = Geops.geoUtils.getDefaultMap({ target: 'map-container' });

    map.addLayer(clusterLinesLayer);
    map.addLayer(vectorLayer);
    map.addLayer(expandedClusterLayer);
    map.addOverlay(popup);
    //map.addInteraction(click);
    //map.addInteraction(hover);

    return {
      expandedClusterSource: expandedClusterSource,
      vectorSource: vectorSource,
      vectorLayer: vectorLayer,
      clusterSource: clusterSource,
      clusterLines: multiLineString,
      popup: popup,
      //click: click,
      //hover: hover,
      view: map.getView(),
      map: map,
      resetCluster: function() {
        multiLineString.setCoordinates([]);
        expandedClusterSource.clear();
        clusterSource.forEachFeature(function(f) {
          if(f.get('expanded')){
            f.set('expanded', false);
            f.setStyle(Geops.styles.OCBIcon)  
          }
        });        
      }
    }
  }

  function renderSelects(missions, selectedMission, selectedProject, changeSelect, dom) {
    var selectTpl = dom.selectTpl.html();
    var projects = selectedMission === 'all' ? [] : Geops.utils.findProjectsForMission(missions, selectedMission);

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

  function renderFeatures(locations, level, webMapping) {
    var features = Geops.geoUtils.locationsToPointFeatures(locations, level);
    var minZoom = level === Geops.LEVELS.MISSION ? 4 : 8;

    webMapping.vectorSource.clear();
    webMapping.vectorSource.addFeatures(features);
    // webMapping.click.getFeatures().clear();
    webMapping.popup.setPosition(null);
    webMapping.resetCluster();

    var extent = webMapping.vectorSource.getExtent();

    if(level === Geops.LEVELS.MISSION) {
      extent = ol.proj.transformExtent(locations[0].countryExtent, 'EPSG:4326', 'EPSG:3857');
    }

    if(level === Geops.LEVELS.WORLD) {
      webMapping.view.fit(extent, {duration: 1000, maxZoom: 11, padding: [50, 20, 5, 20]});
      return;
    }

    if(webMapping.view.getZoom() === 2) {
      webMapping.view.fit(extent, {duration: 1000, maxZoom: 11, padding: [50, 20, 5, 20]});
      return;
    }

    webMapping.view.flyTo(extent, [50, 50, 50, 50], webMapping.map.getSize(), minZoom, 11);
  }

  function renderWebMap(changeSelect, locations, level, webMapping) {
    if(changeSelect) {
      renderFeatures(locations, level, webMapping);
    }
  }

  function displayDetails(missions, selectedMission, selectedProject, level, dom) {
    var mission = missions.find(function(m) { return m.mission === selectedMission; });

    if(level === Geops.LEVELS.MISSION) {
      dom.detailsHook.html(_.template(dom.missionDetailsTpl.html(), mission)); 
      dom.detailsHook.show();  
    }

    if(level === Geops.LEVELS.PROJECT) {
      var project = mission.projects.find(function(p) { return p.code === selectedProject.split(' - ')[0]; });
      dom.detailsHook.html(_.template(dom.projectDetailsTpl.html(), project)); 
      dom.detailsHook.show();  
    }
  }

  function renderDetails(missions, selectedMission, selectedProject, level, dom) {
    if(level === Geops.LEVELS.WORLD){
      dom.detailsHook.hide();
    } else {
      displayDetails(missions, selectedMission, selectedProject, level, dom);
    }
  }

  function render(webMapping, dom, state) {
    renderSelects(state.missions, state.selectedMission, state.selectedProject, state.changeSelect, dom);
    renderWebMap(state.changeSelect, state.locations, state.level, webMapping);
    renderDetails(state.missions, state.selectedMission, state.selectedProject, state.level, dom);
  }

  function main() {
    var dom = buildDOM();
    var webMapping = buildWebMapping(dom);

    var changeMission$ = Rx.Observable.fromEvent(dom.selectMission, 'change').pluck('target', 'value');
    var changeProject$ = Rx.Observable.fromEvent(dom.selectProject, 'change').pluck('target', 'value');
    
    var clickOnMap$ = Rx.Observable.fromEvent(webMapping.map, 'click');
    var pointerMoveOnMap$ = Rx.Observable.fromEvent(webMapping.map, 'pointermove');
    // var hoverOnFeature$ = Rx.Observable.fromEvent(webMapping.hover, 'select');

    var closePopup$ = Rx.Observable.fromEvent(dom.popupCloser, 'click');
    var changeZoom$ = Rx.Observable.fromEvent(webMapping.view, 'change:resolution');

    var data$ = Rx.Observable.just(Geops.data).map(Geops.reducers.data);
    var selectedMission$ = changeMission$.map(Geops.reducers.changeMission);
    var selectedProject$ = changeProject$.map(Geops.reducers.changeProject);    

    var state$ = Rx.Observable.merge(data$, selectedMission$, selectedProject$)
      .scan(function(acc, curr) {
        return curr(acc);
      }, { selectedMission: 'all', selectedProject: 'all', changeSelect: false });  

    state$.subscribe(render.bind(this, webMapping, dom));

    clickOnMap$
      .subscribe(function(ev) {
        var feature = webMapping.map.forEachFeatureAtPixel(ev.pixel, function(f) { return f; });
        webMapping.popup.setPosition(null);

        if(!feature || !feature.get('expandedFeature')) {
          webMapping.resetCluster();
        }

        if(feature) {
          var popupFeature = feature.get('features') ? feature.get('features')[0] : feature;
          var coordinates = popupFeature === undefined ? null : popupFeature.getGeometry().getCoordinates();
          var popupTpl = dom.popupTpl.html();
          if(coordinates !== null) { 
            dom.popupContent.html(_.template(popupTpl, popupFeature.getProperties()));
          }
          webMapping.popup.setPosition(coordinates);
        }
      });

    pointerMoveOnMap$
      .throttle(100)
      .filter(function(ev) { return !ev.dragging; })
      .filter(function(ev) { return  ev.map.hasFeatureAtPixel(ev.pixel); })
      .subscribe(function(ev) {
        var cluster = webMapping.map.forEachFeatureAtPixel(ev.pixel, function(f) { return f; });
        
        if(cluster.get('features') && cluster.get('features').length > 1 && !cluster.get('expanded')) {
          var geom = cluster.getGeometry(),
            coord = geom.getCoordinates(),
            pixel = webMapping.map.getPixelFromCoordinate(coord),
            extent = [coord[0], coord[1], coord[0], coord[1]],
            features = [];

          var points = Geops.geoUtils.generatePointsCircle(cluster.get('features').length, pixel);  

          cluster.set('expanded', true);
          cluster.setStyle(Geops.styles.invisible);
          webMapping.clusterLines.setCoordinates([]);

          cluster.get('features').forEach(function(feature, index){
            var end = webMapping.map.getCoordinateFromPixel(points[index]);
            var props = feature.getProperties();
            var expandFeature = new ol.Feature({ geometry: geom });
            expandFeature.setProperties(props);
            expandFeature.set('expandedFeature', true);
            expandFeature.setGeometry(new ol.geom.Point(end));            
            webMapping.clusterLines.appendLineString( new ol.geom.LineString([coord, end]) );
            webMapping.expandedClusterSource.addFeature(expandFeature);
          });
        }
      });

    // Manage popup
    closePopup$.subscribe(function(ev) {
      ev.stopPropagation();
      ev.preventDefault();
      webMapping.popup.setPosition(null);
    });

    changeZoom$.subscribe(function() {
      webMapping.resetCluster();
    })
  }

  main();

}());  
