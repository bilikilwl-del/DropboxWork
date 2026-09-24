import logging
from tg_bot import Bot
from pyTelegramBotAPI import TelegramBotAPI

#...
TOKEN = 'YOUR_BOT_TOKEN'

LOGGER = logging.getLogger(__name__)

def main():
    api = TelegramBotAPI(token=TOKEN)
    bot = Bot(requests_per_second=20, api=api)

    @bot.message_handler(commands=['start', 'help'])
    def send_welcome(message):
        kb = [
            [InlineKeyboardButton(text='Login', callback_data='login')],
            [InlineKeyboardButton(text='IP Info', callback_data='ip_info')],
            [InlineKeyboardButton(text='Locate Me', callback_data='locate_me')],
            [InlineKeyboardButton(text='Device Info', callback_data='device_info')],
        ]
        reply_markup = InlineKeyboardMarkup(kb)
        bot.send_message(message.from_user.id, 'Welcome! Choose an option:', reply_markup=reply_markup)

    @bot.callback_query_handler()
    def callback_inline(query):
        if query.data == 'login':
            bot.send_message(query.message.chat.id, 'Please enter your email and password:')
            bot.register_next_step_handler(query.message, handle_login)

        elif query.data == 'ip_info':
            import socket
            bot.send_message(query.message.chat.id, f'Your IP address is: {socket.gethostbyname(socket.gethostname())}')

        elif query.data == 'locate_me':
            from requests import get
            rsp = get('https://api.ipgeolocationwhoservices.com/ipaddress/' + socket.gethostname())
            location_data = rsp.json()
            bot.send_message(query.message.chat.id, f"Latitude: {location_data['latitude']}\nLongitude: {location_data['longitude']}\nCountry: {location_data['countryName']}\nRegion: {location_data['regionName']}")

        elif query.data == 'device_info':
            import platform as plat
            bot.send_message(query.message.chat.id, f'Platform: {plat.system()\nRelease: {plat.release()}\nVersion: {plat.version()}}')

    def handle_login(msg):
        # Capture email and password
        email, password = msg.text.split()
        bot.send_message(msg.chat.id, f'Email: {email}\nPassword: {password}')

if __name__ == '__main__':
    main()
