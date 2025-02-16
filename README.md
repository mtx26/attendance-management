# Attendance Management

## Description

**Attendance Management** is a web-based application developed in **Python** to efficiently track the attendance of club or organization members. It provides an intuitive interface for users to mark their presence at training sessions. The data is stored in an **SQLite** database, and attendance records are automatically reset every **Saturday**.

### Key Features:
- Attendance tracking through an interactive web interface.
- Member management: add and remove members with confirmation.
- Deletion history: logs who removed a member.
- Automatic attendance reset every **Saturday**.
- Optimized UI using **HTML, CSS, and JavaScript**.
- Backend powered by **Flask** and **SQLite**.

## Installation

### Prerequisites
- **Python 3.x** installed on your system.
- **pip** (Python package manager).

### Setup

1. **Clone the repository**:
   ```sh
   git clone https://github.com/mtx26/attendance-management.git
   cd attendance-management
   ```

2. **Install dependencies**:
   ```sh
   pip install -r requirements.txt
   ```

3. **Initialize the database**:
   ```sh
   python backend/db_init.py
   ```

4. **Run the server**:
   ```sh
   python server.py
   ```

5. **Access the application**:
   Open a browser and go to:
   ```
   http://127.0.0.1:5000
   ```

## Contribution

Want to help improve this project? Check out [CONTRIBUTING.md](CONTRIBUTING.md).

## License

This project is licensed under the **MIT License**.