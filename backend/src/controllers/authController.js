const crypto = require('crypto');
const User = require('../models/User');
const Organization = require('../models/Organization');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'secret', {
    expiresIn: '30d',
  });
};

const INVITE_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

const hashInviteToken = (token) =>
  crypto.createHash('sha256').update(token).digest('hex');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create a default organization for the new user
    const organization = await Organization.create({
      name: `${name}'s Organization`,
    });

    const user = await User.create({
      name,
      email,
      password,
      role: 'admin',
      organization: organization._id,
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        organization: user.organization,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        organization: user.organization,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Login/Register with Google
// @route   POST /api/auth/google
// @access  Public
const googleLogin = async (req, res) => {
  const { idToken } = req.body;

  try {
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const { name, email, sub: googleId } = ticket.getPayload();

    let user = await User.findOne({ email });

    if (user) {
      // User exists, update googleId if not present
      if (!user.googleId) {
        user.googleId = googleId;
        await user.save();
      }
    } else {
      // Create new user and org
      const organization = await Organization.create({
        name: `${name}'s Organization`,
      });

      user = await User.create({
        name,
        email,
        googleId,
        role: 'admin',
        organization: organization._id,
      });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      organization: user.organization,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(401).json({ message: 'Google authentication failed', error: error.message });
  }
};

// @desc    Invite a user
// @route   POST /api/auth/invite
// @access  Private (Admin/Manager)
const inviteUser = async (req, res) => {
  const { email, name, role } = req.body;

  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const rawInviteToken = crypto.randomBytes(32).toString('hex');

    // Assign to the inviter's organization
    const user = await User.create({
      name,
      email,
      role: role || 'user',
      organization: req.user.organization,
      invitedBy: req.user._id,
      inviteToken: hashInviteToken(rawInviteToken),
      inviteTokenExpires: Date.now() + INVITE_TOKEN_TTL_MS,
    });

    // There's no email service wired up yet, so the raw invite token is
    // returned here for the inviter to share directly. In production this
    // would be emailed to the invitee instead of returned in the response.
    res.status(201).json({
      message: `User ${email} invited successfully.`,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      inviteToken: rawInviteToken,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Look up a pending invite by token (for the accept-invite page)
// @route   GET /api/auth/invite/:token
// @access  Public
const getInviteDetails = async (req, res) => {
  try {
    const user = await User.findOne({
      inviteToken: hashInviteToken(req.params.token),
      inviteTokenExpires: { $gt: Date.now() },
    }).select('name email');

    if (!user) {
      return res.status(400).json({ message: 'Invite link is invalid or has expired' });
    }

    res.json({ name: user.name, email: user.email });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Accept an invite by setting a password
// @route   POST /api/auth/accept-invite
// @access  Public
const acceptInvite = async (req, res) => {
  const { token, password } = req.body;

  try {
    const user = await User.findOne({
      inviteToken: hashInviteToken(token),
      inviteTokenExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Invite link is invalid or has expired' });
    }

    user.password = password;
    user.inviteToken = undefined;
    user.inviteTokenExpires = undefined;
    await user.save();

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      organization: user.organization,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  googleLogin,
  inviteUser,
  getInviteDetails,
  acceptInvite,
};
