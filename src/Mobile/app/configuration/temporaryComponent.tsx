import { Alert, Button } from "react-native";
import { BaseService } from "../../shared/services/baseService";

export default function TemporaryComponent() {

    const foo = async () => {
        var response = await BaseService.GetAsync("/totem/Queue")

        if(response.success)
            Alert.alert("Requisição bem sucedida")
        else{
            console.log(response)
            console.log("=======")
            console.log(response.error)
            Alert.alert("Erro", response.error.message);
        }
    }


    return (
        <Button title="Requisição Teste" onPress={foo} />
    )
}
