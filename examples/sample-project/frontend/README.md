# TaskFlow Frontend

A modern, accessible React application for task management built with TypeScript, Vite, and Tailwind CSS.

## Features

- **Authentication**: Login and signup with form validation
- **Task Management**: Create, view, update, and delete tasks
- **Filtering**: Search and filter tasks by status
- **Responsive Design**: Mobile-first design that works on all screen sizes
- **Keyboard Shortcuts**: Efficient navigation with keyboard shortcuts
- **Accessibility**: WCAG AA compliant with proper ARIA labels and semantic HTML

## Tech Stack

- React 18 with TypeScript
- Vite for fast development and building
- Tailwind CSS for styling
- React Router for navigation
- Zustand for state management
- TanStack Query for server state
- React Hook Form + Zod for form validation

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm or yarn

### Installation

```bash
cd frontend
npm install
```

### Development

```bash
npm run dev
```

The application will be available at http://localhost:3000

### Building for Production

```bash
npm run build
```

### Type Checking

```bash
npm run type-check
```

### Linting

```bash
npm run lint
```

## Project Structure

```
frontend/
├── src/
│   ├── api/              # API client and endpoints
│   ├── components/       # React components
│   ├── hooks/            # Custom React hooks
│   ├── pages/            # Page components
│   ├── stores/           # Zustand stores
│   ├── utils/            # Utility functions
│   ├── App.tsx           # Root component
│   ├── main.tsx          # Entry point
│   └── routes.tsx        # Route configuration
├── index.html            # HTML template
├── package.json
├── tailwind.config.js    # Tailwind configuration
├── tsconfig.json         # TypeScript configuration
└── vite.config.ts        # Vite configuration
```

## Keyboard Shortcuts

- `Ctrl + N` - Create new task (on dashboard)
- `Ctrl + R` - Refresh tasks (on dashboard)

## Accessibility Features

### WCAG AA Compliance

- **Semantic HTML**: Proper use of heading hierarchy, landmarks, and semantic elements
- **ARIA Labels**: All interactive elements have descriptive labels
- **Keyboard Navigation**: Full keyboard support for all functionality
- **Focus Management**: Visible focus indicators and logical tab order
- **Color Contrast**: All text meets WCAG AA contrast requirements (4.5:1 for normal text)
- **Screen Reader Support**: Proper announcements for dynamic content changes
- **Form Validation**: Clear error messages associated with form fields
- **Alt Text**: All images and icons have descriptive text alternatives

### Specific Implementations

1. **Forms**:
   - Labels associated with inputs using `htmlFor`
   - Error messages linked with `aria-describedby`
   - Invalid fields marked with `aria-invalid`
   - Required fields indicated

2. **Modals**:
   - `role="dialog"` and `aria-modal="true"`
   - Focus trapped within modal
   - Escape key to close
   - Click outside to close

3. **Loading States**:
   - `role="status"` on loading spinners
   - `aria-live="polite"` for status updates
   - Screen reader text with `sr-only` class

4. **Navigation**:
   - Skip links (can be added if needed)
   - Proper heading hierarchy (h1 → h2 → h3)
   - Landmark roles implicit through semantic HTML

5. **Buttons and Links**:
   - Descriptive `aria-label` attributes
   - Clear button text
   - Disabled state properly conveyed

## Environment Variables

Create a `.env` file in the frontend directory:

```env
VITE_API_URL=http://localhost:4000/api
```

## API Integration

The frontend connects to the backend API at the URL specified in `VITE_API_URL`. All API calls include:

- Automatic error handling
- Authentication token management
- Type-safe requests and responses
- Loading and error states

## State Management

### Auth Store
- User authentication state
- JWT token storage (persisted to localStorage)
- Login/logout actions

### Task Store
- Task list management
- Filter state
- Selected task tracking

## Contributing

1. Follow the TypeScript strict mode guidelines
2. Ensure all components are accessible
3. Write tests for new features
4. Use semantic commits

## License

MIT
