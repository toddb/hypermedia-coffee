(function () {
  var defaultState, statemachine, _;

  _ = require('underscore');

  statemachine = function (schema, options) {
    var stateNames, states, t, transitionMethods, transitionNames, transitionize, transitions, _i, _len;
    states = options.states, transitions = options.transitions, checkAllowed = options.checkAllowed || true;
    stateNames = Object.keys(states);
    transitionNames = Object.keys(transitions);
    schema.add({
      state: {
        type: String,
        "enum": stateNames,
        "default": defaultState(states)
      }
    });

    schema.virtual('_transitions').get(function () {
      return schema.paths.state.enumValues;
    });

    schema.virtual('_allActions').get(function () {
      return transitionNames;
    });

    schema.virtual('_actions').get(function () {
      return _.filter(transitionNames, function (transition) {
        return transitions[transition].from == this.state;
      }, this)
    });

    transitionize = function (t) {
      return function (callback) {
        var enter, exit, from, guard, k, transition, v,
          _this = this;
        transition = transitions[t];
        if (typeof transition.from === 'string') {
          from = transition.from;
        } else if (Array.isArray(transition.from)) {
          if (transition.from.indexOf(this.state) !== -1) {
            from = this.state;
          }
        }
        if (from != null) {
          exit = states[from].exit;
        }
        enter = states[transition.to].enter;
        guard = transition.guard;

        if (checkAllowed) {
          if (!(from == this.state)) {
            return callback(new Error(from + ' transition not allowed on ' + t));
          }
        }

        switch (typeof guard) {
          case 'function':
            if ((guard != null ? guard.apply(this) : void 0) != null) {
              return callback(new Error('guard failed'));
            }
            break;
          case 'object':
            for (k in guard) {
              v = guard[k];
              if (v.apply(this) != null) {
                this.invalidate(k, v.apply(this));
              }
            }
            if (this._validationError != null) {
              return callback(this._validationError);
            }
        }
        if (this.state === from) {
          this.state = transition.to;
        }
        return this.save(function (err) {
          if (err) {
            return callback(err);
          }
          if (enter != null) {
            enter.call(_this);
          }
          if (exit != null) {
            exit.call(_this);
          }
          return callback(null);
        });
      };
    };
    transitionMethods = {};
    for (_i = 0, _len = transitionNames.length; _i < _len; _i++) {
      t = transitionNames[_i];
      transitionMethods[t] = transitionize(t);
    }
    return schema.method(transitionMethods);
  };

  defaultState = function (states) {
    var selected, stateNames;
    stateNames = Object.keys(states);
    selected = _.filter(stateNames, function (s) {
      if (states[s]["default"] === true) {
        return s;
      }
    });
    return selected[0] || stateNames[0];
  };

  module.exports = statemachine;

}).call(this);