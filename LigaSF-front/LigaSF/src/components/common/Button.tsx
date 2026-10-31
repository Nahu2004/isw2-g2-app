import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  Platform,
} from 'react-native';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'success';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  style,
}) => {
  const isDanger = variant === 'danger';
  const isSecondary = variant === 'secondary';
  const isOutline = variant === 'outline';
  const isSuccess = variant === 'success';

  const containerStyle = [
    styles.button,
    isSecondary && styles.secondary,
    isDanger && styles.danger,
    isSuccess && styles.success,
    isOutline && styles.outline,
    (disabled || loading) && styles.disabled,
    style,
  ];

  const textStyle: TextStyle[] = [
    styles.text,
    isOutline && styles.outlineText,
    isSecondary && styles.secondaryText,
  ];

  return (
    <TouchableOpacity
      style={containerStyle}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.82}
    >
      {loading ? (
        <ActivityIndicator color={isOutline ? '#0284c7' : '#ffffff'} size="small" />
      ) : (
        <Text style={textStyle}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#0284c7',
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 10,
    minHeight: 44, // Hit Target cómodo (Make Interfaces Feel Better)
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
    ...Platform.select({
      web: {
        cursor: 'pointer',
        transition: 'transform 0.16s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.16s cubic-bezier(0.16, 1, 0.3, 1), background-color 0.16s ease',
        boxShadow: '0 1px 2px 0 rgba(2, 132, 199, 0.25)',
      } as any,
      default: {
        shadowColor: '#0284c7',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.15,
        shadowRadius: 3,
        elevation: 2,
      },
    }),
  },
  secondary: {
    backgroundColor: '#f1f5f9',
    borderColor: '#e2e8f0',
    ...Platform.select({
      web: {
        boxShadow: '0 1px 2px 0 rgba(15, 23, 42, 0.04)',
      } as any,
    }),
  },
  danger: {
    backgroundColor: '#dc2626',
    ...Platform.select({
      web: {
        boxShadow: '0 1px 2px 0 rgba(220, 38, 38, 0.25)',
      } as any,
    }),
  },
  success: {
    backgroundColor: '#16a34a',
    ...Platform.select({
      web: {
        boxShadow: '0 1px 2px 0 rgba(22, 163, 74, 0.25)',
      } as any,
    }),
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: '#0284c7',
    ...Platform.select({
      web: {
        boxShadow: 'none',
      } as any,
    }),
  },
  disabled: {
    opacity: 0.5,
    ...Platform.select({
      web: {
        cursor: 'not-allowed',
        boxShadow: 'none',
      } as any,
    }),
  },
  text: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  outlineText: {
    color: '#0284c7',
  },
  secondaryText: {
    color: '#334155',
  },
});

export default Button;
