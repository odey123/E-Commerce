const handleAuthErrors = (err, req, res, next) => {
    if (err.name === 'UnauthorizedError') {
        return res.status(401).json({ message: 'User is not authorized' });
    }
    next(err);
};

module.exports = { handleAuthErrors };
