# Weather App

This Python APP uses the https://openweathermap.org/api API for retrieven weather information. In order to run it, you need an API key (free). Use this [link](https://openweathermap.org/current#name) for API documentation.

The API key needs to be configured as an environment variable: `WEATHER_API_KEY`.

## Run locally

```sh
# Configure Python environment (if needed)
virtualenv weather-app
source weather-app/bin/activate

# Install requirements
pip install -r requirements.txt

# Configure api key
export WEATHER_API_KEY=<your_key>

# Run app
python app.py
```


