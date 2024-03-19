import React, { useState, useEffect } from 'react';
import { AppState,TextInput, Text, View, StyleSheet, ScrollView, Pressable, BackHandler, Dimensions,  TouchableOpacity} from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { Icon } from 'react-native-elements';
import { Audio } from 'expo-av';
import { PASS_1, PASS_2, PASS_3, URL_1, URL_2, URL_3, TOKEN_1, TOKEN_2, TOKEN_3 } from '@env';

const wHeight = Dimensions.get('window').height;
var accessLogin = false;
var urlData = '';
var token = '';


function PageScanner() {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [nameProduct, setProductName] = useState('');
  const [amountProduct, setProductAmount] = useState('');
  const [sale, setProductSale] = useState('');
  const [discount, setProductDiscount] = useState('');
  const [details, setProductDetails] = useState('');
  const [lastProduct, setLastProduct] = useState('');
  const [currentProduct, setCurrentProduct] = useState('');
  const [time, setTimeScanned] = useState(new Date());
  const [canScan, setScannerEnabled] = useState(true); //tiempo entre scanners
  const [type, setTypeCamera] = useState(BarCodeScanner.Constants.Type.back);
  const [sound, setSound] = React.useState();
  const [isActive, setIsActive] = useState(true);

  async function reloadCamera() {
    const { status } = await BarCodeScanner.requestPermissionsAsync();
    setHasPermission(status === 'granted');
    setIsActive(false);
    setIsActive(true);
  }

  async function playSound() {
    const { sound } = await Audio.Sound.createAsync(
      require('./assets/beep.mpeg')
   );
    setSound(sound);
    await sound.playAsync();
  }

  const getProducts = async (barcode) => {
    setProductName('BUSCANDO '+barcode+'...');
    setProductAmount('');
    setProductSale('');
    setProductDiscount('');
    setProductDetails('');
    try {
      const response = await fetch(urlData+'rest.php?token=3EeBg0D6h592AgFCkF8E1sE915&codebar='+barcode);
      const json = await response.json();
      if( json.codigo != barcode ){
        if (json.error){
          setProductName(json.error);
          setProductAmount('');
          setProductSale('');
          setProductDiscount('');
          setProductDetails('');
        }else{
          let text = json.codigo +': '+ json.nombre ;
          let price = json.moneda +' '+ json.importe;
          let sale = '';
          let discount = '';
          let details = '';
          if( json.venta != '')
            sale += json.venta;
          if( json.descuento != '')
            discount += json.descuento;
          if( json.bonifica != '')
            details += json.bonifica;

          setProductName(text);
          setProductAmount(price);
          setProductSale(sale);
          setProductDiscount(discount);
          setProductDetails(details);
        }
      }else{
        setProductName('Producto '+barcode+' no encontrado');
      }
    } catch (error) {
      setProductName('Error: Producto '+barcode+' no encontrado');
    }
  }
  useEffect(() => {
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);
  const handleBarCodeScanned = async ({ type, data }) => {
    if (AppState.currentState == 'active'){
      timeToGetProductData();
      if ( canScan ){
        setTimeScanned(new Date());
        if ( lastProduct == '' && currentProduct == '' ){
          playSound();
          getProducts(data);
          setCurrentProduct(data);
        }
        if ( currentProduct != data ){
          playSound();
          getProducts(data);
          setLastProduct(currentProduct);
          setCurrentProduct(data);
        }
      }
    }
  };

  const timeToGetProductData = async () => {
    console.log('calculando fechas');
    var d1 = new Date();//momento a habilitar
    var d2 = new Date(); // ahora

    d1.setHours(time.getHours(),time.getMinutes(),time.getSeconds()+1,0);
    var more = d2.getTime() > d1.getTime();
    if ( more ){
      setScanned(true);
      setTimeScanned(d2);
      setScannerEnabled(true);
    }else{
      setScanned(false); setScannerEnabled(false);
    }
  };

  //se obtuvo permiso de usar la cámara
  if (hasPermission === null) {
    return <Text>No hay permiso para acceder a la cámara</Text>;
  }
  if (hasPermission === false) {
    return <Text>No hay permiso para acceder a la cámara</Text>;
  }

  if( accessLogin === true ){
    return (
      <View style={styles.container}>
      {isActive && (
        <BarCodeScanner onBarCodeScanned={handleBarCodeScanned}
          type={type}
          style={[StyleSheet.absoluteFill,styles.scanner]}>
          <View
            style={{
              flex: 1,
              backgroundColor: 'transparent',
              flexDirection: 'row',
            }}>
          </View>
        </BarCodeScanner>
        )}
        <ScrollView style={[styles.info]} >
          <View style={{ padding:25, fontSize:25, backgroundColor:'white'}}>
            <Text style={{ fontSize: 30, fontWeight: "bold"}}>{nameProduct}</Text>
            <Text style={{ fontSize: 40, fontWeight: "bold", color: 'red'}}>{amountProduct}</Text>
            <Text style={{ fontSize: 30}}>{sale}</Text>
            <Text style={{ fontSize: 30}}>{discount}</Text>
            <Text style={{ fontSize: 30}}>{details}</Text>
          </View>
        </ScrollView>
        <View  style={[styles.menu]}>
          <Pressable
          style={styles.btn}
          onPress={() => {
            accessLogin = false;
            setIsActive(false);
            BackHandler.exitApp();
          }}>
          <Icon
          name='log-out'
          type='feather'
          color='white'
          />
          </Pressable>
          <TouchableOpacity
          style={styles.btnscan}
          onPress={() => {
            reloadCamera();
          }}>
          <Icon
          name='search'
          type='feather'
          color='white'
          />
          </TouchableOpacity>
        </View>
      </View>
    );
  }else{
    return <Login></Login>
  }
}

function Login() {
  const [key, setClave] = useState(null);
  const [loginMessage, setLoginMessage] = useState('');

  async function changeInputKeyAccess ( key ){
    setLoginMessage('');
    setClave(key);
  }

  async function loginRest( key ) {
    try {
      console.log(urlData);
      if( key == PASS_1 ){
        urlData = URL_1;
        token = TOKEN_1;
      }
      else if( key == PASS_2 ){
        token = TOKEN_2;
        urlData = URL_2;
      }
      else if( key == PASS_3 ){
        token = TOKEN_3;
        urlData = URL_3;
      }
      if (urlData !== '' ){
        console.log(urlData);
        const response = await fetch(urlData+'loginrest.php?token=3EeBg0D6h592AgFCkF8E1sE915&password='+key);
        const json = await response.json();
        console.log('respuesta en json');
        console.log(json);
        if( json.resultado ){
          console.log('login ok');
          accessLogin = true;
          setClave(null);
        }
        else if( json.error ){
          urlData = '';
          setLoginMessage('Error: Clave incorrecta');
        }
        else{
          console.log(json);
          urlData = '';
          setLoginMessage('Error: Consulte con el administrador.');
        }

      }else{
        console.log('no hay url');
        setLoginMessage('Error: Clave incorrecta');
      }
    } catch (error) {
      urlData = '';
      console.error(error);
      console.log('Catch: LOGIN '+key+'  '+error);
      setLoginMessage('Error: Consulte con el administrador.');
    }
  }

  if (accessLogin == true) {
    console.log(accessLogin);
    console.log('retornando el escaner');
    return <PageScanner></PageScanner>;
  }else{
    console.log(accessLogin);
    console.log('retornando el login');
    return (
      <View style={styles.loginPage}>
        <Text style={[styles.errorMessage]}>{loginMessage}</Text>
        <Text style={{ fontSize: 30, fontWeight: "bold", marginTop:'30%'}}>Iniciar Sesión</Text>
        <TextInput
          secureTextEntry={true}
          multiline={false}
          keyboardType='default'
          placeholder='Clave'
          onChangeText={text => changeInputKeyAccess( text )}
          value={key}
          style={{ fontSize: 30, borderColor:'#2080ff', borderWidth:1, width:'70%', alignSelf: 'center'}}
        />
        <TouchableOpacity
          style={{margin:'5%',width:'70%', padding:5, backgroundColor:'#2080ff', borderRadius:3}}
          onPress={() => {
            loginRest(key);
          }}>
          <Text style={{fontSize:25, color:'white', alignSelf: 'center'}}>Confirmar</Text>
        </TouchableOpacity>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container:{
    marginTop: 0,
    height:'100%',
    top: 0,
    left: 0,
  },
  scanner: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 0,
    height:'30%',
    top: 0,
    left: 0,
  },
  info:{
    flexDirection: 'column',
    top: '30%',
    left: 0,
    padding:15,
    height:wHeight-200,
  },
  Text:{
    margin:25,
    padding:25,
  },
  btnscan:{
    width:'70%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor:'#339944c9',
  },
  text: {
    fontSize: 16,
    lineHeight: 21,
    fontWeight: 'bold',
    letterSpacing: 0.25,
    color: 'black',
  },
  btn:{
    width:'30%',
    height:50,
    justifyContent: 'center',
    backgroundColor:'#ff1111c9',
  },
  btnRotate:{
    width:'30%',
    height:50,
    justifyContent: 'center',
    backgroundColor: 'red',
    position:'relative',
    marginTop: 15,
    right:0
  },
  menu:{
    width:'100%',
    position: 'absolute',
    bottom: 0,
    left: 0,
    flexDirection: 'row',
    backgroundColor:'white',
    justifyContent: 'space-between'
  },
  loginPage:{
    flexDirection: 'column',
    alignItems: 'center',
    position: 'absolute',
    top:0,
    width:'100%',
  },
  Button:{
    width:'100%'
  },
  errorMessage:{
    position: 'absolute',
    top:'10%',
    fontSize:25,
    width:'100%',
    color:'#ff1111e0',
    textAlign:'center',
  },
});


export default function App() {
  return (
    <View>
      <Login></Login>
    </View>
  );
}