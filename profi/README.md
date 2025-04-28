# Network Tool

A simple Python-based network tool with GUI for managing and testing network connections.

## Features

- Input and store network device information
- Ping multiple network devices simultaneously
- Generate Excel reports with network details
- Simple and intuitive GUI interface

## Requirements

- Python 3.6 or higher
- Required Python packages (install using requirements.txt)

## Installation

1. Clone or download this repository
2. Install the required packages:
```bash
pip install -r requirements.txt
```

## Usage

1. Run the application:
```bash
python network_tool.py
```

2. Enter the network details in the input fields:
   - IP SW1: First switch IP address
   - IP SW2: Second switch IP address
   - Subnet: Network subnet
   - Local IP: Your local IP address
   - Username: Network device username
   - Password: Network device password

3. Use the buttons:
   - PING SCRIPT: Test connectivity to the entered IP addresses
   - GENERATE XLSX: Create an Excel report with the current network details

## Notes

- The ping function runs in a separate thread to prevent GUI freezing
- Excel reports are saved with timestamps in the filename
- Passwords are masked in the GUI for security 