# 🌦️ HMHS Weather — Live Weather Intelligence

> Real-time weather, radar, air-quality, forecasts, location tracking, and AI-assisted weather insights in one responsive web app.

[![AI](https://img.shields.io/badge/AI-Gemini-blue)](https://ai.google.dev/) [![React](https://img.shields.io/badge/React-19-61dafb)](https://react.dev/) [![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6)](https://www.typescriptlang.org/) [![Maps](https://img.shields.io/badge/Maps-Leaflet-green)](https://leafletjs.com/)

## 🌍 Overview

HMHS Weather is a live weather intelligence interface with browser geolocation, interactive radar mapping, hourly and multi-day forecasts, air-quality metrics, weather comparison, and a Gemini AI advisor.

### ✨ Features

- 📍 Live browser GPS location detection
- 🌧️ Interactive weather/radar map
- ⏱️ Hourly forecast and extended forecast views
- 🌬️ Wind and atmospheric metrics
- 🫁 Air-quality information
- 🤖 Gemini AI weather advisor
- 🔄 Weather comparison between locations
- ⭐ Saved favorite locations
- 🌙 Celestial/astronomy information
- 🌐 Metric and imperial units

## 🏗️ Architecture

```text
Browser GPS
    ↓
Location + Weather Services
    ↓
Weather Data Model
    ├── Radar / Map
    ├── Forecast
    ├── Air Quality
    └── Gemini AI Insights
```

## 🛠️ Tech Stack

- React 19 + TypeScript
- Vite
- Leaflet
- Express + Node.js
- Open-Meteo weather services
- Google Gemini via `@google/genai`
- Tailwind CSS, Motion, Lucide React

## 🚀 Run locally

```bash
npm install
npm run dev
```

Production:

```bash
npm run build
npm start
```

The app requests browser geolocation permission for live-location weather. Configure any required API credentials through environment variables and keep secrets out of Git.

## 🔎 Discoverability

Relevant topics/search terms:

`weather-app` `live-weather` `weather-api` `weather-radar` `forecast` `air-quality` `geolocation` `leaflet` `open-meteo` `gemini-ai` `ai-weather` `react` `typescript` `vite` `express` `tailwindcss` `hmhs`

If you find it useful, **⭐ star the repository**, share it with weather/data/AI developers, and contribute improvements through genuine issues and pull requests.

## 👤 Author

**Hafiz Mohammed Huzaifa Shamim (HMHS)**

## 📄 License

See the repository license for usage terms.
