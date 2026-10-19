function demoGuard(enabled, adminEnabled = false) {
  return (req, res, next) => {
    const isAdmin = adminEnabled && req.session?.isAdmin === true;
    const canManage = adminEnabled ? isAdmin : !enabled;
    res.locals.demoMode = enabled;
    res.locals.isAdmin = isAdmin;
    res.locals.adminEnabled = adminEnabled;
    res.locals.canManage = canManage;
    if (!canManage && !['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
      return res.status(403).send('Solo el administrador puede realizar esta operación.');
    }
    if (!canManage && /^\/(create|edit)-/.test(req.path)) {
      return adminEnabled ? res.redirect('/admin/login') : res.status(403).send('Demo de solo lectura.');
    }
    next();
  };
}
module.exports = { demoGuard };
