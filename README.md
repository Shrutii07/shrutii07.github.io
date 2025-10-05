# ML Engineer Portfolio

A modern, responsive portfolio website built with Astro.js and TailwindCSS, specifically designed for Machine Learning Engineers to showcase their projects, publications, and expertise.

## Features

- 🚀 **Fast & Modern**: Built with Astro.js for optimal performance
- 🎨 **Beautiful Design**: Clean, minimalist interface with dark/light theme support
- 📱 **Fully Responsive**: Mobile-first design that works on all devices
- 🔧 **Easy to Customize**: Markdown-driven content management
- 📊 **ML-Focused**: Sections for projects, publications, skills, and experience
- ⚡ **SEO Optimized**: Built-in SEO features and meta tags
- 🌙 **Theme Toggle**: Dark and light mode with system preference detection

## Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd ml-engineer-portfolio
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open [http://localhost:4321](http://localhost:4321) in your browser

### Building for Production

```bash
npm run build
```

### Deployment

Deploy to GitHub Pages:
```bash
npm run deploy
```

## Project Structure

```
ml-engineer-portfolio/
├── src/
│   ├── components/          # Reusable components
│   │   ├── layout/         # Layout components (Header, Footer)
│   │   ├── sections/       # Page sections (Hero, Skills, Projects, etc.)
│   │   └── ui/            # UI components (Buttons, Cards, etc.)
│   ├── content/            # Markdown content files
│   │   ├── projects/       # Project descriptions
│   │   ├── publications/   # Research papers and patents
│   │   ├── experience/     # Work experience
│   │   └── education/      # Educational background
│   ├── layouts/           # Page layouts
│   ├── pages/             # Astro pages
│   ├── styles/            # Global styles
│   └── utils/             # Utility functions
├── public/                # Static assets
└── dist/                  # Built site (generated)
```

## Customization

### Content Management

All content is managed through Markdown files in the `src/content/` directory:

- **Profile**: Edit `src/content/profile.md`
- **Skills**: Edit `src/content/skills.md`
- **Projects**: Add files to `src/content/projects/`
- **Publications**: Add files to `src/content/publications/`
- **Experience**: Add files to `src/content/experience/`
- **Education**: Add files to `src/content/education/`

### Styling

- Global styles: `src/styles/global.css`
- Theme configuration: `tailwind.config.mjs`
- Color scheme: Modify CSS custom properties in `global.css`

### Configuration

- Site configuration: `astro.config.mjs`
- TypeScript configuration: `tsconfig.json`
- Package configuration: `package.json`

## Technologies Used

- **[Astro.js](https://astro.build/)** - Static site generator
- **[TailwindCSS](https://tailwindcss.com/)** - Utility-first CSS framework
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe JavaScript
- **[Inter Font](https://fonts.google.com/specimen/Inter)** - Modern typography

## License

This project is open source and available under the [MIT License](LICENSE).

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

If you have any questions or need help customizing your portfolio, please open an issue on GitHub.