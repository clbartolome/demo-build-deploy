window.onload = function() {
    var weatherContainer = document.getElementById('weather-animation');
    if (weatherContainer) {
        var condition = weatherContainer.getAttribute('data-condition');
        var error = weatherContainer.getAttribute('data-error') === 'true';
        
        if (error || !condition) {
            weatherContainer.innerHTML = `
                <div class="error">
                    <p>Not sure what's the weather... let's stay at home</p>
                    <div class="house">
                        <div class="roof"></div>
                        <div class="walls"></div>
                        <div class="door"></div>
                    </div>
                </div>`;
        } else if (condition.includes('clear')) {
            weatherContainer.innerHTML = `
                <div class="sun"></div>`;
        } else if (condition.includes('rain')) {
            weatherContainer.innerHTML = `
                <div class="rain">
                    <div class="raindrop"></div>
                    <div class="raindrop"></div>
                    <div class="raindrop"></div>
                    <div class="raindrop"></div>
                    <div class="raindrop"></div>
                </div>`;
        } else if (condition.includes('thunderstorm')) {
            weatherContainer.innerHTML = `
                <div class="thunderstorm">
                    <div class="lightning"></div>
                </div>`;
        } else if (condition.includes('drizzle')) {
            weatherContainer.innerHTML = `
                <div class="rain drizzle">
                    <div class="raindrop"></div>
                    <div class="raindrop"></div>
                    <div class="raindrop"></div>
                    <div class="raindrop"></div>
                    <div class="raindrop"></div>
                </div>`;
        } else if (condition.includes('snow')) {
            weatherContainer.innerHTML = `
                <div class="snow">
                    <div class="snowflake"></div>
                    <div class="snowflake"></div>
                    <div class="snowflake"></div>
                    <div class="snowflake"></div>
                    <div class="snowflake"></div>
                </div>`;
        } else if (condition.includes('clouds')) {
            weatherContainer.innerHTML = `
                <div class="clouds">
                    <div class="cloud"></div>
                    <div class="cloud"></div>
                    <div class="cloud"></div>
                </div>`;
        } else if (condition.includes('atmosphere')) {
            weatherContainer.innerHTML = `
                <div class="atmosphere"></div>`;
        }
    }
};
