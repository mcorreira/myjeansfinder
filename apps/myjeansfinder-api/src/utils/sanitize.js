module.exports = {
  sanitizeUser: (user) => {
    if (!user) return null;
    const { password, salt, ...safeUser } = user.toObject
      ? user.toObject()
      : user;
    return safeUser;
  },
};
