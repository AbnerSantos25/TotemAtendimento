import { Pressable, DimensionValue, View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ComponentProps } from 'react';

type IoniconName = ComponentProps<typeof Ionicons>['name'];

interface ConfigButtonProps {
  title: string;
  route?: string;
  onPress?: () => void;
  color?: string;
  width?: DimensionValue;
  height?: DimensionValue;
  iconName?: IoniconName;
  value?: string;
}

export default function ConfigButton({
  title,
  route,
  onPress,
  color = "white",
  width = 50,
  height = 50,
  iconName = "settings-outline",
  value
}: ConfigButtonProps){
  
  const router = useRouter();

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else if (route) {
      router.push(route as any);
    }
  };

  return (
    <Pressable
      onPress={handlePress}
      style={{ marginRight: 15 }}
    >
      <View style={[ConfigButtonStyles.buttonContainer]}>
        <View style={{width:"10%"}}>
          <Ionicons name={iconName} size={24} color={color} />
        </View>
        
        {/* Título */}
        <View style={{flex: 1, alignItems:"flex-start"}}>
          <Text style={{color:"white", fontSize:18, paddingLeft:7}}>{title}</Text>
        </View>

        {/* Lado Direito: Valor + Ícone */}
        <View style={{flexDirection: 'row', alignItems: 'center', gap: 8}}>
          {value && (
            <Text style={{color: '#AAA', fontSize: 14}}>{value}</Text>
          )}
          <Ionicons style={{fontSize:24, color:"white"}} name="arrow-forward-circle-outline" />
        </View>
      </View>
    </Pressable>
  );
}

const ConfigButtonStyles = StyleSheet.create({
  buttonContainer: {
    flexDirection:"row", 
    padding:12,
    alignItems: 'center'
  },
});