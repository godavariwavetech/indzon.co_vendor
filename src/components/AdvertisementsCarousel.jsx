import React, {useState} from 'react';
import Carousel from 'react-native-reanimated-carousel';
import {View, Image, Dimensions, StyleSheet} from 'react-native';
import {bannerimage1} from '../assets/index';


const {width} = Dimensions.get('window');

const banners = [
  {id: 1, image: bannerimage1},
  {id: 2, image: bannerimage1},
  {id: 3, image: bannerimage1},
];


export default function CarouselComponent({navigation}) {
  const [currentIndex, setCurrentIndex] = useState(0);

  return (
    <View style={styles.container}>
      <Carousel
        loop
        width={width}
        height={125}
        autoPlay={true}
        autoPlayInterval={3000}
        data={banners}
        scrollAnimationDuration={1000}
        onSnapToItem={index => setCurrentIndex(index)}
        renderItem={({item}) => (
          <View style={styles.card}>
            <Image
              source={item.image}
              style={styles.image}
              resizeMode="cover"
            />
          </View>
        )}
      />

      {/* Pagination Dots */}
      <View style={styles.paginationContainer}>
        {banners.map((_, index) => (
          <View
            key={index}
            style={[styles.dot, currentIndex === index && styles.activeDot]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    marginTop: 8,
  },
  card: {
    borderRadius: 8,
    overflow: 'hidden',
    marginHorizontal: 15,
    backgroundColor: '#eee',
  },
  image: {
    width: '100%',
    height: 125,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 50,
    marginHorizontal: 4,
    backgroundColor: '#ccc',
  },
  activeDot: {
    backgroundColor: '#757575',
    width: 8,
    height: 8,
    borderRadius: 50,
  },
});