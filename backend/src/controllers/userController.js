const getProfile = async (req, res) => {
    res.status(200).json({
        message: "Profile fetched successfully",
        user: req.user
    });
};

export { getProfile };
