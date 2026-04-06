# Pulse Attend Grid - Advanced Attendance System

A modern attendance management system powered by Raspberry Pi BLE scanners. Monitor and manage student attendance in real-time with automated tracking, comprehensive reports, and intelligent geo-fencing.

## Features

- **Real-time Monitoring**: Track BLE device detections across all classrooms in real-time
- **Student Management**: Comprehensive student profiles with attendance history
- **Detailed Reports**: Generate and export attendance reports in multiple formats
- **Secure & Reliable**: Enterprise-grade security with accurate geo-fencing
- **Automated Processing**: Automatic attendance marking based on configurable rules
- **Analytics Dashboard**: Insightful metrics and trends for better decision making

## Technologies

This project is built with:

- **Vite** - Fast build tool and dev server
- **React 18** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn-ui** - High-quality React components
- **React Router** - Client-side routing
- **React Query** - Data fetching and caching
- **Radix UI** - Accessible component primitives

## Getting Started

### Prerequisites

- Node.js 18+ and npm (or yarn/pnpm)
- Git

### Installation

1. Clone the repository:
```sh
git clone <YOUR_REPO_URL>
cd pulse-attend-grid-main
```

2. Install dependencies:
```sh
npm install
```

3. Start the development server:
```sh
npm run dev
```

4. Open your browser and navigate to `http://localhost:8080`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run build:dev` - Build in development mode
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Project Structure

```
src/
├── components/     # Reusable UI components
│   ├── dashboard/  # Dashboard-specific components
│   ├── layout/     # Layout components (Header, Sidebar)
│   └── ui/         # shadcn-ui components
├── pages/          # Page components
├── hooks/          # Custom React hooks
├── lib/            # Utility functions
└── main.tsx        # Application entry point
```

## Deployment

### Build for Production

```sh
npm run build
```

The built files will be in the `dist` directory, ready to be deployed to any static hosting service like:

- **Vercel** - Recommended for easy deployment
- **Netlify** - Great for static sites
- **GitHub Pages** - Free hosting for public repos
- **AWS S3 + CloudFront** - For enterprise deployments
- **Any web server** - Serve the `dist` folder

### Deploy to Vercel

```sh
npm install -g vercel
vercel
```

### Deploy to Netlify

```sh
npm install -g netlify-cli
netlify deploy --prod
```

## Configuration

### Environment Variables

Create a `.env` file in the root directory for environment-specific configuration:

```env
VITE_API_URL=your_api_url_here
VITE_APP_NAME=Advanced Attendance System
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Support

For issues and questions, please open an issue on GitHub.

## Authors

- Your Name - Initial work

---

Built with ❤️ using React, Vite, and Tailwind CSS
