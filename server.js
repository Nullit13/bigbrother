const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const basicAuth = require('express-basic-auth');
require('dotenv').config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

mongoose.connect(process.env.MONGO_URI);

const childSchema = new mongoose.Schema({
  name: String,
  computerId: { type: String, unique: true },
  lastActive: Date,
  commands: [{
    command: String,
    executed: { type: Boolean, default: false },
    result: String,
    createdAt: { type: Date, default: Date.now }
  }],
  isOnline: { type: Boolean, default: false }
});

const Child = mongoose.model('Child', childSchema);

function wrapInCmd(command) {
  command = command.trim();
  if (command.toLowerCase().startsWith('powershell') || command.toLowerCase().startsWith('cmd /c')) {
    return command;
  }
  const escapedCmd = command.replace(/"/g, '\\"');
  return `cmd /c "${escapedCmd}"`;
}

app.get('/api/child/:computerId', async (req, res) => {
  try {
    let child = await Child.findOne({ computerId: req.params.computerId });
    if (!child) {
      child = new Child({
        name: `Child-${req.params.computerId}`,
        computerId: req.params.computerId,
        lastActive: new Date(),
        isOnline: true
      });
      await child.save();
    }
    child.lastActive = new Date();
    child.isOnline = true;
    await child.save();
    
    const pendingCommands = child.commands.filter(cmd => !cmd.executed);
    res.json({ child, commands: pendingCommands });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/command/result/:childId/:commandId', async (req, res) => {
  try {
    const child = await Child.findById(req.params.childId);
    if (!child) return res.status(404).json({ error: 'Child not found' });
    
    const command = child.commands.id(req.params.commandId);
    if (command) {
      command.executed = true;
      command.result = req.body.result || "Command executed (no output)";
      await child.save();
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const authMiddleware = basicAuth({
    users: { 'admin': process.env.ADMIN_PASSWORD || 'changeme123' },
    challenge: true,
    realm: 'Parental Control Admin'
});

app.use('/parent', authMiddleware);
app.use('/api/command', authMiddleware);
app.use('/api/child/delete', authMiddleware);

app.get('/', (req, res) => {
  res.redirect('/parent');
});

app.get('/parent', authMiddleware, async (req, res) => {
  try {
    const children = await Child.find();
    res.render('parent/index', { children });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.get('/parent/child/:id', authMiddleware, async (req, res) => {
  try {
    const child = await Child.findById(req.params.id);
    if (!child) return res.status(404).send('Child not found');
    res.render('parent/child', { child });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.post('/api/command/:childId', authMiddleware, async (req, res) => {
  try {
    const child = await Child.findById(req.params.childId);
    if (!child) return res.status(404).json({ error: 'Child not found' });
    
    const command = wrapInCmd(req.body.command);
    child.commands.push({ command, executed: false });
    await child.save();
    
    res.json({ success: true, message: 'Command sent', command });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/child/:childId', authMiddleware, async (req, res) => {
  try {
    const child = await Child.findByIdAndDelete(req.params.childId);
    if (!child) return res.status(404).json({ error: 'Child not found' });
    res.json({ success: true, message: 'Child deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Dashboard: http://localhost:${PORT}/parent`);
  console.log(`Login: admin / ${process.env.ADMIN_PASSWORD || 'changeme123'}`);
});