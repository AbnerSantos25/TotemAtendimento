import "../../global.css";
import React, {useState} from "react";
import { TouchableHighlight, StyleSheet, View, Text } from "react-native";
import { Ionicons } from '@expo/vector-icons';

export default function AGButton({title, subtitle, route, icon, size}: {title: string; subtitle: string; route: string; icon: string; size: number}) {
 
    return(
        <TouchableHighlight style={buttonStyles.buttonContainer}>
            <View style={buttonStyles.viewBase} className="bg-red-100">
                <View className="bg-red-500"><Ionicons name="home" size={size} color="black" /></View>
                <View className="bg-red-500">
                    <Text className="text-white">{title}</Text>
                    <Text>{subtitle}</Text>
                </View>
                {/* <View className="bg-red-500"></View> */}
                <View className="bg-red-500"><Text>-</Text></View>
            </View>
        </TouchableHighlight>
    );
}

const buttonStyles = StyleSheet.create({
  buttonContainer: {
    borderRadius: 20,
    margin: 15,
  },
 viewBase: {
    width: "100%", 
    height: 40,
    flexDirection: "row",
  }
});
