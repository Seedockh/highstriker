import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Animated, Easing } from 'react-native';
import { Audio, Asset } from 'expo';
import Dimensions from 'Dimensions';
import { IconButton, Button } from 'react-native-paper';

  // UI SETTINGS :
  // Puck velocity range : [ 1 - 13.6 ]
  // Header height : 175
  // Tower height : 400
  // Strike button : 75

export default function App() {
  const windowHeight = Dimensions.get('window').height;
  const headerHeight = 175;
  const towerHeight = 400;
  const strikeHeight = 75;
  const puckBase = strikeHeight+20;
  const [puckPosition, setPuckPosition] = useState(new Animated.Value(puckBase));
  const [currentPosition, setCurrentPosition] = useState(0);
  const [maxPosition, setMaxPosition] = useState(0);
  const [lastPosition, setLastPosition] = useState(0);
  const [score, setScore] = useState(0);
  const [triesCount, setTriesCount] = useState(0)
  const [isStriked, setIsStriked] = useState(false);
  const [velocity, setVelocity] = useState();
  const bell = new Audio.Sound();
  const rail = new Audio.Sound();
  const strike = new Audio.Sound();


  /* Listens to the puck's position and convert it in percents */
  useEffect(() => {
    puckPosition.addListener( height => {
        setCurrentPosition(Math.round((height.value-puckBase)/(towerHeight-140)*100));
      }
    );
  }, []);

  useEffect(() => {
    if (currentPosition > maxPosition)
      setMaxPosition(currentPosition);
    if (currentPosition === 100)
      soundBell();
    if (currentPosition > 1)
      setLastPosition(maxPosition);
    if (currentPosition === 0)
      setMaxPosition(0);
  }, [currentPosition])

  useEffect(() => {
    if (lastPosition===100) {
      setScore(score+1);
    }
  }, [lastPosition])

  useEffect(()=>{
    if (isStriked) {
      //soundRail();
      setTriesCount(triesCount+1);
    }

    if (!isStriked) {
      setVelocity(Math.floor(Math.random() * 13)+1);
    }
  },[isStriked])

  soundBell = async () => {
    try {
      await bell.loadAsync(require('./assets/sounds/bell2.wav'));
      await bell.playAsync();
    } catch (err) { console.log(err) }
  }

  soundRail = async () => {
    try {
      await rail.loadAsync(require('./assets/sounds/rails.mp3'));
      await rail.playAsync();
    } catch (err) { console.log(err) }
  }

  soundStrike = async () => {
    try {
      await strike.loadAsync(require('./assets/sounds/strike.wav'));
      await strike.playAsync();
    } catch (err) { console.log(err) }
  }

  const clear = () => {
    setTriesCount(0);
    setScore(0);
    setLastPosition(0);
  }

  const hitPuck = async () => {
    try {
      await strike.loadAsync(require('./assets/sounds/strike.wav'));
      await strike.playAsync();
    } catch (err) { console.log(err) }
    setIsStriked(true);
    Animated.sequence([
      Animated.decay(
        puckPosition,
        {
          velocity: velocity,
          deceleration: 0.950,
        },
      ),
      Animated.timing(
        puckPosition,
        {
          toValue: puckBase,
          easing: Easing.ease,
          duration: 300,
          delay: 0,
        },
      ),
    ]).start(() => {
      setIsStriked(false);
    });
  }


     async function _cacheResourcesAsync() {
       const samples = [require('./sounds/bell2.wav'), require('./sounds/strike.wav'), require('./sounds/rails.mp3')];
       const cacheSamples = samples.map((samples) => {
         return Asset.fromModule(samples).downloadAsync();
       });
       return Promise.all(cacheSamples)
     }


  return (
    <View style={styles.container}>
      <View style={[styles.header, {height: headerHeight}]}>
      <Text style={styles.headerTitle}>HIGH STRIKER</Text>
      <View style={styles.headerScores}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerValueTitle}>Tries</Text>
          <Text style={styles.textRealTimeScore}>{triesCount}</Text>
        </View>
        <View style={styles.headerMiddle}>
          <Text style={styles.headerValueTitle}>Score</Text>
          <Text style={styles.textScore}>{score}</Text>
        </View>
        <View style={styles.headerRight}>
          <Text style={styles.headerValueTitle}>Last</Text>
          <Text style={styles.textLastScore}>{lastPosition}</Text>
        </View>
      </View>
    </View>
      <Button style={[styles.clearButton, {top: headerHeight}]} mode="contained" onPress={clear}>Clear</Button>
      <View style={[styles.tower, {height: towerHeight, bottom: puckBase}]}></View>
      <Animated.View style={[{bottom: puckPosition}, styles.puck]}></Animated.View>
      <View style={[styles.bell, {bottom: towerHeight+puckBase-100}]}></View>
      <View style={[styles.platform, {bottom: strikeHeight}]}></View>
      <Button style={[styles.button, {height: strikeHeight}]} mode="contained" disabled={isStriked} onPress={hitPuck}>STRIKE</Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: "#253140",
  },
  header: {
    width: '80%',
    backgroundColor: '#232323',
    borderRadius: 5,
    position: 'absolute',
    top: 40,
    flexDirection: 'column',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    marginVertical: 25,
    color: '#ffd13f',
  },
  headerLeft: {
    flexDirection: 'column',
    alignItems: 'center',
    width: '30%',
  },
  headerMiddle: {
    flexDirection: 'column',
    alignItems: 'center',
    width: '30%',
  },
  headerRight: {
    flexDirection: 'column',
    alignItems: 'center',
    width: '30%',
  },
  headerScores: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  headerValueTitle: {
    fontSize: 20,
    color: '#ffd13f',
  },
  textRealTimeScore: {
    color: '#ffe07c',
    fontSize: 18,
    fontWeight: 'bold',
  },
  textScore: {
    color: '#ffe07c',
    fontSize: 18,
    fontWeight: 'bold',
  },
  textLastScore: {
    color: '#ffe07c',
    fontSize: 18,
    fontWeight: 'bold',
  },
  tower: {
    backgroundColor: '#3b465c',
    width: 20,
    position: 'absolute',
  },
  bell: {
    width: 100,
    height: 100,
    backgroundColor: '#9ca6b3',
    borderRightWidth: 3,
    borderBottomWidth: 3,
    borderColor: '#67717e',
    position: 'absolute',
    borderRadius: 50,
  },
  puck: {
    width: 50,
    height: 50,
    backgroundColor: '#67717e',
    position: 'absolute',
    borderRadius: 20,
  },
  platform: {
    width: 150,
    height: 20,
    backgroundColor: '#3b465c',
    position: 'absolute',
  },
  button: {
    width: 150,
    color: '#9ca6b3',
    justifyContent: 'center',
    backgroundColor: '#b5423c',
    borderRadius: 15,
    position: 'absolute',
    bottom: 0,
  },
  clearButton: {
    width: 100,
    height: 40,
    justifyContent: 'center',
    backgroundColor: 'transparent',
    borderRadius: 5,
    position: 'absolute',
    left: '10%',
  },
});
