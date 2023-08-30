
exports.getLogout = (req, res, next) => {
    res.clearCookie('jwt');
    return res.redirect('/');
}