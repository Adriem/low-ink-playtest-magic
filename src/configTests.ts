import { Features } from './config';
import { initialiseFlags, Toggle, type Flag } from './utils/flags';

// Every feature off, plus TEST_FLAG for the flags' own tests
const TestFeatures = Object.fromEntries(
  [...Object.keys(Features), 'TEST_FLAG'].map((name) => [name, Toggle.OFF]),
) as Record<Flag, Toggle>;

export const initialiseTestConfig = () => {
  initialiseFlags(TestFeatures);
};
