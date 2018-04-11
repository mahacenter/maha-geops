'use strict';

var Geops = Geops || {};

(function(){

  Geops.reducers = {};

  /**
   *
   */
  Geops.reducers.changeMission = function(mission) {
    return function(state) {
      state.selectedMission = mission;
      state.selectedProject = 'all';
      state.locations = Geops.geoUtils.filterLocations(state.missions, state.selectedMission, state.selectedProject);
      state.level = mission === 'all' ? Geops.LEVELS.WORLD : Geops.LEVELS.MISSION;
      state.changeSelect = true;
      return state;
    }
  };

  /**
   *
   */
  Geops.reducers.changeProject = function(project) {
    return function(state) {
      state.selectedProject = project;
      state.locations = Geops.geoUtils.filterLocations(state.missions, state.selectedMission, state.selectedProject);
      state.level = project === 'all' ? Geops.LEVELS.MISSION : Geops.LEVELS.PROJECT;
      state.changeSelect = true;
      return state;
    }
  }; 

  /**
   *
   */
  Geops.reducers.selectOnClick = function(p) {
    return function(state) {
      if(state.level === Geops.LEVELS.WORLD) {
        state.selectedMission = p.mission;
        state.level = Geops.LEVELS.MISSION;
      } else if (state.level === Geops.LEVELS.MISSION) {
        state.selectedProject = p.code + ' - ' + p.project_type + ' / ' + p.location;
        state.level = Geops.LEVELS.PROJECT;
      }
      state.changeSelect = true;
      state.locations = Geops.geoUtils.filterLocations(state.missions, state.selectedMission, state.selectedProject);
      return state;
    }  
  };

  /**
   *
   */
  Geops.reducers.data = function(data) {
    return function(state) {
      state.missions = data;
      state.locations = Geops.geoUtils.filterLocations(state.missions, state.selectedMission, state.selectedProject);
      state.level = Geops.LEVELS.WORLD;
      state.changeSelect = true;
      return state;
    }
  };

  /**
   *
   */
  Geops.reducers.initFilters = function(projects) {
    return function(state) {
      state.filters = {};
      state.filters.type = Geops.geoUtils.getProjectsDistinctTypes(projects);
      state.filters.context = Geops.geoUtils.getProjectsDistinctContexts(projects);
      state.filters.popType = Geops.geoUtils.getProjectsDistinctPopTypes(projects);
      state.locations = Geops.geoUtils.locationsToPointFeatures(projects, Geops.LEVELS.PROJECT);
      return state;
    }
  };  

}());