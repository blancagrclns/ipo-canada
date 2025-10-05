// Funciones auxiliares

export function recuperaElementoAleatorio(array) {
  // Numero de elementos en el array
  const size = array.length;

  // Numero real aleatorio entre 0 y size
  const indiceRealAleatorio = Math.random() * size;

  // Redondeo del número real obtenido al entero más próximo
  // para que se corresponda con una posición (indice) correcta.
  const indiceAleatorio = Math.floor(indiceRealAleatorio);

  // Devuelve el elemento del array ubicado en el indice aleatorio
  return array[indiceAleatorio];
}
