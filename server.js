import os
import http.server
import socketserver
import threading
import logging
import socket
import platform
import requests
from dotenv import load-dotenv # type: ignore

# Load environment variables if a .env file is present
load_dotenv()

PORT = int(os.environ.get("PORT", 3000))
TELEGRAM_BOT_TOKEN = os.environ.get("TELEGRAM_BOT_TOKEN", "YOUR_BOT_TOKEN")

# Setup basic logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ==========================================
# 1. Simple HTTP Server (Python Equivalent)
# ==========================================
class SimpleHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path == '/health':
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            response = '{"status": "ok", "uptime": "running"}'
            self.wfile.write(response.encode("utf-8"))
        else:
            # Fallback for static files / SPA routing
            super().do_GET()

def run_http_server():
    """Runs the HTTP server in a background thread."""
    handler = SimpleHandler
    with socketserver.TCPServer(("0.0.0.0", PORT), handler) as httpd:
        logger.info(f"🚀 Production server running on port {PORT}")
        httpd.serve_forever()


# ==========================================
# 2. Telegram Bot Implementation
# ==========================================
try:
    import telebot
    from telebot.types import InlineKeyboardMarkup, InlineKeyboardButton
except ImportError:
    telebot = None

def run_telegram_bot():
    """Initializes and runs the Telegram bot."""
    if not telebot or TELEGRAM_BOT_TOKEN == "YOUR_BOT_TOKEN":
        logger.warning("Telegram bot library not installed or token not configured.")
        return

    bot = telebot.TeleBot(TELEGRAM_BOT_TOKEN)

    @bot.message_handler(commands=['start', 'help'])
    def send_welcome(message):
        keyboard = InlineKeyboardMarkup()
        keyboard.add(InlineKeyboardButton(text='Login', callback_data='login'))
        keyboard.add(InlineKeyboardButton(text='IP Info', callback_data='ip_info'))
        keyboard.add(InlineKeyboardButton(text='Locate Me', callback_data='locate_me'))
        keyboard.add(InlineKeyboardButton(text='Device Info', callback_data='device_info'))
        
        bot.send_message(message.chat.id, 'Welcome! Choose an option:', reply_markup=keyboard)

    @bot.callback_query_handler(func=lambda call: True)
    def callback_inline(query):
        if query.data == 'login':
            msg = bot.send_message(query.message.chat.id, 'Please enter your email and password:')
            bot.register_next_step_handler(msg, handle_login)

        elif query.data == 'ip_info':
            ip_address = socket.gethostbyname(socket.gethostname())
            bot.send_message(query.message.chat.id, f'Your IP address is: {ip_address}')

        elif query.data == 'locate_me':
            try:
                hostname = socket.gethostname()
                rsp = requests.get(f'https://ipapi.co/{socket.gethostbyname(hostname)}/json/')
                location_data = rsp.json()
                bot.send_message(
                    query.message.chat.id, 
                    f"Latitude: {location_data.get('latitude')}\n"
                    f"Longitude: {location_data.get('longitude')}\n"
                    f"Country: {location_data.get('country_name')}\n"
                    f"Region: {location_data.get('region')}"
                )
            except Exception as e:
                bot.send_message(query.message.chat.id, f"Could not retrieve location: {e}")

        elif query.data == 'device_info':
            device_info = (
                f"Platform: {platform.system()}\n"
                f"Release: {platform.release()}\n"
                f"Version: {platform.version()}"
            )
            bot.send_message(query.message.chat.id, device_info)

    def handle_login(msg):
        try:
            parts = msg.text.split(maxsplit=1)
            email = parts[0]
            password = parts[1] if len(parts) > 1 else "N/A"
            bot.send_message(msg.chat.id, f'Email: {email}\nPassword: {password}')
        except Exception:
            bot.send_message(msg.chat.id, "Invalid format. Please send both email and password separated by a space.")

    logger.info("🤖 Telegram bot polling started...")
    bot.infinity_polling()


# ==========================================
# Main Execution
# ==========================================
if __name__ == '__main__':
    # Start the HTTP server in a separate thread so it doesn't block the bot
    server_thread = threading.Thread(target=run_http_server, daemon=True)
    server_thread.start()

    # Run the Telegram bot on the main thread
    run_telegram_bot()
