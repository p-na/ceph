import CustomMatcherFactories = jasmine.CustomMatcherFactories;

export const customMatchers: CustomMatcherFactories = {
  toBe: () => {
    return {
      compare: (actual, expected, message?) => {
        if (actual === expected) {
          return {
            pass: true
          };
        } else {
          const result: { pass: boolean; message?: Function } = { pass: false };
          if (message) {
            result.message = () => message;
          }
          return result;
        }
      }
    };
  }
};
