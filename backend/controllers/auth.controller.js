export const signup = async (req, res) => {
    // 1. Destructure mobile from the request body
    const { email, password, mobile } = req.body;
    
    try {
        // 2. Validate that all required fields are present
        if (!email || !password || !mobile) {
            return res.status(400).json({ message: "All fields are required" });
        }
        if (password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters" });
        }

        // 3. Check if a user already exists with this email
        const existingEmail = await User.findOne({ email });
        if (existingEmail) {
            return res.status(400).json({ message: "Email is already registered" });
        }

        // 4. Check if a user already exists with this mobile number
        const existingMobile = await User.findOne({ mobile });
        if (existingMobile) {
            return res.status(400).json({ message: "Mobile number is already registered" });
        }

        // 5. Hash password and save new record
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            email,
            password: hashedPassword,
            mobile // <-- Saves the mobile number to the database
        });

        await newUser.save();
        generateToken(newUser._id, res);
        
        res.status(201).json({
            _id: newUser._id,
            email: newUser.email,
            mobile: newUser.mobile,
            isVerified: newUser.isVerified
        });
    } catch (error) {
        console.log("Error in signup controller:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};