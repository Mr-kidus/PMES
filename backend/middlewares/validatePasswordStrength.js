export const validatePasswordStrength = (req, res, next) => {
  const { password } = req.body;
  const strongRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

  if (!strongRegex.test(password)) {
    return res.status(400).json({
      error: "Password must be at least 8 characters long and include uppercase, lowercase, and a number.",
    });
  }

  next();
};
