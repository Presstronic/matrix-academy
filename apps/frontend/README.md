# Matrix Academy - Frontend

React 18 + TypeScript + Vite + Material-UI frontend application for Matrix Academy.

## Tech Stack

- **React 18** - UI library with hooks and concurrent features
- **TypeScript** - Type-safe JavaScript
- **Vite** - Fast build tool with HMR (Hot Module Replacement)
- **Material-UI (MUI) v6** - React component library with Emotion styling
- **React Router** - Client-side routing (to be configured)

## Development Setup

### Prerequisites

- Node.js 24.x
- pnpm 9.x
- EditorConfig plugin for your editor

### Getting Started

```bash
# From the repository root
pnpm install

# Run frontend dev server (from root)
pnpm turbo run dev --filter=@matrix-academy/frontend

# Or run all services in parallel
pnpm dev
```

The dev server will start at `http://localhost:5173` with HMR enabled.

## Project Structure

```
apps/frontend/
├── src/
│   ├── App.tsx          # Main application component
│   ├── App.css          # Application styles
│   ├── main.tsx         # Application entry point
│   ├── index.css        # Global styles
│   └── assets/          # Static assets (images, fonts, etc.)
├── public/              # Public static files
├── tsconfig.app.json    # TypeScript config for application code
├── tsconfig.node.json   # TypeScript config for build tools
├── vite.config.ts       # Vite configuration
└── package.json         # Frontend dependencies
```

## Path Aliases

The project is configured with path aliases for cleaner imports:

```typescript
// Instead of:
import { MyComponent } from '../../components/MyComponent';

// You can use:
import { MyComponent } from '@/components/MyComponent';
```

Configured in:

- `tsconfig.app.json` - TypeScript path resolution
- `vite.config.ts` - Vite bundler resolution

## Code Quality & Tooling

### ESLint

The project uses ESLint v9 with Flat Config for code linting.

**Configuration:**

- Root-level `eslint.config.js` with type-aware rules
- TypeScript strict type checking enabled
- React Hooks rules enforced
- Import sorting and unused import detection
- Automatic header injection for license compliance

**Run linting:**

```bash
# Check for lint errors
pnpm lint

# Auto-fix lint errors
pnpm lint:fix
```

**ESLint Rules Summary:**

- ✅ Type-aware TypeScript rules (`@typescript-eslint`)
- ✅ React Hooks best practices (`eslint-plugin-react-hooks`)
- ✅ Import sorting (`eslint-plugin-simple-import-sort`)
- ✅ Unused imports removal (`eslint-plugin-unused-imports`)
- ✅ Circular dependency detection (`eslint-plugin-import`)
- ✅ SPDX license headers (`eslint-plugin-headers`)

### Prettier

Code formatting is handled by Prettier with the following configuration:

```json
{
  "singleQuote": true,
  "semi": true,
  "printWidth": 100,
  "trailingComma": "all"
}
```

**Run formatting:**

```bash
# Format all files
pnpm prettier --write .

# Format specific files
pnpm prettier --write apps/frontend/src/**/*.tsx
```

### Pre-commit Hooks

The project uses Husky + lint-staged to run quality checks before each commit:

1. **Add license headers** - Automatically adds SPDX headers to files
2. **Prettier formatting** - Formats staged files
3. **ESLint auto-fix** - Fixes linting issues automatically

The hooks run automatically when you commit:

```bash
git add .
git commit -m "Your commit message"
# Pre-commit hooks run automatically
```

If the hooks fail, fix the issues and try committing again.

### EditorConfig

The project includes `.editorconfig` for consistent editor settings:

- UTF-8 encoding
- LF line endings
- 2-space indentation
- Trim trailing whitespace
- Insert final newline

**Supported editors:** VS Code, WebStorm, Sublime Text, Vim, Emacs, and more.

Install the EditorConfig plugin for your editor for automatic configuration.

## Build

```bash
# Build for production
pnpm turbo run build --filter=@matrix-academy/frontend

# Preview production build
pnpm turbo run preview --filter=@matrix-academy/frontend
```

## TypeScript Configuration

The project uses TypeScript with strict mode and modern ESM conventions:

**Features:**

- Strict type checking enabled
- Bundler module resolution (Vite-compatible)
- Path aliases configured (`@/` → `src/`)
- React JSX transform
- No unused variables/parameters warnings

**Key settings:**

```json
{
  "moduleResolution": "bundler",
  "jsx": "react-jsx",
  "strict": true,
  "baseUrl": ".",
  "paths": {
    "@/*": ["src/*"]
  }
}
```

## Common Tasks

### Adding a New Component

```typescript
// src/components/MyComponent/MyComponent.tsx
/**
 * @file
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
import { Box, Typography } from '@mui/material';

export function MyComponent() {
  return (
    <Box>
      <Typography>Hello World</Typography>
    </Box>
  );
}
```

### Using Path Aliases

```typescript
import { MyComponent } from '@/components/MyComponent/MyComponent';
import { useMyHook } from '@/hooks/useMyHook';
import { myUtil } from '@/utils/myUtil';
```

### Material-UI Styling

```typescript
import { Box, Button } from '@mui/material';

<Button
  variant="contained"
  sx={{
    bgcolor: 'primary.main',
    '&:hover': {
      bgcolor: 'primary.dark',
    },
  }}
>
  Click Me
</Button>
```

## Troubleshooting

### Port already in use

If port 5173 is already in use:

```bash
# Find process using the port
lsof -i :5173

# Kill the process
kill -9 <PID>
```

Or configure a different port in `vite.config.ts`:

```typescript
export default defineConfig({
  server: {
    port: 3000,
  },
});
```

### Import errors after adding path alias

1. Restart your TypeScript server (VS Code: Cmd+Shift+P → "TypeScript: Restart TS Server")
2. Restart the Vite dev server
3. Clear Vite cache: `rm -rf node_modules/.vite`

### ESLint errors not auto-fixing

1. Check that your editor has ESLint extension installed
2. Ensure ESLint is configured to run on save
3. Run `pnpm lint:fix` manually to fix all issues

## VS Code Recommended Settings

Add to `.vscode/settings.json`:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib",
  "typescript.enablePromptUseWorkspaceTsdk": true
}
```

## Contributing

1. Create a feature branch from `main`
2. Make your changes
3. Ensure all tests pass and linting succeeds
4. Pre-commit hooks will run automatically
5. Create a pull request

## License

GPL-3.0-or-later
