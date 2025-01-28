
import CryptoJS from "crypto-js"
import bcrypt from "bcryptjs"
import userModel from "../../DB/Models/user.model.js"
import jwt from "jsonwebtoken"


export const addUser = async (req, res) => {
    try {
        const { name, email, password, cPassword, phone, age } = req.body;

        // Validate input
        if (!name || !email || !password || !cPassword || !phone || !age) {
            return res.status(400).json({ error: "All fields are required" });
        }

        // Check if passwords match
        if (password !== cPassword) {
            return res.status(400).json({ error: "Passwords do not match" });
        }

        // Check if user already exists
        const user = await userModel.findOne({ email });
        if (user) {
            return res.status(400).json({ error: "User already exists" });
        }

        // Hash password
        const hashedPassword = bcrypt.hashSync(password, 12);

        // Encrypt phone number
        const encryptedPhone = CryptoJS.AES.encrypt(phone, process.env.SECRET_KEY).toString();

        // Create new user
        const newUser = await userModel.create({
            name,
            email,
            password: hashedPassword,
            phone: encryptedPhone,
            age,
        });

        // Return success response
        return res.status(201).json({
            message: "User added successfully",
            data: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                age: newUser.age,
            },
        });
    } catch (error) {
        console.error("Error in addUser:", error);
        return res.status(500).json({ error: "An error occurred while adding user" });
    }
};

export const signIn = async (req, res) => {
    const { email, password } = req.body
    if (!email || !password) {
        return res.status(400).json({ error: "All fields are required" })
    }
    const user = await userModel.findOne({ email })
    if (!user) {
        return res.status(404).json({ error: "User not found" })
    }
    const isMatch = bcrypt.compareSync(password, user.password)
    if (!isMatch) {
        return res.status(400).json({ error: "Invalid Password" })
    }
    const token = jwt.sign({ id: user._id, name: user.name, email: user.email }, process.env.SECRET_KEY, { expiresIn: "1h" })
    return res.status(200).json({ message: "User logged in successfully", token: token })
}

export const updateUser = async (req, res) => {
    const userId = req.id;
    const { email, name, phone, age } = req.body;

    try {

        if (email) {
            const existingUser = await userModel.findOne({ email });
            if (existingUser && existingUser._id.toString() !== userId) {
                return res.status(400).json({ message: 'Email already exists.' });
            }
        }


        const updatedUser = await userModel.findOneAndUpdate(
            { _id: userId },
            { $set: { email, name, phone, age } },
            { new: true, omitUndefined: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found.' });
        }


        const { password, ...userInfo } = updatedUser.toObject();
        res.status(200).json({ message: 'User updated successfully.', user: userInfo });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An error occurred while updating user information.' });
    }
};



export const deleteUser = async (req, res) => {
    const userId = req.id;
    try {
        const user = await userModel.findByIdAndDelete(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        return res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "An error occurred while deleting user" });
    }
}

export const getUser = async (req, res) => {
    const userId = req.id;
    try {
        const user = await userModel.findById(userId).lean();

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        delete user.password;

        return res.status(200).json({ user: user });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "An error occurred while fetching user" });
    }
};
