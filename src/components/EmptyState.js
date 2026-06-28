import { View, Text, StyleSheet } from 'react-native';
import { COLORS, FONTS, SIZES } from '../utils/theme';
import Button from './Button';

export default function EmptyState({ icon, title, message, actionTitle, onAction }) {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>{icon || '📭'}</Text>
      <Text style={styles.title}>{title || 'Nothing here yet'}</Text>
      <Text style={styles.message}>{message || 'Add something to get started'}</Text>
      {actionTitle && onAction && (
        <View style={styles.buttonWrapper}>
          <Button title={actionTitle} onPress={onAction} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SIZES.spacing.xl,
    gap: SIZES.spacing.sm,
  },
  icon: {
    fontSize: 48,
    marginBottom: SIZES.spacing.sm,
  },
  title: {
    color: COLORS.textPrimary,
    fontSize: SIZES.lg,
    fontFamily: FONTS.bold,
    textAlign: 'center',
  },
  message: {
    color: COLORS.textSecondary,
    fontSize: SIZES.md,
    fontFamily: FONTS.regular,
    textAlign: 'center',
    lineHeight: 22,
  },
  buttonWrapper: {
    marginTop: SIZES.spacing.md,
    width: '100%',
  },
});