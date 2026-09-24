import os
import http.server
import socketserver
import threading
import logging
import socket
import platform
import requests
import telebot

from dotenv import load_dotenv
from telebot.types import InlineKeyboardMarkup, InlineKeyboardButton

# ==========================================
# Load environment variables
# ==========================================
load_dotenv()

PORT = int(os.environ.get("PORT", 10000))
TELEGRAM_BOT_TOKEN = os.environ.get("TELEGRAM_BOT_TOKEN", "").strip()

# ==========================================
# Logging
# ==========================================
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s"
)

logger = logging.getLogger(__name__)


# ==========================================
# Check Telegram token
# ==========================================
if not TELEGRAM_BOT_TOKEN:
    logger.error("TELEGRAM_BOT_TOKEN is not configured.")
    raise RuntimeError(
        "Please add TELEGRAM_BOT_TOKEN to Render Environment Variables."
    )


# ==========================================
# HTTP Health Server
# Required by Render
# ==========================================
class HealthHandler(http.server.BaseHTTPRequestHandler):

    def do_GET(self):
        if self.path == "/health" or self.path == "/":
            response = b'{"status":"ok","service":"telegram-bot","uptime":"running"}'

            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Content-Length", str(len(response)))
            self.end_headers()
            self.wfile.write(response)

        else:
            response = b'{"status":"not_found"}'

            self.send_response(404)
            self.send_header("Content-Type", "application/json")
            self.send_header("Content-Length", str(len(response)))
            self.end_headers()
            self.wfile.write(response)

    def log_message(self, format, *args):
        # Prevent unnecessary HTTP access logs
        return


def run_http_server():
    try:
        with socketserver.TCPServer(
            ("0.0.0.0", PORT),
            HealthHandler
        ) as server:

            logger.info(
                f"HTTP health server running on port {PORT}"
            )

            server.serve_forever()

    except Exception as e:
        logger.error(f"HTTP server error: {e}")


# ==========================================
# Telegram Bot
# ==========================================
bot = telebot.TeleBot(
    TELEGRAM_BOT_TOKEN,
    parse_mode=None
)


# ==========================================
# /start and /help
# ==========================================
@bot.message_handler(commands=["start", "help"])
def send_welcome(message):

    keyboard = InlineKeyboardMarkup()

    keyboard.add(
        InlineKeyboardButton(
            text="🌐 IP Information",
            callback_data="ip_info"
        )
    )

    keyboard.add(
        InlineKeyboardButton(
            text="📍 Server Location",
            callback_data="location"
        )
    )

    keyboard.add(
        InlineKeyboardButton(
            text="💻 Server Device Info",
            callback_data="device_info"
        )
    )

    keyboard.add(
        InlineKeyboardButton(
            text="ℹ️ Bot Information",
            callback_data="bot_info"
        )
    )

    bot.send_message(
        message.chat.id,
        "Welcome! 👋\n\n"
        "Choose an option below:",
        reply_markup=keyboard
    )


# ==========================================
# Callback buttons
# ==========================================
@bot.callback_query_handler(func=lambda call: True)
def callback_handler(call):

    try:
        # Acknowledge button click
        bot.answer_callback_query(call.id)

        # --------------------------------------
        # IP Information
        # --------------------------------------
        if call.data == "ip_info":

            try:
                hostname = socket.gethostname()
                server_ip = socket.gethostbyname(hostname)

                bot.send_message(
                    call.message.chat.id,
                    "🌐 Server IP Information\n\n"
                    f"Hostname: {hostname}\n"
                    f"Server IP: {server_ip}"
                )

            except Exception as e:

                logger.error(f"IP information error: {e}")

                bot.send_message(
                    call.message.chat.id,
                    "Unable to retrieve server IP information."
                )

        # --------------------------------------
        # Server Location
        # --------------------------------------
        elif call.data == "location":

            try:
                response = requests.get(
                    "https://ipapi.co/json/",
                    timeout=10
                )

                response.raise_for_status()

                data = response.json()

                message_text = (
                    "📍 Server Location\n\n"
                    f"IP: {data.get('ip', 'Unknown')}\n"
                    f"City: {data.get('city', 'Unknown')}\n"
                    f"Region: {data.get('region', 'Unknown')}\n"
                    f"Country: {data.get('country_name', 'Unknown')}\n"
                    f"Latitude: {data.get('latitude', 'Unknown')}\n"
                    f"Longitude: {data.get('longitude', 'Unknown')}\n"
                    f"Timezone: {data.get('timezone', 'Unknown')}"
                )

                bot.send_message(
                    call.message.chat.id,
                    message_text
                )

            except Exception as e:

                logger.error(f"Location error: {e}")

                bot.send_message(
                    call.message.chat.id,
                    "Unable to retrieve the server location."
                )

        # --------------------------------------
        # Device Information
        # --------------------------------------
        elif call.data == "device_info":

            device_info = (
                "💻 Server Device Information\n\n"
                f"Operating System: {platform.system()}\n"
                f"OS Release: {platform.release()}\n"
                f"OS Version: {platform.version()}\n"
                f"Machine: {platform.machine()}\n"
                f"Processor: {platform.processor() or 'Unknown'}\n"
                f"Hostname: {socket.gethostname()}"
            )

            bot.send_message(
                call.message.chat.id,
                device_info
            )

        # --------------------------------------
        # Bot Information
        # --------------------------------------
        elif call.data == "bot_info":

            bot.send_message(
                call.message.chat.id,
                "🤖 Telegram Bot\n\n"
                "Status: Online ✅\n"
                "Hosting: Render\n"
                "Connection: Telegram Bot API\n\n"
                "The bot is running successfully."
            )

    except Exception as e:

        logger.error(
            f"Callback handler error: {e}"
        )


# ==========================================
# Simple text handler
# ==========================================
@bot.message_handler(
    func=lambda message: True,
    content_types=["text"]
)
def handle_text(message):

    if message.text.startswith("/"):
        return

    bot.send_message(
        message.chat.id,
        "I received your message. 👍\n\n"
        "Use /start to open the bot menu."
    )


# ==========================================
# Telegram polling
# ==========================================
def run_telegram_bot():

    logger.info("Starting Telegram bot...")

    try:

        bot.remove_webhook()

        logger.info(
            "Telegram webhook removed. Starting polling..."
        )

        bot.infinity_polling(
            timeout=60,
            long_polling_timeout=60,
            skip_pending=True
        )

    except Exception as e:

        logger.error(
            f"Telegram bot stopped: {e}"
        )

        raise


# ==========================================
# Main
# ==========================================
if __name__ == "__main__":

    logger.info("Starting application...")

    # Start Render HTTP server
    server_thread = threading.Thread(
        target=run_http_server,
        daemon=True
    )

    server_thread.start()

    # Start Telegram bot
    run_telegram_bot()
