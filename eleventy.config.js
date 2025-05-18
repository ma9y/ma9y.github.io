import 'dotenv/config'
import { DateTime } from "luxon";
import { feedPlugin } from "@11ty/eleventy-plugin-rss";

export default function (eleventyConfig) {

    eleventyConfig.addPassthroughCopy("views/assets/img");
    eleventyConfig.addPassthroughCopy("views/assets/js");

    // PLUGINS
    eleventyConfig.addPlugin(feedPlugin, {
		type: "atom", // or "rss", "json"
		outputPath: "/feed.xml",
		collection: {
			name: "post", // iterate over `collections.posts`
			limit: 10,     // 0 means no limit
		},
		metadata: {
			language: "cs",
			title: "ma9y.net",
			subtitle: "Deník",
			base: "https://ma9y.net/",
			author: {
				name: "Fanda",
				email: "", // Optional
			}
		}
	});

    // FILTERS
    eleventyConfig.addFilter("postDate", (dateObj, format = "DDD", locale = "cs") => {
        return DateTime.fromJSDate(dateObj).setLocale(locale).toFormat(format);
    });

};

export const config = {

    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",

    dir: {
        input: "views",
        layouts: "_layouts",
        output: "dist"
    }
};