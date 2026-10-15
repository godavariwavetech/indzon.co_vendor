export default function validateLogin(phoneNumber, password) {
  if (!phoneNumber?.trim()) {
    return {title: 'Mobile Number Required', message: 'Please enter your mobile number.'};
  }
  if (!/^[0-9]{10}$/.test(phoneNumber.trim())) {
    return {title: 'Invalid Mobile Number', message: 'Please enter a valid 10-digit mobile number.'};
  }
  if (!password?.trim()) {
    return {title: 'Password Required', message: 'Please enter your password.'};
  }
  return null;
}
