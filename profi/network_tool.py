import tkinter as tk
from tkinter import ttk, messagebox
import threading
import ping3
from openpyxl import Workbook
from datetime import datetime
import os

class NetworkTool:
    def __init__(self, root):
        self.root = root
        self.root.title("Network Tool")
        self.root.geometry("400x350")
        
        # Create and set up the main frame
        self.main_frame = ttk.Frame(root, padding="10")
        self.main_frame.grid(row=0, column=0, sticky=(tk.W, tk.E, tk.N, tk.S))
        
        # Create input fields
        self.create_input_fields()
        
        # Create buttons
        self.create_buttons()
        
    def create_input_fields(self):
        # IP Switch 1
        ttk.Label(self.main_frame, text="IP SW1:").grid(row=0, column=0, sticky=tk.W, pady=5)
        self.ip_sw1 = ttk.Entry(self.main_frame, width=30)
        self.ip_sw1.grid(row=0, column=1, columnspan=2, pady=5)
        
        # IP Switch 2
        ttk.Label(self.main_frame, text="IP SW2:").grid(row=1, column=0, sticky=tk.W, pady=5)
        self.ip_sw2 = ttk.Entry(self.main_frame, width=30)
        self.ip_sw2.grid(row=1, column=1, columnspan=2, pady=5)
        
        # Subnet
        ttk.Label(self.main_frame, text="Subnet:").grid(row=2, column=0, sticky=tk.W, pady=5)
        self.subnet = ttk.Entry(self.main_frame, width=30)
        self.subnet.grid(row=2, column=1, columnspan=2, pady=5)
        
        # Local IP
        ttk.Label(self.main_frame, text="Local IP:").grid(row=3, column=0, sticky=tk.W, pady=5)
        self.local_ip = ttk.Entry(self.main_frame, width=30)
        self.local_ip.grid(row=3, column=1, columnspan=2, pady=5)
        
        # Username
        ttk.Label(self.main_frame, text="Username:").grid(row=4, column=0, sticky=tk.W, pady=5)
        self.username = ttk.Entry(self.main_frame, width=30)
        self.username.grid(row=4, column=1, columnspan=2, pady=5)
        
        # Password
        ttk.Label(self.main_frame, text="Password:").grid(row=5, column=0, sticky=tk.W, pady=5)
        self.password = ttk.Entry(self.main_frame, width=30, show="*")
        self.password.grid(row=5, column=1, columnspan=2, pady=5)

    def create_buttons(self):
        # Create a frame for buttons
        button_frame = ttk.Frame(self.main_frame)
        button_frame.grid(row=6, column=0, columnspan=3, pady=20)
        
        # Ping Script Button
        self.ping_button = ttk.Button(button_frame, text="PING SCRIPT", command=self.run_ping_script)
        self.ping_button.grid(row=0, column=0, padx=10)
        
        # Generate XLSX Button
        self.xlsx_button = ttk.Button(button_frame, text="GENERATE XLSX", command=self.generate_xlsx)
        self.xlsx_button.grid(row=0, column=1, padx=10)

    def run_ping_script(self):
        def ping_thread():
            ips_to_ping = [self.ip_sw1.get(), self.ip_sw2.get(), self.local_ip.get()]
            results = []
            
            for ip in ips_to_ping:
                if ip:
                    try:
                        response_time = ping3.ping(ip)
                        if response_time is not None:
                            results.append(f"{ip}: Response time = {response_time:.2f}ms")
                        else:
                            results.append(f"{ip}: No response")
                    except Exception as e:
                        results.append(f"{ip}: Error - {str(e)}")
            
            # Show results in message box
            messagebox.showinfo("Ping Results", "\n".join(results))
            
        threading.Thread(target=ping_thread, daemon=True).start()

    def generate_xlsx(self):
        wb = Workbook()
        ws = wb.active
        ws.title = "Network Details"
        
        # Add headers
        headers = ["Parameter", "Value"]
        ws.append(headers)
        
        # Add data
        data = [
            ["IP SW1", self.ip_sw1.get()],
            ["IP SW2", self.ip_sw2.get()],
            ["Subnet", self.subnet.get()],
            ["Local IP", self.local_ip.get()],
            ["Username", self.username.get()],
            ["Timestamp", datetime.now().strftime("%Y-%m-%d %H:%M:%S")]
        ]
        
        for row in data:
            ws.append(row)
        
        # Save file
        filename = f"network_details_{datetime.now().strftime('%Y%m%d_%H%M%S')}.xlsx"
        wb.save(filename)
        messagebox.showinfo("Success", f"Excel file generated: {filename}")

if __name__ == "__main__":
    root = tk.Tk()
    app = NetworkTool(root)
    root.mainloop() 