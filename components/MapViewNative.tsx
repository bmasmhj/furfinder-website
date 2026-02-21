import { forwardRef } from 'react';
import RNMapView, { Marker as RNMarker, Callout as RNCallout } from 'react-native-maps';

export const NativeMapView = forwardRef<RNMapView, any>((props, ref) => (
  <RNMapView ref={ref} {...props} />
));

export const NativeMarker = RNMarker;
export const NativeCallout = RNCallout;
