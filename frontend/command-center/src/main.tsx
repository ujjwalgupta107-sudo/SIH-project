import '../../shared/theme.css';
import { createRoot } from 'react-dom/client';
import { CommandCenterApp } from './app/CommandCenterApp';
import './styles.css';
createRoot(document.getElementById('root')!).render(<CommandCenterApp />);
