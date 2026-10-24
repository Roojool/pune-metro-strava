import React from 'react';
import { Platform, Text as NativeText, type TextProps } from 'react-native';

export const fontFamily = Platform.select({ web: 'Arial, Helvetica, sans-serif', ios: 'System', default: 'sans-serif' });

export function Text({ style, ...props }: TextProps) {
  return <NativeText {...props} style={[{ fontFamily }, style]} />;
}
