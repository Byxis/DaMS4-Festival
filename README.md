![](banner_polytech_dams.png)

# DaMS4 - Festival

<div align="center">

**🌍 Language / Langue**

[![🇺🇸 English](https://img.shields.io/badge/🇺🇸-English-blue?style=for-the-badge)](README.md)
[![🇫🇷 Français](https://img.shields.io/badge/🇫🇷-Français-lightgrey?style=for-the-badge)](README.fr.md)

---

</div>

# DaMS4 - Festival

DaMS4 Festival is a specialized web application designed for organizing **board game festivals**. It enables organizers to manage the entire lifecycle of table and gaming area reservations by publishers and service providers. The application facilitates the rental of spaces, tracking of available square meters (converted to tables), and the logistics of game assignments across different pricing and map zones.

## Key Features

The application is structured around several core functionalities:

### 1. Festival & Zone Logistics
- **Multi-Festival Support**: Seamlessly create, manage, and switch between different festivals.
- **Pricing Zones**: Define zones with specific pricing rules (per table or m²) and table types (standard, large, town tables).
- **Space Tracking**: Real-time monitoring of available "gauge" and table stocks to prevent overbooking.

### 2. Booker & Publisher CRM
- **Booker Workflow**: Manage varying types of bookers (Publishers, Service Providers, Associations, Stores, Animations).
- **Interaction History**: Track the status of each relationship: *To Contact*, *Contacted*, *In Discussion*, *Reserved*, or *Absent*.
- **Contact Database**: Centralized management of billing contacts and publisher details.

### 3. Reservation & Invoicing
- **Booking Engine**: Handle reservations for specific numbers of tables across multiple pricing zones.
- **Financial Management**: Automated invoicing calculations with space costs.
- **Status Monitoring**: Track reservation states (`Invoiced`, `Paid`) and manage financial compliance.

### 4. Game Management & Allocation
- **Game Catalog**: Maintain a detailed portfolio of games (Name, Type, Age Range, Authors).
- **Table Assignment**: Allocating specific games to reserved tables and map zones (e.g., "Game X assigned to 1/2 large table in Zone A").
- **Exhibition Logic**: Distinguish between games provided by publishers versus games presented by the festival.

### 5. Authentication & Security
- **Access Control**: Secure login/logout for festival organizers.
- **Admin Privileges**: Role-based protection for sensitive operations like festival creation and logic configuration.

---

### Tech Stack

- **Frontend**: Angular 20, SCSS
- **Backend**: Node.js, Express, TypeScript
- **Database**: PostgreSQL
- **File Storage**: Multer
- **Security**: JWT Authentication

## Prerequisites

- Docker
- Docker Compose
- Git
- Node.js
- npm

## Installation

To install the application, follow these steps:

1. Clone the repository:
```bash
$ git clone https://github.com/byxis/DaMS4-Festival.git
```

2. Install dependencies:
```bash
$ cd DaMS4-Festival
$ npm install
```

3. Copy the .env.example file to .env and fill in the values:
```bash
$ cp backend/.env.example .env
$ nano .env
```

4. Add your certificate files to the `certs` directory:
```bash
$ cp /path/to/your/cert.pem /path/to/your/key.pem certs/
```
*Note: The certificate files might need to be added to the `backend/certs` directory and the `frontend/certs` directory*

5. Run the application with docker:
```bash
$ docker compose -f docker-compose.prod.yml up --build
```

## Authors

<div align="center">

| [<img src="https://github.com/byxis.png" width="100px" style="border-radius: 50%;" alt="Alexis Serrano"/>](https://github.com/byxis) | [<img src="https://github.com/AndreaAntoniali.png" width="100px" style="border-radius: 50%;" alt="Andréa Antoniali"/>](https://github.com/AndreaAntoniali) | [<img src="https://github.com/esternielsen.png" width="100px" style="border-radius: 50%;" alt="Esther Nielsen"/>](https://github.com/esternielsen) | [<img src="https://github.com/YoanBst.png" width="100px" style="border-radius: 50%;" alt="Yoan Bastide"/>](https://github.com/YoanBst) |
| :---: | :---: | :---: | :---: |
| **Alexis Serrano** | **Andréa Antoniali** | **Esther Nielsen** | **Yoan Bastide** |
| [![GitHub](https://img.shields.io/badge/GitHub-Byxis-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/byxis) | [![GitHub](https://img.shields.io/badge/GitHub-AndreaAntoniali-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/AndreaAntoniali) | [![GitHub](https://img.shields.io/badge/GitHub-esternielsen-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/esternielsen) | [![GitHub](https://img.shields.io/badge/GitHub-YoanBst-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/YoanBst) |

</div>


