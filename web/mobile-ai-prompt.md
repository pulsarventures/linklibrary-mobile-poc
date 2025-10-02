# LinkLibrary Mobile App Design System - AI Agent Prompt

## 🎯 **Objective**
Create a React Native mobile app that perfectly matches the LinkLibrary web frontend design system. Use the provided color constants and styling guidelines to ensure visual consistency across platforms.

## 🎨 **Design System Overview**

### **Primary Brand Colors**
- **Accent Orange**: `#F25D15` - Main brand color for primary buttons and accents
- **Accent Cerulean**: `#236CE2` - Secondary brand color for links and highlights  
- **Logo Pink**: `#E25C64` - Tertiary brand color for special elements

### **Button Styling Requirements**

#### **1. Sign In Button**
```typescript
// Gradient: Blue to Orange
backgroundColor: 'linear-gradient(135deg, #236CE2 0%, #F25D15 100%)'
textColor: '#FFFFFF'
borderRadius: 12
fontWeight: '600'
fontSize: 16
paddingVertical: 12
paddingHorizontal: 24
shadow: Shadows.lg
hoverEffect: 'scale(1.02)' // Slight scale on press
```

#### **2. Sign Up Button**  
```typescript
// Gradient: Purple to Blue
backgroundColor: 'linear-gradient(135deg, #9333EA 0%, #236CE2 100%)'
textColor: '#FFFFFF'
borderRadius: 12
fontWeight: '600'
fontSize: 16
paddingVertical: 12
paddingHorizontal: 24
shadow: Shadows.lg
hoverEffect: 'scale(1.02)'
```

#### **3. Add Link Button**
```typescript
// Solid Orange (Primary)
backgroundColor: '#F25D15'
textColor: '#FFFFFF'
borderRadius: 12
fontWeight: '600'
fontSize: 16
paddingVertical: 12
paddingHorizontal: 24
shadow: Shadows.md
hoverEffect: 'scale(1.02)'
```

#### **4. Primary Buttons (General)**
```typescript
backgroundColor: '#F25D15'
textColor: '#FFFFFF'
borderRadius: 12
fontWeight: '600'
fontSize: 16
paddingVertical: 12
paddingHorizontal: 24
shadow: Shadows.md
```

#### **5. Secondary Buttons**
```typescript
backgroundColor: '#F4F4F5'
textColor: '#1A1A1A'
borderRadius: 12
fontWeight: '500'
fontSize: 16
paddingVertical: 12
paddingHorizontal: 24
borderWidth: 1
borderColor: '#E4E4E7'
```

## 🌙 **Dark Mode Support**

### **Dark Theme Colors**
- **Background**: `#0C0A0F` (Very dark blue)
- **Card**: `#0C0A0F` (Same as background)
- **Text**: `#F8FAFC` (Near white)
- **Primary**: `#FF6B35` (Brighter orange for dark)
- **Border**: `#2D3748` (Dark gray)

### **Dark Mode Button Adjustments**
```typescript
// Primary buttons in dark mode
backgroundColor: '#FF6B35'
textColor: '#1A1D29'

// Secondary buttons in dark mode  
backgroundColor: '#2D3748'
textColor: '#F8FAFC'
borderColor: '#2D3748'
```

## 📱 **Mobile-Specific Adaptations**

### **Touch Targets**
- Minimum touch target: 44x44 points
- Button padding: 12px vertical, 24px horizontal
- Icon buttons: 44x44 points minimum

### **Typography**
- Use system fonts: San Francisco (iOS) / Roboto (Android)
- Font weights: Regular (400), Medium (500), SemiBold (600), Bold (700)
- Line height: 1.5 for body text, 1.25 for headings

### **Spacing**
- Use 8px grid system
- Common spacing: 4, 8, 16, 24, 32, 48, 64px
- Card padding: 16px
- Button padding: 12px vertical, 24px horizontal

### **Border Radius**
- Small elements: 6px
- Buttons and cards: 12px
- Large containers: 16px
- Fully rounded: 9999px

## 🎨 **Visual Hierarchy**

### **Card Design**
```typescript
// Card styling
backgroundColor: '#FFFFFF' // Light mode
backgroundColor: '#0C0A0F' // Dark mode
borderRadius: 12
borderWidth: 1
borderColor: '#E4E4E7' // Light mode
borderColor: '#2D3748' // Dark mode
shadow: Shadows.sm
padding: 16
```

### **Input Fields**
```typescript
// Input styling
backgroundColor: '#FFFFFF' // Light mode
backgroundColor: '#0C0A0F' // Dark mode
borderRadius: 8
borderWidth: 1
borderColor: '#E4E4E7' // Light mode
borderColor: '#2D3748' // Dark mode
paddingVertical: 12
paddingHorizontal: 16
fontSize: 16
```

## 🚀 **Implementation Guidelines**

### **1. Use the Provided Color Constants**
```typescript
import { Colors, Typography, Spacing, BorderRadius, Shadows } from './colors';

// Example button component
const PrimaryButton = ({ title, onPress }) => (
  <TouchableOpacity
    style={[
      styles.primaryButton,
      { backgroundColor: Colors.light.primary }
    ]}
    onPress={onPress}
  >
    <Text style={styles.buttonText}>{title}</Text>
  </TouchableOpacity>
);
```

### **2. Implement Theme Switching**
```typescript
// Use React Context or state management for theme switching
const isDarkMode = useColorScheme() === 'dark';
const colors = isDarkMode ? Colors.dark : Colors.light;
```

### **3. Gradient Implementation**
```typescript
// For React Native, use LinearGradient from expo-linear-gradient
import { LinearGradient } from 'expo-linear-gradient';

const SignInButton = ({ title, onPress }) => (
  <TouchableOpacity onPress={onPress}>
    <LinearGradient
      colors={Colors.gradients.signIn}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={styles.gradientButton}
    >
      <Text style={styles.buttonText}>{title}</Text>
    </LinearGradient>
  </TouchableOpacity>
);
```

### **4. Consistent Shadows**
```typescript
// Apply shadows consistently
const cardStyle = [
  styles.card,
  Shadows.md, // Use predefined shadow
];
```

## 📋 **Key Requirements Checklist**

- [ ] Use exact brand colors: Orange `#F25D15`, Blue `#236CE2`, Pink `#E25C64`
- [ ] Implement gradient buttons for Sign In (Blue→Orange) and Sign Up (Purple→Blue)
- [ ] Use solid orange for Add Link and primary action buttons
- [ ] Support both light and dark themes
- [ ] Use 12px border radius for buttons and cards
- [ ] Apply consistent shadows and spacing
- [ ] Use system fonts with proper weights
- [ ] Ensure 44x44 minimum touch targets
- [ ] Implement proper hover/press states with scale effects
- [ ] Use 8px grid system for spacing

## 🎯 **Success Criteria**

The mobile app should look and feel identical to the web frontend with:
- Identical button colors and gradients
- Consistent typography and spacing
- Matching card designs and borders
- Proper dark mode support
- Smooth animations and interactions
- Professional, modern appearance

## 📱 **Platform Considerations**

- **iOS**: Use SF Pro font family, follow iOS Human Interface Guidelines
- **Android**: Use Roboto font family, follow Material Design principles
- **Both**: Ensure accessibility with proper contrast ratios and touch targets
- **Both**: Use platform-appropriate navigation patterns while maintaining visual consistency
