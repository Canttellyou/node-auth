const adminMiddleware = (req, res, next) => {
    try {
        const role = req.userInfo.role;
        console.log(role);

        if (role !== "admin") {
            return res.status(401).json({
                success: false,
                message: "Access Denied. Only admins allowed access"
            })
        }
        next()
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "An error occurred! Unable to verify access"
        })
    }
}

module.exports = adminMiddleware;