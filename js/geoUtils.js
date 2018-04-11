'use strict';

var Geops = Geops || {};

(function(){

  Geops.geoUtils = {};

  /**
   * 
   */
  Geops.geoUtils.getDefaultView = function() {
    return new ol.View({
      center: [0, 0],
      zoom: 2,
      minZoom: 2,
      maxZoom: 20,
      extent: ol.proj.transformExtent([-122.445717, -47.576989, 122.218094, 47.71623], 'EPSG:4326', 'EPSG:3857')
    });
  }

  /**
   * 
   */
  Geops.geoUtils.getDefaultMap = function(opt_options) {
    var options = opt_options || {};
    var switcher = new ol.control.LayerSwitcher();
    var attribution = new ol.control.Attribution({
      collapsible: false
    });

    var map = new ol.Map({
      target: options.target,
      layers: [Geops.geoUtils.getDefaultBasemapLayerGroup()],
      controls: ol.control.defaults({attribution: false}).extend([attribution]),
      view: Geops.geoUtils.getDefaultView()
    });
    
    map.addControl(switcher);

    return map;
  }

  /**
   * 
   */
  Geops.geoUtils.getDefaultBasemapLayerGroup = function() {
    
    var OMSR = new ol.layer.Tile({
      title: 'OMS Roads',
      type: 'base',
      visible: false,
      source: new ol.source.XYZ({
        url: 'http://korona.geog.uni-heidelberg.de/tiles/roads/x={x}&y={y}&z={z}',
        attributions: 'Imagery from <a href="http://giscience.uni-hd.de/">GIScience Research Group @ University of Heidelberg</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        extent: ol.proj.transformExtent([-122.445717, -47.576989, 122.218094, 47.71623], 'EPSG:4326', 'EPSG:3857')
      })
    });

    var cartoLite = new ol.layer.Tile({
      title: 'Carto Light',
      type: 'base',
      visible: true,
      source: new ol.source.XYZ({
        url: 'https://cartodb-basemaps-{a-c}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png',
        maxZoom: 18,
        attributions: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, &copy;<a href="https://carto.com/attribution">CARTO</a>',
        extent: ol.proj.transformExtent([-122.445717, -47.576989, 122.218094, 47.71623], 'EPSG:4326', 'EPSG:3857')
      })
    });

    var OSM = new ol.layer.Tile({
      title: 'OSM',
      type: 'base',
      visible: false,
      source: new ol.source.XYZ({
        url: 'http://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        maxZoom: 19,
        attributions: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        extent: ol.proj.transformExtent([-122.445717, -47.576989, 122.218094, 47.71623], 'EPSG:4326', 'EPSG:3857')
      })
    });

    var HOT = new ol.layer.Tile({
      title: 'OSM HOT',
      type: 'base',
      visible: false,
      source: new ol.source.XYZ({
        url: 'https://{a-c}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',
        maxZoom: 19,
        attributions: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, Tiles courtesy of <a href="http://hot.openstreetmap.org/" target="_blank">Humanitarian OpenStreetMap Team</a>',
        extent: ol.proj.transformExtent([-122.445717, -47.576989, 122.218094, 47.71623], 'EPSG:4326', 'EPSG:3857')
      })
    });

    var esriIm = new ol.layer.Tile({
      title: 'Esri Imagery',
      type: 'base',
      visible: false,
      source: new ol.source.XYZ({
        url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        attributions: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
        extent: ol.proj.transformExtent([-122.445717, -47.576989, 122.218094, 47.71623], 'EPSG:4326', 'EPSG:3857')
      })
    });

    return new ol.layer.Group({
      'title': 'Basemap',
      layers: [OMSR, OSM, HOT, esriIm, cartoLite]
    });
  };

  /**
   *
   */
  Geops.geoUtils.filterLocations = function(missions, selMission, selProject) {
    var projectCode = selProject !== 'all' ? selProject.split(' - ')[0] : 'all';

    if(selMission === 'all') {
      return missions;
    }

    if(projectCode === 'all') {
      return Geops.utils.findProjectsForMission(missions, selMission);
    }

    return Geops.utils.findProjectsForMission(missions, selMission)
      .filter(function(p) {
        return p.code === projectCode;
      });  
  }

  /**
   *
   */
  Geops.geoUtils.locationsToPointFeatures = function(locations, level) {
    return locations.map(function(loc) {
      var props = loc;
      var geom =  new ol.geom.Point(ol.proj.transform([loc.lng, loc.lat], 'EPSG:4326', 'EPSG:3857'));
      var feature = new ol.Feature();

      props.displayType = level === Geops.LEVELS.WORLD ? 'mission' : 'project';
      feature.setGeometry(geom);
      feature.setProperties(props)
      return feature
    });
  }

  /**
   *
   */
  Geops.geoUtils.findCountryExtent = function(ISO3, countryExtents) { 
    var findExtents = countryExtents.filter(function(ex) {
      return ex.ISO === ISO3;
    });
    return findExtents.length === 0 ? undefined : findExtents[0].extent;
  }

  /**
   *
   */
  Geops.geoUtils.getExtentForLevel = function(features, level, countryExtents) { 
    var tempSrc = new ol.source.Vector({ features: features });
    var extent = tempSrc.getExtent();

    if(level === Geops.LEVELS.MISSION) {
      var countryExtent = Geops.geoUtils.findCountryExtent(features[0].getProperties().ISO_3, countryExtents);
      if(countryExtent !== undefined) {
        return ol.proj.transformExtent(countryExtent, 'EPSG:4326', 'EPSG:3857');
      }
    }

    return extent;
  };

  /**
   *
   */
  Geops.geoUtils.getProjects = function(missions) { 
    return missions.reduce(function(acc, curr) {
      curr.projects.forEach(function(p) {
        acc.push(p);
      });
      return acc;
    }, []);
  };

  /**
   *
   */
  Geops.geoUtils.getProjectsDistinctTypes = function(projects) { 
    return projects.reduce(function(acc, curr) {
      if(acc.indexOf(curr.type) < 0){
        acc.push(curr.type);
      }
      return acc;
    },[]);
  };

  /**
   *
   */
  Geops.geoUtils.getProjectsDistinctContexts = function(projects) { 
    return projects.reduce(function(acc, curr) {
      if(acc.indexOf(curr.context) < 0){
        acc.push(curr.context);
      }
      return acc;
    },[]);
  };

  /**
   *
   */
  Geops.geoUtils.getProjectsDistinctPopTypes = function(projects) { 
    return projects.reduce(function(acc, curr) {
      if(acc.indexOf(curr.popType) < 0){
        acc.push(curr.popType);
      }
      return acc;
    },[]);
  };

  /**
   *
   */
  Geops.geoUtils.generatePointsCircle = function(count, centerPixel) {
    var 
        separation = 25,
        twoPi = Math.PI * 2,
        start_angle = twoPi / 12,
        circumference = separation * (2 + count),
        legLength = circumference / twoPi,  //radius from circumference
        angleStep = twoPi / count,
        res = [],
        i, angle;
    res.length = count;

    for (i = count - 1; i >= 0; i--) {
      angle = start_angle + i * angleStep;
      res[i] = [
        centerPixel[0] + legLength * Math.cos(angle), 
        centerPixel[1] + legLength * Math.sin(angle)
      ];
    }
    return res;
  }
  
}());