# NexusCore Frontend - Quick Start

## Getting Started

1. **Install dependencies:**
   ```sh
   npm install
   # or
   yarn install
   ```

2. **Copy environment file:**
   ```sh
   cp .env.example .env
   # Edit .env as needed
   ```

3. **Start the frontend:**
   ```sh
   npm start
   # or
   yarn start
   ```
   The app will be available at [http://localhost:3000](http://localhost:3000).

---

## Troubleshooting
- If navigation or pages do not work, ensure you have restarted the frontend after any file renames or deletions.
- Make sure all route files are `.tsx` (not `.js`) if using TypeScript.
- Check the browser console for errors and resolve any import or routing issues.
- For full-stack setup, see the main README in the project root.

---

# NexusCore Frontend

The frontend application for NexusCore, built with React, TypeScript, and Material-UI. This application provides a modern and responsive interface for managing Twitch and Discord bot integrations.

## Features

- Modern React application with TypeScript
- Material-UI components and theming
- Redux state management with Redux Toolkit
- Form handling with Formik and Yup validation
- Real-time updates using WebSocket
- Responsive and accessible design
- Comprehensive charting library

## Project Structure

```
frontend/
├── public/
├── src/
│   ├── components/
│   │   ├── charts/           # Data visualization components
│   │   ├── ErrorBoundary.tsx # Error handling component
│   │   ├── FormField.tsx     # Reusable form field component
│   │   ├── LoadingSpinner.tsx# Loading indicator
│   │   └── SuspenseFallback.tsx # Suspense fallback component
│   ├── hooks/
│   │   ├── useAppDispatch.ts # Typed dispatch hook
│   │   ├── useAppSelector.ts # Typed selector hook
│   │   ├── useLoading.ts     # Loading state hook
│   │   └── useWebSocket.ts   # WebSocket connection hook
│   ├── pages/
│   │   ├── LoginPage.tsx     # User authentication
│   │   ├── RegisterPage.tsx  # User registration
│   │   └── ...              # Other page components
│   ├── services/
│   │   ├── api.ts           # API client configuration
│   │   ├── authService.ts   # Authentication service
│   │   ├── botService.ts    # Bot management service
│   │   └── socketService.ts # WebSocket service
│   ├── store/
│   │   ├── slices/         # Redux slices
│   │   └── index.ts        # Store configuration
│   └── utils/
│       └── validationSchemas.ts # Form validation schemas
```

## Components

### Form Components
- `FormField`: A reusable form component that supports text inputs, select dropdowns, and switches
- `ErrorBoundary`: Catches and handles React component errors
- `LoadingSpinner`: Displays a loading indicator with optional message
- `SuspenseFallback`: Fallback component for React Suspense

### Chart Components
A comprehensive set of data visualization components built with Recharts:
- `BarChart`: For comparing values across categories
- `LineChart`: For visualizing trends over time
- `PieChart`: For showing parts of a whole
- `RadarChart`: For comparing multiple variables
- `ScatterChart`: For visualizing correlations
- `StackedBarChart`: For comparing parts of a whole across categories

See [Chart Components Documentation](./src/components/charts/README.md) for detailed usage.

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
```
Edit `.env` with your configuration.

3. Start the development server:
```bash
npm start
```

4. Build for production:
```bash
npm run build
```

## Environment Variables

- `REACT_APP_API_URL`: Backend API URL
- `REACT_APP_WS_URL`: WebSocket server URL
- `REACT_APP_ENV`: Environment (development/production)

## Scripts

- `npm start`: Start development server
- `npm test`: Run tests
- `npm run build`: Build for production
- `npm run lint`: Run ESLint
- `npm run format`: Format code with Prettier

## Best Practices

1. **State Management**
   - Use Redux for global state
   - Use local state for component-specific state
   - Use React Query for server state

2. **Form Handling**
   - Use Formik for form state management
   - Use Yup for form validation
   - Use FormField component for consistent form inputs

3. **Error Handling**
   - Use ErrorBoundary for React errors
   - Handle API errors consistently
   - Show user-friendly error messages

4. **Performance**
   - Use React.memo for expensive components
   - Use useMemo and useCallback appropriately
   - Implement code splitting with React.lazy

5. **Accessibility**
   - Follow WCAG guidelines
   - Use semantic HTML
   - Provide ARIA labels where needed

## Contributing

1. Follow the TypeScript style guide
2. Write tests for new features
3. Update documentation as needed
4. Follow Git commit message conventions

## License

MIT License - see LICENSE file for details 