import { createApp } from '../app/create-app';
import { createMockBindings } from './mock-bindings';

export const createTestApp = () => {
  const app = createApp();
  return {
    app,
    bindings: createMockBindings(),
  };
};
