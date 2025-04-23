import User from '../models/userModel.js';

const getElo = async (req, res) => {
    const { yeetcode_username } = req.body;
    const userObject = await User.findOne({ yeetcode_username: yeetcode_username });
    // if (!userObject) return res.status(404).json({ message: 'User not found' });
    const userElo = userObject.elo;
    console.log(userObject);

    return res.status(200).json({
        yeetcode_username: yeetcode_username,
        elo: userElo
    });
}

const updateElo = async (req, res) => {
    const { yeetcode_username, newElo } = req.body;
    const userObject = await User.findOne({ yeetcode_username: yeetcode_username });
    const previousElo = userObject.elo;

    const update = { elo: newElo };
    const filter = { yeetcode_username: yeetcode_username };
    const result = await User.updateOne(filter, { $set: update });

    return res.status(200).json({
        yeetcode_username: yeetcode_username,
        previous_elo: previousElo,
        updated_elo: newElo
    });
};

export { getElo, updateElo };
