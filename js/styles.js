'use strict';

var Geops = Geops || {};

(function(){

  Geops.styles = {};

  var image = new Image(28, 39);
  image.src = Geops.MSFIcon;

  Geops.styles.OCBIcon = new ol.style.Style({
    image: new ol.style.Icon({
      anchor: [0.5, 1],
      img: image,
      imgSize: [28, 39],
    }),
    stroke: new ol.style.Stroke({
      color: '#ffffff',
      width: 30
    }),
    zIndex: 3
  });

  Geops.styles.clusterSelect = new ol.style.Style({
    stroke: new ol.style.Stroke({
      color: "#fff", 
      width: 1
    }) 
  });

  /**
   *
   */
  Geops.styles.camenbert = function(feature) {
    var props = feature.getProperties();
    var r = props.displayType === 'mission' ? 8 + ((props.NS + props.IS) / 100) : 8 + ((props.NS + props.IS) / 10);
    return new ol.style.Style({ 
      image: new ol.style.Chart({ 
        type: 'pie', 
        radius: r, 
        offsetY: 0,
        data: [props.NS, props.IS],
        colors: ['rgba(255, 187, 68, 0.7)','rgba(119, 153, 204, 0.7)'],
        rotateWithView: true,
        animation: false,
        stroke: new ol.style.Stroke({ 
          color: '#FFF',
          width: 1
        }),
      })
    });
  }

  /**
   *
   */
  Geops.styles.selCamenbert = function(feature, res) {
    var props = feature.getProperties();
    var r = props.displayType === 'mission' ? 8 + ((props.NS + props.IS) / 100) : 8 + ((props.NS + props.IS) / 10);
    return new ol.style.Style({ 
      image: new ol.style.Chart({ 
        type: 'pie', 
        radius: r, 
        offsetY: 0,
        data: [props.NS, props.IS],
        colors: ['rgba(255, 187, 68, 0.7)','rgba(119, 153, 204, 0.7)'],
        rotateWithView: true,
        animation: false,
        stroke: new ol.style.Stroke({ 
          color: '#FFF',
          width: 2
        }),
      })
    });
  };

  /**
   *
   */
  Geops.styles.ISFilter = function(feature) {
    var props = feature.getProperties();
    var r = props.displayType === 'mission' ? 8 + (props.IS / 10) : 8 + (props.IS / 2);
    return new ol.style.Style({
      image: new ol.style.Circle({
        radius: r,
        fill: new ol.style.Fill({
          color: 'rgba(119, 153, 204, 0.7)'
        })
      })
    });
  };

  /**
   *
   */
  Geops.styles.selISFilter = function(feature, res) {
    var props = feature.getProperties();
    var r = props.displayType === 'mission' ? 8 + (props.IS / 10) : 8 + (props.IS / 2);
    return new ol.style.Style({
      image: new ol.style.Circle({
        radius: r,
        fill: new ol.style.Fill({
          color: 'rgba(119, 153, 204, 0.7)'
        }),
        stroke: new ol.style.Stroke({ 
          color: '#FFF',
          width: 2
        }),
      })
    });
  };

  /**
   *
   */
  Geops.styles.NSFilter = function(feature) {
    var props = feature.getProperties();
    var r = props.displayType === 'mission' ? 8 + (props.NS / 75) : 8 + (props.NS / 5);
    return new ol.style.Style({
      image: new ol.style.Circle({
        radius: r,
        fill: new ol.style.Fill({
          color: 'rgba(255, 187, 68, 0.7)'
        })
      })
    });       
  };

  /**
   *
   */
  Geops.styles.selISFilter = function(feature, res) {
    var props = feature.getProperties();
    var r = props.displayType === 'mission' ? 8 + (props.NS / 75) : 8 + (props.NS / 5);
    return new ol.style.Style({
      image: new ol.style.Circle({
        radius: r,
        fill: new ol.style.Fill({
          color: 'rgba(255, 187, 68, 0.7)'
        }),
        stroke: new ol.style.Stroke({ 
          color: '#FFF',
          width: 2
        }),
      })
    });       
  };

  /**
   *
   */
  Geops.styles.redIcon = function(feature, res) {
    var image = new Image(28, 39);
    image.src = Geops.MSFIcon;
    return new ol.style.Style({
      image: new ol.style.Icon({
        anchor: [0.5, 1],
        img: image,
        imgSize: [28, 39],
      }),
      stroke: new ol.style.Stroke({
        color: '#ffffff',
        width: 30
      })
    });
  };

  /**
   *
   */
  Geops.styles.fin = function(feature) {
    var props = feature.getProperties();
    var color = Geops.MISSIONS_COLORS[props.mission.trim()];
    return new ol.style.Style({
      image: new ol.style.Circle({
        radius: 5 + (props.forecast / 1000000),
        fill: new ol.style.Fill({
          color: color
        }),
        stroke: new ol.style.Stroke({ 
          color: '#FFF',
          width: 1
        })
      })
    });
  };

  /**
   *
   */
  Geops.styles.projectType = function(feature) {
    var props = feature.getProperties();
    var color = Geops.PROJECT_TYPES_COLORS[props.type];
    return new ol.style.Style({
      image: new ol.style.Circle({
        radius: 8,
        fill: new ol.style.Fill({
          color: color
        }),
        stroke: new ol.style.Stroke({ 
          color: '#FFF',
          width: 1
        })
      })
    });
  };

  /**
   *
   */
  Geops.styles.invisible = new ol.style.Style({
    fill: new ol.style.Fill({
      color: 'rgba(256, 256, 256, 0)'
    })
  });

  /**
   *
   */
  Geops.styles.expandedClusterLine = [
    new ol.style.Style({
      stroke: new ol.style.Stroke({
        width: 3,
        color: [238, 238, 238, 0.7]
      }),
      zIndex: 1
    }),
    new ol.style.Style({
      stroke: new ol.style.Stroke({
        width: 1,
        color: [37, 37, 37, 1]
      }),
      zIndex: 2
    })
  ]

}());