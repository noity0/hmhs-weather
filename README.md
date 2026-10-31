# HMHS Weather — Weather Forecasts, Radar & AI Insights

[![GitHub stars](https://img.shields.io/github/stars/noity0/hmhs-weather?style=flat-square)](https://github.com/noity0/hmhs-weather/stargazers)
[![GitHub issues](https://img.shields.io/github/issues/noity0/hmhs-weather?style=flat-square)](https://github.com/noity0/hmhs-weather/issues)
[![Last commit](https://img.shields.io/github/last-commit/noity0/hmhs-weather?style=flat-square)](https://github.com/noity0/hmhs-weather/commits/main)

> A responsive weather dashboard exploring current conditions, forecasts, map layers, air-quality information, saved locations, and AI-generated summaries.

HMHS Weather is a React and TypeScript weather application with an Express backend. The project combines location-aware weather views, map visualizations, and optional Gemini-powered explanations.

## Features

- Browser geolocation for local weather lookup.
- Current conditions and forecast views.
- Hourly and multi-day forecast presentation.
- Interactive map and weather-layer interface.
- Wind and atmospheric information.
- Air-quality information where provider data is available.
- Saved or compared locations.
- Gemini-assisted explanations and weather summaries.
- Metric and imperial unit presentation.

Weather information depends on the configured data provider, location coverage, network availability, and provider update schedule. AI-generated summaries are informational and can be wrong; check official local weather alerts for safety-critical decisions.

## Data flow

```text
Location search / browser GPS
             |
             v
       Weather services
             |
             v
       Weather data model
        |      |      |
     Forecast Map   Air quality
             |
             v
       Optional AI summary
```

## Technology stack

- React 19, TypeScript, and Vite 6
- Leaflet
- Node.js and Express
- Weather data service integration
- Google Gemini SDK (`@google/genai`)
- Tailwind CSS, Motion, and Lucide React

## Requirements

- Node.js 22 LTS recommended
- npm
- Modern browser
- Location permission for GPS-based lookup
- Gemini API key for AI-assisted features

## Install on Windows

```powershell
git clone https://github.com/noity0/hmhs-weather.git
Set-Location hmhs-weather
npm install
```

Create a local environment file:

```powershell
Copy-Item .env.example .env
notepad .env
```

Add your own key:

```dotenv
GEMINI_API_KEY=your_gemini_api_key
APP_URL=http://localhost:3000
```

Do not commit API keys or other secrets.

## Start and build

```powershell
npm run dev
```

Production build:

```powershell
npm run build
npm start
```

## Available scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the Express/TypeScript development server |
| `npm run build` | Build the Vite frontend and bundle the server |
| `npm start` | Start the built server |
| `npm run lint` | Run TypeScript checks |

## Use and safety notes

- Allow location access only when you want location-based weather.
- Check local meteorological authorities for official warnings and emergency instructions.
- Weather and air-quality data can be delayed, incomplete, or unavailable for some regions.
- Review third-party data-provider terms and limits before deploying publicly.

## Contributing

Useful contributions include accessibility improvements, clearer units, robust loading/error states, tests, and documentation. Include reproducible steps when reporting a problem.

- [Issues](https://github.com/noity0/hmhs-weather/issues)
- [Source code](https://github.com/noity0/hmhs-weather)

## License

See the repository's `LICENSE` file if present. If no license is included, reuse and redistribution are not automatically permitted.

## Search terms

Weather app, weather forecast, live weather dashboard, weather radar, air quality, weather map, geolocation, Leaflet, Gemini AI, React, TypeScript, HMHS Weather.
