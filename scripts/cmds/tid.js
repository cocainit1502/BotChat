module.exports = {
	config: {
		name: "tid",
		version: "1.0",
		author: "Nguyễn Đức Duy",
		countDown: 5,
		role: 0,
		shortDescription: "Xem threadID",
		longDescription: "Xem id nhóm chat của bạn",
		category: "info",
		guide: "{pn}"
	},

	onStart: async function ({ message, event }) {
		message.reply(event.threadID.toString());
	}
};