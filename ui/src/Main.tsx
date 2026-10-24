import './styles.css';
import { SevenxMain } from './modules/SevenxMain';

// core-ui mounts this component at `/<path>/*` and resolves it by the
// PascalCase expose name (`./sevenx` → `Sevenx`).
export { SevenxMain, SevenxMain as Sevenx };
export default SevenxMain;
