import { useState } from "react";

function Weather() {
    const [city, setCity] = useState("");
    const [weather, setWeather] = useState();
    const [temperature, setTemperature] = useState();
    const API_KEY = "1fb4cc08b94c981c96e16ef736d41c77";    

    const handleChange = (e) => {
         setCity(e.target.value);
    }

    const handleClick = async() => {
         try{
            const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`;

            const weatherResponse = await fetch(url);
            const weatherData = await weatherResponse.json();

            setTemperature(weatherData.main.temp);
            setWeather(weatherData.main.humidity);
         }
         catch(err){
            console.log("Error:", err);
         }

    }

    return (
        <>
            <label>Enter a state:</label>
            <input type="text" name="state" onChange={handleChange}></input>
            <button style={{padding: "5px", borderRadius: "5px"}} onClick={handleClick}>Click to get weather</button>
            <p>Current Temperature: {temperature}</p>
            <p>Current Weather: {weather}</p>
            <p></p>
        </>

    )
}

export default Weather;