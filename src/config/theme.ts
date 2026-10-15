const brandPrimary = '#4671C6';

export const colors = {
  // 🔹 Brand / Global colors
  primary: brandPrimary,
  brandSurface: '#EDF3FF',
  primaryLight: "#4671C633",
  primarySemi: "#4671C6B2",
  success: '#34816F',
  danger: '#C94854',
  accent: "#00CE9C",
  veg: "#0AA007",
  nonVeg: "#FF4D4D",

  // 🔹 Global text colors
  textDark: '#243247',
  textMedium: "#000000B2",
  textLight: '#59697E',
  textMuted: '#64748B',
  textWhite: "#FFFFFF",

  // 🔹 Backgrounds & Borders
  background: '#F5F7FC',
  cardBackground: "#FFFFFF",
  border: '#E2E8F0',
  borderLight: "#00000040",
  borderMedium: "#00000080",
  divider: '#E2E8F0',

  // 🔹 Shared utility
  onlineGreen: '#34816F',
  totalPrice: "#333",
  toggleOff: '#CBD5E1',

  // ------- SignInScreen specific -------
  signInLogoCircle: "#EDF3FF", // ✅ new
  signInRememberText: "#1A1A1A99", // ✅ new
  rememberMeToggle:"#f4f3f4",

  // ------- OrdersScreen specific -------
  ordersCardBg: "#FFFFFF",
  ordersBorder: '#E2E8F0',
  ordersDivider: '#E2E8F0',
  ordersText: '#243247',
  ordersTextMuted: '#59697E',
  ordersVeg: "#00C48C",
  ordersNonVeg: "#FF4D4D",

  // ------- MenuScreen specific -------
  menuCardBg: "#FFFFFF",
  menuBorder: '#E2E8F0',
  menuDivider: '#E2E8F0',
  menuText: '#243247',
  menuTextMuted: '#59697E',
  menuVeg: "#00CE9C",
  menuNonVeg: "#FF4D4D",
  editBtn: brandPrimary,
  searchOutline: "#A0A0A0",
  closeButton: "#333",
  white: "#FFFFFF",
  lightBlue: "#4671C624",
  black: "#00000014",
  black2: "#0000001A",
  black3: "#000000A6",
  grey: "#959FA8",
  black4: "#000000",
  black5: "rgba(0,0,0,0.4)",
  black6: "#0000008C",

  // ------- ReportsScreen specific -------
  reportsContainerBg: '#F5F7FC',
  reportsTopTitle: '#243247',
  reportsBorder: "#0000001A",
  reportsFilterBorder: "#DDDDDD",
  reportsDateBorder: "#000000B2",
  reportsDownloadBg: "#1F2937",
  reportsDownloadText: "#FFFFFF",

  reportsCardBg: "#F2F2F2",
  reportsCardBorder: '#E2E8F0',
  reportsCardId: '#243247',
  reportsCardItems: "#00000080",
  reportsCardRatingBg: "#2E323F",
  reportsCardRatingText: "#FFFFFF",
  reportsDelivered: '#34816F',
  reportsCancelled: '#C94854',
  reportsOtherStatus: "#A1A1AA",
  reportsCardBodyBg: "#FFFFFF",
  reportsCardItem: "#000000B2",
  reportsCardTime: "#000000B2",
  reportsPriceTagBg: '#FFF7E6',
  reportsPrice: "#000000",

  // ------- EarningsScreen specific -------
  earningsHeaderBg: "#000000",
  earningsWithdrawBtnBg: '#F59E0B',
  earningsAmountPositive: '#34816F',
  earningsAmountNegative: '#C94854',
  earningsPending: '#F59E0B',
  earningsTransferred: brandPrimary,
  earningsRejected: '#C94854',
  earningsDividerWhite: "#FFFFFF",
  earningsDividerBlack: "#000000",
  earningsCardBorder: '#E2E8F0',
  earningsShadow: "#000000",
  earningsTextMuted: "#00000099",
  earningsModalOverlay: "rgba(0,0,0,0.4)",
  earningsSuccessBg: "#FFFFFF",
  earningsSuccessDivider: "#DDDDDD",

  // ------- MoreScreen specific -------
  moreBackground: '#F5F7FC',
  moreTextDark: '#243247',
  morePrimary: brandPrimary,
  moreIcon: "#000000",
  moreChevron: "#888888",
  moreShadow: "#000000",

  // ------- BillSummary specific -------
  billHeaderBg: "#EDF3FF",
  billSubText: "#00000099",
  billCoupon: brandPrimary, // blue
  billCommission: '#34816F', // green
  billTotalBg: '#FFF7E6',


   
  primaryBlue: brandPrimary,
  textSecondary: '#59697E',
  borderGray: 'lightgray',
  errorRed: '#C94854',



  brandPrimary: brandPrimary,     // Main brand / accent color (buttons, icons, highlights)
  backgroundLight: '#F5F7FC',  // Screen background
  cardBackground2: "#FFFFFF",   // Card / surface background
  textPrimary: '#243247',      // Main heading text
  textSecondary2: '#59697E',    // Supporting / body text
  shadowColor: "#000000",      // For shadow effects
  buttonTextLight: "#FFFFFF",  // Text color for buttons


black7:"#00000024",
  bgColor: '#F5F7FC',
  mainColor:brandPrimary,
  black8:"#00000033"




};















export const fonts = {
  primary: 'times-new-roman',
  secondry: 'Arial',
  title: 'DMSans-Bold',
  subTitle: 'DMSans-Regular',
  dmSans: 'DM Sans',
  textInput: "DMSans-Medium",
  textFont: "DMSans-Regular",
};

export const lightTheme = {
  primary: brandPrimary,        // Main brand color
  secondry: '#02B0E8',       // Accent color
  text: '#414042',           // Default text color







  // Additional extracted colors
  white: '#FFFFFF',
  black: '#000000',
  gray: '#CCCCCC',
  darkGray: '#525252',
  lightGray: '#E0E0E0',
  iconGray: '#3D3D3D',
  error: 'red',
  buttonOrange: '#FF9500',
};

export const darkTheme = {
  primary: brandPrimary,
  secondry: '#02B0E8',
  text: '#FFFFFF',

  // Same colors for dark mode (can be customized differently later)
  white: '#FFFFFF',
  black: '#000000',
  gray: '#CCCCCC',
  darkGray: '#525252',
  lightGray: '#E0E0E0',
  iconGray: '#3D3D3D',
  error: 'red',
  buttonOrange: '#FF9500',
};

// Theme switcher
//const isDarkMode = false; // Replace with Redux or context-based check
//export const colors = isDarkMode ? darkTheme : lightTheme;
