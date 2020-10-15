const { EntitySchema } = require('typeorm');

module.exports = new EntitySchema({
	name: "Post",
	columns: {
		id: {
			primary: true,
			type: "int",
			generated: true
		},
		title: {
			type: "varchar",
			length: 60
		},
		text: {
			type: "text"
		}
	}
});