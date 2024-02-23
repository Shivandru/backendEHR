const express = require("express");
const { RecordModel } = require("../Model/Record.Model");
const recordRouter = express.Router();
const { auth } = require("../Middlewares/Auth.middleware");
const { authorizedRole } = require("../Middlewares/RoleMiddleware");
recordRouter.use(auth);

recordRouter.get(
  "/",
  authorizedRole(["doctor", "patient", "admin"]),
  async (req, res) => {
    try {
      const records = await RecordModel.find();
      const aggregatedData = await RecordModel.aggregate([
        { $group: { _id: "$gender", count: { $sum: 1 } } },
        { $project: { category: "$_id", value: "$count", _id: 0 } },
      ]);
      const aggregatedConditionData = await RecordModel.aggregate([
        { $group: { _id: "$condition", count: { $sum: 1 } } },
        { $project: { category: "$_id", value: "$count", _id: 0 } },
      ]);
      res
        .status(200)
        .send({
          msg: "All records",
          data: records,
          aggregatedData,
          aggregatedConditionData,
        });
    } catch (error) {
      res.status(404).send({ msg: error.message });
    }
  }
);

recordRouter.post(
  "/add",
  authorizedRole(["doctor", "admin"]),
  async (req, res) => {
    try {
      let userId = req.userId;
      let username = req.username;
      const record = new RecordModel({ ...req.body, userId, username });
      await record.save();
      res.status(200).send({ msg: "record added successfully" });
    } catch (error) {
      res.status(404).send({ msg: error.message });
    }
  }
);

recordRouter.patch(
  "/update/:record_id",
  authorizedRole(["doctor", "admin"]),
  async (req, res) => {
    try {
      const { record_id } = req.params;
      const userId = req.userId;
      const role = req.role;
      const record = await RecordModel.findOne({ _id: record_id });
      if (record.userId === userId || role == "admin" || role == "doctor") {
        await RecordModel.findByIdAndUpdate({ _id: record_id }, req.body);
        res.status(200).send({ msg: "record updated successfully" });
      } else {
        res
          .status(200)
          .send({ msg: `You are not authorized to update this record` });
      }
    } catch (error) {
      res.status(404).send({ msg: error.message });
    }
  }
);
recordRouter.delete(
  "/delete/:record_id",
  authorizedRole(["admin"]),
  async (req, res) => {
    try {
      const { record_id } = req.params;
      const userId = req.userId;
      const role = req.role;
      const record = await RecordModel.findOne({ _id: record_id });
      if (userId === record.userId || role == "admin") {
        await RecordModel.findByIdAndDelete({ _id: record_id });
        res.status(200).send({ msg: "record deleted successfully" });
      } else {
        res
          .status(200)
          .send({ msg: `You are not authorized to delete this record` });
      }
    } catch (error) {
      res.status(404).send({ msg: error.message });
    }
  }
);

module.exports = { recordRouter };
