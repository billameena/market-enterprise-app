import { RouterProvider } from '@tanstack/react-router';
import { router } from './routes/index';

export default function App() {
  return <RouterProvider router={router} />;
}
