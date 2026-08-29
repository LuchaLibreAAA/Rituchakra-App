<div align="center">

# 🌾 𝗥𝗜𝗧𝗨𝗖𝗛𝗔𝗞𝗥𝗔 (ऋतुचक्र / ঋতুচক্র) 🌦️
### *Hyperlocal Precision Agro-Meteorological & Climate Intelligence Mobile Platform*

[![React Native](https://img.shields.io/badge/React_Native-0.74.5-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-SDK_51-000020?style=for-the-badge&logo=expo&logoColor=white)](https://expo.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![TanStack Query](https://img.shields.io/badge/TanStack_Query-v5-FF4154?style=for-the-badge&logo=reactquery&logoColor=white)](https://tanstack.com/query)
[![i18next](https://img.shields.io/badge/i18n-EN%20%7C%20HI%20%7C%20BN-26A69A?style=for-the-badge)](https://www.i18next.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](LICENSE)

<br />

<p align="center">
  <b>Empowering farmers, agri-planners, and rural communities with real-time weather nowcasting, flood tracking, water-balance forecasting, Mandi market pricing, and AI-assisted agricultural advisory.</b>
</p>

---

</div>

## 🌟 Key Highlights & Core Features

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            RITUCHAKRA MOBILE APP                            │
├─────────────────┬──────────────────┬─────────────────┬──────────────────────┤
│ 🏠 Home         │ 📈 Analytics     │ 📊 Data         │ 💬 AI Advisor        │
│ • Live Sky/Rain │ • Live Storm Grid│ • 7D Forecast   │ • Multilingual Chat  │
│ • Next 6h Bars  │ • Kalman Filter  │ • ET₀ & Water   │ • Preset Prompts     │
│ • High Risk CAP │ • Hugli Tide     │ • Soil Moisture │ • Official Sources   │
│ • Mandi Prices  │ • Onset & Lightning • Flood Alerts │ • Offline Fallback   │
└─────────────────┴──────────────────┴─────────────────┴──────────────────────┘
```

### 📋 Screen Capabilities Matrix

| Screen | Route | Key Data Feeds | Visual Elements | Offline / Mock Support |
| :--- | :--- | :--- | :--- | :---: |
| **Home** | `app/(tabs)/index.tsx` | Sky temp, Rain prob, CAP Hazards, Mandi rates | SVG Bar Charts, Alert Cards, Commodity Grid | ✅ 100% |
| **Analytics** | `app/(tabs)/analytics.tsx` | INSAT-IR1 radar nowcasting, Lightning, Hugli tides | 2×2 Matrix, 4-way Tile, Kalman Line Chart | ✅ 100% |
| **Data** | `app/(tabs)/data.tsx` | 7-day GloFAS hydrology, FAO-56 $ET_0$, Soil moisture | 4 SVG Analytic Charts, Flood Badges, Summary Chips | ✅ 100% |
| **Maps** | `app/(tabs)/maps.tsx` | Station telemetry, Regional radars, River basins | Stylized map canvas, District focus | ✅ 100% |
| **Advisor** | `app/(tabs)/chat.tsx` | Multi-agent agro LLM, Official scientific sources | Speech bubbles, Fast presets, Lang Switcher | ✅ 100% |


### 📱 1. 🏠 Home & Dashboard (`/`)
* **Real-time Sky Conditions**: Live temperature, night lows, visibility, and precipitation tracking.
* **Hourly Precipitation Bar Charts**: Interactive SVG visualization of expected rain across the next 6–8 hours.
* **CAP Early Warning Banners**: Instant hazard warnings from IMD-CAP (Extreme rain, lightning pulse, heavy storm).
* **Mandi Market Prices**: Real-time commodity rate trackers (Paddy, Jute, Potato, Mustard, Chilli, etc.) paired with dynamic bar comparisons.

### ⚡ 2. 📈 Analytics & Nowcasting (`/analytics`)
* **Real-Time Storm Matrix**: Live metrics for Lightning, Cloudburst risk, Downburst wind speed, Cell rain rate, and Hugli tide heights.
* **Between-Scene Kalman Filter**: High-precision line charts displaying continuous rain rate estimations with live error feedback and scene update countdowns.

### 💧 3. 📊 Agro-Climatic Data & Forecast (`/data`)
* **7-Day Agricultural Water Balance**: Daily Max Temp, Precipitation, Probabilities, Reference Evapotranspiration ($ET_0$), and Soil Moisture.
* **Multi-Chart Analytics Suite**:
  - 🌧️ Rain vs. $ET_0$ Combo Charts
  - 🌡️ Temperature Range Curves
  - 🌱 Soil Saturation & Rain Probability Waves
  - ⏱️ Micro-Hourly Breakdown

### 🗺️ 4. 🧭 Hyperlocal Geospatial Map (`/maps`)
* Visual regional hazard maps, satellite radar overlays, and district-level weather station mapping.

### 🤖 5. 💬 Multilingual AI Agro-Advisor (`/chat`)
* **Seamless Language Switcher**: Switch on-the-fly between **English**, **हिंदी (Hindi)**, and **বাংলা (Bengali)**.
* **Curated Agri-Query Presets**: Instant answers for irrigation advisories, flood rankings, mandi rates, and district outlooks.
* **Official Data Provenance**: Transparent links and citations to **IMD**, **Open-Meteo GloFAS**, **CPCB**, and **Agmarknet**.

---

## 🏗️ Architecture & Resilient Data Layer

Rituchakra Mobile features a **3-Tier Resilient Data Strategy** that ensures 100% uptime in low-connectivity rural environments:

```mermaid
flowchart LR
    A[User Screen Request] --> B{EXPO_PUBLIC_USE_MOCKS?}
    B -- true --> C[Instant Mock Fixtures]
    B -- false --> D[Try Live Backend API]
    D -- 200 OK --> E[Live Data Stream]
    D -- Timeout 2s / Network Error --> F[Automatic Fallback to Offline Cache]
    C --> G[UI Render + Mock Indicator]
    E --> H[UI Render + Live Indicator]
    F --> I[UI Render + Fallback Amber Banner]
```

---

## 🧮 Agro-Climatic Intelligence & Algorithmic Models

Rituchakra Mobile computes and presents precision agro-meteorological metrics derived from validated open-source meteorological formulations:

### 1. 🌀 Between-Scene Kalman Nowcasting Filter
Calculates smoothed rain-rate transitions ($\hat{x}_k$) between satellite radar scan scenes to predict convective downbursts:
$$\hat{x}_k = \hat{x}_{k|k-1} + K_k \left( z_k - H \hat{x}_{k|k-1} \right)$$
* **Update Interval**: 15-minute INSAT-3D/3DR scan integration
* **Error Correction**: Dynamic Kalman Gain ($K_k$) adjusted against local AWS (Automatic Weather Station) ground sensors

### 2. ☀️ FAO-56 Penman-Monteith Evapotranspiration ($ET_0$)
Provides field-level reference crop water consumption for scientific irrigation scheduling:
$$ET_0 = \frac{0.408 \Delta (R_n - G) + \gamma \frac{900}{T + 273} u_2 (e_s - e_a)}{\Delta + \gamma (1 + 0.34 u_2)}$$
* **Inputs**: Solar radiation ($R_n$), Air Temp ($T$), Wind Speed ($u_2$ at 2m), Vapor Deficit ($e_s - e_a$)
* **Agri Guidance**: Recommends `IRRIGATE: NO` when $P_{\text{eff}} \ge ET_0$ over consecutive days

### 3. 🌊 GloFAS River Basin Discharge & Ponding Index
* Multi-point hydrological runoff model comparing river stage height against historical flood quantiles.


---

## 📂 Project Structure

```
rituchakra-mobile/
├── 📁 app/                     # Expo Router File-Based Navigation
│   ├── 📄 _layout.tsx          # Root Layout (QueryClient & i18n initialization)
│   └── 📁 (tabs)/              # 5 Core Navigation Tabs
│       ├── 📄 _layout.tsx      # Bottom Tab Bar configuration & Lucide icons
│       ├── 📄 index.tsx        # Home Screen (Sky, Warnings, Mandi Market)
│       ├── 📄 analytics.tsx    # Storm Matrix & Kalman Chart Screen
│       ├── 📄 maps.tsx         # Geospatial Map View Screen
│       ├── 📄 data.tsx         # 7-Day Forecast, ET₀ & Soil Water Balance
│       └── 📄 chat.tsx         # Multilingual AI Advisor Screen
├── 📁 src/
│   ├── 📁 api/                 # API Client with Promise.race Fallback Engine
│   │   └── 📄 client.ts        # TanStack Query hooks & resilient fetch
│   ├── 📁 components/          # Reusable UI Atoms & Components
│   │   └── 📄 MockBanner.tsx   # Offline/Mock status banner
│   ├── 📁 i18n/                # Multi-language internationalization
│   │   └── 📄 index.ts         # English, Hindi, and Bengali translation keys
│   ├── 📁 mocks/               # Domain Mock Fixtures
│   │   ├── 📄 analytics.mock.ts
│   │   ├── 📄 chat.mock.ts
│   │   ├── 📄 dashboard.mock.ts
│   │   ├── 📄 forecast.mock.ts
│   │   ├── 📄 geo.mock.ts
│   │   └── 📄 market.mock.ts
│   ├── 📁 theme/               # Design Tokens & Palette
│   │   └── 📄 tokens.ts        # Colors, Typography, Spacing, Elevation
│   └── 📁 types/               # TypeScript Domain Interfaces
│       └── 📄 index.ts
├── 📄 app.config.ts            # Expo configuration
├── 📄 package.json             # Dependencies & scripts
└── 📄 tsconfig.json            # Strict TypeScript configuration
```

---

## 🛠️ Tech Stack & Libraries

* **Framework**: [Expo](https://expo.dev/) (SDK 51) with [Expo Router v3](https://docs.expo.dev/router/introduction/)
* **Language**: [TypeScript](https://www.typescriptlang.org/)
* **State & Server Cache**: [TanStack Query v5](https://tanstack.com/query) (`@tanstack/react-query`)
* **Vector Graphics & Visuals**: [react-native-svg](https://github.com/software-mansion/react-native-svg)
* **Iconography**: [lucide-react-native](https://lucide.dev/)
* **Localization**: [i18next](https://www.i18next.com/) & [react-i18next](https://react.i18next.com/)
* **Safe Area Handling**: [react-native-safe-area-context](https://github.com/th3rdwave/react-native-safe-area-context)

---

## 🚀 Getting Started & Local Development

### 1. Clone the Repository
```bash
git clone https://github.com/LuchaLibreAAA/Rituchakra-App.git
cd Rituchakra-App
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env` file in the root directory:
```env
EXPO_PUBLIC_API_BASE=https://api.rituchakra.in
EXPO_PUBLIC_DEFAULT_LAT=22.0667
EXPO_PUBLIC_DEFAULT_LON=88.0698
EXPO_PUBLIC_USE_MOCKS=true
```

### 4. Run Development Server
```bash
# Start with clean cache
npx expo start -c

# Run on Android emulator / device
npx expo start --android

# Run on iOS simulator / device
npx expo start --ios

# Run on Web browser
npx expo start --web
```

---

## 🌐 Official Data Providers & References
* 🛰️ **IMD**: India Meteorological Department Weather Forecasts & CAP Alerts
* 🌊 **Open-Meteo GloFAS**: Global Flood Awareness & Discharge APIs
* 💨 **CPCB**: Central Pollution Control Board (Real-time AQI)
* 🌾 **Agmarknet**: Ministry of Agriculture & Farmers Welfare (Mandi Prices)
* 🌍 **USGS**: Earthquake Hazards Program (FDSN)

---

<div align="center">
  <sub>Built with ❤️ for Indian Agriculture and Resilient Climate Communities.</sub>
</div>
