from flask import Flask, render_template, request
import requests
import os

app = Flask(__name__)
BASE_URL = 'https://api.openweathermap.org/data/2.5/weather'


def get_weather(city):
    params = {'q': city, 'appid': os.environ.get('WEATHER_API_KEY', 'none'), 'units': 'metric'}
    print(params)
    response = requests.get(BASE_URL, params=params)
    return response.json(), response.status_code

@app.route('/', methods=['GET', 'POST'])
def index():
    weather = None
    error = False
    if request.method == 'POST':
        city = request.form.get('city')
        weather_data, status_code = get_weather(city)
        print(weather_data)
        if status_code == 200:
            weather = weather_data
        else:
            error = True
    return render_template('index.html', weather=weather, error=error)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
