module.exports = {
	config: {
		name: "badwords",
		aliases: ["badword"],
		version: "1.1",
		author: "Nguyễn Đức Duy",
		countDown: 5,
		role: 1,
		shortDescription: "Bật/tắt cảnh báo thô tục",
		longDescription: "Bật/tắt/thêm/xóa cảnh báo vi phạm từ thô tục, nếu thành viên vi phạm sẽ bị cảnh báo, lần 2 sẽ kick khỏi box chat",
		category: "box chat",
		guide: "   {pn} {{add <words>}}: thêm từ cấm (có thể thêm nhiều từ cách nhau bằng dấu phẩy \",\" hoặc dấu gạch đứng \"|\""
			+ "\n   {pn} {{delete <words>}}: xóa từ cấm (có thể xóa nhiều từ cách nhau bằng dấu phẩy \",\" hoặc dấu gạch đứng \"|\""
			+ "\n   {pn} {{list <hide | để trống>}}: tắt cảnh báo (thêm \"hide\" để ẩn từ cấm)"
			+ "\n   {pn} {{unwarn [<userID> | <@tag>]}}: xóa 1 lần cảnh báo của 1 thành viên"
			+ "\n   {pn} {{on}}: tắt cảnh báo"
			+ "\n   {pn} {{off}}: bật cảnh báo"
	},

	onStart: async function ({ message, event, args, threadsData, usersData, role }) {
		if (!await threadsData.get(event.threadID, "data.badWords"))
			await threadsData.set(event.threadID, {
				words: [],
				violationUsers: {}
			}, "data.badWords");

		const badWords = await threadsData.get(event.threadID, "data.badWords.words", []);

		switch (args[0]) {
			case "add": {
				if (role < 1)
					return message.reply(`Chỉ quản trị viên mới có thể thêm từ cấm vào danh sách`);
				const words = args.slice(1).join(" ").split(/[,|]/);
				if (words.length === 0)
					return message.reply("⚠️ | Bạn chưa nhập từ cần cấm");
				const badWordsExist = [];
				const success = [];
				const failed = [];
				for (const word of words) {
					const oldIndex = badWords.indexOf(word);
					if (oldIndex === -1) {
						badWords.push(word);
						success.push(word);
					}
					else if (oldIndex > -1) {
						badWordsExist.push(word);
					}
					else
						failed.push(word);
				}
				await threadsData.set(event.threadID, badWords, "data.badWords.words");
				message.reply(
					success.length > 0 ? `✅ | Đã thêm ${success.length} từ cấm vào danh sách` : ""
						+ badWordsExist.length > 0 ? `\n❌ | ${badWordsExist.length} từ cấm đã tồn tại trong danh sách từ trước: ${badWordsExist.map(w =>
							w.length == 2 ? w.split("")[0] + "*" : w.split("")[0] + Array.from('*'.repeat(w.length - 2)).join("") + w.split("")[w.length - 1]
						).join(", ")}` : ""
							+ failed.length > 0 ? `\n⚠️ | ${failed.length} từ cấm không thể thêm vào danh sách từ trước do có độ dài nhỏ hơn 2 ký tự: ${failed.join(", ")}` : ""
				);
				break;
			}
			case "delete":
			case "del":
			case "-d": {
				if (role < 1)
					return message.reply(`Chỉ quản trị viên mới có thể xóa từ cấm khỏi danh sách`);
				const words = args.slice(1).join(" ").split(/[,|]/);
				if (words.length === 0)
					return message.reply("⚠️ | Bạn chưa nhập từ cần xóa");
				const success = [];
				const failed = [];
				for (const word of words) {
					const oldIndex = badWords.indexOf(word);
					if (oldIndex > -1) {
						badWords.splice(oldIndex, 1);
						success.push(word);
					}
					else
						failed.push(word);
				}
				await threadsData.set(event.threadID, badWords, "data.badWords.words");
				message.reply(
					success.length > 0 ? `✅ | Đã xóa ${success.length} từ cấm khỏi danh sách` : ""
						+ failed.length > 0 ? `\n⚠️ | ${failed.length} từ cấm không tồn tại trong danh sách từ trước: ${failed.join(", ")}` : ""
				);
				break;
			}
			case "list":
			case "all":
			case "-a": {
				if (badWords.length === 0)
					return message.reply("⚠️ | Danh sách từ cấm trong nhóm bạn hiện đang trống");
				message.reply(`📑 | Danh sách từ cấm trong nhóm bạn: ${args[1] === "hide" ? badWords.map(w => w.length == 2 ? w.split("")[0] + "*" : w.split("")[0] + Array.from('*'.repeat(w.length - 2)).join("") + w.split("")[w.length - 1]).join(", ") : badWords.join(", ")}`);
				break;
			}
			case "on": {
				if (role < 1)
					return message.reply(`Chỉ quản trị viên mới có thể bật tính năng này`);
				await threadsData.set(event.threadID, true, "settings.badWords");
				message.reply("✅ | Cảnh báo vi phạm từ cấm đã bật");
				break;
			}
			case "off": {
				if (role < 1)
					return message.reply(`Chỉ quản trị viên mới có thể tắt tính năng này`);
				await threadsData.set(event.threadID, false, "settings.badWords");
				message.reply("✅ | Cảnh báo vi phạm từ cấm đã tắt");
				break;
			}
			case "unwarn": {
				if (role < 1)
					return message.reply(`Chỉ quản trị viên mới có thể xóa cảnh báo vi phạm từ cấm`);
				let userID;
				if (Object.keys(event.mentions)[0])
					userID = Object.keys(event.mentions)[0];
				else if (args[1])
					userID = args[1];
				else if (event.messageReply)
					userID = event.messageReply.senderID;
				if (isNaN(userID))
					return message.reply("⚠️ | Bạn chưa nhập ID người dùng hoặc ID người dùng không hợp lệ");
				const violationUsers = await threadsData.get(event.threadID, "data.badWords.violationUsers", {});
				if (!violationUsers[userID])
					return message.reply(`⚠️ | Người dùng ${userID} chưa bị cảnh báo vi phạm từ cấm`);
				violationUsers[userID]--;
				await threadsData.set(event.threadID, violationUsers, "data.badWords.violationUsers");
				const userName = await usersData.getName(userID);
				message.reply(`✅ | Người dùng ${userID} | ${userName} đã được xóa bỏ 1 lần cảnh báo vi phạm từ cấm`);
			}
		}
	},

	onChat: async function ({ message, event, api, threadsData, prefix }) {
		if (!event.body)
			return;
		const threadData = global.db.allThreadData.find(t => t.threadID === event.threadID) || await threadsData.create(event.threadID);
		const isEnabled = threadData.settings.badWords;
		if (!isEnabled)
			return;
		const allAliases = [...(global.GoatBot.commands.get("badwords").config.aliases || []), ...(threadData.data.aliases?.["badwords"] || [])];
		const isCommand = allAliases.some(a => event.body.startsWith(prefix + a));
		if (isCommand)
			return;
		const badWordList = threadData.data.badWords?.words;
		if (!badWordList || badWordList.length === 0)
			return;
		const violationUsers = threadData.data.badWords?.violationUsers || {};

		for (const word of badWordList) {
			if (event.body.match(new RegExp(`\\b${word}\\b`, "gi"))) {
				if ((violationUsers[event.senderID] || 0) < 1) {
					message.reply(`⚠️ | Từ cấm "${word}" đã được phát hiện trong tin nhắn của bạn, nếu tiếp tục vi phạm bạn sẽ bị kick khỏi nhóm.`);
					violationUsers[event.senderID] = violationUsers[event.senderID] ? violationUsers[event.senderID] + 1 : 1;
					await threadsData.set(event.threadID, violationUsers, "data.badWords.violationUsers");
					return;
				}
				else {
					await message.reply(`⚠️ | Từ cấm "${word}" đã được phát hiện trong tin nhắn của bạn, bạn đã vi phạm 2 lần và sẽ bị kick khỏi nhóm.`);
					api.removeUserFromGroup(event.senderID, event.threadID, (err) => {
						if (err)
							return message.reply(`Bot cần quyền quản trị viên để kick thành viên bị ban`, (e, info) => {
								let { onEvent } = global.GoatBot;
								onEvent.push({
									messageID: info.messageID,
									onStart: ({ event }) => {
										if (event.logMessageType === "log:thread-admins" && event.logMessageData.ADMIN_EVENT == "add_admin") {
											const { TARGET_ID } = event.logMessageData;
											if (TARGET_ID == api.getCurrentUserID())
												api.removeUserFromGroup(event.senderID, event.threadID, () => onEvent = onEvent.filter(item => item.messageID != info.messageID));
										}
									}
								});
							});
					});
				}
			}
		}
	}
};
