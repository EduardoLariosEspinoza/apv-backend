const generarId = () => {
  // substring(2) para eliminar los primeros 2 caracteres
  return Date.now().toString(32) + Math.random().toString(32).substring(2);
};

export default generarId;
