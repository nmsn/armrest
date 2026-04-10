import type { AppBindings } from '../app/types';
import type { LocalBindings } from '../dev/create-local-bindings';

export type RuntimeContext = AppBindings | LocalBindings;
