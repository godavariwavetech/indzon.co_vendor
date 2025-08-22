import React from 'react';
import {View, Text, StyleSheet} from 'react-native';

const Support = () => (
  <View style={styles.container}>
    <Text style={styles.text}>Currently Not Available</Text>
  </View>
);

export default Support;

const styles = StyleSheet.create({
  container: {flex: 1, justifyContent: 'center', alignItems: 'center'},
  text: {fontSize: 18, fontWeight: 'bold'},
});
