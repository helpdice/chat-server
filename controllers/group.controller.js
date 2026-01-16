const Group = require('../models/group.model'); // Adjust path as needed
const GroupMember = require('../models/member.model');

// ✅ Create a new group

exports.createGroup = async (req, res) => {
    try {
        // console.log('CREATE GROUP:', req);
        const { name, description, isPrivate } = req.body;
        const createdBy = req.user._id;

        const group = await Group.create({
            name,
            description,
            isPrivate,
            createdBy
        });

        await GroupMember.create({
            groupId: group._id,
            userId: createdBy,
            role: 'creator'
        });

        res.status(201).json({ payload: group });
    } catch (err) {
        console.error('Error in Create Group', err);
        res.status(500).json({ error: err.message });
    }
};

exports.getGroup = async (req, res) => {};

// ✅ Get all groups created by user
exports.getGroupsByCreator = async (req, res) => {
    try {
        const groups = await Group.find({ createdBy: req.user._id });
        // console.log(groups);
        res.status(200).json({ payload: groups });
    } catch (err) {
        console.error('Error in get groups by creator', err);
        res.status(500).json({ error: err.message });
    }
};

exports.getGroupsByMember = async (req, res) => {
  try {
    const groupMember = await GroupMember.find({ userId: req.user._id });
    const groupIds = groupMember.map((gm) => gm.groupId);
    const groups = await Group.find({ _id: groupIds });
    if (groups) {
      res.status(200).json({
        payload: groups
      });
    }
  } catch (err) {
    console.error('Error in get groups by creator', err);
    res.status(500).json({ error: err.message });
  }
}

// ✅ Add admin to group
exports.addAdmin = async (req, res) => {
    try {
        const { groupId, userId } = req.body;

        const group = await Group.findByIdAndUpdate(groupId, { $addToSet: { admins: userId } }, { new: true });

        res.json(group);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ✅ Remove admin from group
exports.removeAdmin = async (req, res) => {
    try {
        const { groupId, userId } = req.body;

        const group = await Group.findByIdAndUpdate(groupId, { $pull: { admins: userId } }, { new: true });

        res.json(group);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ✅ Add member to group
exports.addMember = async (req, res) => {
    try {
        const { groupId, userId } = req.body;
        const currentUserId = req.user._id;

        const admin = await GroupMember.findOne({ groupId, userId: currentUserId, role: 'admin' });
        if (!admin) return res.status(403).json({ error: 'Only admins can add members' });

        const member = await GroupMember.create({ groupId, userId });
        res.status(201).json({ message: 'Member added', member });
    } catch (err) {
        if (err.code === 11000) {
            return res.status(400).json({ error: 'User already a member' });
        }
        res.status(500).json({ error: err.message });
    }
};

// ✅ Remove member from group
exports.removeMember = async (req, res) => {
    try {
        const { groupId, userId } = req.body;
        const currentUserId = req.user._id;

        const admin = await GroupMember.findOne({ groupId, userId: currentUserId, role: 'admin' });
        if (!admin) return res.status(403).json({ error: 'Only admins can remove members' });

        await GroupMember.deleteOne({ groupId, userId });
        res.json({ message: 'Member removed' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { isPrivate, desc } = req.body;
    const data = {
      isPrivate: isPrivate
    };
    if (desc) {
      data.desc = desc;
    }
    console.log("Update Group Data", data);
    const updated = await Group.findByIdAndUpdate(groupId, data);
    if (updated) {
      return res.status(200).json({
        message: "Update Successfully"
      });
    }
  } catch (err) {
    console.error("Error in Update Group", err);
    res.status(500).json({ error: err.message });
  }
}

exports.getGroupMembers = async (req, res) => {
    try {
        const { groupId } = req.params;
        // console.log('Group ID :', groupId);
        const { page = 1, limit = 50 } = req.query;

        const members = await GroupMember.find({ groupId })
            .populate('userId', 'name dp phoneNo')
            .sort({ joinedAt: 1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        return res.status(200).json({ payload: members });
    } catch (err) {
        console.error('Group Members Error:', err);
        res.status(500).json({ error: err.message });
    }
};

exports.changeGroupMembers = async (req, res) => {
    try {
        const { groupId } = req.params;
        const { members, today } = req.body;
        // console.log('Group Members :', members, today);
        const addMembers = [];
        const removeMembers = [];
        members.forEach((member) => {
            const data = {
                groupId: groupId,
                userId: member.contact.id,
                joinedAt: new Date(today)
            };
            if (member.action == 'add') {
                addMembers.push(data);
            } else {
                removeMembers.push(data);
            }
        });

        if (addMembers.length > 0) {
            try {
                GroupMember.insertMany(addMembers, { ordered: false });
            } catch (err) {
                if (err.name === 'BulkWriteError') {
                    console.error('Some documents failed to insert due to duplicates or validation errors.');
                } else {
                    console.error('Insert failed:', err);
                }
            }
        }

        if (removeMembers.length > 0) {
            GroupMember.deleteMany();
        }
    } catch (err) {
        console.error('Change Group Members Error:', err);
        res.status(500).json({ error: err.message });
    }
};

// ✅ Delete group (only by creator or admin)
exports.deleteGroup = async (req, res) => {
    try {
        const group = await Group.findById(req.params.groupId);
        if (!group) return res.status(404).json({ error: 'Group not found' });

        const isAuthorized = group.createdBy.toString() === req.user._id.toString() || group.admins.includes(req.user._id);

        if (!isAuthorized) return res.status(403).json({ error: 'Not authorized to delete group' });

        await group.deleteOne();
        res.json({ message: 'Group deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.requestToJoinGroup = async (req, res) => {
    try {
        const { groupId } = req.body;
        const userId = req.user._id;

        const existingMember = await GroupMember.findOne({ groupId, userId });
        if (existingMember) return res.status(400).json({ error: 'Already a member' });

        const group = await Group.findById(groupId);
        if (!group) return res.status(404).json({ error: 'Group not found' });
        if (!group.isPrivate) return res.status(400).json({ error: 'Group is public, join directly' });

        await JoinRequest.create({ groupId, userId });
        res.status(201).json({ message: 'Join request sent' });
    } catch (err) {
        if (err.code === 11000) {
            return res.status(400).json({ error: 'Request already sent' });
        }
        res.status(500).json({ error: err.message });
    }
};

exports.approveJoinRequest = async (req, res) => {
    try {
        const { groupId, userId } = req.body;
        const admin = await GroupMember.findOne({ groupId, userId: req.user._id, role: 'admin' });
        if (!admin) return res.status(403).json({ error: 'Not authorized' });

        await JoinRequest.deleteOne({ groupId, userId });
        const member = await GroupMember.create({ groupId, userId });

        res.json({ message: 'User added to group', member });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.rejectJoinRequest = async (req, res) => {
    try {
        const { groupId, userId } = req.body;
        const admin = await GroupMember.findOne({ groupId, userId: req.user._id, role: 'admin' });
        if (!admin) return res.status(403).json({ error: 'Not authorized' });

        await JoinRequest.deleteOne({ groupId, userId });
        res.json({ message: 'Join request rejected' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
