# NexusFinance — AI Agents Handbook & Development Log

This handbook outlines the system architecture, completed features, and file paths to guide any future AI agent working on this codebase.

---

## 1. Core Completed Features

### 🔑 Single-Trip Telegram OTP Linkage
* **Goal**: Enable users to link their website profile with their Telegram account using their phone number in a single trip.
* **Flow**: 
  1. User clicks **"📱 Share Phone Number to Link"** inline button in the Telegram bot chat.
  2. A lightweight WebApp sheet loads (`/tg-share-phone`) and prompts the native Telegram phone sharing popup.
  3. Once shared, the WebApp auto-closes, returning the user instantly to the chat.
  4. The backend links the phone number to their profile and **instantly sends a 6-digit OTP code** in the same response.
  5. The website polls `/auth/check-link` in the background and redirects them to enter the OTP.

### 👥 Normal Admin (`admin`) & Super Admin (`super-admin`) Roles
* **Goal**: Provide a separate administrative level for clients (`admin`) while retaining root system configuration rights (`super-admin`).
* **Implementation**:
  * **Role Guards**: Backend endpoints (loan approval, stats, broadcasts, tasks, reminder sweep configs) are protected by `requireRole('loan-officer', 'admin', 'super-admin')`.
  * **Dashboard Routing**: Users with the `admin` role are directed to select and enter the Super Admin portal dashboard upon login.
  * **User Promotion**: Super Admins can promote users to `admin` level via the roles dropdown selector on the User Management tab.

### 📱 Real-Time Telegram Status Alerts
* **Goal**: Push status updates directly to users' Telegram chats.
* **Implementation**: The backend `notifyUser` callback in `server/index.ts` is patched to automatically query the user's `telegram_chat_id` and send a Telegram notification if they are linked.

### 🎨 Responsive Auth Pages
* **Goal**: Prevent zoomed viewports or smaller devices from hiding login/register forms and footer elements, and clip background decorative elements.
* **Implementation**: 
  * Outer parent container is set to `h-screen overflow-hidden` (acting as the viewport boundary).
  * Background glow orbs are inside the boundary and clipped.
  * The actual login/register templates are wrapped in an `absolute inset-0 overflow-y-auto` scrolling container.

---

## 2. Key File Paths & Mappings

* **Telegram Bot Handlers**: [`server/bot.ts`](file:///c:/Users/Asus/Desktop/yoooo/server/bot.ts)
* **Backend API Server**: [`server/index.ts`](file:///c:/Users/Asus/Desktop/yoooo/server/index.ts)
* **SMS Twilio Gateway**: [`server/sms.ts`](file:///c:/Users/Asus/Desktop/yoooo/server/sms.ts)
* **Auth Page Component**: [`src/components/AuthPage.tsx`](file:///c:/Users/Asus/Desktop/yoooo/src/components/AuthPage.tsx)
* **WebApp Contact Share Overlay**: [`src/components/TgSharePhone.tsx`](file:///c:/Users/Asus/Desktop/yoooo/src/components/TgSharePhone.tsx)
* **Main Router**: [`src/App.tsx`](file:///c:/Users/Asus/Desktop/yoooo/src/App.tsx)
* **Portal Selector**: [`src/components/PortalSelection.tsx`](file:///c:/Users/Asus/Desktop/yoooo/src/components/PortalSelection.tsx)

---

## 3. Development Commands

* **Local Dev (Client)**: `npm run dev`
* **Local Dev (Server)**: `npm run server`
* **Compilation Checks**: `npm run lint` (`tsc --noEmit`)
