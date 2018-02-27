/*
  Copyright (C) 2018 Google Inc.
  Licensed under http://www.apache.org/licenses/LICENSE-2.0 <see LICENSE file>
*/

import StateValidator from '../../utils/state-validator-utils';

describe('StateValidator module', () => {
  describe('constructor', () => {
    describe('sets valitationState object', () => {
      it('to passed initState', function () {
        const initState = {};
        const sv = new StateValidator({}, initState);
        expect(sv.validationState).toBe(initState);
      });

      it('to an empty object if initState param is empty', function () {
        const sv = new StateValidator({});
        expect(sv.validationState).toEqual({});
      });
    });

    describe('sets injection object', () => {
      it('to passed initInjection', function () {
        const initInjection = {};
        const sv = new StateValidator(initInjection);
        expect(sv._injected).toBe(initInjection);
      });

      it('to an empty array if initInjection param is empty', function () {
        const sv = new StateValidator();
        expect(sv._injected).toEqual({});
      });
    });

    it('sets the queue of the validation actions to an empty array',
      function () {
        const sv = new StateValidator();
        expect(sv._validationActions).toEqual([]);
      });
  });

  describe('addValidationActions() method', () => {
    let validator;

    beforeEach(function () {
      validator = new StateValidator();
    });

    it('pushes passed actions to the queue of the validation actions',
      function () {
        const actions = [
          () => {},
          () => {},
        ];
        validator.addValidationActions(...actions);
        expect(validator._validationActions).toEqual(actions);
      });
  });

  describe('updateInjection() method', () => {
    it('merges passed injection object with inner injection state object',
      function () {
        const innerInjection = {a: 10};
        const validator = new StateValidator(innerInjection);
        const injection = {
          a: 20,
          b: 30,
        };
        validator.updateInjection(injection);
        expect(innerInjection).toEqual(injection);
      });

    it('saves reference to original original inner injection', function () {
      const validator = new StateValidator();
      const injection = validator._injected;
      validator.updateInjection({});
      expect(validator._injected).toEqual(injection);
    });
  });

  describe('validate() method', () => {
    it('calls each validation action from the queue with passed inner ' +
    'injection', function () {
      const injection = {};
      const validator = new StateValidator(injection);
      const actions = [
        jasmine.createSpy('action1'),
        jasmine.createSpy('action2'),
      ];
      validator.addValidationActions(...actions);
      validator.validate();
      actions.forEach((action) => {
        expect(action).toHaveBeenCalledWith(injection);
      });
    });

    it('saves reference to original state', function () {
      const validator = new StateValidator();
      const ref = validator.validationState;
      validator.validate();
      expect(validator.validationState).toBe(ref);
    });

    it('merges inner validation state with state which was generated by ' +
    'validation actions', function () {
      const injected = {number: 10};
      const initState = {a: 20};
      const validator = new StateValidator(injected, initState);
      const actions = [
        ({number}) => ({a: number + 20}),
        ({number}) => ({b: number + 30}),
        ({number}) => ({
          a: number + 40,
          c: number + 50,
        }),
      ];
      validator.addValidationActions(...actions);
      validator.validate();

      expect(validator.validationState).toEqual({
        a: 50,
        b: 40,
        c: 60,
      });
    });
  });

  describe('validationState getter', () => {
    it('returns validation state', () => {
      const initState = {};
      const validator = new StateValidator({}, initState);
      expect(validator.validationState).toBe(initState);
    });
  });
});
