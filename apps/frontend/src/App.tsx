/**
 * @file
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
import { RouterProvider } from 'react-router-dom';

import { router } from '@/routes';

function App() {
  return <RouterProvider router={router} />;
}

export default App;
