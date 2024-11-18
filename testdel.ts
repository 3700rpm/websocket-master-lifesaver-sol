function countTrailingZeros(num: number) {
  let strNum = num.toString(); // Convert the number to a string
  let count = 0; // Initialize counter for trailing zeros

  // Start counting from the end of the string
  for (let i = strNum.length - 1; i >= 0; i--) {
      if (strNum[i] === '0') {
          count++; // Increment count if current character is '0'
      } else {
          break; // Stop counting when a non-zero character is encountered
      }
  }

  // Return count only if it's more than 1, otherwise return 0
  return count > 2 ? count : 0;
}

// Test cases
console.log(countTrailingZeros(1000) > 0); // 5