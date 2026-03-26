export const userOnly = (req, res, next) => {
  if (!req.user?.id) {
    return res.status(401).json({ error: "Unauthenticated" });
  }

  if (
    !req.params.id ||
    Number(req.params.id) !== Number(req.user.id)
  ) {
    return res.status(403).json({ error: "Access denied" });
  }

  next();
};
