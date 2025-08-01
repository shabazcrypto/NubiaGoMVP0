# Nubiago

## Overview

Nubiago is a static HTML website project that appears to be a search or discovery platform with the tagline "Find what you need, faster!". The project consists of a single HTML file with embedded CSS styling, creating a modern, clean interface with glassmorphism design elements. The website features a responsive layout with a top header, main navigation, and hero section structure.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Static HTML Structure**: Single-page application built with vanilla HTML and CSS
- **Styling Approach**: Embedded CSS within the HTML file for simplicity and self-containment
- **Design System**: Modern UI with glassmorphism effects using backdrop-filter and rgba backgrounds
- **Typography**: Uses system fonts (-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto) for optimal cross-platform rendering
- **Layout Strategy**: Responsive design with flexible containers and consistent padding/spacing

### Component Structure
- **Container System**: Unified container classes for consistent layout across sections
- **Badge Components**: Reusable glassmorphism-styled badges with blur effects and subtle borders
- **Header Hierarchy**: Multi-level header structure (top-header, main-header) for organized navigation
- **Hero Section**: Dedicated content area for primary messaging and calls-to-action

### Responsive Design
- **Viewport Optimization**: Proper meta viewport configuration for mobile responsiveness
- **Flexible Containers**: 100% width containers with consistent horizontal padding
- **Box Model**: Universal box-sizing: border-box for predictable layout behavior

### Asset Management
- **Attached Assets**: Contains backup/reference files for styling components
- **Self-Contained Approach**: All critical styles embedded in the main HTML file

## External Dependencies

### Frontend Dependencies
- **System Fonts**: Relies on operating system fonts (Apple System, Segoe UI, Roboto) - no external font loading required
- **No JavaScript Frameworks**: Pure HTML/CSS implementation without external libraries
- **No Build Tools**: Direct HTML file that can be served statically

### Browser Requirements
- **Modern Browser Support**: Requires browsers with backdrop-filter support for glassmorphism effects
- **CSS3 Features**: Uses advanced CSS features like flexbox, rgba colors, and box-shadow
- **No External APIs**: Currently no third-party service integrations identified

### Hosting Requirements
- **Static Hosting**: Can be deployed on any static file hosting service
- **No Database**: No backend or database requirements
- **No Server-Side Processing**: Pure client-side rendering