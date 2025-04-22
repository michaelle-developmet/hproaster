const mongoose = require('mongoose');

const WorkerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  post: { type: String, unique: true, required: true }, // Должность сотрудника
  password: { type: String, required: true },
  bossPost: { type: String, required: true }, // Должность главного пользователя
});

module.exports = mongoose.model('Worker', WorkerSchema);
