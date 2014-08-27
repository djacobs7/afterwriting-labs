define(['jspdf'], function (jsPDF) {
	var module = {};

	module.get_pdf = function (parsed, cfg) {

		var title_page = parsed.title_page;
		var lines = parsed.lines;

		// set up document
		var doc = new jsPDF("p", "in", cfg.print().paper_size || "a4");
		doc.setFont("courier").setFontSize(12);

		// helper
		var center = function (txt, y) {
			var feed = cfg.print().left_margin + (cfg.print().page_width - cfg.print().left_margin - cfg.print().right_margin - txt.length * cfg.print().font_width) / 2;
			doc.text(feed, y, txt);
		};

		var get_title_page_token = function (type) {
			for (var i = 0; i < title_page.length; i++) {
				if (title_page[i].type === type) {
					return title_page[i];
				}
			}
		};

		// formatting not supported yet
		parsed.title_page.forEach(function (title_page_token) {
			title_page_token.text = title_page_token.text.replace(/\*/g, '').replace(/_/g, '');
		});

		var title_y = cfg.print().title_page.top_start;

		var title_page_next_line = function () {
			title_y += cfg.print().line_spacing * cfg.print().font_height;
		};

		var title_page_main = function (type) {
			if (type === undefined) {
				title_page_next_line();
				return;
			}
			var token = get_title_page_token(type);
			if (token) {
				token.text.split('\n').forEach(function (line) {
					center(line, title_y);
					title_page_next_line();
				});
			}
		};

		if (cfg.print_title_page) {

			// title page
			title_page_main('title');
			title_page_main();
			title_page_main();
			title_page_main('credit');
			title_page_main();
			title_page_main('author');
			title_page_main();
			title_page_main();
			title_page_main();
			title_page_main();
			title_page_main('source');

			var draft = get_title_page_token('draft date');
			doc.text(cfg.print().title_page.draft_date.x, cfg.print().title_page.draft_date.y, draft ? draft.text.trim() : "");
			var contact = get_title_page_token('contact');
			doc.text(cfg.print().title_page.contact.x, cfg.print().title_page.contact.y, contact ? contact.text.trim() : "");

			var notes = get_title_page_token('notes');
			if (notes) {
				var notes_text = notes.text;
				var copy = get_title_page_token('copyright');
				if (copy) {
					notes_text += '\n\n' + copy.text.trim();
				}
				doc.text(cfg.print().title_page.notes.x, cfg.print().title_page.notes.y, notes_text.trim());
			}

			var date = get_title_page_token('date');
			doc.text(cfg.print().title_page.date.x, cfg.print().title_page.date.y, date ? date.text.trim() : "");

			// script
			doc.addPage();
		}

		// rest
		var y = 1;
		var page = 1;

		lines.forEach(function (line) {
			if (line.type == "page_break") {
				y = 1;
				doc.addPage();
				page++;

				if (cfg.show_page_numbers) {
					var page_num = page.toFixed() + ".";
					doc.text(cfg.print().action.feed + cfg.print().action.max * cfg.print().font_width - page_num.length * cfg.print().font_width, cfg.print().page_number_top_margin, page_num);
				}
			} else {
				// formatting not supported yet
				line.text = line.text.replace(/\*/g, '').replace(/_/g, '');

				if (line.type === 'centered') {
					center(line.text, cfg.print().top_margin + cfg.print().font_height * y++);
				} else {
					var feed = (cfg.print()[line.type] || {}).feed || cfg.print().action.feed;
					if (line.type == "transition") {
						feed = cfg.print().action.feed + cfg.print().action.max * 0.1 - line.text.length * 0.1;
					}
					if (line.type == "scene_heading" && cfg.embolden_scene_headers) {
						doc.setFontType("bold");
					}
					else {
						doc.setFontType("normal");
					}
					doc.text(feed, cfg.print().top_margin + cfg.print().font_height * y++, line.text);
				}
			}

		});
		return doc;
	};

	return module;
});