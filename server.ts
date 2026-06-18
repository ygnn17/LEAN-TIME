import tcb from "@cloudbase/node-sdk";

// 初始化腾讯云CloudBase
const tcbApp = tcb.init({
  env: process.env.TCB_ENV_ID,
  secretId: process.env.TCB_SERVER_API_KEY.split(',')[0],
  secretKey: process.env.TCB_SERVER_API_KEY.split(',')[1]
});
const db = tcbApp.database();
const dataCollection = db.collection("app_data");

// 获取数据接口
app.get("/api/getRecords", async (req, res) => {
  const { deviceId, projectKey } = req.query;
  if (!deviceId || !projectKey) {
    return res.status(400).json({ code: -1, msg: "缺少设备标识或工具标识" });
  }
  const { data } = await dataCollection
    .where({ deviceId, projectKey })
    .orderBy("createTime", "desc")
    .get();
  res.json({ code: 0, data });
});

// 新增数据接口
app.post("/api/addRecord", async (req, res) => {
  const record = req.body;
  if (!record.deviceId || !record.projectKey) {
    return res.status(400).json({ code: -1, msg: "缺少设备标识或工具标识" });
  }
  record.createTime = Date.now();
  await dataCollection.add(record);
  res.json({ code: 0, msg: "云端保存成功" });
});