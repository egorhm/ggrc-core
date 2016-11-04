/*!
    Copyright (C) 2016 Google Inc.
    Licensed under http://www.apache.org/licenses/LICENSE-2.0 <see LICENSE file>
*/

(function (can, $) {
  'use strict';

  GGRC.Components('assessmentTemplates', {
    tag: 'assessment-templates',
    template: can.view(
      GGRC.mustache_path +
      '/components/assessment_templates/assessment_templates.mustache'
    ),
    scope: {
      binding: '@',
      responses: [],
      instance: null,
      mapper: null,  // a shared object representing the mapper modal's state

      templates: function () {
        var result = {};
        var responses = this.attr('responses');
        var noValue = {
          title: 'No template',
          value: ''
        };
        _.each(responses, function (response) {
          var type;
          var instance;

          if (!response.instance) {
            return;
          }
          instance = response.instance;
          type = instance.template_object_type;
          if (!result[type]) {
            result[type] = {
              group: type,
              subitems: []
            };
          }
          result[type].subitems.push({
            title: instance.title,
            value: instance.id + '-' + type
          });
        });
        return [noValue].concat(_.toArray(result));
      },

      /**
       * Set the initial Assessment Template to be selected in the relevant
       * dropdown menu.
       *
       * By default, the first option from the first option group is selected,
       * unless such option does not exist, or if the mapper instance is not
       * given. In that case this method has no effect.
       *
       * @param {Array} templates - a list of possible options for the dropdown
       * @param {GGRC.Models.MapperModel} mapper - the shared object holding
       *   the state of the mapper modal
       */
      _selectInitialTemplate: function (templates, mapper) {
        var initialTemplate;
        var nonDummyItem;

        if (!mapper) {
          return;
        }

        // The first element is a dummy option, thus if there are no other
        // elements, simply don't pick anything.
        if (templates.length < 2) {
          return;
        }

        nonDummyItem = templates[1];  // a single item or an object group

        if (!nonDummyItem.group) {  // a single item
          initialTemplate = nonDummyItem.value;
        } else {
          if (!nonDummyItem.subitems || nonDummyItem.subitems.length === 0) {
            return;  // an empty group, no option to pick from it
          }
          initialTemplate = nonDummyItem.subitems[0].value;
        }

        mapper.attr('assessmentTemplate', initialTemplate);
      }
    },
    init: function () {
      var scope = this.scope;
      var instance = scope.attr('instance');
      var binding = instance.get_binding(scope.attr('binding'));

      binding.refresh_instances().done(function (response) {
        scope.attr('responses', response);
        scope._selectInitialTemplate(scope.templates(), scope.mapper);
      });
    }
  });
})(window.can, window.can.$);
