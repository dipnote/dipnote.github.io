# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a static web mapping application for Ethiopia that visualizes governmental, educational, medical, and conflict-related data using Leaflet.js.

## Architecture

The application follows a simple static site structure:
- **index.html** - Entry point that loads all dependencies and data files
- **js/main.js** - Core application logic (508 lines) containing:
  - Map initialization with Ethiopia center point [9.15, 40.49]
  - Layer management for multiple data sources
  - API integrations (ACLED for conflict data, Geoapify for icons)
  - MGRS coordinate conversion functionality

## Data Organization

Data files are organized by category in the `data/` directory:
- Administrative boundaries (GeoJSON): `adminLevels/`
- Conflict incidents: `conflict/`
- Educational facilities: `education/` (includes JavaScript data files)
- Medical providers: `health/`
- Infrastructure and locations: `locations/`
- Cultural sites: `cultural/`
- Aid organizations: `WhoDoesWhat/`

## Development

This is a pure client-side application with no build process:
```bash
# Serve locally with any static file server:
python -m http.server 8000
# or
npx http-server
```

## Key Implementation Details

### External APIs
- ACLED API for real-time conflict data (90-day window)
- Geoapify API for custom map markers

### Map Layers
- Base layers: OpenStreetMap, Google Satellite/Streets/Terrain
- Overlay layers loaded dynamically from GeoJSON files
- Marker clustering enabled for incident data
- Click-to-coordinate feature with MGRS conversion

### Data Loading Pattern
The application uses two main patterns for loading geographic data:
1. Direct JavaScript includes for static data (universities, medical providers)
2. Dynamic fetch() calls for GeoJSON files

## TODO Items (from README.md)
- Who What Where: https://data.humdata.org/dataset/ethiopia-operational-presence
- Healthsites: https://data.humdata.org/dataset/ethiopia-healthsites
- Update for Sheets Data as JSON for Web API using JavaScript fetch