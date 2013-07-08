var MemoryStore, Super, modelUtils, _;

_ = require('underscore');
Backbone = require('backbone');
Super = MemoryStore = require('./memory_store');
modelUtils = require('../modelUtils');

module.exports = ModelStore;

function ModelStore() {
  Super.apply(this, arguments);
}

/**
 * Set up inheritance.
 */
ModelStore.prototype = Object.create(Super.prototype);
ModelStore.prototype.constructor = ModelStore;

ModelStore.prototype.set = function(model) {
  var existingAttrs, id, key, modelName, newAttrs;

  id = model.get(model.idAttribute);
  modelName = modelUtils.modelName(model.constructor);
  if (modelName == null) {
    throw new Error('Undefined modelName for model');
  }
  key = getModelStoreKey(modelName, id);
  /*
  * We want to merge the model attrs with whatever is already
  * present in the store.
  */
  // NEW LOGIC
  var existingModel = this.get(modelName, id, true);
  var newData;
  if (existingModel) {
    newData = (model instanceof Backbone.Model) ? model.toJSON() : model;
    existingModel.set(newData);
    return true;
  }
  else {
    model = (model instanceof Backbone.Model) ? model : modelUtils.getModel(modelName, model);
    return Super.prototype.set.call(this, key, model, null);
  }
  // OLD LOGIC
  // existingAttrs = this.get(modelName, id) || {};
  // newAttrs = _.extend({}, existingAttrs, model.toJSON());
  // return Super.prototype.set.call(this, key, newAttrs, null);
};

ModelStore.prototype.get = function(modelName, id, returnModelInstance) {
  var key, model;
  if (returnModelInstance == null) {
    returnModelInstance = false;
  }
  key = getModelStoreKey(modelName, id);
  model = Super.prototype.get.call(this, key);
  if (model) {
    if (returnModelInstance) {
      // NEW
      return model;
      // OLD
      // return modelUtils.getModel(modelName, modelData, {
      //   app: this.app
      // });
    } else {
      // NEW
      return model.toJSON();
      // OLD
      // return modelData;
    }
  }
};

ModelStore.prototype._getModel = function (model) {
  var id, modelName;

  id = model.get(model.idAttribute);
  modelName = modelUtils.modelName(model.constructor);
  if (modelName == null) {
    throw new Error('Undefined modelName for model');
  }

  return this.get(modelName, id, true);
};

ModelStore.prototype._formatKey = function(key) {
  return Super.prototype._formatKey.call(this, "_ms:" + key);
};

function getModelStoreKey(modelName, id) {
  var underscored = modelUtils.underscorize(modelName);
  return underscored + ":" + id;
}
