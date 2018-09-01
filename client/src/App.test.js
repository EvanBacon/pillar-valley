import 'react-native';
import React from 'react';
import renderer from 'react-test-renderer';
import App from './App';

it('renders correctly', async () => {
  expect.assertions(1);
  const tree = renderer.create(<App />).toJSON();
  expect(tree).toMatchSnapshot();
});
