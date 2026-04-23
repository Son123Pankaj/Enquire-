/**
 * @format
 */

import { AppRegistry } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import App from './App';
import { name as appName } from './app.json';

Icon.loadFont();

AppRegistry.registerComponent(appName, () => App);
