import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Button,TouchableOpacity } from "react-native";
import { collection, db, onSnapshot, orderBy } from "../config/fireBase";
import { query } from "firebase/firestore";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import { saveDriverLocation } from "../config/fireBase";

const Dashboard = () => {
  const [currentRide, setCurrentRide] = useState("");
  const [location, setLocation] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");

  // GETING USER LOCATION
  useEffect(() => {
    listenToRide();
  }, []);

  const listenToRide = () => {
    setCurrentRide("");
    const q = query(collection(db, "rides"), orderBy("timestamp"));
    const unsubscribe = onSnapshot(q, (querysnapshot) => {
      const rides = [];
      querysnapshot.forEach((doc) => {
        rides.push(doc.data());
      });
      setCurrentRide(rides[rides.length - 1]);
      alert("New Request");
    });
    return unsubscribe;
  };
  if (!currentRide) {
    return (
      <Text
        style={{
          textAlign: "center",
          marginTop: 50,
          fontSize: 18,
          fontWeight: "bold",
        }}
      >
        No requset yet...
      </Text>
    );
  }

  // USER lat-long destructing
  const pickUp_latitude = currentRide.pickUpLat;
  const pickUp_longitude = currentRide.pickUpLong;
  const destenation_latitude = currentRide.destinationLat;
  const destenation_longitude = currentRide.destinationLong;
  //
  // GETING DRIVER LOCATION
  const driverLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      setErrorMsg("Permission to access location was denied");
      return;
    }

    Location.watchPositionAsync(
      {
        accuracy: 6,
        timeInterval: 1000,
        distanceInterval: 1,
      },
      (location) => {
        // console.log(location, "<==location");
        setLocation(location);
        setLatitude(location.coords.latitude);
        setLongitude(location.coords.longitude);
      }
    );
    await saveDriverLocation({
      latitude,
      longitude,
      status: "compeleted",
      timestamp: Date.now(),
    });
    alert("YOU CONFIRM YOUR RIDE");
  };

  //  Functions

  const reject = () => {
    setCurrentRide("");
  };

  return (
    <>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerText}>Dashboard</Text>
        </View>
        <View style={styles.pickUp}>
          <MapView
            initialRegion={{
              latitude: pickUp_latitude,
              longitude: pickUp_longitude,
              latitudeDelta: 0.07,
              longitudeDelta: 0.06,
            }}
            style={styles.pickUp_map}
          >
            <Marker
              coordinate={{
                latitude: pickUp_latitude,
                longitude: pickUp_longitude,
              }}
              title="Pick Up Location"
              description="Here I am"
            />

            <Marker
              coordinate={{
                latitude: destenation_latitude,
                longitude: destenation_longitude,
              }}
              title="Destenation Location"
              description="Here I am"
            />
          </MapView>
          <View style={styles.btnContainer}>
          <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.button}
            onPress={driverLocation}
            >
            <Text style={styles.buttonText}>TAKE RIDE </Text>
          </TouchableOpacity>
        </View>
           
          </View>
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // gap: 30,
    backgroundColor: "#fff",
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  headerText: {
    fontSize: 24,
    fontWeight: "bold",
  },
  pickUp: {
    width: "100%",
    height: "80%",
  },
  pickUp_map: {
    width: "100%",
    height: "100%",
  },
  buttonContainer: {
    width:"auto",
    borderRadius: 25,
    overflow: "hidden",
    marginBottom:20,
  },
  button: {
    backgroundColor: "darkgreen",
    paddingVertical: 15,
    alignItems: "center",
    borderRadius: 25,
  },
  buttonText: {
    color: "#fff",
    fontSize: 19,
  },
  
});
export default Dashboard;
