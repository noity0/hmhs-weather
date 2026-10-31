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

<!-- COMMUNITY-CONTRIBUTORS-SECTION -->
## Contributors & community

[![Contributors](https://img.shields.io/github/contributors/noity0/hmhs-weather?style=flat-square)](https://github.com/noity0/hmhs-weather/graphs/contributors)
[![Pull requests](https://img.shields.io/github/issues-pr/noity0/hmhs-weather?style=flat-square)](https://github.com/noity0/hmhs-weather/pulls)
[![Good first issues](https://img.shields.io/github/issues/noity0/hmhs-weather/good%20first%20issue?style=flat-square)](https://github.com/noity0/hmhs-weather/labels/good%20first%20issue)

<a href="https://github.com/noity0/hmhs-weather/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=noity0/hmhs-weather" alt="Contributors to hmhs-weather" />
</a>

The contributor graphic and GitHub contributor page reflect **real GitHub contribution activity**. Names, avatars, and contribution counts are not manually invented or assigned. As this project grows, accepted pull requests and other qualifying contributions will appear automatically.

### How to contribute

1. Browse the [open issues](https://github.com/noity0/hmhs-weather/issues) and [existing pull requests](https://github.com/noity0/hmhs-weather/pulls) before starting work.
2. For a major change, open an issue first to discuss the proposed approach.
3. Fork the repository and create a focused feature or fix branch.
4. Keep changes scoped, document user-visible behavior, and add or update tests when applicable.
5. Run the checks documented above and include the results in your pull request.
6. Never include API keys, passwords, personal data, or other secrets in commits or screenshots.

### Open-source ecosystem

This project builds on established open-source tools and developer ecosystems documented in its technology stack. Please visit and support the upstream projects, follow their licenses, and report issues to the correct upstream repository when the problem is not caused by this project.

- [GitHub community and contribution guidelines](https://docs.github.com/en/get-started/quickstart/contributing-to-projects)
- [Open-source licenses explained](https://choosealicense.com/)

**Community note:** No celebrity, company, or upstream maintainer is represented as a project contributor or endorser unless their contribution or endorsement is independently verifiable.
