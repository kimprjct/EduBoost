import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, spacing, typography, shadows, borderRadius } from '../app/theme';
import type { MotivationalQuote } from '../app/types';

interface WelcomeModalProps {
  visible: boolean;
  quote: MotivationalQuote | null;
  onClose: () => void;
}

export default function WelcomeModal({ visible, quote, onClose }: WelcomeModalProps) {
  if (!quote) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <TouchableOpacity 
        style={styles.overlay as ViewStyle}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={styles.modalContainer as ViewStyle}>
          <TouchableOpacity 
            style={styles.closeButton as ViewStyle}
            onPress={onClose}
          >
            <MaterialIcons name="close" size={24} color={colors.text.secondary} />
          </TouchableOpacity>

          <View style={styles.quoteIcon as ViewStyle}>
            <MaterialIcons name="format-quote" size={24} color={colors.primary} />
          </View>
          
          <Text style={styles.quoteText as TextStyle}>
            {quote.quote}
          </Text>
          
          <Text style={styles.authorText as TextStyle}>
            - {quote.author}
            <Text style={styles.categoryText as TextStyle}>
              {'\n'}{quote.category}
            </Text>
          </Text>

          <TouchableOpacity style={styles.button as ViewStyle} onPress={onClose}>
            <Text style={styles.buttonText as TextStyle}>Continue</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

interface Styles {
  overlay: ViewStyle;
  modalContainer: ViewStyle;
  closeButton: ViewStyle;
  quoteIcon: ViewStyle;
  quoteText: TextStyle;
  authorText: TextStyle;
  categoryText: TextStyle;
  button: ViewStyle;
  buttonText: TextStyle;
}

const styles = StyleSheet.create<Styles>({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.md,
  },
  modalContainer: {
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    width: '90%',
    maxWidth: 400,
    alignItems: 'center',
    ...shadows.large,
  },
  closeButton: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    padding: spacing.sm,
    zIndex: 1,
  },
  quoteIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.round,
    backgroundColor: colors.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  quoteText: {
    fontSize: typography.sizes.lg,
    color: colors.text.primary,
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: spacing.md,
    lineHeight: typography.sizes.lg * 1.5,
  },
  authorText: {
    fontSize: typography.sizes.md,
    color: colors.text.secondary,
    textAlign: 'right',
    alignSelf: 'stretch',
    marginBottom: spacing.xl,
  },
  categoryText: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    opacity: 0.7,
    fontStyle: 'italic',
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.round,
    ...shadows.small,
  },
  buttonText: {
    color: colors.text.inverse,
    fontSize: typography.sizes.md,
    fontWeight: '500',
  },
}); 