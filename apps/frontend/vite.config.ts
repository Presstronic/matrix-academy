/**
 * @file
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
})
