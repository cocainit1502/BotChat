const { removeHomeDir } = global.utils;

module.exports = {
	config: {
		name: "eval",
		version: "1.0",
		author: "Nguyễn Đức Duy",
		countDown: 5,
		role: 2,
		shortDescription: "Test code nhanh",
		longDescription: "Test code nhanh",
		category: "owner",
		guide: "{pn} <đoạn code cần test>"
	},

	onStart: async function ({ api, args, message, event, threadsData, usersData, dashBoardData, threadModel, userModel, dashBoardModel, role, commandName }) {
		const cmd = `(async () => { try { ${args.join(" ")} } catch(err) { message.send("❌ Đã có lỗi xảy ra:\\n" + "{{" + (err.stack ? removeHomeDir(err.stack) : removeHomeDir(JSON.stringify(err, null, 2))) + "}}"); }})()`;
		eval(cmd);
	}
};