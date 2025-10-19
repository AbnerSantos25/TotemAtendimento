// src/shared/components/ConfigButton.tsx
import { Pressable, DimensionValue, View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ComponentProps } from 'react';

type IoniconName = ComponentProps<typeof Ionicons>['name'];

interface ConfigButtonProps {
  title: string;
  route: string;
  color?: string;
  width?: DimensionValue;
  height?: DimensionValue;
  iconName?: IoniconName;
}
export default function ConfigButton({
  title,
  route,
  color = "white",
  width = 50,
  height = 50,
  iconName = "settings-outline",
}: ConfigButtonProps){
  
  const router = useRouter();

  return (
    <Pressable
      onPress={() => {
        router.push("" + route);
      }}
      style={{ marginRight: 15 }} // Estilo para dar um espaçamento
    >
      <View style={[ConfigButtonStyles.buttonContainer]}>
        <View style={{width:"10%"}}>
          <Ionicons name={iconName} size={24} color={color} />
        </View>
        <View style={{width:"80%", alignItems:"flex-start"}}>
          <Text style={{color:"white", fontSize:18, paddingLeft:7}}>{title}</Text>
        </View>
        <View style={{width:"10%", alignItems:"flex-end"}}>
          <Ionicons style={{fontSize:24, color:"white"}} name="arrow-forward-circle-outline"></Ionicons>
        </View>
      </View>
    </Pressable>
  );
}

const ConfigButtonStyles = StyleSheet.create({
  buttonContainer: {
    flexDirection:"row", 
    // justifyContent:"space-between", 
    padding:12
    // backgroundColor: '#ddd',
  },
});