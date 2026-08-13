import '../../shared/theme.css';
import {createRoot} from 'react-dom/client';
import {BrowserRouter} from 'react-router-dom';
import {CitizenApp} from './app/CitizenApp';
import './styles.css';
createRoot(document.getElementById('root')!).render(<BrowserRouter><CitizenApp/></BrowserRouter>);
