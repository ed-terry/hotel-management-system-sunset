import { createBrowserRouter } from 'react-router-dom';
import App from '../App';
import Dashboard from '../pages/Dashboard';
import Bookings from '../pages/Bookings';
import Rooms from '../pages/Rooms';
import Housekeeping from '../pages/Housekeeping';
import Guests from '../pages/Guests';
import Reports from '../pages/Reports';
import Settings from '../pages/Settings';
import Analytics from '../pages/Analytics';
import Invoices from '../pages/Invoices';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
      {
        path: 'bookings',
        element: <Bookings />,
      },
      {
        path: 'rooms',
        element: <Rooms />,
      },
      {
        path: 'housekeeping',
        element: <Housekeeping />,
      },
      {
        path: 'guests',
        element: <Guests />,
      },
      {
        path: 'invoices',
        element: <Invoices />,
      },
      {
        path: 'reports',
        element: <Reports />,
      },
      {
        path: 'analytics',
        element: <Analytics />,
      },
      {
        path: 'settings',
        element: <Settings />,
      },
    ],
  },
]);
