import React, {useEffect, useState} from 'react';
import { View, TouchableOpacity, Text, Image, Alert } from 'react-native';
import { Feather as Icon } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import  MapView, {Marker}  from 'react-native-maps';
import { SvgUri } from 'react-native-svg';
import * as Location from 'expo-location'

import styles from './styles';
import { ScrollView } from 'react-native-gesture-handler';

import api from './../../services/api';

interface Item {
     id: number,
     name: string,
     image_url: string,
}

interface Point {
     id: number,
     name: string,
     image: string,
     latitude: number,
     longitude: number,
}

const Points = () => {

     // PUXANDO A NAVEGAÇÃO DO APP
     const navigation = useNavigation();

     // STATES
     const [items, setItems] = useState<Item[]>([]);
     const [points, setPoints] = useState<Point[]>([]);
     const [selectedItems, setSelectedItems] = useState<number[]>([]);
     const [initialPosition, setInitialPosition] = useState<[number, number]>([0,0]);

     // VOLTAR PARA A HOME
     function handleNavigateBack(){
          navigation.goBack();
          console.log(`Voltando para a Home`);
     }

     // IR PARA DETALHES DO PONTO DE COLETA
     function handleNavigateToDetail(id: number){
          navigation.navigate("Detail", {point_id: id});
          console.log(`Indo para detalhes`);
     }

     // PEGAR OS ITEMS SELECIONADOS E ADD AO STATE
     function handleSelectItem(id: number){
          const alreadySelected = selectedItems.findIndex(item => item === id);
          if(alreadySelected >= 0){
               const filteredItems = selectedItems.filter(item => item !== id);
               setSelectedItems(filteredItems);
          } else {
               console.log(`Items selecionados: ${selectedItems}`);
               setSelectedItems([...selectedItems, id]);
               console.log(selectedItems);
          }
     }

     // LISTA OS INTEMS TENDO DE UM ARRAY
     useEffect(() => {
          api.get("items").then(response => {
               setItems(response.data)
               console.log(`Os items: ${response.data}`);
          })
          console.log('Rodou' + items);
     }, [])

     // PEGA A LOCALIZAÇÃO DO USUÁRIO
     useEffect(() => {
          async function loadPosition(){
               const { status } = await Location.requestPermissionsAsync()
               if(status !== 'granted'){
                    Alert.alert('Opsss...', 'Precisamos de sua permissão para obter a localização');
                    return;
               }
               const location = await Location.getCurrentPositionAsync();
               const { latitude, longitude } = location.coords;
               // console.log(`Coordenadas: latidude=${latitude} longitude=${longitude}`);
               setInitialPosition([latitude, longitude]);
          }
          loadPosition();
     })

     useEffect(() => {
          api.get("points", {
               params: {
                    city: "São Paulo",
                    uf: "SP",
                    items: selectedItems
               }
          }).then(response => {
               console.log("Pontos listados: " + response.data);
               setPoints(response.data);
          })
     }, [selectedItems])

     return(
          <>
               <View style={styles.container}>
                    <TouchableOpacity onPress={handleNavigateBack}>
                         <Icon name="arrow-left" color="#34cb79" size={20}/>
                    </TouchableOpacity>
                    <Text style={styles.title}>Bem vindo.</Text>
                    <Text style={styles.description}>Encontre no mapa um ponto de coleta.</Text>
                    <View style={styles.mapContainer}>
                         {initialPosition[0] != 0 && (
                              <MapView 
                                   style={styles.map}
                                   initialRegion={{
                                        latitude:initialPosition[0],
                                        longitude:initialPosition[1],
                                        latitudeDelta:0.014,
                                        longitudeDelta:0.014,
                                   }}
                              >
                                   {
                                        points.map(point => {
                                             return(
                                                  <Marker
                                                       key={point.id}
                                                       style={styles.mapMarker}
                                                       coordinate={{
                                                            latitude: point.latitude,
                                                            longitude: point.longitude,
                                                       }}
                                                       onPress={() => handleNavigateToDetail(point.id)}
                                                  >
                                                       <View style={styles.mapMarkerContainer}>
                                                            <Image
                                                                 style={styles.mapMarkerImage} 
                                                                 source={{
                                                                      uri: point.image
                                                                 }}
                                                            />
                                                            <Text style={styles.mapMarkerTitle}>
                                                                 {point.name}
                                                            </Text>
                                                       </View>
                                                  </Marker>
                                             )
                                        })
                                   }
                              </MapView>
                         )}
                    </View>
               </View>
               <View style={styles.itemsContainer}>
                    <ScrollView 
                         horizontal 
                         showsHorizontalScrollIndicator={false}
                         contentContainerStyle={{
                              paddingHorizontal: 20,
                         }}                    
                    >
                         {
                              items.map(item => {
                                   return(
                                        <TouchableOpacity
                                             key={String(item.id)}
                                             style={[
                                                  styles.item,
                                                  selectedItems.includes(item.id) ? styles.selectedItem : {}
                                             ]}
                                             onPress={() => handleSelectItem(item.id)}
                                             activeOpacity={0.6}
                                        >
                                             <SvgUri width={42} height={42} uri={item.image_url}/>
                                             <Text style={styles.itemTitle}>{item.name}</Text>
                                        </TouchableOpacity>
                                   )
                              })
                         }
                    </ScrollView>
               </View>
          </>
     );
}

export default Points;