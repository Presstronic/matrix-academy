/**
 * @file
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
import { RouterProvider } from 'react-router-dom';

import { AuthProvider } from '@/contexts/AuthContext';
import { router } from '@/routes';

function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}

export default App;
