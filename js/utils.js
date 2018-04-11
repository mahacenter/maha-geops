'use strict';

var Geops = Geops || {};

(function(){

  Geops.utils = {};

  /**
   *
   */
  Geops.utils.findProjectsForMission = function(missions, mission) {
    return missions.find(function(m) { return m.mission === mission; }).projects;
  }

}());