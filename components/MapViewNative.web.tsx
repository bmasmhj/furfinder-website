import { forwardRef } from 'react';
import { View } from 'react-native';

export const NativeMapView = forwardRef<any, any>((props, ref) => (
  <View ref={ref as any} {...props} />
));

export const NativeMarker = View as any;
export const NativeCallout = View as any;
