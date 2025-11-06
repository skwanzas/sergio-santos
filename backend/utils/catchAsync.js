// Wrapper para funções async. Executa a função e captura
// qualquer erro, passando-o para o 'next()' (handler global).
module.exports = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};
