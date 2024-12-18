export function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = array[i];
      array[i] = array[j];
      array[j] = temp;
    }
    return array;
}

export const generateArrayOfNumbers = (length = 100) => {
  const arr = [];  
  for (let i = 0; i < length; i++) {
    arr[i] = i;
  }

  return arr;
}
