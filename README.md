# 🌎 TravelTrip Frontend (Vue 3 Application)

This repository contains the **single-page application (SPA)** user interface for **TravelTrip**, built with **Vue 3**, **TypeScript**, and **Tailwind CSS**.

The frontend communicates with the TravelTrip Backend API to deliver a seamless travel management experience including trip browsing, user authentication, and trip management.

---

## 🖼️ Tech Stack

| Component           | Technology   | Details                                            |
| ------------------- | ------------ | -------------------------------------------------- |
| **Framework**       | Vue 3 + Vite | Modern SPA development + lightning-fast dev server |
| **Styling**         | Tailwind CSS | Utility-first CSS framework                        |
| **Routing**         | Vue Router   | Client-side routing                                |
| **Authentication**  | Clerk        | Frontend auth via `@clerk/vue`                     |
| **Language**        | TypeScript   | Strong typing for safer development                |
| **Map Integration** | Leaflet.js   | Real-time Map pin                                  |

### 🌐 Live Frontend Endpoint

**https://traveltrip-frontend.netlify.app/**

---

# 🛠️ Local Development Setup

### **Prerequisites**

- Node.js (LTS recommended)
- Access to the TravelTrip Backend API
  - Local: `http://localhost:8081/api`
  - OR Production backend

---

## 📦 Project Structure

```
src/
├─ api/
│  ├─ CloudinaryUploader.ts
│  └─ tripsApi.ts
│
├─ assets/
│  └─ (images, icons, etc.)
│
├─ components/              // Components
│  ├─ sections/             // Sub-sections in page component
│  │  ├─ HeroSection.vue
│  │  ├─ HighlightSection.vue
│  │  ├─ TravelCardSection.vue
│  │
│  ├─ CloudinaryUploader.vue
│  ├─ DeleteConfirmationModal.vue
│  ├─ FeatureCardScroller.vue
│  ├─ Footer.vue
│  ├─ ImageUploader.vue
│  ├─ Modal.vue
│  ├─ Navbar.vue
│  ├─ SearchBar.vue
│  ├─ TravelCard.vue
│  ├─ Button.vue
│  └─ TripMap.vue
│
├─ pages/                   // Page component
│  ├─ DashboardPage.vue
│  ├─ DestinationDetailPage.vue
│  ├─ DestinationFormPage.vue
│  ├─ LandingPage.vue
│  ├─ NotFoundPage.vue
│  ├─ SearchPage.vue
│
├─ types/                   // Type Interface
│  └─ types.ts
│
├─ utils/                   // Mock Data
│  ├─ trips.ts
│  └─ users.ts
│
├─ App.vue
├─ index.ts                 // Page Navigation setup
├─ main.ts
```

#### For Backend Part

Please refer to this repo : https://github.com/tatchunari/travel-app-backend

Developed by Orathai Saengsoemsap
