import { useTheme } from '@/theme';

export const getToastConfig = () => {
  const { colors } = useTheme();
  
  return {
    success: (internalState: any) => ({
      backgroundColor: '#10B981', // Green-500
      borderLeftColor: '#059669', // Green-600
      borderLeftWidth: 4,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 5,
    }),
    
    error: (internalState: any) => ({
      backgroundColor: '#EF4444', // Red-500
      borderLeftColor: '#DC2626', // Red-600
      borderLeftWidth: 4,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 5,
    }),
    
    info: (internalState: any) => ({
      backgroundColor: '#3B82F6', // Blue-500
      borderLeftColor: '#2563EB', // Blue-600
      borderLeftWidth: 4,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 5,
    }),
    
    warning: (internalState: any) => ({
      backgroundColor: '#F59E0B', // Amber-500
      borderLeftColor: '#D97706', // Amber-600
      borderLeftWidth: 4,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 5,
    }),
  };
};

export const getText1Style = () => ({
  color: '#FFFFFF',
  fontSize: 16,
  fontWeight: '600',
  marginBottom: 4,
});

export const getText2Style = () => ({
  color: '#FFFFFF',
  fontSize: 14,
  fontWeight: '400',
  opacity: 0.9,
});
