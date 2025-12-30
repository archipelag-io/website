# Archipelag.io Website

This is the marketing website for Archipelag.io, built with [Zola](https://www.getzola.org/) static site generator.

## Overview

The website serves as the public-facing marketing site for the distributed compute platform. It features:

- **Modern, minimalistic design** inspired by Zed.dev and OpenAI
- **IA Writer Quattro S typography** for clean, readable text
- **Responsive layout** that works on all devices
- **Fast loading** with optimized assets and minimal JavaScript
- **SEO optimized** with proper meta tags and structured data

## Architecture

- **Static site generator**: Zola (Rust-based, fast builds)
- **Styling**: Custom CSS with design system variables
- **Hosting**: Intended for CDN deployment (Cloudflare Pages, Netlify, etc.)
- **Integration**: Links to Phoenix app at `app.archipelag.io`

## Key Pages

- **Homepage** (`/`) - Hero section with primary CTAs
- **Pricing** (`/pricing`) - Transparent pricing for users and hosts
- **About** (`/about`) - Company mission and technology overview
- **Contact** (`/contact`) - Support and business contact information

## Design System

The site uses a custom design system with:

- **Typography**: IA Writer Quattro S as primary font
- **Colors**: Blue primary palette with neutral grays
- **Components**: Buttons, cards, status indicators
- **Layout**: Container-based responsive grid
- **Dark mode**: Automatic based on system preference

## Development

### Prerequisites

- [Zola](https://www.getzola.org/documentation/getting-started/installation/) installed

### Running locally

```bash
# Development server with live reload
zola serve

# Build for production
zola build

# Check for errors
zola check
```

The development server runs on `http://127.0.0.1:1111` by default.

### Project Structure

```
website/
├── config.toml          # Zola configuration
├── content/             # Markdown content files
│   ├── _index.md       # Homepage
│   ├── about.md        # About page
│   ├── pricing.md      # Pricing page
│   └── contact.md      # Contact page
├── templates/           # HTML templates
│   ├── base.html       # Base layout
│   ├── index.html      # Homepage template
│   ├── page.html       # Content page template
│   └── 404.html        # Error page
├── sass/               # Stylesheets
│   └── main.scss       # Main stylesheet with design system
├── static/             # Static assets
│   ├── favicon.svg     # Site favicon
│   └── robots.txt      # Search engine directives
└── public/             # Built site (generated)
```

## Key Features

### CTAs (Call to Actions)

The site has two primary CTAs that link to the Phoenix app:

- **"Use AI"** → `app.archipelag.io/use`
- **"Earn with your PC"** → `app.archipelag.io/earn`

### External Links

- **Documentation** → `docs.archipelag.io` (separate repository)
- **Status Page** → `status.archipelag.io` (future)
- **Phoenix App** → `app.archipelag.io`

### Responsive Design

- **Desktop**: Full navigation, multi-column layouts
- **Tablet**: Adapted grid layouts, collapsible sections
- **Mobile**: Stacked layout, simplified navigation (mobile menu planned)

## Deployment

### Production Build

```bash
zola build
```

Outputs to `public/` directory, ready for CDN deployment.

### Environment Variables

For production deployment, ensure:

- `base_url` in `config.toml` matches production domain
- App URLs in `config.extra` point to production Phoenix app
- Analytics tracking IDs are configured if needed

## Content Management

### Adding Pages

1. Create new `.md` file in `content/`
2. Add frontmatter with title, description, template
3. Write content in Markdown
4. Build and deploy

### Updating Styles

- Edit `sass/main.scss` for styling changes
- Use CSS custom properties (variables) for consistency
- Follow the established design system patterns

## Performance

The site is optimized for:

- **Fast loading**: Minimal CSS, no heavy JavaScript frameworks
- **SEO**: Proper meta tags, semantic HTML, clean URLs
- **Accessibility**: Proper heading hierarchy, focus states, alt text
- **Core Web Vitals**: Optimized for Google's performance metrics

## Integration with Phoenix App

The marketing site seamlessly hands off to the Phoenix app:

- **Consistent styling**: Same design tokens and visual language
- **Smooth transitions**: Preloaded assets for instant navigation
- **Shared analytics**: Unified tracking across domains (future)

## Future Enhancements

- Mobile navigation menu
- Blog section for updates and announcements
- Interactive demos or calculators
- A/B testing for conversion optimization
- Multi-language support