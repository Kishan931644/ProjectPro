const Client = require('../models/Client');

// @desc    Create a client
// @route   POST /api/clients
// @access  Private
const createClient = async (req, res) => {
  const { name, address, ratePerHour } = req.body;

  try {
    const client = await Client.create({
      name,
      address,
      ratePerHour,
      organization: req.user.organization,
    });

    res.status(201).json(client);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all clients for the user's organization
// @route   GET /api/clients
// @access  Private
const getClients = async (req, res) => {
  try {
    const clients = await Client.find({ organization: req.user.organization });
    res.json(clients);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Edit a client
// @route   PUT /api/clients/:id
// @access  Private (Admin)
const editClient = async (req, res) => {
  try {
    let client = await Client.findById(req.params.id);

    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    if (client.organization.toString() !== req.user.organization.toString()) {
      return res.status(401).json({ message: 'Not authorized to edit this client' });
    }

    client = await Client.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.json(client);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a client
// @route   DELETE /api/clients/:id
// @access  Private (Admin)
const deleteClient = async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);

    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    if (client.organization.toString() !== req.user.organization.toString()) {
      return res.status(401).json({ message: 'Not authorized to delete this client' });
    }

    await client.deleteOne();
    res.json({ message: 'Client removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createClient,
  getClients,
  editClient,
  deleteClient,
};
