<p align="right">
  <img src="https://res.cloudinary.com/dy35wrc6z/image/upload/v1752076118/logo_nkqsnx.png" alt="OstaFandy Logo" height="60"/>
</p>

##  OstaFandy Frontend

![OstaFandy](https://img.shields.io/badge/Angular-Frontend-red?style=flat-square&logo=angular)  
*Modern, responsive, and user-friendly interface for the OstaFandy handyman booking platform.*

---

## 📖 Overview

**OstaFandy Frontend** is the web application that allows users to explore and book handyman services effortlessly.  
The application is built using **Angular** and communicates with a RESTful API backend to deliver a seamless experience.  
It supports **Arabic language**, **responsive design**, and a clean, intuitive interface.

---

## 🚀 Features

- User authentication (Sign In / Sign Up)  
- Browse and book available services  
- User dashboard with booking details and profile management  
- Real-time notifications and chat
- Clean and modern design

---

## 🛠️ Tech Stack

| Technology      | Purpose                     |
|-----------------|-----------------------------|
| **Angular**     | Framework for SPA frontend |
| **TypeScript**  | Strongly-typed JS          |
| **HTML & CSS**  | Markup and styling         |
| **RxJS**        | Reactive programming       |
| **Bootstrap / Custom CSS** | Styling & layout |

---

## 📂 Project Structure 
```
├── app/
│ ├── auth/ # Authentication components
│ ├── components/ # Common UI components
│ ├── Admin/ # Admin role modules, layouts & routes
│ │ ├── ...
│ │ ├── Layouts/
│ │ ├── Services/
│ │ ├── routes/
│ ├── Customer/ # Customer role modules, layouts & routes
│ │ ├── ...
│ │ ├── Layouts/
│ │ ├── Services/
│ │ ├── routes/
│ ├── Handyman/ # Handyman role modules, layouts & routes
│ │ ├── ...
│ │ ├── Layouts/
│ │ ├── Services/
│ │ ├── routes/
│ ├── Core/ # Core app logic
│ │ ├── guards/ # Route guards
│ │ ├── interceptors/ # HTTP interceptors
│ │ ├── modals/ # Common modals
│ │ ├── Shared/ # Shared enums, URLs, utilities
│ │ ├── Enum/
│ │ ├── URL/ # Environment/config URLs
│ └── app.module.ts # Root module
```

## ⚙️ Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) 
- [Angular CLI](https://angular.io/cli)

### Installation
Clone the repository and install dependencies:
```bash
git clone https://github.com/OstaFandy-ITI/Frontend.git
cd Frontend
npm install
ng serve --open
```


