function demoGuard(enabled) {
  return (req, res, next) => {
    res.locals.demoMode = enabled;
    if (enabled && !['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
      return res.status(403).send('Demo de solo lectura: los cambios y las cargas de archivos están desactivados.');
    }
    next();
  };
}
module.exports = { demoGuard };
