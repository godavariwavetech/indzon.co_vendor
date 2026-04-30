export const colors = {
  // 🔹 Brand / Global colors
  primary: "#85360B",
  primaryLight: "#1A43BF33",
  primarySemi: "#1A43BFB2",
  success: "#0AA007",
  danger: "#FF4D4D",
  accent: "#00CE9C",
  veg: "#0AA007",
  nonVeg: "#FF4D4D",

  // 🔹 Global text colors
  textDark: "#000000",
  textMedium: "#000000B2",
  textLight: "#6E6E6E",
  textMuted: "#00000080",
  textWhite: "#FFFFFF",

  // 🔹 Backgrounds & Borders
  background: "#FFFFFF",
  cardBackground: "#FFFFFF",
  border: "#0000001A",
  borderLight: "#00000040",
  borderMedium: "#00000080",
  divider: "#E0E0E0",

  // 🔹 Shared utility
  onlineGreen: "#007740",
  totalPrice: "#333",
  toggleOff: "#ccc",

  // ------- SignInScreen specific -------
  signInLogoCircle: "#DCE4FA", // ✅ new
  signInRememberText: "#1A1A1A99", // ✅ new
  rememberMeToggle:"#f4f3f4",

  // ------- OrdersScreen specific -------
  ordersCardBg: "#FFFFFF",
  ordersBorder: "#0000001A",
  ordersDivider: "#E0E0E0",
  ordersText: "#000000",
  ordersTextMuted: "#6E6E6E",
  ordersVeg: "#00C48C",
  ordersNonVeg: "#FF4D4D",

  // ------- MenuScreen specific -------
  menuCardBg: "#FFFFFF",
  menuBorder: "#0000001A",
  menuDivider: "#E0E0E0",
  menuText: "#000000",
  menuTextMuted: "#6E6E6E",
  menuVeg: "#00CE9C",
  menuNonVeg: "#FF4D4D",
  editBtn: "#1E63D7",
  searchOutline: "#A0A0A0",
  closeButton: "#333",
  white: "#FFFFFF",
  lightBlue: "#1A43BF24",
  black: "#00000014",
  black2: "#0000001A",
  black3: "#000000A6",
  grey: "#959FA8",
  black4: "#000000",
  black5: "rgba(0,0,0,0.4)",
  black6: "#0000008C",

  // ------- ReportsScreen specific -------
  reportsContainerBg: "#FFFFFF",
  reportsTopTitle: "#000000",
  reportsBorder: "#0000001A",
  reportsFilterBorder: "#DDDDDD",
  reportsDateBorder: "#000000B2",
  reportsDownloadBg: "#1F2937",
  reportsDownloadText: "#FFFFFF",

  reportsCardBg: "#F2F2F2",
  reportsCardBorder: "#0000001A",
  reportsCardId: "#000000",
  reportsCardItems: "#00000080",
  reportsCardRatingBg: "#2E323F",
  reportsCardRatingText: "#FFFFFF",
  reportsDelivered: "#0E6E0C",
  reportsCancelled: "#FF5758",
  reportsOtherStatus: "#A1A1AA",
  reportsCardBodyBg: "#FFFFFF",
  reportsCardItem: "#000000B2",
  reportsCardTime: "#000000B2",
  reportsPriceTagBg: "#EFB319",
  reportsPrice: "#000000",

  // ------- EarningsScreen specific -------
  earningsHeaderBg: "#000000",
  earningsWithdrawBtnBg: "#FBBF24",
  earningsAmountPositive: "#0AA007",
  earningsAmountNegative: "#FF5758",
  earningsPending: "#FFB123",
  earningsTransferred: "#1A43BF",
  earningsRejected: "#FF5758",
  earningsDividerWhite: "#FFFFFF",
  earningsDividerBlack: "#000000",
  earningsCardBorder: "#DDDDDD",
  earningsShadow: "#000000",
  earningsTextMuted: "#00000099",
  earningsModalOverlay: "rgba(0,0,0,0.4)",
  earningsSuccessBg: "#FFFFFF",
  earningsSuccessDivider: "#DDDDDD",

  // ------- MoreScreen specific -------
  moreBackground: "#FFFFFF",
  moreTextDark: "#1B1B1B",
  morePrimary: "#1849C6",
  moreIcon: "#000000",
  moreChevron: "#888888",
  moreShadow: "#000000",

  // ------- BillSummary specific -------
  billHeaderBg: "#E6E8F6",
  billSubText: "#00000099",
  billCoupon: "#0000FF", // blue
  billCommission: "#008000", // green
  billTotalBg: "#EFB319B2",


   
  primaryBlue: '#1A43BF',
  textSecondary: '#00000099',
  borderGray: 'lightgray',
  errorRed: '#FF4D4F',



  brandPrimary: "#1A43BF",     // Main brand / accent color (buttons, icons, highlights)
  backgroundLight: "#F9F9F9",  // Screen background
  cardBackground2: "#FFFFFF",   // Card / surface background
  textPrimary: "#333333",      // Main heading text
  textSecondary2: "#555555",    // Supporting / body text
  shadowColor: "#000000",      // For shadow effects
  buttonTextLight: "#FFFFFF",  // Text color for buttons


black7:"#00000024",
  bgColor: '#FFFFFF',
  mainColor:'#1A43BF',
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
  primary: '#064081',        // Main brand color
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
  primary: '#064081',
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
