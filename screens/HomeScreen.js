import {
  View,
  Text,
  Image,
  SafeAreaView,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import React, { useState, useCallback, useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { theme } from "../theme";
import { fetchLocations, fetchWeatherForecast } from "../api/weather";
import {
  CalendarDaysIcon,
  MagnifyingGlassIcon,
} from "react-native-heroicons/outline";
import { MapPinIcon } from "react-native-heroicons/solid";
import { debounce } from "lodash";
import { weatherImages } from '../constants'
import * as Progress from 'react-native-progress'
import { getData } from "../utils/asyncStorage";

const HomeScreen = () => {
  const [showSearch, toggleSearch] = useState(false);
  const [locations, setLocations] = useState([]);
  const [weather, setWeather] = useState({});
  const [loading, setLoading] = useState(true);
  const handleLocations = (loc) => {
    console.log("locations ", loc);
    setLocations([]);
    toggleSearch(false)
    setLoading(true);
    fetchWeatherForecast({
      cityName: loc.name,
      days: "7",
    }).then((data) => {
      setWeather(data);
      setLoading(false)
      console.log("got forecast", data);
    });
  };

  const handleSearch = (value) => {
    if (value.length > 2) {
      fetchLocations({ cityName: value }).then((data) => {
        setLocations(data);
      });
    }
  };

  const handleTextDebounce = useCallback(debounce(handleSearch, 1200), []);

  const { current, location } = weather;

  useEffect(() => {
    fetchDefaultWeatherData()
  }, [])

  const fetchDefaultWeatherData = async () => {
    let myCity = await getData('city')
    let cityName = 'Izmir'
    if (myCity) cityName = myCity
    fetchWeatherForecast({
      cityName,
      days: '7'
    }).then(data => {
      setWeather(data)
      setLoading(false)
    })
  }

  return (
    <View className="flex-1 relative">
      <StatusBar style="light" />
      <Image
        blurRadius={70}
        source={require("../assets/aa.jpg")}
        className="absolute h-full w-full"
      />
      {
        loading ? (
          <View className='flex-1 flex-row justify-center items-center'>
            <Progress.CircleSnail thickness={10} size={140} color='#0bb3b2' />
          </View>
        ) : (
          <SafeAreaView className="flex flex-1">
            {/*search sections*/}
            <View
              style={{ height: "7%" }}
              className="ml-4 mr-4 mt-10 relative z-50"
            >
              <View
                className="flex-row justify-end items-center rounded-full"
                style={{
                  backgroundColor: showSearch
                    ? "rgba(23, 32, 42 , 0.5)"
                    : "transparent",
                }}
              >
                {showSearch ? (
                  <TextInput
                    onChangeText={handleTextDebounce}
                    placeholder="Search City"
                    placeholderTextColor={"#F0F3F4"}
                    className="pl-6 h-10 pb-1 flex-1 text-base text-white"
                  />
                ) : null}

                <TouchableOpacity
                  onPress={() => toggleSearch(!showSearch)}
                  style={{ backgroundColor: "rgba(23,32,42,0.6)" }}
                  className="rounded-full p-3 m-1"
                >
                  <MagnifyingGlassIcon size="25" color="white" />
                </TouchableOpacity>
              </View>
              <View>
                {locations.length > 0 && showSearch ? (
                  <View className="absolute w-full bg-gray-300 top-2  rounded-3xl">
                    {locations.map((loc, index) => {
                      let showBorder = index + 1 != locations.length;
                      let borderClass = showBorder
                        ? "border-b-2 border-b-gray-400"
                        : " ";
                      return (
                        <TouchableOpacity
                          onPress={() => handleLocations(loc)}
                          key={index}
                          className={
                            "flex-row items-center border-0 p-3 px-4 mb-1 " +
                            borderClass
                          }
                        >
                          <MapPinIcon size="20" color="gray" />
                          <Text className="text-black text-lg ml-2 ">
                            {loc?.name}, {loc?.country}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                ) : null}
              </View>
            </View>
            <View className="mx-4 flex justify-around flex-1 mb-2">
              <Text className="text-white text-center text-2xl font-bold">
                {location?.name},
                <Text className="text-lg font-semibold text-gray-300">
                  {" " + location?.country}
                </Text>
              </Text>
              <View className="flex-row justify-center">
                <Image
                  source={weatherImages[current?.condition?.text]}
                  className="w-52 h-52"
                />
              </View>
              <View className="space-y-2">
                <Text className="text-center font-bold text-white text-6xl ml-5">
                  {current?.temp_c + "°"}
                </Text>
                <Text className="text-center font-bold text-white text-xl tracking-widest">
                  {current?.condition?.text}
                </Text>
              </View>
              <View className="flex-row justify-between mx-4">
                <View className="flex-row space-x-2 items-center">
                  <Image
                    source={require("../assets/wind.png")}
                    className="h-6 w-6"
                  />
                  <Text className="text-white font-semibold text-base">{current?.wind_kph}km</Text>
                </View>
                <View className="flex-row space-x-2 items-center">
                  <Image
                    source={require("../assets/drop.png")}
                    className="h-6 w-6"
                  />
                  <Text className="text-white font-semibold text-base">{current?.humidity}</Text>
                </View>
                <View className="flex-row space-x-2 items-center">
                  <Image
                    source={require("../assets/sun.png")}
                    className="h-6 w-6"
                  />
                  <Text className="text-white font-semibold text-base">
                    {weather?.forecast?.forecastday[0]?.astro?.sunrise}
                  </Text>
                </View>
              </View>
            </View>
            <View className="mb-2 space-y-3">
              <View className="flex-row items-center mx-5 space-x-2">
                <CalendarDaysIcon size="22" color="white" />
                <Text className="text-white text-base">Daily forecast</Text>
              </View>
              <ScrollView
                horizontal
                contentContainerStyle={{ paddingHorizontal: 15 }}
                showsHorizontalScrollIndicator={false}
              >
                {weather?.forecast?.forecastday?.map((item, index) => {
                  let date = new Date(item.date)
                  let options = { weekday: 'long' }
                  let dayName = date.toLocaleDateString('en-US', options)
                  dayName = dayName.split(',')[0]
                  return (
                    <View
                      key={index}
                      className="flex justify-center items-center w-24 rounded-3xl py-3 space-y-1 mr-4"
                      style={{ backgroundColor: "rgba(23,32,42,0.2)" }}
                    >
                      <Image
                        source={weatherImages[item?.day?.condition?.text]}
                        className="h-11 w-11"
                      />
                      <Text className="text-white">{item?.date}</Text>
                      <Text className="text-white text-xl font-semibold">{item?.day?.avgtemp_c + '°'}</Text>
                    </View>
                  )
                })}

              </ScrollView>
            </View>
          </SafeAreaView>
        )
      }

    </View>
  );
};

export default HomeScreen;
